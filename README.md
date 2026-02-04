# Calculator ASYSTEM

Калькулятор IT-услуг с AI-ассистентом и автоматической генерацией коммерческих предложений.

## Архитектура

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web App       │     │     Redis       │     │   BMAD Worker   │
│   (Next.js)     │◄───►│   (BullMQ)      │◄───►│   (Node.js)     │
│   Port: 3000    │     │   Port: 6379    │     │   Port: 3001    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │              WebSocket/Socket.IO              │
        └───────────────────────────────────────────────┘
```

## Компоненты

### Web App (`/app`)
- Next.js 16 с App Router
- AI чат для сбора требований
- Калькулятор услуг
- Socket.IO клиент для real-time обновлений

### BMAD Worker (`/worker`)
- Обработка очереди генерации
- Генерация документов (Brief, PRD, Architecture)
- Создание демо-сайта
- Скриншоты через Puppeteer
- Генерация PDF

## Быстрый старт

### С Docker Compose (рекомендуется)

```bash
# Запустить всё
docker-compose up -d

# Логи
docker-compose logs -f

# Остановить
docker-compose down
```

### Локальная разработка

#### 1. Запустить Redis

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis

# Или через Docker
docker run -d -p 6379:6379 redis:7-alpine
```

#### 2. Запустить Web App

```bash
cd app

# Установить зависимости
npm install

# Создать .env.local
cp .env.example .env.local
# Отредактировать .env.local

# Запустить в режиме разработки (без Socket.IO)
npm run dev

# Или с Socket.IO сервером
npm run dev:socket
```

#### 3. Запустить BMAD Worker

```bash
cd worker

# Установить зависимости
npm install

# Создать .env
cp .env.example .env
# Отредактировать .env

# Запустить
npm run dev
```

## Переменные окружения

### Web App (`.env.local`)

```env
# AI API
GEMINI_API_KEY=your_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Worker auth
WORKER_SECRET=your-secret-token
```

### Worker (`.env`)

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Web App
WEB_APP_URL=http://localhost:3000

# Auth
WORKER_SECRET=your-secret-token

# Output
OUTPUT_DIR=./output
PUBLIC_URL=http://localhost:3001/files
```

## API Endpoints

### POST /api/generation
Запустить генерацию КП

```json
{
  "sessionId": "session_123",
  "context": {
    "projectName": "Мой проект",
    "businessType": "Кофейня",
    "mainFeatures": ["Онлайн-запись", "Меню"]
  },
  "selectedServices": [
    { "name": "Лендинг", "price": 500, "quantity": 1 }
  ]
}
```

### GET /api/generation?jobId=xxx
Получить статус генерации

### DELETE /api/generation?jobId=xxx
Отменить генерацию

## WebSocket Events

### Client → Server
- `generation:start` - Начать генерацию
- `generation:answer` - Ответ на вопрос BMAD
- `generation:cancel` - Отменить генерацию

### Server → Client
- `generation:status` - Обновление статуса
- `generation:question` - Вопрос от BMAD
- `generation:completed` - Генерация завершена
- `generation:failed` - Ошибка генерации

## Продакшн деплой

### На Proxmox/Debian VM

1. Установить Docker и Docker Compose
2. Склонировать репозиторий
3. Настроить переменные окружения
4. Запустить через docker-compose
5. Настроить Cloudflare Tunnel для публичного доступа

```bash
# Установка Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Клонировать и запустить
git clone <repo> /opt/calculator
cd /opt/calculator
cp app/.env.example app/.env.local
cp worker/.env.example worker/.env
# Настроить .env файлы

docker-compose up -d
```

## Структура генерируемых файлов

```
output/
├── artifacts/
│   └── {sessionId}/
│       ├── brief.md
│       ├── prd.md
│       ├── architecture.md
│       ├── demo.html
│       └── metadata.json
├── screenshots/
│   └── {sessionId}/
│       ├── desktop-full.png
│       ├── desktop-hero.png
│       ├── tablet.png
│       └── mobile.png
└── pdf/
    └── {sessionId}.pdf
```

## Лицензия

MIT
