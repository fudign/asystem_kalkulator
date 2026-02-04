import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './redis.js';
import { processGeneration } from './processor.js';
import type { GenerationJobData, GenerationJobResult } from './types.js';

const QUEUE_NAME = 'kp-generation';

let worker: Worker<GenerationJobData, GenerationJobResult> | null = null;

export function startWorker(): void {
  if (worker) {
    console.log('[Worker] Already running');
    return;
  }

  const connection = getRedisConnection();

  worker = new Worker<GenerationJobData, GenerationJobResult>(
    QUEUE_NAME,
    async (job: Job<GenerationJobData, GenerationJobResult>) => {
      console.log(`[Worker] Processing job ${job.id}`);
      return processGeneration(job);
    },
    {
      connection,
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1'),
      limiter: {
        max: 5,
        duration: 60000, // Max 5 jobs per minute
      },
    }
  );

  // Event handlers
  worker.on('ready', () => {
    console.log('[Worker] Ready to process jobs');
  });

  worker.on('active', (job) => {
    console.log(`[Worker] Job ${job.id} is now active`);
  });

  worker.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} completed`);
    console.log(`[Worker] Result: PDF at ${result.pdfUrl}, ${result.screenshots.length} screenshots`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Job ${job?.id} failed:`, error.message);
  });

  worker.on('progress', (job, progress) => {
    console.log(`[Worker] Job ${job.id} progress:`, progress);
  });

  worker.on('error', (error) => {
    console.error('[Worker] Error:', error);
  });

  console.log('[Worker] Started');
}

export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('[Worker] Stopped');
  }
}

export function getWorker(): Worker<GenerationJobData, GenerationJobResult> | null {
  return worker;
}
