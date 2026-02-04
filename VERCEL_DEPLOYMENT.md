# Развертывание на Vercel

## Настройки проекта в Vercel Dashboard

При импорте проекта в Vercel необходимо указать следующие настройки:

### Build & Development Settings

1. **Root Directory**: `app`
2. **Framework Preset**: `Next.js`
3. **Build Command**: `npm run build` (оставить по умолчанию)
4. **Output Directory**: `.next` (оставить по умолчанию)
5. **Install Command**: `npm install` (оставить по умолчанию)

### Environment Variables (обязательно!)

Добавьте следующие переменные окружения:

```bash
# База данных (для Prisma)
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# AI API (опционально, если используется)
GEMINI_API_KEY="your-gemini-api-key"

# Redis (опционально, если используется)
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"

# Socket.IO
NEXT_PUBLIC_SOCKET_URL="https://your-app.vercel.app"

# Worker
WORKER_SECRET="your-worker-secret"
```

## Пошаговая инструкция

### 1. Зайдите в Vercel Dashboard

Перейдите на https://vercel.com/dashboard

### 2. Создайте новый проект

- Нажмите "Add New..." → "Project"
- Выберите репозиторий: `fudign/asystem_kalkulator`

### 3. Настройте Build Settings

**ВАЖНО!** В разделе "Configure Project":

- Раскройте "Build and Output Settings"
- Установите **Root Directory** в `app`
- Нажмите кнопку "Edit" рядом с Root Directory
- Введите `app` и сохраните

### 4. Добавьте Environment Variables

В разделе "Environment Variables" добавьте все переменные из списка выше.

**Минимальный набор для запуска:**
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-random-string-here"
NEXTAUTH_URL="https://your-app.vercel.app"
```

### 5. Deploy

Нажмите "Deploy" и дождитесь завершения сборки.

## Генерация NEXTAUTH_SECRET

Для генерации безопасного секретного ключа используйте:

```bash
openssl rand -base64 32
```

Или онлайн:
https://generate-secret.vercel.app/32

## Troubleshooting

### 404 NOT_FOUND

Если вы получили ошибку 404:
- Убедитесь, что Root Directory установлен в `app`
- Проверьте, что все Environment Variables добавлены
- Пересоберите проект (Deployments → три точки → Redeploy)

### Build Failed

Если сборка не удалась:
- Проверьте логи сборки
- Убедитесь, что DATABASE_URL установлен
- Проверьте, что все зависимости установлены корректно

### Prisma Errors

Если ошибки связаны с Prisma:
- Добавьте в Environment Variables: `DATABASE_URL="file:./dev.db"`
- Или используйте PostgreSQL на платформе типа Neon или Supabase

## Использование PostgreSQL (рекомендуется для production)

Вместо SQLite рекомендуется использовать PostgreSQL:

1. Создайте базу данных на https://neon.tech или https://supabase.com
2. Получите connection string
3. Добавьте в Vercel Environment Variables:
   ```bash
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```
4. Обновите `app/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Redeploy проект

## Дополнительная настройка

### Redis для BullMQ (опционально)

Если нужна очередь генерации:
1. Создайте Redis на https://upstash.com
2. Добавьте переменные REDIS_HOST и REDIS_PORT
3. Разверните Worker отдельно на Railway или Render

### Worker для фоновых задач (опционально)

Worker необходимо развернуть отдельно:
- Railway.app
- Render.com
- Fly.io

Подробнее см. в `/worker/README.md`
