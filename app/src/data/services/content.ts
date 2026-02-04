import { ServiceOption } from '@/types/calculator.types';

export const contentServices: ServiceOption[] = [
  {
    id: 'content-copywriting',
    name: 'Копирайтинг',
    price: 20,
    description: 'Написание текстов для сайта (за 1000 знаков).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 50,
  },
  {
    id: 'content-seo-text',
    name: 'SEO тексты',
    price: 30,
    description: 'Оптимизированные тексты для продвижения (за 1000 знаков).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 50,
  },
  {
    id: 'content-translation',
    name: 'Перевод',
    price: 15,
    description: 'Перевод текстов (за 1000 знаков).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 100,
  },
  {
    id: 'content-photo',
    name: 'Фотосессия',
    price: 200,
    description: 'Профессиональная фотосъёмка для сайта.',
  },
  {
    id: 'content-video',
    name: 'Видеоролик',
    price: 500,
    description: 'Создание промо-видео для сайта или соцсетей.',
  },
  {
    id: 'content-3d',
    name: '3D визуализация',
    price: 300,
    description: '3D модель продукта или интерьера.',
  },
  {
    id: 'content-infographic',
    name: 'Инфографика',
    price: 100,
    description: 'Создание информационной графики.',
  },
  {
    id: 'content-presentation',
    name: 'Презентация',
    price: 150,
    description: 'Дизайн презентации для бизнеса.',
  },
];
