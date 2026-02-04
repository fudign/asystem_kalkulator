// BullMQ Queue configuration for ASYSTEM Generator Platform

import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from './constants';

// Redis connection (reuse existing connection config)
const getRedisConnection = () => {
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });
};

// Create queue instance
export function createQueue(queueName: string): Queue {
  return new Queue(queueName, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        count: 100,
        age: 24 * 60 * 60, // 24 hours
      },
      removeOnFail: {
        count: 50,
      },
    },
  });
}

// Create worker instance
export function createWorker<T, R>(
  queueName: string,
  processor: (job: Job<T>) => Promise<R>,
  concurrency: number = 1
): Worker<T, R> {
  return new Worker<T, R>(queueName, processor, {
    connection: getRedisConnection(),
    concurrency,
  });
}

// Queue instances (lazy loaded)
let queues: Record<string, Queue> | null = null;

export function getQueues() {
  if (!queues) {
    queues = {
      intake: createQueue(QUEUES.INTAKE),
      researcher: createQueue(QUEUES.RESEARCHER),
      planner: createQueue(QUEUES.PLANNER),
      generator: createQueue(QUEUES.GENERATOR),
      deployer: createQueue(QUEUES.DEPLOYER),
      documents: createQueue(QUEUES.DOCUMENTS),
    };
  }
  return queues;
}

// Helper to add job to next queue in pipeline
export async function addToNextQueue(
  currentQueue: keyof typeof QUEUES,
  projectId: string,
  data: Record<string, unknown>
): Promise<void> {
  const queues = getQueues();
  const queueOrder: (keyof typeof QUEUES)[] = [
    'INTAKE',
    'RESEARCHER',
    'PLANNER',
    'GENERATOR',
    'DEPLOYER',
    'DOCUMENTS',
  ];

  const currentIndex = queueOrder.indexOf(currentQueue);
  const nextQueue = queueOrder[currentIndex + 1];

  if (nextQueue) {
    const queueKey = nextQueue.toLowerCase() as keyof typeof queues;
    await queues[queueKey].add(`project-${projectId}`, {
      projectId,
      ...data,
    });
    console.log(`[Queue] Added job to ${nextQueue} for project ${projectId}`);
  }
}

// Helper to get queue by name
export function getQueue(name: keyof typeof QUEUES): Queue {
  const queues = getQueues();
  const queueKey = name.toLowerCase() as keyof typeof queues;
  return queues[queueKey];
}
