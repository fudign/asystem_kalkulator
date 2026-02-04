// Module 4: GENERATOR Worker
// Generates site code and saves to filesystem

import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';
import { QUEUES } from '@/shared/constants';
import { prisma } from '@/lib/prisma';
import { generateSiteCode } from './claude-agent';
import type { IntakeData } from '@/modules/intake/validation';
import type { ProjectPlan } from '@/shared/types';

interface GeneratorJobData {
  projectId: string;
  intake: IntakeData;
  plan: ProjectPlan;
}

// Base path for generated projects
const PROJECTS_BASE_PATH = process.env.GENERATED_PROJECTS_PATH || '/tmp/asystem-projects';

// Create Redis connection
const getRedisConnection = () => {
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });
};

// Process generation job
async function processGeneration(job: Job<GeneratorJobData>): Promise<void> {
  const { projectId, intake, plan } = job.data;

  console.log(`[GENERATOR] Processing project ${projectId}`);

  try {
    // Update status
    await prisma.clientProject.update({
      where: { id: projectId },
      data: { status: 'generating' },
    });

    // Generate site code
    const generatedSite = await generateSiteCode(intake, plan);

    if (generatedSite.buildStatus === 'failed') {
      throw new Error(`Generation failed: ${generatedSite.errors?.join(', ')}`);
    }

    // Create project directory
    const projectPath = path.join(PROJECTS_BASE_PATH, projectId);
    await fs.mkdir(projectPath, { recursive: true });

    // Write all files
    for (const file of generatedSite.files) {
      const filePath = path.join(projectPath, file.path);
      const fileDir = path.dirname(filePath);

      // Create directory if needed
      await fs.mkdir(fileDir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    console.log(`[GENERATOR] Generated ${generatedSite.files.length} files for project ${projectId}`);

    // Update generated site path
    generatedSite.projectPath = projectPath;

    // Save to database
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        generatedSiteData: JSON.stringify(generatedSite),
        projectPath,
        updatedAt: new Date(),
      },
    });

    // Add to deployer queue
    const deployerQueue = new Queue(QUEUES.DEPLOYER, {
      connection: getRedisConnection(),
    });

    await deployerQueue.add(`deploy-${projectId}`, {
      projectId,
      generatedSite,
      companyName: intake.companyName,
    });

    console.log(`[GENERATOR] Project ${projectId} generated, sent to deployer`);

  } catch (error) {
    console.error(`[GENERATOR] Error processing project ${projectId}:`, error);

    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        failedModule: 'generator',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Create and export worker
export let generatorWorker: Worker<GeneratorJobData> | null = null;

export function startGeneratorWorker(): Worker<GeneratorJobData> {
  if (generatorWorker) {
    return generatorWorker;
  }

  generatorWorker = new Worker<GeneratorJobData>(
    QUEUES.GENERATOR,
    processGeneration,
    {
      connection: getRedisConnection(),
      concurrency: 1, // One at a time due to heavy API usage
    }
  );

  generatorWorker.on('completed', (job) => {
    console.log(`[GENERATOR] Job ${job.id} completed`);
  });

  generatorWorker.on('failed', (job, error) => {
    console.error(`[GENERATOR] Job ${job?.id} failed:`, error);
  });

  console.log('[GENERATOR] Worker started');

  return generatorWorker;
}

export function stopGeneratorWorker(): void {
  if (generatorWorker) {
    generatorWorker.close();
    generatorWorker = null;
    console.log('[GENERATOR] Worker stopped');
  }
}
