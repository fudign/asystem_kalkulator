import { ServiceOption } from '@/types/calculator.types';

export const promotionServices: ServiceOption[] = [
  {
    id: 'promo-seo',
    name: 'SEO продвижение',
    price: 300,
    description: 'Оптимизация сайта для поисковых систем (в месяц).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 12,
  },
  {
    id: 'promo-context',
    name: 'Контекстная реклама',
    price: 200,
    description: 'Настройка и ведение Google Ads / Яндекс.Директ (в месяц).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 12,
  },
  {
    id: 'promo-smm',
    name: 'SMM продвижение',
    price: 250,
    description: 'Ведение социальных сетей (в месяц).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 12,
  },
  {
    id: 'promo-target',
    name: 'Таргетированная реклама',
    price: 200,
    description: 'Настройка рекламы в Instagram/Facebook (в месяц).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 12,
  },
  {
    id: 'promo-audit',
    name: 'SEO аудит',
    price: 150,
    description: 'Полный анализ сайта с рекомендациями по улучшению.',
  },
  {
    id: 'promo-strategy',
    name: 'Маркетинговая стратегия',
    price: 400,
    description: 'Разработка комплексной стратегии продвижения.',
  },
  {
    id: 'promo-content-plan',
    name: 'Контент-план',
    price: 100,
    description: 'План публикаций для социальных сетей на месяц.',
  },
  {
    id: 'promo-2gis',
    name: 'Продвижение в 2GIS',
    price: 100,
    description: 'Настройка и оптимизация карточки компании в 2GIS.',
  },
];
