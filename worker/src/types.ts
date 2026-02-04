// Job data from the web app
export interface GenerationJobData {
  sessionId: string;
  context: ProjectContext;
  selectedServices: ServiceItem[];
  createdAt: Date;
  answers?: Record<string, string>;
  cancelled?: boolean;
}

// Project context collected from chat
export interface ProjectContext {
  projectName?: string;
  businessType?: string;
  businessDescription?: string;
  targetAudience?: string;
  mainFeatures: string[];
  budget?: { min: number; max: number };
  designPreferences?: string;
  integrations: string[];
  timeline?: string;
}

// Selected service from calculator
export interface ServiceItem {
  name: string;
  price: number;
  quantity: number;
}

// Job result
export interface GenerationJobResult {
  pdfUrl: string;
  screenshots: string[];
  completedAt: Date;
}

// Progress update
export interface ProgressUpdate {
  progress: number;
  currentStep: GenerationStep;
  message?: string;
}

// Generation steps
export type GenerationStep =
  | 'analysis'
  | 'brief'
  | 'prd'
  | 'architecture'
  | 'demo'
  | 'screenshots'
  | 'pdf';

// Question to ask user
export interface BmadQuestion {
  id: string;
  question: string;
  field: string;
  options?: string[];
}

// BMAD artifacts
export interface BmadArtifacts {
  brief: string;
  prd: string;
  architecture: string;
  demoCode: string;
}

// Screenshot config
export interface ScreenshotConfig {
  width: number;
  height: number;
  pages: string[];
}
