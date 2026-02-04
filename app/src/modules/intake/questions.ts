// Intake questions configuration

export const BUSINESS_TYPES = [
  'Кофейня/Ресторан',
  'Салон красоты/Барбершоп',
  'Фитнес/Спорт',
  'Медицина/Клиника',
  'Образование/Курсы',
  'IT/Технологии',
  'Строительство/Ремонт',
  'Недвижимость',
  'Автосервис/Автомойка',
  'Магазин/Ритейл',
  'Творческая студия',
  'Юридические услуги',
  'Консалтинг',
  'Производство',
  'Другое',
] as const;

export const SITE_GOALS = [
  { id: 'attract', label: 'Привлечение клиентов' },
  { id: 'sales', label: 'Онлайн-продажи' },
  { id: 'info', label: 'Информирование о услугах' },
  { id: 'leads', label: 'Сбор заявок' },
  { id: 'portfolio', label: 'Портфолио работ' },
  { id: 'blog', label: 'Блог/Контент' },
  { id: 'booking', label: 'Онлайн-запись' },
  { id: 'catalog', label: 'Каталог товаров' },
] as const;

export const DESIGN_STYLES = [
  { id: 'minimal', label: 'Минималистичный' },
  { id: 'modern', label: 'Современный/Модерн' },
  { id: 'corporate', label: 'Корпоративный' },
  { id: 'creative', label: 'Яркий/Креативный' },
  { id: 'elegant', label: 'Элегантный/Премиум' },
  { id: 'friendly', label: 'Дружелюбный/Тёплый' },
] as const;

export interface IntakeQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'tags' | 'email' | 'phone';
  required: boolean;
  placeholder?: string;
  options?: readonly { id: string; label: string }[] | readonly string[];
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: 'companyName',
    question: 'Как называется ваша компания?',
    description: 'Это название будет использоваться на сайте',
    type: 'text',
    required: true,
    placeholder: 'Например: Кофейня Бариста',
  },
  {
    id: 'businessType',
    question: 'Какой у вас тип бизнеса?',
    type: 'select',
    required: true,
    options: BUSINESS_TYPES,
  },
  {
    id: 'businessDescription',
    question: 'Расскажите о вашем бизнесе',
    description: 'Что делает вас особенными? Чем вы отличаетесь от других?',
    type: 'textarea',
    required: false,
    placeholder: 'Мы — семейная кофейня в центре Бишкека. Обжариваем зёрна сами...',
  },
  {
    id: 'targetAudience',
    question: 'Кто ваши клиенты?',
    description: 'Опишите вашу целевую аудиторию',
    type: 'textarea',
    required: true,
    placeholder: 'Молодые профессионалы 25-40 лет, ценящие качественный кофе...',
  },
  {
    id: 'competitors',
    question: 'Ваши конкуренты',
    description: 'Назовите 2-3 конкурентов или оставьте пустым — мы найдём сами',
    type: 'tags',
    required: false,
    placeholder: 'Введите название или сайт',
  },
  {
    id: 'siteGoals',
    question: 'Что должен делать сайт?',
    description: 'Выберите основные задачи',
    type: 'multiselect',
    required: true,
    options: SITE_GOALS,
  },
  {
    id: 'designPreferences',
    question: 'Какой стиль вам ближе?',
    type: 'select',
    required: false,
    options: DESIGN_STYLES,
  },
  {
    id: 'additionalNotes',
    question: 'Что ещё нам важно знать?',
    description: 'Любые дополнительные пожелания',
    type: 'textarea',
    required: false,
    placeholder: 'Хотим интеграцию с Instagram, доставку через Glovo...',
  },
  {
    id: 'contactName',
    question: 'Как к вам обращаться?',
    type: 'text',
    required: true,
    placeholder: 'Ваше имя',
  },
  {
    id: 'contactEmail',
    question: 'Email для связи',
    description: 'Сюда отправим готовое КП и демо-сайт',
    type: 'email',
    required: true,
    placeholder: 'email@example.com',
  },
  {
    id: 'contactPhone',
    question: 'Телефон',
    type: 'phone',
    required: false,
    placeholder: '+996 XXX XXX XXX',
  },
];

// Get question by ID
export function getQuestion(id: string): IntakeQuestion | undefined {
  return INTAKE_QUESTIONS.find(q => q.id === id);
}

// Get required questions
export function getRequiredQuestions(): IntakeQuestion[] {
  return INTAKE_QUESTIONS.filter(q => q.required);
}
