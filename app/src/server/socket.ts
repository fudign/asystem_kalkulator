import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { addGenerationJob, getJob, cancelJob, getQueueEvents } from './queue';
import type { ProjectContext, GenerationStatus, BmadQuestion } from '@/types/context.types';

// Socket.IO server instance
let io: SocketServer | null = null;

// Map of sessionId to socket
const sessionSockets = new Map<string, Socket>();

// Map of jobId to sessionId
const jobSessions = new Map<string, string>();

// Worker socket reference - use global to share across Next.js modules
declare global {
  // eslint-disable-next-line no-var
  var __workerSocket: Socket | null;
}

// Initialize global if not exists
if (typeof globalThis.__workerSocket === 'undefined') {
  globalThis.__workerSocket = null;
}

// Getter/setter for workerSocket
function getWorkerSocket(): Socket | null {
  return globalThis.__workerSocket;
}

function setWorkerSocket(socket: Socket | null): void {
  globalThis.__workerSocket = socket;
}

// Event types
interface ClientToServerEvents {
  'generation:start': (data: {
    sessionId: string;
    context: Record<string, unknown>;
    selectedServices: Array<{ name: string; price: number; quantity: number }>;
  }) => void;
  'generation:answer': (data: {
    jobId: string;
    questionId: string;
    answer: string;
  }) => void;
  'generation:cancel': (data: {
    jobId: string;
  }) => void;
}

interface ServerToClientEvents {
  'generation:status': (data: {
    jobId: string;
    status: GenerationStatus;
  }) => void;
  'generation:question': (data: {
    jobId: string;
    question: BmadQuestion;
  }) => void;
  'generation:completed': (data: {
    jobId: string;
    pdfUrl: string;
    screenshots: string[];
  }) => void;
  'generation:failed': (data: {
    jobId: string;
    error: string;
  }) => void;
}

// Initialize Socket.IO server
export function initSocketServer(httpServer: HttpServer): SocketServer {
  if (io) {
    return io;
  }

  io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: [
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://host.docker.internal:3000',
        'http://localhost:3001',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set up queue event listeners
  setupQueueListeners();

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Check if this is a worker connection
    const authToken = socket.handshake.auth?.token;
    const isWorker = authToken === process.env.WORKER_SECRET;

    if (isWorker) {
      console.log(`[Socket] Worker connected: ${socket.id}`);
      setupWorkerHandlers(socket);
      return;
    }

    // Start generation
    socket.on('generation:start', async (data) => {
      try {
        const { sessionId, context, selectedServices } = data;

        // Store socket reference
        sessionSockets.set(sessionId, socket);

        // Add job to queue
        const job = await addGenerationJob({
          sessionId,
          context: context as Partial<ProjectContext>,
          selectedServices,
          createdAt: new Date(),
        });

        // Map job to session
        jobSessions.set(job.id!, sessionId);

        // Send initial status
        socket.emit('generation:status', {
          jobId: job.id!,
          status: {
            state: 'queued',
            progress: 0,
            currentStep: 'analysis',
          },
        });

        console.log(`[Socket] Generation started for session ${sessionId}, job ${job.id}`);
      } catch (error) {
        console.error('[Socket] Error starting generation:', error);
        socket.emit('generation:failed', {
          jobId: '',
          error: 'Failed to start generation',
        });
      }
    });

    // Answer question from BMAD
    socket.on('generation:answer', async (data) => {
      const { jobId, questionId, answer } = data;

      console.log(`[Socket] Answer received for job ${jobId}:`, { questionId, answer });

      // Forward answer to worker
      const ws = getWorkerSocket();
      if (ws?.connected) {
        ws.emit('worker:answer', { jobId, questionId, answer });
        console.log(`[Socket] Forwarded answer to worker for job ${jobId}`);
      } else {
        console.error(`[Socket] Worker not connected, cannot forward answer`);
      }

      const job = await getJob(jobId);
      if (job) {
        // Update job data with the answer
        await job.updateData({
          ...job.data,
          answers: {
            ...job.data.answers,
            [questionId]: answer,
          },
        });

        // Emit status update
        socket.emit('generation:status', {
          jobId,
          status: {
            state: 'processing',
            progress: (job.progress as number) || 0,
            currentStep: 'processing_answer',
          },
        });
      }
    });

    // Cancel generation
    socket.on('generation:cancel', async (data) => {
      const { jobId } = data;

      try {
        await cancelJob(jobId);
        console.log(`[Socket] Generation cancelled: ${jobId}`);

        socket.emit('generation:status', {
          jobId,
          status: {
            state: 'failed',
            progress: 0,
            error: 'Cancelled by user',
          },
        });
      } catch (error) {
        console.error('[Socket] Error cancelling job:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);

      // Clean up session mapping
      for (const [sessionId, s] of sessionSockets.entries()) {
        if (s.id === socket.id) {
          sessionSockets.delete(sessionId);
          break;
        }
      }
    });
  });

  console.log('[Socket] Server initialized');
  return io;
}

// Set up queue event listeners
function setupQueueListeners(): void {
  const queueEvents = getQueueEvents();

  queueEvents.on('progress', ({ jobId, data }) => {
    const sessionId = jobSessions.get(jobId);
    if (sessionId) {
      const socket = sessionSockets.get(sessionId);
      if (socket) {
        // Handle potentially nested progress data
        const rawData = data as Record<string, unknown>;

        // Extract progress - handle both flat and nested structures
        const progress = typeof rawData.progress === 'number'
          ? rawData.progress
          : (rawData.progress as any)?.progress ?? 0;

        const currentStep = typeof rawData.currentStep === 'string'
          ? rawData.currentStep
          : (rawData.progress as any)?.currentStep ?? 'analysis';

        const question = rawData.question as BmadQuestion | undefined;

        console.log(`[Queue] Progress for ${jobId}:`, { progress, currentStep, hasQuestion: !!question });

        if (question) {
          // BMAD is asking a question
          console.log(`[Queue] Emitting question to client for job ${jobId}:`, question.question);
          socket.emit('generation:question', {
            jobId,
            question,
          });
        } else {
          socket.emit('generation:status', {
            jobId,
            status: {
              state: 'processing',
              progress,
              currentStep,
            },
          });
        }
      }
    }
  });

  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    const sessionId = jobSessions.get(jobId);
    if (sessionId) {
      const socket = sessionSockets.get(sessionId);
      if (socket) {
        try {
          // returnvalue can be string or object depending on BullMQ version
          const result = typeof returnvalue === 'string' ? JSON.parse(returnvalue) : returnvalue;
          socket.emit('generation:completed', {
            jobId,
            pdfUrl: result.pdfUrl,
            screenshots: result.screenshots,
          });
        } catch (error) {
          console.error(`[Queue] Error parsing completed result for ${jobId}:`, error);
        }
      }
    }

    // Clean up
    jobSessions.delete(jobId);
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    const sessionId = jobSessions.get(jobId);
    if (sessionId) {
      const socket = sessionSockets.get(sessionId);
      if (socket) {
        socket.emit('generation:failed', {
          jobId,
          error: failedReason || 'Unknown error',
        });
      }
    }

    // Clean up
    jobSessions.delete(jobId);
  });
}

