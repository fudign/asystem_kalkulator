// Module 3: PLANNER Worker
// Creates project plan with epics/stories and waits for client approval

import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from '@/shared/constants';
import { prisma } from '@/lib/prisma';
import { generateProjectPlan, generateApprovalSummary } from './epic-generator';
import type { IntakeData } from '@/modules/intake/validation';
import type { ResearchResult, ProjectPlan } from '@/shared/types';

interface PlannerJobData {
  projectId: string;
  intake: IntakeData;
  research: ResearchResult;
}

// Create Redis connection
const getRedisConnection = () => {
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });
};

// Process planning job
async function processPlanning(job: Job<PlannerJobData>): Promise<void> {
  const { projectId, intake, research } = job.data;

  console.log(`[PLANNER] Processing project ${projectId}`);

  try {
    // Update status
    await prisma.clientProject.update({
      where: { id: projectId },
      data: { status: 'planning' },
    });

    // Generate project plan
    const plan = await generateProjectPlan(intake, research);

    // Save plan to database
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        planData: JSON.stringify(plan),
        status: 'awaiting_approval',
        updatedAt: new Date(),
      },
    });

    // For auto-approval flow (no client confirmation needed)
    // Automatically approve and continue to generator
    const AUTO_APPROVE = process.env.AUTO_APPROVE_PLANS === 'true';

    if (AUTO_APPROVE) {
      console.log(`[PLANNER] Auto-approving project ${projectId}`);
      await approvePlan(projectId, intake, plan);
    } else {
      // Send notification to client for approval
      // TODO: Implement email/websocket notification
      console.log(`[PLANNER] Project ${projectId} awaiting client approval`);

      // Generate approval summary for client
      const summary = generateApprovalSummary(plan, intake);
      console.log(`[PLANNER] Approval summary:\n${summary}`);
    }

  } catch (error) {
    console.error(`[PLANNER] Error processing project ${projectId}:`, error);

    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        failedModule: 'planner',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Approve plan and send to generator
export async function approvePlan(
  projectId: string,
  intake: IntakeData,
  plan: ProjectPlan
): Promise<void> {
  // Update approval status
  await prisma.clientProject.update({
    where: { id: projectId },
    data: {
      clientApproved: true,
      approvedAt: new Date(),
      status: 'approved',
    },
  });

  // Add to generator queue
  const generatorQueue = new Queue(QUEUES.GENERATOR, {
    connection: getRedisConnection(),
  });

  await generatorQueue.add(`generate-${projectId}`, {
    projectId,
    intake,
    plan,
  });

  console.log(`[PLANNER] Project ${projectId} approved, sent to generator`);
}

// Create and export worker
export let plannerWorker: Worker<PlannerJobData> | null = null;

export function startPlannerWorker(): Worker<PlannerJobData> {
  if (plannerWorker) {
    return plannerWorker;
  }

  plannerWorker = new Worker<PlannerJobData>(
    QUEUES.PLANNER,
    processPlanning,
    {
      connection: getRedisConnection(),
      concurrency: 2,
    }
  );

  plannerWorker.on('completed', (job) => {
    console.log(`[PLANNER] Job ${job.id} completed`);
  });

  plannerWorker.on('failed', (job, error) => {
    console.error(`[PLANNER] Job ${job?.id} failed:`, error);
  });

  console.log('[PLANNER] Worker started');

  return plannerWorker;
}

export function stopPlannerWorker(): void {
  if (plannerWorker) {
    plannerWorker.close();
    plannerWorker = null;
    console.log('[PLANNER] Worker stopped');
  }
}
