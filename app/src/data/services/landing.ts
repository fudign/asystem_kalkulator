import { ServiceOption } from '@/types/calculator.types';

export const landingServices: ServiceOption[] = [
  {
    id: 'lp-base',
    name: 'Базовый лендинг',
    price: 300,
    description: 'Одностраничный сайт с основной информацией о продукте или услуге. Включает до 5 секций.',
  },
  {
    id: 'lp-premium',
    name: 'Премиум лендинг',
    price: 500,
    description: 'Расширенный лендинг с анимациями, до 10 секций и продвинутым дизайном.',
  },
  {
    id: 'lp-animation',
    name: 'Анимации и эффекты',
    price: 150,
    description: 'Плавные анимации при скролле, hover-эффекты, микроанимации для привлечения внимания.',
  },
  {
    id: 'lp-form',
    name: 'Форма заявки',
    price: 50,
    description: 'Контактная форма с отправкой на email или в Telegram.',
  },
  {
    id: 'lp-quiz',
    name: 'Квиз/Калькулятор',
    price: 200,
    description: 'Интерактивный опросник или калькулятор для вовлечения посетителей.',
  },
  {
    id: 'lp-multilang',
    name: 'Мультиязычность',
    price: 150,
    description: 'Поддержка нескольких языков (русский, кыргызский, английский).',
    hasQuantity: true,
    minQuantity: 2,
    maxQuantity: 5,
  },
  {
    id: 'lp-adaptive',
    name: 'Адаптивный дизайн',
    price: 100,
    description: 'Корректное отображение на мобильных устройствах и планшетах.',
  },
  {
    id: 'lp-seo',
    name: 'Базовая SEO оптимизация',
    price: 100,
    description: 'Meta-теги, структурированные данные, оптимизация скорости загрузки.',
  },
];
