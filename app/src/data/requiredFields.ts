// Fields required for КП generation
export const REQUIRED_FIELDS = [
  {
    id: 'projectName',
    label: 'Название проекта',
    question: 'Как называется ваш проект или компания?',
  },
  {
    id: 'businessType',
    label: 'Тип бизнеса',
    question: 'Какой у вас бизнес? (например: кофейня, автомойка, магазин)',
  },
  {
    id: 'targetAudience',
    label: 'Целевая аудитория',
    question: 'Кто ваши клиенты? Опишите вашу целевую аудиторию.',
  },
  {
    id: 'mainFeatures',
    label: 'Основные функции',
    question: 'Какие основные функции нужны на сайте/в приложении?',
  },
] as const;

// Optional but helpful fields
export const OPTIONAL_FIELDS = [
  {
    id: 'budget',
    label: 'Бюджет',
    question: 'Какой примерный бюджет на проект?',
  },
  {
    id: 'timeline',
    label: 'Сроки',
    question: 'К какому сроку нужен проект?',
  },
  {
    id: 'designPreferences',
    label: 'Предпочтения по дизайну',
    question: 'Есть ли предпочтения по дизайну? Может, примеры сайтов которые нравятся?',
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    question: 'Нужны ли интеграции с другими сервисами? (1С, CRM, платёжные системы)',
  },
] as const;

export type RequiredFieldId = typeof REQUIRED_FIELDS[number]['id'];
export type OptionalFieldId = typeof OPTIONAL_FIELDS[number]['id'];
