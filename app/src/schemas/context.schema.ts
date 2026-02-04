import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
});

export const bmadQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  field: z.string(),
  options: z.array(z.string()).optional(),
});

export const generationResultSchema = z.object({
  pdfUrl: z.string().url(),
  screenshots: z.array(z.string().url()),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export const generationStatusSchema = z.object({
  state: z.enum(['queued', 'processing', 'waiting_for_input', 'completed', 'failed', 'generating']),
  currentStep: z.string().optional(),
  progress: z.number().min(0).max(100),
  question: bmadQuestionSchema.optional(),
  result: generationResultSchema.optional(),
  error: z.string().optional(),
});

export const projectContextSchema = z.object({
  sessionId: z.string(),
  projectName: z.string().optional(),
  businessType: z.string().optional(),
  businessDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  mainFeatures: z.array(z.string()).default([]),
  budget: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  designPreferences: z.string().optional(),
  integrations: z.array(z.string()).default([]),
  timeline: z.string().optional(),
  collectedFields: z.array(z.string()).default([]),
  missingRequiredFields: z.array(z.string()).default([]),
  conversationHistory: z.array(messageSchema).default([]),
  readyToGenerate: z.boolean().default(false),
  generationJobId: z.string().optional(),
  generationStatus: generationStatusSchema.optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type BmadQuestion = z.infer<typeof bmadQuestionSchema>;
export type GenerationResult = z.infer<typeof generationResultSchema>;
export type GenerationStatus = z.infer<typeof generationStatusSchema>;
export type ProjectContext = z.infer<typeof projectContextSchema>;
