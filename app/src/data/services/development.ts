import { ServiceOption } from '@/types/calculator.types';

export const developmentServices: ServiceOption[] = [
  {
    id: 'dev-api',
    name: 'Разработка API',
    price: 500,
    description: 'Создание REST или GraphQL API для вашего проекта.',
  },
  {
    id: 'dev-backend',
    name: 'Backend разработка',
    price: 40,
    description: 'Серверная разработка (за час работы).',
    hasQuantity: true,
    minQuantity: 10,
    maxQuantity: 200,
  },
  {
    id: 'dev-frontend',
    name: 'Frontend разработка',
    price: 35,
    description: 'Клиентская разработка (за час работы).',
    hasQuantity: true,
    minQuantity: 10,
    maxQuantity: 200,
  },
  {
    id: 'dev-database',
    name: 'Проектирование БД',
    price: 200,
    description: 'Проектирование структуры базы данных.',
  },
  {
    id: 'dev-migration',
    name: 'Миграция данных',
    price: 300,
    description: 'Перенос данных из старой системы в новую.',
  },
  {
    id: 'dev-optimization',
    name: 'Оптимизация',
    price: 200,
    description: 'Оптимизация производительности существующего кода.',
  },
  {
    id: 'dev-refactoring',
    name: 'Рефакторинг',
    price: 30,
    description: 'Улучшение качества кода (за час работы).',
    hasQuantity: true,
    minQuantity: 5,
    maxQuantity: 100,
  },
  {
    id: 'dev-testing',
    name: 'Тестирование',
    price: 25,
    description: 'Написание автотестов (за час работы).',
    hasQuantity: true,
    minQuantity: 5,
    maxQuantity: 50,
  },
];
