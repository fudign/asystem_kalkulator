export interface Service {
  id: string;
  name: string;
  price: number;
  unit: 'fixed' | 'hour';
  description?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  services: Service[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'landing',
    name: 'Лендинг (LP)',
    shortName: 'Лендинг',
    icon: 'Layout',
    services: [
      { id: 'lp-design', name: 'Дизайн лендинга', price: 400, unit: 'fixed', description: 'Уникальный дизайн главной страницы' },
      { id: 'lp-frontend', name: 'Верстка лендинга', price: 350, unit: 'fixed', description: 'Адаптивная верстка по макету' },
      { id: 'lp-animations', name: 'Анимации и эффекты', price: 200, unit: 'fixed', description: 'Плавные анимации при скролле' },
      { id: 'lp-forms', name: 'Формы захвата', price: 150, unit: 'fixed', description: 'Контактные формы и интеграции' },
      { id: 'lp-cms', name: 'Подключение CMS', price: 250, unit: 'fixed', description: 'WordPress/Tilda/Webflow' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'Интернет-магазин (ИМ)',
    shortName: 'Магазин',
    icon: 'ShoppingCart',
    services: [
      { id: 'im-design', name: 'Дизайн магазина', price: 800, unit: 'fixed', description: 'Дизайн всех страниц магазина' },
      { id: 'im-catalog', name: 'Каталог товаров', price: 500, unit: 'fixed', description: 'Страницы категорий и товара' },
      { id: 'im-cart', name: 'Корзина и оформление', price: 400, unit: 'fixed', description: 'Полный цикл покупки' },
      { id: 'im-payment', name: 'Онлайн-оплата', price: 300, unit: 'fixed', description: 'Интеграция платежных систем' },
      { id: 'im-1c', name: 'Интеграция с 1С/МойСклад', price: 600, unit: 'fixed', description: 'Синхронизация товаров и заказов' },
      { id: 'im-filters', name: 'Фильтры и поиск', price: 350, unit: 'fixed', description: 'Умный поиск по каталогу' },
    ],
  },
  {
    id: 'corporate',
    name: 'Корпоративный сайт (КС)',
    shortName: 'Корп.сайт',
    icon: 'Building2',
    services: [
      { id: 'ks-design', name: 'Дизайн сайта', price: 1000, unit: 'fixed', description: 'Профессиональный корпоративный дизайн' },
      { id: 'ks-pages', name: 'Внутренние страницы', price: 200, unit: 'fixed', description: 'О компании, услуги, контакты' },
      { id: 'ks-news', name: 'Новости и блог', price: 350, unit: 'fixed', description: 'Система управления контентом' },
      { id: 'ks-vacancies', name: 'Раздел вакансий', price: 400, unit: 'fixed', description: 'Карьера и отклики' },
      { id: 'ks-multilang', name: 'Мультиязычность', price: 500, unit: 'fixed', description: 'Несколько языковых версий' },
      { id: 'ks-admin', name: 'Админ-панель', price: 600, unit: 'fixed', description: 'Управление контентом сайта' },
    ],
  },
  {
    id: 'crm',
    name: 'CRM системы',
    shortName: 'CRM',
    icon: 'Users',
    services: [
      { id: 'crm-setup', name: 'Настройка CRM', price: 500, unit: 'fixed', description: 'Базовая настройка Битрикс24/amoCRM' },
      { id: 'crm-custom', name: 'Доработка CRM', price: 45, unit: 'hour', description: 'Кастомизация под бизнес-процессы' },
      { id: 'crm-integration', name: 'Интеграции', price: 400, unit: 'fixed', description: 'Связь с сайтом, телефонией, почтой' },
      { id: 'crm-reports', name: 'Отчеты и аналитика', price: 350, unit: 'fixed', description: 'Настройка воронок и дашбордов' },
      { id: 'crm-training', name: 'Обучение сотрудников', price: 300, unit: 'fixed', description: 'Проведение тренинга' },
    ],
  },
  {
    id: 'apps',
    name: 'Приложения',
    shortName: 'Приложения',
    icon: 'Smartphone',
    services: [
      { id: 'app-design', name: 'Дизайн приложения', price: 1200, unit: 'fixed', description: 'UI/UX дизайн мобильного приложения' },
      { id: 'app-ios', name: 'iOS разработка', price: 50, unit: 'hour', description: 'Нативная разработка для iPhone' },
      { id: 'app-android', name: 'Android разработка', price: 45, unit: 'hour', description: 'Нативная разработка для Android' },
      { id: 'app-cross', name: 'Кроссплатформа', price: 40, unit: 'hour', description: 'React Native / Flutter' },
      { id: 'app-backend', name: 'Backend для приложения', price: 1500, unit: 'fixed', description: 'API и серверная часть' },
      { id: 'app-publish', name: 'Публикация в сторах', price: 300, unit: 'fixed', description: 'App Store и Google Play' },
    ],
  },
  {
    id: 'bots',
    name: 'Боты',
    shortName: 'Боты',
    icon: 'Bot',
    services: [
      { id: 'bot-telegram', name: 'Telegram бот', price: 400, unit: 'fixed', description: 'Бот для Telegram с любыми функциями' },
      { id: 'bot-whatsapp', name: 'WhatsApp бот', price: 500, unit: 'fixed', description: 'Интеграция с WhatsApp Business API' },
      { id: 'bot-vk', name: 'ВКонтакте бот', price: 350, unit: 'fixed', description: 'Бот для сообщества ВК' },
      { id: 'bot-ai', name: 'AI-ассистент', price: 600, unit: 'fixed', description: 'Интеграция с OpenAI/Anthropic' },
      { id: 'bot-crm', name: 'Интеграция бота с CRM', price: 400, unit: 'fixed', description: 'Связь с вашей CRM системой' },
    ],
  },
  {
    id: 'marketing',
    name: 'Продвижение',
    shortName: 'SEO/Реклама',
    icon: 'TrendingUp',
    services: [
      { id: 'seo-audit', name: 'SEO-аудит', price: 300, unit: 'fixed', description: 'Полный анализ сайта' },
      { id: 'seo-optimization', name: 'SEO-оптимизация', price: 500, unit: 'fixed', description: 'Внутренняя и внешняя оптимизация' },
      { id: 'ads-setup', name: 'Настройка рекламы', price: 400, unit: 'fixed', description: 'Google Ads, Яндекс.Директ' },
      { id: 'ads-manage', name: 'Ведение рекламы', price: 350, unit: 'fixed', description: 'Ежемесячное управление' },
      { id: 'smm', name: 'SMM продвижение', price: 600, unit: 'fixed', description: 'Ведение соцсетей' },
      { id: 'content', name: 'Контент-маркетинг', price: 450, unit: 'fixed', description: 'Стратегия и создание контента' },
    ],
  },
  {
    id: 'it-outsourcing',
    name: 'IT-аутсорсинг',
    shortName: 'IT-аутсорс',
    icon: 'Code2',
    services: [
      { id: 'dev-api', name: 'Разработка API', price: 500, unit: 'fixed', description: 'REST/GraphQL API для вашего проекта' },
      { id: 'dev-backend', name: 'Backend разработка', price: 40, unit: 'hour', description: 'Серверная разработка Node.js/Python/PHP' },
      { id: 'dev-frontend', name: 'Frontend разработка', price: 35, unit: 'hour', description: 'React/Vue/Angular разработка' },
      { id: 'dev-db', name: 'Проектирование БД', price: 200, unit: 'fixed', description: 'Оптимальная структура базы данных' },
      { id: 'dev-migration', name: 'Миграция данных', price: 300, unit: 'fixed', description: 'Перенос данных между системами' },
      { id: 'dev-optimize', name: 'Оптимизация', price: 200, unit: 'fixed', description: 'Ускорение работы сайта/приложения' },
      { id: 'dev-refactor', name: 'Рефакторинг', price: 30, unit: 'hour', description: 'Улучшение существующего кода' },
      { id: 'dev-test', name: 'Тестирование', price: 25, unit: 'hour', description: 'QA и автоматизированное тестирование' },
    ],
  },
];

export const discountOptions = [
  { value: 0, label: 'Без скидки' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 25, label: '25%' },
];

export const features = [
  {
    id: 'kp',
    title: 'Детальное КП в PDF',
    description: 'Полное коммерческое предложение с описанием работ, сроками и стоимостью',
    icon: 'FileText',
  },
  {
    id: 'demo',
    title: 'Демо-сайт с вотермаркой',
    description: 'Готовый прототип сайта для демонстрации заказчикам и инвесторам',
    icon: 'Monitor',
  },
  {
    id: 'presentation',
    title: 'Презентация проекта',
    description: 'Профессиональная презентация в PowerPoint/Google Slides',
    icon: 'Presentation',
  },
  {
    id: 'estimate',
    title: 'Смета с breakdown',
    description: 'Детальный разбор стоимости по каждой услуге и этапу',
    icon: 'Calculator',
  },
  {
    id: 'tz',
    title: 'Техническое задание',
    description: 'Структурированное ТЗ для разработчиков',
    icon: 'FileCheck',
  },
  {
    id: 'roadmap',
    title: 'Roadmap проекта',
    description: 'Визуальный план разработки с этапами и milestones',
    icon: 'Map',
  },
  {
    id: 'ai-recs',
    title: 'AI-рекомендации',
    description: 'Персонализированные советы по оптимизации бюджета',
    icon: 'Sparkles',
  },
  {
    id: 'compare',
    title: 'Сравнение вариантов',
    description: 'Анализ разных подходов к реализации проекта',
    icon: 'GitCompare',
  },
];

export const testimonials = [
  {
    id: 1,
    name: 'Александр Петров',
    role: 'CEO, WebStudio Pro',
    content: 'Сэкономил 3 дня на подготовке КП для клиента. Теперь использую ASYSTEM для всех проектов.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Елена Смирнова',
    role: 'Product Manager, TechStart',
    content: 'AI-ассистент задал правильные вопросы и помог оптимизировать бюджет на 20%.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Дмитрий Козлов',
    role: 'Founder, AppCraft',
    content: 'Демо-сайт с вотермаркой произвел впечатление на инвесторов. Получили финансирование!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Мария Иванова',
    role: 'CTO, DigitalFlow',
    content: 'Точность расчета впечатляет. Реальная стоимость отличалась менее чем на 5%.',
    rating: 5,
  },
];

export const steps = [
  {
    number: '01',
    title: 'Выберите услуги',
    description: 'Отметьте нужные услуги в калькуляторе или опишите проект AI-ассистенту',
  },
  {
    number: '02',
    title: 'Уточните детали',
    description: 'Ответьте на уточняющие вопросы для точного расчета',
  },
  {
    number: '03',
    title: 'Получите расчет',
    description: 'Мгновенный расчет стоимости и сроков на основе ваших требований',
  },
  {
    number: '04',
    title: 'Скачайте материалы',
    description: 'PDF с КП, демо-сайт, презентация и смета — все готово за 5 минут',
  },
];

export const chatMessages = [
  {
    id: 1,
    sender: 'ai',
    text: 'Здравствуйте! Я AI-ассистент ASYSTEM. Расскажите о вашем проекте — я помогу рассчитать стоимость и сроки.',
  },
  {
    id: 2,
    sender: 'user',
    text: 'Мне нужен интернет-магазин для продажи электроники',
  },
  {
    id: 3,
    sender: 'ai',
    text: 'Отлично! Для точного расчета мне нужно уточнить несколько деталей:\n\n1. Сколько товаров планируется?\n2. Нужна интеграция с 1С/МойСклад?\n3. Требуется ли онлайн-оплата?',
  },
];
