import { ServiceOption } from '@/types/calculator.types';

export const integrationServices: ServiceOption[] = [
  {
    id: 'int-1c',
    name: 'Интеграция 1С',
    price: 400,
    description: 'Синхронизация сайта с 1С (товары, заказы, остатки).',
  },
  {
    id: 'int-dikidi',
    name: 'Dikidi интеграция',
    price: 150,
    description: 'Система онлайн-записи для салонов красоты.',
  },
  {
    id: 'int-yclients',
    name: 'YClients интеграция',
    price: 150,
    description: 'Интеграция с системой записи YClients.',
  },
  {
    id: 'int-payment',
    name: 'Платёжные системы',
    price: 200,
    description: 'Интеграция с Элкарт, Visa, MasterCard.',
  },
  {
    id: 'int-delivery',
    name: 'Службы доставки',
    price: 150,
    description: 'Интеграция с курьерскими службами.',
  },
  {
    id: 'int-sms',
    name: 'SMS уведомления',
    price: 100,
    description: 'Отправка SMS клиентам (интеграция с провайдером).',
  },
  {
    id: 'int-email-service',
    name: 'Email сервис',
    price: 100,
    description: 'Интеграция с SendPulse, Mailchimp, Unisender.',
  },
  {
    id: 'int-social',
    name: 'Соцсети',
    price: 100,
    description: 'Авторизация и шаринг через социальные сети.',
  },
];
