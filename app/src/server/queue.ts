import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { createRedisConnection } from './redis';
import type { ProjectContext } from '@/types/context.types';

// Job data structure
export interface GenerationJobData {
  sessionId: string;
  context: Partial<ProjectContext>;
  selectedServices: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  createdAt: Date;
  answers?: Record<string, string>;
  cancelled?: boolean;
}

// Job result structure
export interface GenerationJobResult {
  pdfUrl: string;
  screenshots: string[];
  completedAt: Date;
}

// Queue name
const QUEUE_NAME = 'kp-generation';

// Use global to persist across Next.js hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __generationQueue: Queue<GenerationJobData, GenerationJobResult> | null;
  // eslint-disable-next-line no-var
  var __queueEvents: QueueEvents | null;
}

// Initialize globals if not exists
if (typeof globalThis.__generationQueue === 'undefined') {
  globalThis.__generationQueue = null;
}
if (typeof globalThis.__queueEvents === 'undefined') {
  globalThis.__queueEvents = null;
}

// Get or create queue
export function getGenerationQueue(): Queue<GenerationJobData, GenerationJobResult> {
  if (!globalThis.__generationQueue) {
    const connection = createRedisConnection();

    globalThis.__generationQueue = new Queue<GenerationJobData, GenerationJobResult>(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          age: 24 * 60 * 60, // Keep completed jobs for 24 hours
          count: 100,
        },
        removeOnFail: {
          age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days
        },
      },
    });

    console.log('[Queue] Generation queue initialized (global)');
  }

  return globalThis.__generationQueue;
}

// Ensure queue is ready before adding jobs
async function ensureQueueReady(): Promise<Queue<GenerationJobData, GenerationJobResult>> {
  const queue = getGenerationQueue();
  await queue.waitUntilReady();
  console.log('[Queue] Queue connection ready');
  return queue;
}

// Get queue events for subscribing to job updates
export function getQueueEvents(): QueueEvents {
  if (!globalThis.__queueEvents) {
    const connection = createRedisConnection();
    globalThis.__queueEvents = new QueueEvents(QUEUE_NAME, { connection });

    globalThis.__queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`[Queue] Job ${jobId} completed`);
    });

    globalThis.__queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`[Queue] Job ${jobId} failed: ${failedReason}`);
    });

    globalThis.__queueEvents.on('progress', ({ jobId, data }) => {
      console.log(`[Queue] Job ${jobId} progress:`, data);
    });

    console.log('[Queue] Queue events initialized (global)');
  }

  return globalThis.__queueEvents;
}

// Add a job to the queue
export async function addGenerationJob(
  data: GenerationJobData
): Promise<Job<GenerationJobData, GenerationJobResult>> {
  // Wait for queue connection to be ready
  const queue = await ensureQueueReady();

  try {
    const job = await queue.add('generate-kp', data, {
      jobId: `kp-${data.sessionId}-${Date.now()}`,
    });

    console.log(`[Queue] Job added: ${job.id}`);

    // Small delay to ensure Redis persistence
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify job was actually added
    const verifyJob = await queue.getJob(job.id!);
    if (verifyJob) {
      console.log(`[Queue] Job verified in Redis: ${job.id}`);
    } else {
      console.error(`[Queue] WARNING: Job ${job.id} not found in Redis after add!`);
    }

    return job;
  } catch (error) {
    console.error('[Queue] Failed to add job:', error);
    throw error;
  }
}

// Get job by ID
export async function getJob(
  jobId: string
): Promise<Job<GenerationJobData, GenerationJobResult> | undefined> {
  const queue = getGenerationQueue();
  return queue.getJob(jobId);
}

// Get job status
export async function getJobStatus(jobId: string): Promise<{
  state: string;
  progress: number;
  data?: GenerationJobData;
  result?: GenerationJobResult;
  failedReason?: string;
} | null> {
  const job = await getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress as number;

  return {
    state,
    progress: typeof progress === 'number' ? progress : 0,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
  };
}

// Cancel a job
export async function cancelJob(jobId: string): Promise<boolean> {
  const job = await getJob(jobId);

  if (!job) {
    return false;
  }

  const state = await job.getState();

  if (state === 'waiting' || state === 'delayed') {
    await job.remove();
    return true;
  }

  // For active jobs, we need to signal cancellation
  // This will be handled by the worker
  await job.updateData({
    ...job.data,
    cancelled: true,
  } as GenerationJobData & { cancelled: boolean });

  return true;
}

// Close queue connections
export async function closeQueue(): Promise<void> {
  if (globalThis.__queueEvents) {
    await globalThis.__queueEvents.close();
    globalThis.__queueEvents = null;
  }

  if (globalThis.__generationQueue) {
    await globalThis.__generationQueue.close();
    globalThis.__generationQueue = null;
  }
}
