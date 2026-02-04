// Shared types for ASYSTEM Generator Platform

export type ProjectStatus =
  | 'intake_pending'        // Ожидает заполнения
  | 'intake_complete'       // Данные собраны
  | 'researching'           // Исследование
  | 'planning'              // Создание эпиков
  | 'awaiting_approval'     // Ждём подтверждения клиента
  | 'approved'              // Клиент подтвердил
  | 'generating'            // Генерация сайта
  | 'deploying'             // Деплой
  | 'generating_documents'  // Создание КП и Презентации
  | 'completed'             // Готово
  | 'failed';               // Ошибка

export interface ClientIntake {
  // Основная информация
  companyName: string;
  businessType: string;
  businessDescription?: string;

  // Целевая аудитория
  targetAudience: string;

  // Конкуренты
  competitors?: string[];
  findCompetitors?: boolean; // Найти автоматически

  // Цели сайта
  siteGoals: string[];

  // Дополнительные пожелания
  designPreferences?: string;
  additionalNotes?: string;

  // Контакты
  contactEmail: string;
  contactPhone?: string;
  contactName: string;
}

export interface ResearchResult {
  competitors: CompetitorAnalysis[];
  industryTrends: string[];
  targetAudienceInsights: string[];
  recommendations: string[];
}

export interface CompetitorAnalysis {
  name: string;
  url: string;
  strengths: string[];
  weaknesses: string[];
  features: string[];
}

export interface ProjectPlan {
  summary: string;
  epics: Epic[];
  siteStructure: SitePage[];
  estimatedFeatures: string[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  stories: UserStory[];
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface SitePage {
  name: string;
  path: string;
  purpose: string;
  components: string[];
}

export interface GeneratedSite {
  projectPath: string;
  files: GeneratedFile[];
  buildStatus: 'success' | 'failed';
  errors?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface DeploymentResult {
  url: string;
  previewUrl: string;
  deploymentId: string;
  status: 'success' | 'failed';
}

export interface DocumentsResult {
  kpPdfUrl: string;
  presentationPdfUrl: string;
  emailSent: boolean;
}

// Full project data flowing through the pipeline
export interface GeneratorProject {
  id: string;
  status: ProjectStatus;
  userId: string;

  // Stage 1: Intake
  intake?: ClientIntake;

  // Stage 2: Research
  research?: ResearchResult;

  // Stage 3: Planning
  plan?: ProjectPlan;
  clientApproved?: boolean;

  // Stage 4: Generation
  generatedSite?: GeneratedSite;

  // Stage 5: Deployment
  deployment?: DeploymentResult;

  // Stage 6: Documents
  documents?: DocumentsResult;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Error tracking
  lastError?: string;
  failedAt?: string; // Which module failed
}

// Queue job payloads
export interface IntakeJobData {
  projectId: string;
  intake: ClientIntake;
}

export interface ResearcherJobData {
  projectId: string;
  intake: ClientIntake;
}

export interface PlannerJobData {
  projectId: string;
  intake: ClientIntake;
  research: ResearchResult;
}

export interface GeneratorJobData {
  projectId: string;
  intake: ClientIntake;
  plan: ProjectPlan;
}

export interface DeployerJobData {
  projectId: string;
  generatedSite: GeneratedSite;
  companyName: string;
}

export interface DocumentsJobData {
  projectId: string;
  intake: ClientIntake;
  plan: ProjectPlan;
  deployment: DeploymentResult;
}
