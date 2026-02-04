// Module 5: DEPLOYER Worker
// Deploys generated sites to Vercel with watermark

import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';
import { QUEUES } from '@/shared/constants';
import { prisma } from '@/lib/prisma';
import { deployToVercel } from './vercel';
import { generateWatermarkComponent, generateWatermarkCSS } from './watermark';
import type { GeneratedSite } from '@/shared/types';

interface DeployerJobData {
  projectId: string;
  generatedSite: GeneratedSite;
  companyName: string;
}

// Create Redis connection
const getRedisConnection = () => {
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });
};

// Inject watermark into generated site
async function injectWatermark(projectPath: string): Promise<void> {
  // 1. Create Watermark component if not exists
  const watermarkPath = path.join(projectPath, 'src/components/Watermark.tsx');
  const watermarkContent = generateWatermarkComponent();
  await fs.writeFile(watermarkPath, watermarkContent, 'utf-8');

  // 2. Add watermark CSS to globals.css
  const globalsPath = path.join(projectPath, 'src/app/globals.css');
  try {
    const existingCSS = await fs.readFile(globalsPath, 'utf-8');
    const watermarkCSS = generateWatermarkCSS();

    // Append if not already present
    if (!existingCSS.includes('.asystem-watermark')) {
      await fs.writeFile(globalsPath, existingCSS + '\n' + watermarkCSS, 'utf-8');
    }
  } catch (error) {
    // Create if doesn't exist
    await fs.writeFile(globalsPath, generateWatermarkCSS(), 'utf-8');
  }

  // 3. Inject Watermark into layout.tsx
  const layoutPath = path.join(projectPath, 'src/app/layout.tsx');
  try {
    let layoutContent = await fs.readFile(layoutPath, 'utf-8');

    // Add import if not present
    if (!layoutContent.includes("import { Watermark }")) {
      layoutContent = layoutContent.replace(
        /^(import .+\n)+/m,
        (match) => match + "import { Watermark } from '@/components/Watermark';\n"
      );
    }

    // Add Watermark component to body if not present
    if (!layoutContent.includes('<Watermark')) {
      layoutContent = layoutContent.replace(
        /<body([^>]*)>([\s\S]*?){children}/,
        '<body$1>$2<Watermark />\n        {children}'
      );
    }

    await fs.writeFile(layoutPath, layoutContent, 'utf-8');
  } catch (error) {
    console.error('[DEPLOYER] Error injecting watermark into layout:', error);
  }
}

// Process deployment job
async function processDeployment(job: Job<DeployerJobData>): Promise<void> {
  const { projectId, generatedSite, companyName } = job.data;
  const projectPath = generatedSite.projectPath;

  console.log(`[DEPLOYER] Processing deployment for project ${projectId}`);

  try {
    // Update status
    await prisma.clientProject.update({
      where: { id: projectId },
      data: { status: 'deploying' },
    });

    // Inject watermark
    console.log(`[DEPLOYER] Injecting watermark for ${projectId}...`);
    await injectWatermark(projectPath);

    // Deploy to Vercel
    console.log(`[DEPLOYER] Deploying to Vercel for ${projectId}...`);
    const deploymentResult = await deployToVercel({
      projectPath,
      projectName: slugify(companyName) || `project-${projectId.slice(0, 8)}`,
    });

    if (deploymentResult.status === 'failed') {
      throw new Error('Deployment to Vercel failed');
    }

    console.log(`[DEPLOYER] Deployed to: ${deploymentResult.url}`);

    // Save deployment data
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        deploymentData: JSON.stringify(deploymentResult),
        deployedUrl: deploymentResult.url,
        previewUrl: deploymentResult.previewUrl,
        updatedAt: new Date(),
      },
    });

    // Add to documents queue
    const documentsQueue = new Queue(QUEUES.DOCUMENTS, {
      connection: getRedisConnection(),
    });

    // Get full project data for document generation
    const project = await prisma.clientProject.findUnique({
      where: { id: projectId },
    });

    await documentsQueue.add(`docs-${projectId}`, {
      projectId,
      deploymentUrl: deploymentResult.url,
      previewUrl: deploymentResult.previewUrl,
      intake: project ? {
        companyName: project.companyName,
        businessType: project.businessType,
        businessDescription: project.businessDescription,
        targetAudience: project.targetAudience,
        contactEmail: project.contactEmail,
        contactPhone: project.contactPhone,
      } : null,
      plan: project?.planData ? JSON.parse(project.planData) : null,
      research: project?.researchData ? JSON.parse(project.researchData) : null,
    });

    console.log(`[DEPLOYER] Project ${projectId} deployed, sent to documents`);

  } catch (error) {
    console.error(`[DEPLOYER] Error deploying project ${projectId}:`, error);

    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        failedModule: 'deployer',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Helper: slugify string
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Create and export worker
export let deployerWorker: Worker<DeployerJobData> | null = null;

export function startDeployerWorker(): Worker<DeployerJobData> {
  if (deployerWorker) {
    return deployerWorker;
  }

  deployerWorker = new Worker<DeployerJobData>(
    QUEUES.DEPLOYER,
    processDeployment,
    {
      connection: getRedisConnection(),
      concurrency: 2, // Can deploy multiple at once
    }
  );

  deployerWorker.on('completed', (job) => {
    console.log(`[DEPLOYER] Job ${job.id} completed`);
  });

  deployerWorker.on('failed', (job, error) => {
    console.error(`[DEPLOYER] Job ${job?.id} failed:`, error);
  });

  console.log('[DEPLOYER] Worker started');

  return deployerWorker;
}

export function stopDeployerWorker(): void {
  if (deployerWorker) {
    deployerWorker.close();
    deployerWorker = null;
    console.log('[DEPLOYER] Worker stopped');
  }
}
