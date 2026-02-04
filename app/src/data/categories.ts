import { Category } from '@/types/calculator.types';
import { landingServices } from './services/landing';
import { ecommerceServices } from './services/ecommerce';
import { corporateServices } from './services/corporate';
import { crmServices } from './services/crm';
import { appServices } from './services/apps';
import { botServices } from './services/bots';
import { promotionServices } from './services/promotion';
import { developmentServices } from './services/development';
import { designServices } from './services/design';
import { supportServices } from './services/support';
import { hostingServices } from './services/hosting';
import { contentServices } from './services/content';
import { analyticsServices } from './services/analytics';
import { integrationServices } from './services/integration';

export const categories: Category[] = [
  {
    id: 'landing',
    name: 'Лендинг (LP)',
    icon: '🌐',
    options: landingServices,
  },
  {
    id: 'ecommerce',
    name: 'Интернет-магазин (ИМ)',
    icon: '🛒',
    options: ecommerceServices,
  },
  {
    id: 'corporate',
    name: 'Корпоративный сайт (КС)',
    icon: '🏢',
    options: corporateServices,
  },
  {
    id: 'crm',
    name: 'CRM системы',
    icon: '📊',
    options: crmServices,
  },
  {
    id: 'apps',
    name: 'Приложения',
    icon: '📱',
    options: appServices,
  },
  {
    id: 'bots',
    name: 'Боты',
    icon: '🤖',
    options: botServices,
  },
  {
    id: 'promotion',
    name: 'Продвижение',
    icon: '📈',
    options: promotionServices,
  },
  {
    id: 'development',
    name: 'IT-разработка',
    icon: '💻',
    options: developmentServices,
  },
  {
    id: 'design',
    name: 'Дизайн UI/UX',
    icon: '🎨',
    options: designServices,
  },
  {
    id: 'support',
    name: 'Поддержка',
    icon: '🛠️',
    options: supportServices,
  },
  {
    id: 'hosting',
    name: 'Хостинг',
    icon: '☁️',
    options: hostingServices,
  },
  {
    id: 'content',
    name: 'Контент',
    icon: '✍️',
    options: contentServices,
  },
  {
    id: 'analytics',
    name: 'Аналитика',
    icon: '📉',
    options: analyticsServices,
  },
  {
    id: 'integration',
    name: 'Интеграции',
    icon: '🔗',
    options: integrationServices,
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getAllOptions = () => {
  return categories.flatMap(cat => cat.options);
};
