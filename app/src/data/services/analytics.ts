import { ServiceOption } from '@/types/calculator.types';

export const analyticsServices: ServiceOption[] = [
  {
    id: 'analytics-ga',
    name: 'Google Analytics',
    price: 50,
    description: 'Настройка Google Analytics 4 с целями и событиями.',
  },
  {
    id: 'analytics-ym',
    name: 'Яндекс.Метрика',
    price: 50,
    description: 'Настройка Яндекс.Метрики с вебвизором и целями.',
  },
  {
    id: 'analytics-gtm',
    name: 'Google Tag Manager',
    price: 100,
    description: 'Настройка GTM для управления тегами.',
  },
  {
    id: 'analytics-ecom',
    name: 'E-commerce аналитика',
    price: 150,
    description: 'Расширенная аналитика для интернет-магазина.',
  },
  {
    id: 'analytics-dashboard',
    name: 'Дашборд',
    price: 200,
    description: 'Кастомный дашборд в Google Data Studio / Metabase.',
  },
  {
    id: 'analytics-report',
    name: 'Аналитический отчёт',
    price: 100,
    description: 'Ежемесячный отчёт по метрикам сайта.',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 12,
  },
  {
    id: 'analytics-ab',
    name: 'A/B тестирование',
    price: 150,
    description: 'Настройка и проведение A/B тестов.',
  },
  {
    id: 'analytics-heatmap',
    name: 'Тепловые карты',
    price: 50,
    description: 'Анализ поведения пользователей через тепловые карты.',
  },
];
