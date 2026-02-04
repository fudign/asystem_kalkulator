// Module 2: RESEARCHER Worker
// Performs web search, competitor analysis, and sends to planner

import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from '@/shared/constants';
import { prisma } from '@/lib/prisma';
import { searchCompetitors, generateCompetitiveAdvantages } from './competitor-analyzer';
import { searchIndustryTrends, generateContentSuggestions } from './web-search';
import type { IntakeData } from '@/modules/intake/validation';
import type { ResearchResult } from '@/shared/types';

interface ResearcherJobData {
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

// Process research job
async function processResearch(job: Job<ResearcherJobData>): Promise<void> {
  const { projectId, intake } = job.data;

  console.log(`[RESEARCHER] Processing project ${projectId}`);

  try {
    // Update status
    await prisma.clientProject.update({
      where: { id: projectId },
      data: { status: 'researching' },
    });

    // Parse competitors from intake
    const knownCompetitors = intake.competitors || [];

    // Run research tasks in parallel
    const [competitors, trends, contentSuggestions] = await Promise.all([
      searchCompetitors(
        intake.businessType || '',
        'Кыргызстан',
        knownCompetitors
      ),
      searchIndustryTrends(
        intake.businessType || '',
        intake.targetAudience || ''
      ),
      generateContentSuggestions(
        intake.businessType || '',
        intake.siteGoals || []
      ),
    ]);

    // Generate competitive advantages
    const advantages = await generateCompetitiveAdvantages(
      intake.businessType || '',
      intake.businessDescription || '',
      competitors
    );

    // Compile research results
    const researchResult: ResearchResult = {
      competitors,
      industryTrends: trends.trends,
      targetAudienceInsights: trends.insights,
      recommendations: [
        ...trends.recommendations,
        ...advantages,
      ],
    };

    // Save research to database
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        researchData: JSON.stringify(researchResult),
        updatedAt: new Date(),
      },
    });

    // Add job to planner queue
    const plannerQueue = new Queue(QUEUES.PLANNER, {
      connection: getRedisConnection(),
    });

    await plannerQueue.add(`plan-${projectId}`, {
      projectId,
      intake,
      research: researchResult,
    });

    console.log(`[RESEARCHER] Project ${projectId} research complete, sent to planner`);

  } catch (error) {
    console.error(`[RESEARCHER] Error processing project ${projectId}:`, error);

    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        failedModule: 'researcher',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Create and export worker
export let researcherWorker: Worker<ResearcherJobData> | null = null;

export function startResearcherWorker(): Worker<ResearcherJobData> {
  if (researcherWorker) {
    return researcherWorker;
  }

  researcherWorker = new Worker<ResearcherJobData>(
    QUEUES.RESEARCHER,
    processResearch,
    {
      connection: getRedisConnection(),
      concurrency: 3,
    }
  );

  researcherWorker.on('completed', (job) => {
    console.log(`[RESEARCHER] Job ${job.id} completed`);
  });

  researcherWorker.on('failed', (job, error) => {
    console.error(`[RESEARCHER] Job ${job?.id} failed:`, error);
  });

  console.log('[RESEARCHER] Worker started');

  return researcherWorker;
}

export function stopResearcherWorker(): void {
  if (researcherWorker) {
    researcherWorker.close();
    researcherWorker = null;
    console.log('[RESEARCHER] Worker stopped');
  }
}
