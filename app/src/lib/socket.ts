'use client';

import { io, Socket } from 'socket.io-client';
import { useContextStore } from '@/store/contextStore';
import type { GenerationStatus, BmadQuestion } from '@/types/context.types';

// Socket.IO client instance
let socket: Socket | null = null;

// Event types from BMAD Worker
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

// Events we send to server
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

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

    socket = io(socketUrl, {
      autoConnect: false,
      reconnection: false,  // Disable auto-reconnection - using BullMQ pipeline instead
      reconnectionAttempts: 0,
      timeout: 5000,
    });

    // Set up event listeners
    setupSocketListeners(socket);
  }

  return socket as Socket<ServerToClientEvents, ClientToServerEvents>;
}

function setupSocketListeners(socket: Socket) {
  const { setGenerationStatus, setGenerationJobId } = useContextStore.getState();

  socket.on('connect', () => {
    console.log('[Socket] Connected to BMAD Worker');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
  });

  // Generation status updates
  socket.on('generation:status', ({ jobId, status }) => {
    console.log('[Socket] Status update:', jobId, status);
    // Store job ID on first status update
    if (jobId) {
      setGenerationJobId(jobId);
    }
    setGenerationStatus(status);
  });

  // BMAD asking a question
  socket.on('generation:question', ({ jobId, question }) => {
    console.log('[Socket] Question received:', question);
    setGenerationStatus({
      state: 'waiting_for_input',
      progress: useContextStore.getState().generationStatus?.progress || 0,
      currentStep: useContextStore.getState().generationStatus?.currentStep,
      question,
    });
  });

  // Generation completed
  socket.on('generation:completed', ({ jobId, pdfUrl, screenshots }) => {
    console.log('[Socket] Generation completed:', jobId);
    setGenerationStatus({
      state: 'completed',
      progress: 100,
      result: {
        pdfUrl,
        screenshots,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Save project data to database
    saveProjectToDatabase(pdfUrl);
  });

  // Generation failed
  socket.on('generation:failed', ({ jobId, error }) => {
    console.error('[Socket] Generation failed:', error);
    setGenerationStatus({
      state: 'failed',
      progress: 0,
      error,
    });
  });
}

// Connect to socket server
export function connectSocket(): void {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
}

// Disconnect from socket server
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

// Start generation
export function startGeneration(data: {
  sessionId: string;
  context: Record<string, unknown>;
  selectedServices: Array<{ name: string; price: number; quantity: number }>;
}): void {
  const socket = getSocket();

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('generation:start', data);
}

// Answer BMAD question
export function answerQuestion(jobId: string, questionId: string, answer: string): void {
  const socket = getSocket();
  socket.emit('generation:answer', { jobId, questionId, answer });
}

// Cancel generation
export function cancelGeneration(jobId: string): void {
  const socket = getSocket();
  socket.emit('generation:cancel', { jobId });
}

// Save project data to database after generation
async function saveProjectToDatabase(pdfUrl: string): Promise<void> {
  try {
    const state = useContextStore.getState();

    const projectData = {
      projectName: state.projectName,
      businessType: state.businessType,
      targetAudience: state.targetAudience,
      planData: JSON.stringify({
        mainFeatures: state.mainFeatures,
        budget: state.budget,
        timeline: state.timeline,
        aiSummary: generateAiSummary(state as unknown as Record<string, unknown>),
      }),
      pdfUrl,
    } as Record<string, unknown>;

    const res = await fetch('/api/user/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    if (res.ok) {
      console.log('[Socket] Project saved to database');
    } else {
      console.error('[Socket] Failed to save project');
    }
  } catch (error) {
    console.error('[Socket] Error saving project:', error);
  }
}

// Generate a simple AI summary from the collected context
function generateAiSummary(state: Record<string, unknown>): string {
  const parts: string[] = [];

  if (state.businessType) {
    parts.push(`Тип бизнеса: ${state.businessType}`);
  }
  if (state.projectName) {
    parts.push(`Проект "${state.projectName}"`);
  }
  if (state.targetAudience) {
    parts.push(`Целевая аудитория: ${state.targetAudience}`);
  }
  if (Array.isArray(state.mainFeatures) && state.mainFeatures.length > 0) {
    parts.push(`Требуемый функционал: ${state.mainFeatures.join(', ')}`);
  }

  return parts.length > 0
    ? parts.join('. ') + '.'
    : 'Информация о проекте не была собрана.';
}
