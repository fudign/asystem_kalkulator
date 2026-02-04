import { ServiceOption } from '@/types/calculator.types';

export const corporateServices: ServiceOption[] = [
  {
    id: 'cs-base',
    name: 'Базовый корп. сайт',
    price: 600,
    description: 'Многостраничный сайт компании: главная, о нас, услуги, контакты.',
  },
  {
    id: 'cs-pages',
    name: 'Дополнительные страницы',
    price: 50,
    description: 'Дополнительные страницы сайта (за каждую).',
    hasQuantity: true,
    minQuantity: 1,
    maxQuantity: 20,
  },
  {
    id: 'cs-news',
    name: 'Блог/Новости',
    price: 200,
    description: 'Раздел новостей или блога с возможностью публикации статей.',
  },
  {
    id: 'cs-portfolio',
    name: 'Портфолио/Кейсы',
    price: 150,
    description: 'Раздел с примерами работ или успешными кейсами.',
  },
  {
    id: 'cs-team',
    name: 'Раздел команды',
    price: 100,
    description: 'Страница с информацией о сотрудниках компании.',
  },
  {
    id: 'cs-vacancy',
    name: 'Вакансии',
    price: 100,
    description: 'Раздел с актуальными вакансиями и формой отклика.',
  },
  {
    id: 'cs-faq',
    name: 'FAQ раздел',
    price: 50,
    description: 'Часто задаваемые вопросы с удобным поиском.',
  },
  {
    id: 'cs-map',
    name: 'Карта офисов',
    price: 50,
    description: 'Интерактивная карта с расположением офисов.',
  },
];
