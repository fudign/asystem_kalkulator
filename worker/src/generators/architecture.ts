import type { GenerationJobData } from '../types.js';

// Generate Architecture document
export async function generateArchitecture(
  prd: string,
  services: GenerationJobData['selectedServices']
): Promise<string> {
  const hasEcommerce = services.some(s =>
    s.name.toLowerCase().includes('магазин') ||
    s.name.toLowerCase().includes('каталог') ||
    s.name.toLowerCase().includes('e-commerce')
  );

  const hasBot = services.some(s =>
    s.name.toLowerCase().includes('бот') ||
    s.name.toLowerCase().includes('telegram')
  );

  const hasCrm = services.some(s =>
    s.name.toLowerCase().includes('crm') ||
    s.name.toLowerCase().includes('admin')
  );

  const architecture = `# Архитектура решения

## 1. Обзор системы

### 1.1 Архитектурный стиль
Система построена на основе **модульной монолитной архитектуры** с возможностью масштабирования отдельных компонентов.

### 1.2 Диаграмма высокого уровня

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         КЛИЕНТЫ                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │ Browser │  │ Mobile  │  │ Admin   │  │ ${hasBot ? 'Telegram Bot' : 'API Client '} ││
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘│
└───────┼────────────┼────────────┼────────────────┼─────────┘
        │            │            │                │
        └────────────┴────────────┴────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Cloudflare   │
                    │  (CDN + WAF)  │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │    Nginx      │
                    │ (Load Balancer)│
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│   Next.js     │   │   Next.js     │   │   Next.js     │
│  Instance 1   │   │  Instance 2   │   │  Instance N   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│  PostgreSQL   │   │    Redis      │   │   S3/Minio    │
│  (Database)   │   │   (Cache)     │   │  (Storage)    │
└───────────────┘   └───────────────┘   └───────────────┘
\`\`\`

## 2. Компоненты системы

### 2.1 Frontend (Next.js)

**Технологии:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (state)

**Структура:**
\`\`\`
src/
├── app/                    # App Router pages
│   ├── (public)/          # Публичные страницы
│   │   ├── page.tsx       # Главная
│   │   ├── about/         # О компании
│   │   └── contacts/      # Контакты
${hasEcommerce ? `│   ├── (shop)/           # Магазин
│   │   ├── catalog/       # Каталог
│   │   ├── product/       # Товар
│   │   └── cart/          # Корзина` : ''}
│   ├── (auth)/            # Авторизация
│   │   ├── login/
│   │   └── register/
${hasCrm ? `│   └── admin/             # Админ-панель
│       ├── dashboard/
│       ├── orders/
│       └── settings/` : ''}
├── components/            # UI компоненты
├── lib/                   # Утилиты
├── hooks/                 # React hooks
├── store/                 # Zustand stores
└── types/                 # TypeScript types
\`\`\`

### 2.2 Backend (API Routes)

**Endpoints:**
\`\`\`
/api/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   └── POST /logout
${hasEcommerce ? `├── products/
│   ├── GET /             # Список товаров
│   ├── GET /:id          # Товар по ID
│   └── POST /search      # Поиск
├── cart/
│   ├── GET /             # Корзина
│   ├── POST /add         # Добавить
│   └── DELETE /:id       # Удалить
├── orders/
│   ├── GET /             # Заказы
│   ├── POST /            # Создать
│   └── GET /:id          # Детали` : ''}
├── contacts/
│   └── POST /            # Форма обратной связи
└── files/
    └── POST /upload      # Загрузка файлов
\`\`\`

### 2.3 База данных

**PostgreSQL Schema:**
\`\`\`sql
-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

${hasEcommerce ? `-- Товары
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    images JSONB,
    stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Заказы
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);` : ''}

-- Заявки
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 2.4 Кэширование (Redis)

**Стратегия кэширования:**
- Сессии пользователей (TTL: 24h)
- Каталог товаров (TTL: 1h)
- Результаты поиска (TTL: 15min)
- Rate limiting

## 3. Безопасность

### 3.1 Аутентификация
- JWT токены (access + refresh)
- HttpOnly cookies
- CSRF protection

### 3.2 Авторизация
- Role-based access control (RBAC)
- Middleware проверки прав

### 3.3 Защита данных
- Шифрование паролей (bcrypt)
- Валидация входных данных (Zod)
- Prepared statements (SQL injection)
- Content Security Policy

## 4. Инфраструктура

### 4.1 Развёртывание
\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=\${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
\`\`\`

### 4.2 CI/CD Pipeline
1. Push to GitHub
2. Run tests (Jest, Playwright)
3. Build Docker image
4. Deploy to staging
5. Run E2E tests
6. Deploy to production

### 4.3 Мониторинг
- **Logs:** Structured logging (Pino)
- **Metrics:** Prometheus + Grafana
- **Errors:** Sentry
- **Uptime:** UptimeRobot

## 5. Масштабирование

### 5.1 Горизонтальное масштабирование
- Stateless приложение
- Redis для сессий
- Load balancer (Nginx)

### 5.2 Вертикальное масштабирование
- Увеличение ресурсов VM
- Оптимизация запросов БД
- Индексы и партиционирование

---
*Документ создан автоматически системой ASYSTEM*
*Версия: 1.0*
`;

  // Simulate processing time
  await delay(3000);

  return architecture;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
