import { io, Socket } from 'socket.io-client';
import type { ProgressUpdate, BmadQuestion } from './types.js';

let socket: Socket | null = null;

export function connectToWebApp(): void {
  const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3000';

  socket = io(webAppUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    transports: ['polling', 'websocket'],
    auth: {
      token: process.env.WORKER_SECRET || 'worker-secret',
    },
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to Web App');
    // Register as worker
    socket?.emit('worker:register', {
      workerId: process.env.WORKER_ID || 'worker-1',
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected from Web App:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  // Listen for answer responses from web app
  socket.on('worker:answer', (data: { jobId: string; questionId: string; answer: string }) => {
    console.log('[Socket] Received answer for job:', data.jobId);
    // This will be handled by the processor via a callback system
    answerCallbacks.get(data.jobId)?.(data.questionId, data.answer);
  });
}

export function disconnectFromWebApp(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Send progress update to web app
export function sendProgress(jobId: string, sessionId: string, progress: ProgressUpdate): void {
  if (socket?.connected) {
    socket.emit('worker:progress', {
      jobId,
      sessionId,
      ...progress,
    });
  }
}

// Send question to web app and wait for answer
const answerCallbacks = new Map<string, (questionId: string, answer: string) => void>();

export function askQuestion(
  jobId: string,
  sessionId: string,
  question: BmadQuestion
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error('Not connected to web app'));
      return;
    }

    const timeout = setTimeout(() => {
      answerCallbacks.delete(jobId);
      reject(new Error('Question timeout'));
    }, 5 * 60 * 1000); // 5 minute timeout

    answerCallbacks.set(jobId, (questionId, answer) => {
      if (questionId === question.id) {
        clearTimeout(timeout);
        answerCallbacks.delete(jobId);
        resolve(answer);
      }
    });

    socket.emit('worker:question', {
      jobId,
      sessionId,
      question,
    });
  });
}

// Send completion to web app
export function sendCompleted(
  jobId: string,
  sessionId: string,
  result: { pdfUrl: string; screenshots: string[] }
): void {
  if (socket?.connected) {
    socket.emit('worker:completed', {
      jobId,
      sessionId,
      ...result,
    });
  }
}

// Send failure to web app
export function sendFailed(jobId: string, sessionId: string, error: string): void {
  if (socket?.connected) {
    socket.emit('worker:failed', {
      jobId,
      sessionId,
      error,
    });
  }
}
