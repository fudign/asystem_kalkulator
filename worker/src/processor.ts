import { Job } from 'bullmq';
import { sendProgress, sendCompleted, sendFailed, askQuestion } from './socket.js';
import { generateBrief } from './generators/brief.js';
import { generatePrd } from './generators/prd.js';
import { generateArchitecture } from './generators/architecture.js';
import { generateDemoSite } from './generators/demo.js';
import { takeScreenshots } from './screenshots.js';
import { generatePdf } from './pdf.js';
import { saveArtifacts, getArtifactUrl } from './storage.js';
import type {
  GenerationJobData,
  GenerationJobResult,
  ProgressUpdate,
  BmadQuestion,
  BmadArtifacts,
} from './types.js';

// Main processing function
export async function processGeneration(
  job: Job<GenerationJobData, GenerationJobResult>
): Promise<GenerationJobResult> {
  const { sessionId, context, selectedServices } = job.data;
  const jobId = job.id!;

  console.log(`[Processor] Starting generation for session ${sessionId}`);

  try {
    // Track current progress for questions
    let currentProgress = 0;
    let currentStep: ProgressUpdate['currentStep'] = 'analysis';

    // Helper to update progress
    const updateProgress = async (progress: number, step: ProgressUpdate['currentStep'], message?: string) => {
      currentProgress = progress;
      currentStep = step;
      await job.updateProgress({ progress, currentStep: step, message });
      sendProgress(jobId, sessionId, { progress, currentStep: step, message });
    };

    // Helper to ask questions
    const askUserQuestion = async (question: BmadQuestion): Promise<string> => {
      await job.updateProgress({
        progress: currentProgress,
        currentStep: currentStep,
        question,
      });
      return askQuestion(jobId, sessionId, question);
    };

    // Check for cancellation
    const checkCancelled = async () => {
      // Refresh job data to check for cancellation
      const currentData = job.data as any;
      if (currentData?.cancelled) {
        throw new Error('Job cancelled by user');
      }
    };

    // ========================================
    // Step 1: Analysis (0-10%)
    // ========================================
    await updateProgress(0, 'analysis', 'Анализирую требования...');
    await checkCancelled();

    // Validate and enrich context
    const enrichedContext = await analyzeContext(context, selectedServices, askUserQuestion);
    await updateProgress(10, 'analysis', 'Анализ завершён');

    // ========================================
    // Step 2: Generate Brief (10-25%)
    // ========================================
    await updateProgress(15, 'brief', 'Создаю Product Brief...');
    await checkCancelled();

    const brief = await generateBrief(enrichedContext, selectedServices);
    await updateProgress(25, 'brief', 'Product Brief готов');

    // ========================================
    // Step 3: Generate PRD (25-40%)
    // ========================================
    await updateProgress(30, 'prd', 'Создаю техническое задание...');
    await checkCancelled();

    const prd = await generatePrd(brief, enrichedContext, selectedServices);
    await updateProgress(40, 'prd', 'ТЗ готово');

    // ========================================
    // Step 4: Generate Architecture (40-55%)
    // ========================================
    await updateProgress(45, 'architecture', 'Проектирую архитектуру...');
    await checkCancelled();

    const architecture = await generateArchitecture(prd, selectedServices);
    await updateProgress(55, 'architecture', 'Архитектура готова');

    // ========================================
    // Step 5: Generate Demo Site (55-75%)
    // ========================================
    await updateProgress(60, 'demo', 'Создаю демо-сайт...');
    await checkCancelled();

    const demoCode = await generateDemoSite(brief, prd, architecture, enrichedContext);
    await updateProgress(75, 'demo', 'Демо-сайт готов');

    // ========================================
    // Step 6: Take Screenshots (75-85%)
    // ========================================
    await updateProgress(78, 'screenshots', 'Делаю скриншоты...');
    await checkCancelled();

    const screenshotPaths = await takeScreenshots(demoCode, sessionId);
    await updateProgress(85, 'screenshots', 'Скриншоты готовы');

    // ========================================
    // Step 7: Generate PDF (85-100%)
    // ========================================
    await updateProgress(88, 'pdf', 'Формирую КП...');
    await checkCancelled();

    // Save all artifacts
    const artifacts: BmadArtifacts = { brief, prd, architecture, demoCode };
    await saveArtifacts(sessionId, artifacts);

    // Generate PDF
    const pdfPath = await generatePdf(sessionId, {
      context: enrichedContext,
      selectedServices,
      brief,
      prd,
      screenshots: screenshotPaths,
    });

    await updateProgress(100, 'pdf', 'КП готово!');

    // Build result
    const result: GenerationJobResult = {
      pdfUrl: getArtifactUrl(pdfPath),
      screenshots: screenshotPaths.map(getArtifactUrl),
      completedAt: new Date(),
    };

    // Notify web app
    sendCompleted(jobId, sessionId, result);

    console.log(`[Processor] Generation completed for session ${sessionId}`);
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Processor] Generation failed for session ${sessionId}:`, errorMessage);

    sendFailed(jobId, sessionId, errorMessage);
    throw error;
  }
}

// Analyze and enrich context, asking questions if needed
async function analyzeContext(
  context: GenerationJobData['context'],
  services: GenerationJobData['selectedServices'],
  askQuestion: (q: BmadQuestion) => Promise<string>
): Promise<GenerationJobData['context']> {
  const enriched = { ...context };

  // Ask for project name if missing
  if (!enriched.projectName) {
    const answer = await askQuestion({
      id: 'projectName',
      question: 'Как называется ваш проект или компания?',
      field: 'projectName',
    });
    enriched.projectName = answer;
  }

  // Ask for business description if only type is provided
  if (enriched.businessType && !enriched.businessDescription) {
    const answer = await askQuestion({
      id: 'businessDescription',
      question: `Расскажите подробнее о вашем бизнесе (${enriched.businessType}). Чем вы занимаетесь?`,
      field: 'businessDescription',
    });
    enriched.businessDescription = answer;
  }

  // Ask for target audience if missing
  if (!enriched.targetAudience) {
    const answer = await askQuestion({
      id: 'targetAudience',
      question: 'Кто ваши основные клиенты? Опишите целевую аудиторию.',
      field: 'targetAudience',
    });
    enriched.targetAudience = answer;
  }

  // Infer features from selected services if not specified
  if (enriched.mainFeatures.length === 0 && services.length > 0) {
    enriched.mainFeatures = services.map(s => s.name);
  }

  return enriched;
}
