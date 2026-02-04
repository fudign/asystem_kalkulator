export interface ProjectContext {
  // Идентификация
  sessionId: string;

  // Собранные данные
  projectName?: string;
  businessType?: string;
  businessDescription?: string;
  targetAudience?: string;
  mainFeatures: string[];
  budget?: { min: number; max: number };
  designPreferences?: string;
  integrations: string[];
  timeline?: string;

  // Трекинг
  collectedFields: string[];
  missingRequiredFields: string[];
  conversationHistory: Message[];

  // Статус
  readyToGenerate: boolean;
  generationJobId?: string;
  generationStatus?: GenerationStatus;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GenerationStatus {
  state: 'queued' | 'processing' | 'waiting_for_input' | 'completed' | 'failed' | 'generating';
  currentStep?: string;
  progress: number;
  question?: BmadQuestion;
  result?: GenerationResult;
  error?: string;
}

export interface BmadQuestion {
  id: string;
  question: string;
  field: string;
  options?: string[];
}

export interface GenerationResult {
  pdfUrl: string;
  screenshots: string[];
  createdAt: Date;
  expiresAt: Date;
}
