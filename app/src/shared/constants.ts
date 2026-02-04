// Constants for ASYSTEM Generator Platform

export const QUEUES = {
  INTAKE: 'asystem-intake',
  RESEARCHER: 'asystem-researcher',
  PLANNER: 'asystem-planner',
  GENERATOR: 'asystem-generator',
  DEPLOYER: 'asystem-deployer',
  DOCUMENTS: 'asystem-documents',
} as const;

export const WATERMARK = {
  text: 'ASYSTEM.KG',
  opacity: 0.07,
  rotation: -30,
  fontSize: '120px',
  color: '#000000',
} as const;

export const SITE_GOALS = [
  'Привлечение клиентов',
  'Онлайн-продажи',
  'Информирование о услугах',
  'Сбор заявок',
  'Портфолио работ',
  'Блог/Контент',
  'Онлайн-запись',
  'Каталог товаров',
] as const;

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

export const DESIGN_STYLES = [
  'Минималистичный',
  'Современный/Модерн',
  'Корпоративный',
  'Яркий/Креативный',
  'Элегантный/Премиум',
  'Дружелюбный/Тёплый',
] as const;

// Intake questions for the modal
export const INTAKE_QUESTIONS = [
  {
    id: 'companyName',
    question: 'Как называется ваша компания или проект?',
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
    question: 'Расскажите кратко о вашем бизнесе',
    type: 'textarea',
    required: false,
    placeholder: 'Чем вы занимаетесь, что особенного в вашем бизнесе...',
  },
  {
    id: 'targetAudience',
    question: 'Кто ваша целевая аудитория?',
    type: 'textarea',
    required: true,
    placeholder: 'Например: молодые люди 20-35 лет, любители кофе, работающие рядом...',
  },
  {
    id: 'competitors',
    question: 'Назовите 2-3 ваших конкурентов (или оставьте пустым - мы найдём сами)',
    type: 'tags',
    required: false,
    placeholder: 'Введите название или сайт конкурента',
  },
  {
    id: 'siteGoals',
    question: 'Какие задачи должен решать сайт?',
    type: 'multiselect',
    required: true,
    options: SITE_GOALS,
  },
  {
    id: 'designPreferences',
    question: 'Какой стиль дизайна вам ближе?',
    type: 'select',
    required: false,
    options: DESIGN_STYLES,
  },
  {
    id: 'additionalNotes',
    question: 'Есть что-то ещё, что нам важно знать?',
    type: 'textarea',
    required: false,
    placeholder: 'Любые дополнительные пожелания...',
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
    question: 'Ваш email для связи',
    type: 'email',
    required: true,
    placeholder: 'email@example.com',
  },
  {
    id: 'contactPhone',
    question: 'Телефон для связи',
    type: 'phone',
    required: false,
    placeholder: '+996 XXX XXX XXX',
  },
] as const;

export type IntakeQuestionId = typeof INTAKE_QUESTIONS[number]['id'];
