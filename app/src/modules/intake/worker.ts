// Module 1: INTAKE Worker
// Processes intake submissions and sends to researcher queue

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from '@/shared/constants';
import { prisma } from '@/lib/prisma';
import type { IntakeData } from './validation';

interface IntakeJobData {
  projectId: string;
  intake: IntakeData;
}

// Create Redis connection
const getRedisConnection = () => {
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });
};

// Process intake job
async function processIntake(job: Job<IntakeJobData>): Promise<void> {
  const { projectId, intake } = job.data;

  console.log(`[INTAKE] Processing project ${projectId}`);

  try {
    // Update project status
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'intake_complete',
        updatedAt: new Date(),
      },
    });

    // Add job to researcher queue
    const researcherQueue = new (await import('bullmq')).Queue(QUEUES.RESEARCHER, {
      connection: getRedisConnection(),
    });

    await researcherQueue.add(`research-${projectId}`, {
      projectId,
      intake,
    });

    console.log(`[INTAKE] Project ${projectId} sent to researcher`);

  } catch (error) {
    console.error(`[INTAKE] Error processing project ${projectId}:`, error);

    // Update project with error
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        failedModule: 'intake',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Create and export worker
export let intakeWorker: Worker<IntakeJobData> | null = null;

export function startIntakeWorker(): Worker<IntakeJobData> {
  if (intakeWorker) {
    return intakeWorker;
  }

  intakeWorker = new Worker<IntakeJobData>(
    QUEUES.INTAKE,
    processIntake,
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  intakeWorker.on('completed', (job) => {
    console.log(`[INTAKE] Job ${job.id} completed`);
  });

  intakeWorker.on('failed', (job, error) => {
    console.error(`[INTAKE] Job ${job?.id} failed:`, error);
  });

  console.log('[INTAKE] Worker started');

  return intakeWorker;
}

export function stopIntakeWorker(): void {
  if (intakeWorker) {
    intakeWorker.close();
    intakeWorker = null;
    console.log('[INTAKE] Worker stopped');
  }
}
