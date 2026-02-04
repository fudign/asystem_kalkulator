import { ServiceOption } from '@/types/calculator.types';

export const ecommerceServices: ServiceOption[] = [
  {
    id: 'ec-base',
    name: 'Базовый магазин',
    price: 800,
    description: 'Интернет-магазин до 100 товаров с корзиной и оформлением заказа.',
  },
  {
    id: 'ec-catalog',
    name: 'Расширенный каталог',
    price: 300,
    description: 'Каталог до 1000 товаров с фильтрами, сортировкой и поиском.',
  },
  {
    id: 'ec-payment',
    name: 'Онлайн оплата',
    price: 200,
    description: 'Интеграция с платёжными системами (Элкарт, Visa, MasterCard).',
  },
  {
    id: 'ec-delivery',
    name: 'Модуль доставки',
    price: 150,
    description: 'Расчёт стоимости доставки, выбор способа и адреса.',
  },
  {
    id: 'ec-admin',
    name: 'Админ-панель',
    price: 250,
    description: 'Удобная панель управления товарами, заказами и клиентами.',
  },
  {
    id: 'ec-promo',
    name: 'Промокоды и скидки',
    price: 100,
    description: 'Система промокодов, акций и автоматических скидок.',
  },
  {
    id: 'ec-reviews',
    name: 'Отзывы и рейтинги',
    price: 100,
    description: 'Возможность оставлять отзывы и оценки товарам.',
  },
  {
    id: 'ec-wishlist',
    name: 'Избранное',
    price: 50,
    description: 'Список желаний для сохранения понравившихся товаров.',
  },
];
