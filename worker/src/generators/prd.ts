import type { GenerationJobData } from '../types.js';

// Generate PRD (Product Requirements Document)
export async function generatePrd(
  brief: string,
  context: GenerationJobData['context'],
  services: GenerationJobData['selectedServices']
): Promise<string> {
  // Calculate total price
  const totalPrice = services.reduce((sum, s) => sum + s.price * s.quantity, 0);

  // Generate functional requirements based on services
  const functionalRequirements = generateFunctionalRequirements(services, context);

  const prd = `# Техническое задание (PRD)

## Проект: ${context.projectName || 'Веб-проект'}

### 1. Введение

#### 1.1 Цель документа
Данный документ описывает функциональные и нефункциональные требования к разработке веб-решения для ${context.businessType || 'бизнеса'}.

#### 1.2 Область применения
${context.businessDescription || 'Веб-сайт/приложение для автоматизации бизнес-процессов и привлечения клиентов.'}

#### 1.3 Целевая аудитория
${context.targetAudience || 'Потенциальные клиенты компании'}

### 2. Общее описание продукта

#### 2.1 Контекст продукта
Разрабатываемое решение является ${getProductType(services)} для ${context.businessType || 'бизнеса'}.

#### 2.2 Пользовательские классы
1. **Посетители** - просмотр информации, оставление заявок
2. **Клиенты** - регистрация, личный кабинет, заказы
3. **Администраторы** - управление контентом и заказами

### 3. Функциональные требования

${functionalRequirements}

### 4. Нефункциональные требования

#### 4.1 Производительность
- Время загрузки главной страницы: < 3 секунды
- Время отклика API: < 500 мс
- Поддержка до 1000 одновременных пользователей

#### 4.2 Безопасность
- HTTPS шифрование
- Защита от SQL-инъекций и XSS
- Валидация всех входных данных
- Безопасное хранение паролей (bcrypt)

#### 4.3 Совместимость
- Браузеры: Chrome, Firefox, Safari, Edge (последние 2 версии)
- Мобильные устройства: iOS 14+, Android 10+
- Разрешения: от 320px до 2560px

#### 4.4 Доступность
- Соответствие WCAG 2.1 Level AA
- Поддержка screen readers
- Контрастность текста минимум 4.5:1

### 5. Технологический стек

#### 5.1 Frontend
- Next.js / React
- TypeScript
- Tailwind CSS
- Zustand (state management)

#### 5.2 Backend
- Node.js
- PostgreSQL / MySQL
- Redis (кэширование)

#### 5.3 Инфраструктура
- Docker контейнеры
- CI/CD pipeline
- Мониторинг и логирование

### 6. Этапы разработки

| Этап | Описание | Срок |
|------|----------|------|
| 1 | Дизайн и прототипирование | 1-2 недели |
| 2 | Разработка frontend | 2-3 недели |
| 3 | Разработка backend | 2-3 недели |
| 4 | Интеграция и тестирование | 1-2 недели |
| 5 | Запуск и поддержка | 1 неделя |

### 7. Бюджет

**Общая стоимость:** $${totalPrice.toLocaleString()}

#### Разбивка по услугам:
${services.map(s => `- ${s.name}: $${(s.price * s.quantity).toLocaleString()}`).join('\n')}

### 8. Приложения

#### A. Глоссарий
- **КП** - Коммерческое предложение
- **PRD** - Product Requirements Document
- **API** - Application Programming Interface
- **UI/UX** - User Interface / User Experience

---
*Документ создан автоматически системой ASYSTEM*
*Версия: 1.0*
*Дата: ${new Date().toLocaleDateString('ru-RU')}*
`;

  // Simulate processing time
  await delay(3000);

  return prd;
}

function generateFunctionalRequirements(
  services: GenerationJobData['selectedServices'],
  context: GenerationJobData['context']
): string {
  const requirements: string[] = [];
  let reqNumber = 1;

  // Base requirements
  requirements.push(`#### FR${reqNumber++}: Главная страница
- Отображение информации о компании
- Презентация услуг/товаров
- Призыв к действию (CTA)
- Контактная информация`);

  // Add requirements based on selected services
  for (const service of services) {
    const serviceLower = service.name.toLowerCase();

    if (serviceLower.includes('лендинг') || serviceLower.includes('landing')) {
      requirements.push(`#### FR${reqNumber++}: Лендинг
- Одностраничный дизайн с секциями
- Форма захвата лидов
- Счётчики и достижения
- Отзывы клиентов`);
    }

    if (serviceLower.includes('каталог') || serviceLower.includes('магазин') || serviceLower.includes('e-commerce')) {
      requirements.push(`#### FR${reqNumber++}: Каталог товаров
- Категории и подкатегории
- Фильтрация и сортировка
- Карточки товаров с фото
- Поиск по каталогу`);

      requirements.push(`#### FR${reqNumber++}: Корзина и оформление заказа
- Добавление товаров в корзину
- Изменение количества
- Оформление заказа
- Выбор способа оплаты и доставки`);
    }

    if (serviceLower.includes('бот') || serviceLower.includes('telegram')) {
      requirements.push(`#### FR${reqNumber++}: Telegram бот
- Интеграция с Telegram API
- Автоматические уведомления
- Обработка команд
- Рассылка сообщений`);
    }

    if (serviceLower.includes('crm') || serviceLower.includes('admin')) {
      requirements.push(`#### FR${reqNumber++}: Административная панель
- Управление заказами
- Управление клиентами
- Аналитика и отчёты
- Настройки системы`);
    }

    if (serviceLower.includes('seo') || serviceLower.includes('продвижение')) {
      requirements.push(`#### FR${reqNumber++}: SEO оптимизация
- Meta-теги и Open Graph
- Sitemap.xml и robots.txt
- Структурированные данные
- Оптимизация скорости загрузки`);
    }
  }

  // Add features from context
  for (const feature of context.mainFeatures) {
    const featureLower = feature.toLowerCase();

    if (featureLower.includes('запис') || featureLower.includes('бронирован')) {
      requirements.push(`#### FR${reqNumber++}: Система бронирования
- Календарь доступности
- Выбор услуги и времени
- Подтверждение записи
- Напоминания`);
    }

    if (featureLower.includes('оплат')) {
      requirements.push(`#### FR${reqNumber++}: Онлайн-оплата
- Интеграция с платёжной системой
- Безопасная обработка платежей
- Чеки и квитанции
- История транзакций`);
    }

    if (featureLower.includes('личн') && featureLower.includes('кабинет')) {
      requirements.push(`#### FR${reqNumber++}: Личный кабинет
- Регистрация и авторизация
- Профиль пользователя
- История заказов
- Настройки уведомлений`);
    }
  }

  return requirements.join('\n\n');
}

function getProductType(services: GenerationJobData['selectedServices']): string {
  const serviceNames = services.map(s => s.name.toLowerCase()).join(' ');

  if (serviceNames.includes('интернет-магазин') || serviceNames.includes('e-commerce')) {
    return 'интернет-магазином';
  }
  if (serviceNames.includes('корпоратив')) {
    return 'корпоративным сайтом';
  }
  if (serviceNames.includes('лендинг')) {
    return 'лендингом';
  }
  if (serviceNames.includes('бот')) {
    return 'чат-ботом';
  }
  if (serviceNames.includes('приложен') || serviceNames.includes('app')) {
    return 'мобильным/веб приложением';
  }

  return 'веб-решением';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
