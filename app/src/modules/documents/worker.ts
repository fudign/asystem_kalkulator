// Module 6: DOCUMENTS Worker
// Generates KP, Presentation and sends to client

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from '@/shared/constants';
import { prisma } from '@/lib/prisma';
import { generateKP } from './kp-generator';
import { generatePresentation } from './presentation-generator';
import { sendKPEmail, sendAdminNotification } from './email-sender';
import type { IntakeData } from '@/modules/intake/validation';
import type { ProjectPlan, ResearchResult } from '@/shared/types';

interface DocumentsJobData {
  projectId: string;
  deploymentUrl: string;
  previewUrl: string;
  intake: IntakeData | null;
  plan: ProjectPlan | null;
  research: ResearchResult | null;
}

// Create Redis connection
const getRedisConnection = () => {
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });
};

// Process documents generation job
async function processDocuments(job: Job<DocumentsJobData>): Promise<void> {
  const { projectId, deploymentUrl, previewUrl, intake, plan, research } = job.data;

  console.log(`[DOCUMENTS] Processing documents for project ${projectId}`);

  if (!intake || !plan) {
    console.error(`[DOCUMENTS] Missing intake or plan data for project ${projectId}`);
    throw new Error('Missing required data for document generation');
  }

  try {
    // Update status
    await prisma.clientProject.update({
      where: { id: projectId },
      data: { status: 'generating_documents' },
    });

    // Prepare input for generators
    const generatorInput = {
      projectId,
      intake,
      plan,
      research: research || {
        industryTrends: [],
        competitorAnalysis: [],
        recommendations: [],
        competitors: [],
        targetAudienceInsights: [],
      },
      deploymentUrl,
      previewUrl,
    };

    // Generate KP PDF
    console.log(`[DOCUMENTS] Generating KP for ${projectId}...`);
    let kpPdfPath = '';
    try {
      kpPdfPath = await generateKP(generatorInput);
    } catch (error) {
      console.error(`[DOCUMENTS] Failed to generate KP:`, error);
    }

    // Generate Presentation PDF
    console.log(`[DOCUMENTS] Generating presentation for ${projectId}...`);
    let presentationPdfPath = '';
    try {
      presentationPdfPath = await generatePresentation(generatorInput);
    } catch (error) {
      console.error(`[DOCUMENTS] Failed to generate presentation:`, error);
    }

    // Update database with document paths
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        kpPdfUrl: kpPdfPath,
        presentationPdfUrl: presentationPdfPath,
        updatedAt: new Date(),
      },
    });

    // Send email to client
    if (intake.contactEmail && (kpPdfPath || presentationPdfPath)) {
      console.log(`[DOCUMENTS] Sending documents to ${intake.contactEmail}...`);

      const emailSent = await sendKPEmail({
        recipientEmail: intake.contactEmail,
        companyName: intake.companyName || 'Клиент',
        deploymentUrl,
        kpPdfPath,
        presentationPdfPath,
      });

      if (emailSent) {
        console.log(`[DOCUMENTS] Email sent successfully to ${intake.contactEmail}`);
      } else {
        console.warn(`[DOCUMENTS] Failed to send email to ${intake.contactEmail}`);
      }
    }

    // Send admin notification
    await sendAdminNotification(
      projectId,
      intake.companyName || 'Unknown',
      deploymentUrl
    );

    // Mark project as completed
    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`[DOCUMENTS] Project ${projectId} completed successfully!`);

  } catch (error) {
    console.error(`[DOCUMENTS] Error processing project ${projectId}:`, error);

    await prisma.clientProject.update({
      where: { id: projectId },
      data: {
        status: 'failed',
        failedModule: 'documents',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Create and export worker
export let documentsWorker: Worker<DocumentsJobData> | null = null;

export function startDocumentsWorker(): Worker<DocumentsJobData> {
  if (documentsWorker) {
    return documentsWorker;
  }

  documentsWorker = new Worker<DocumentsJobData>(
    QUEUES.DOCUMENTS,
    processDocuments,
    {
      connection: getRedisConnection(),
      concurrency: 2,
    }
  );

  documentsWorker.on('completed', (job) => {
    console.log(`[DOCUMENTS] Job ${job.id} completed`);
  });

  documentsWorker.on('failed', (job, error) => {
    console.error(`[DOCUMENTS] Job ${job?.id} failed:`, error);
  });

  console.log('[DOCUMENTS] Worker started');

  return documentsWorker;
}

export function stopDocumentsWorker(): void {
  if (documentsWorker) {
    documentsWorker.close();
    documentsWorker = null;
    console.log('[DOCUMENTS] Worker stopped');
  }
}
