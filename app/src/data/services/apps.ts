import { ServiceOption } from '@/types/calculator.types';

export const appServices: ServiceOption[] = [
  {
    id: 'app-ios',
    name: 'iOS приложение',
    price: 2000,
    description: 'Нативное приложение для iPhone и iPad.',
  },
  {
    id: 'app-android',
    name: 'Android приложение',
    price: 2000,
    description: 'Нативное приложение для Android устройств.',
  },
  {
    id: 'app-cross',
    name: 'Кроссплатформенное',
    price: 3000,
    description: 'Одно приложение для iOS и Android (React Native/Flutter).',
  },
  {
    id: 'app-pwa',
    name: 'PWA приложение',
    price: 800,
    description: 'Прогрессивное веб-приложение, работающее как мобильное.',
  },
  {
    id: 'app-push',
    name: 'Push уведомления',
    price: 200,
    description: 'Система push-уведомлений для пользователей.',
  },
  {
    id: 'app-offline',
    name: 'Офлайн режим',
    price: 300,
    description: 'Работа приложения без интернета.',
  },
  {
    id: 'app-geo',
    name: 'Геолокация',
    price: 200,
    description: 'Функции на основе местоположения пользователя.',
  },
  {
    id: 'app-publish',
    name: 'Публикация в сторах',
    price: 150,
    description: 'Размещение приложения в App Store и Google Play.',
  },
];