// Get Socket.IO server instance
export function getSocketServer(): SocketServer | null {
  return io;
}

// Forward answer to worker (called from API route)
export function forwardAnswerToWorker(jobId: string, questionId: string, answer: string): boolean {
  const ws = getWorkerSocket();
  if (ws?.connected) {
    ws.emit('worker:answer', { jobId, questionId, answer });
    console.log(`[Socket] Forwarded answer to worker for job ${jobId} via API`);
    return true;
  }
  console.error(`[Socket] Worker not connected, cannot forward answer`);
  return false;
}

// Send status update to specific session
export function sendStatusToSession(
  sessionId: string,
  jobId: string,
  status: GenerationStatus
): void {
  const socket = sessionSockets.get(sessionId);
  if (socket) {
    socket.emit('generation:status', { jobId, status });
  }
}

// Send question to specific session
export function sendQuestionToSession(
  sessionId: string,
  jobId: string,
  question: BmadQuestion
): void {
  const socket = sessionSockets.get(sessionId);
  if (socket) {
    socket.emit('generation:question', { jobId, question });
  }
}

// Handle worker socket events
function setupWorkerHandlers(socket: import('socket.io').Socket): void {
  // Store worker socket reference
  setWorkerSocket(socket as Socket);

  // Worker registration
  socket.on('worker:register', (data: { workerId: string }) => {
    console.log(`[Socket] Worker registered: ${data.workerId}`);
  });

  // Worker sends progress update
  socket.on('worker:progress', (data: {
    jobId: string;
    sessionId: string;
    progress: number;
    currentStep: string;
    message?: string;
  }) => {
    const { sessionId, jobId, progress, currentStep, message } = data;
    jobSessions.set(jobId, sessionId);

    const clientSocket = sessionSockets.get(sessionId);
    if (clientSocket) {
      clientSocket.emit('generation:status', {
        jobId,
        status: {
          state: 'processing',
          progress,
          currentStep,
        },
      });
    }
  });

  // Worker asks a question
  socket.on('worker:question', (data: {
    jobId: string;
    sessionId: string;
    question: BmadQuestion;
  }) => {
    const { sessionId, jobId, question } = data;

    console.log(`[Socket] Worker question for session ${sessionId}:`, question.question);
    console.log(`[Socket] Available sessions:`, Array.from(sessionSockets.keys()));

    const clientSocket = sessionSockets.get(sessionId);
    if (clientSocket) {
      console.log(`[Socket] Sending question to client socket ${clientSocket.id}`);
      clientSocket.emit('generation:question', { jobId, question });
    } else {
      console.error(`[Socket] No client socket found for session ${sessionId}!`);
    }
  });

  // Worker completed generation
  socket.on('worker:completed', (data: {
    jobId: string;
    sessionId: string;
    pdfUrl: string;
    screenshots: string[];
  }) => {
    const { sessionId, jobId, pdfUrl, screenshots } = data;

    const clientSocket = sessionSockets.get(sessionId);
    if (clientSocket) {
      clientSocket.emit('generation:completed', { jobId, pdfUrl, screenshots });
    }

    // Clean up
    jobSessions.delete(jobId);
  });

  // Worker failed
  socket.on('worker:failed', (data: {
    jobId: string;
    sessionId: string;
    error: string;
  }) => {
    const { sessionId, jobId, error } = data;

    const clientSocket = sessionSockets.get(sessionId);
    if (clientSocket) {
      clientSocket.emit('generation:failed', { jobId, error });
    }

    // Clean up
    jobSessions.delete(jobId);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Worker disconnected: ${socket.id}`);
    setWorkerSocket(null);
  });
}
