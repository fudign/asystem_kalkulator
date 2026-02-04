import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};

// Singleton Redis connection
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('error', (error) => {
      console.error('[Redis] Connection error:', error);
    });

    redisClient.on('close', () => {
      console.log('[Redis] Connection closed');
    });
  }

  return redisClient;
}

// For BullMQ - separate connections for publisher and subscriber
export function createRedisConnection(): Redis {
  const conn = new Redis(redisConfig);

  conn.on('connect', () => {
    console.log('[Redis/BullMQ] Connection established');
  });

  conn.on('error', (error) => {
    console.error('[Redis/BullMQ] Connection error:', error.message);
  });

  conn.on('ready', () => {
    console.log('[Redis/BullMQ] Ready to accept commands');
  });

  return conn;
}

// Close Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
