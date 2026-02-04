import { ServiceOption } from '@/types/calculator.types';

export const designServices: ServiceOption[] = [
  {
    id: 'design-logo',
    name: 'Логотип',
    price: 200,
    description: 'Разработка уникального логотипа с 3 концепциями.',
  },
  {
    id: 'design-brandbook',
    name: 'Брендбук',
    price: 500,
    description: 'Полное руководство по использованию фирменного стиля.',
  },
  {
    id: 'design-ui',
    name: 'UI дизайн',
    price: 50,
    description: 'Дизайн интерфейса (за экран).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 50,
  },
  {
    id: 'design-ux',
    name: 'UX исследование',
    price: 300,
    description: 'Анализ пользовательского опыта и проектирование.',
  },
  {
    id: 'design-prototype',
    name: 'Интерактивный прототип',
    price: 200,
    description: 'Кликабельный прототип в Figma.',
  },
  {
    id: 'design-mobile',
    name: 'Мобильный дизайн',
    price: 40,
    description: 'Дизайн мобильной версии (за экран).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 30,
  },
  {
    id: 'design-icons',
    name: 'Иконки',
    price: 100,
    description: 'Набор уникальных иконок для проекта.',
  },
  {
    id: 'design-banner',
    name: 'Баннеры',
    price: 30,
    description: 'Рекламные баннеры для соцсетей или сайта (за штуку).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 20,
  },
];
