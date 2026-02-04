import { ServiceOption } from '@/types/calculator.types';

export const botServices: ServiceOption[] = [
  {
    id: 'bot-tg-simple',
    name: 'Простой Telegram бот',
    price: 200,
    description: 'Бот с базовыми командами и автоответами.',
  },
  {
    id: 'bot-tg-advanced',
    name: 'Продвинутый Telegram бот',
    price: 500,
    description: 'Бот с меню, инлайн-кнопками и сложной логикой.',
  },
  {
    id: 'bot-wa',
    name: 'WhatsApp бот',
    price: 400,
    description: 'Автоматизация общения в WhatsApp Business.',
  },
  {
    id: 'bot-instagram',
    name: 'Instagram бот',
    price: 350,
    description: 'Автоответы в Direct и комментариях Instagram.',
  },
  {
    id: 'bot-ai',
    name: 'AI чат-бот',
    price: 600,
    description: 'Бот с искусственным интеллектом для умных ответов.',
  },
  {
    id: 'bot-booking',
    name: 'Бот записи',
    price: 400,
    description: 'Telegram бот для онлайн-записи на услуги.',
  },
  {
    id: 'bot-shop',
    name: 'Магазин в боте',
    price: 500,
    description: 'Полноценный интернет-магазин внутри Telegram.',
  },
  {
    id: 'bot-notify',
    name: 'Уведомления',
    price: 100,
    description: 'Отправка уведомлений о заказах, записях, событиях.',
  },
];
