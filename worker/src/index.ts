import 'dotenv/config';
import { startWorker, stopWorker } from './worker.js';
import { connectToWebApp, disconnectFromWebApp } from './socket.js';
import { startFileServer } from './fileServer.js';

console.log('🚀 BMAD Worker starting...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Start file server for serving screenshots and PDFs
startFileServer();

// Connect to web app via Socket.IO
connectToWebApp();

// Start the job processor
startWorker();

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n📴 Received ${signal}, shutting down gracefully...`);

  await stopWorker();
  disconnectFromWebApp();

  console.log('👋 BMAD Worker stopped');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('✅ BMAD Worker is running');
