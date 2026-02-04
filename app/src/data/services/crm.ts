import { ServiceOption } from '@/types/calculator.types';

export const crmServices: ServiceOption[] = [
  {
    id: 'crm-setup',
    name: 'Настройка CRM',
    price: 300,
    description: 'Настройка готовой CRM системы (Bitrix24, AmoCRM) под ваши процессы.',
  },
  {
    id: 'crm-custom',
    name: 'Кастомная CRM',
    price: 1500,
    description: 'Разработка индивидуальной CRM системы под ваш бизнес.',
  },
  {
    id: 'crm-integration',
    name: 'Интеграция с сайтом',
    price: 200,
    description: 'Связь CRM с вашим сайтом для автоматического создания заявок.',
  },
  {
    id: 'crm-telephony',
    name: 'Интеграция телефонии',
    price: 150,
    description: 'Подключение IP-телефонии для записи и отслеживания звонков.',
  },
  {
    id: 'crm-email',
    name: 'Email интеграция',
    price: 100,
    description: 'Синхронизация почты с CRM для истории переписки.',
  },
  {
    id: 'crm-reports',
    name: 'Отчёты и дашборды',
    price: 200,
    description: 'Настройка аналитических отчётов и визуальных дашбордов.',
  },
  {
    id: 'crm-automation',
    name: 'Автоматизация процессов',
    price: 250,
    description: 'Настройка автоматических задач, напоминаний и воронок.',
  },
  {
    id: 'crm-training',
    name: 'Обучение персонала',
    price: 100,
    description: 'Обучение сотрудников работе в CRM системе.',
  },
];
