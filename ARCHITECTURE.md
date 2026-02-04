# ASYSTEM.KG Generator Platform

## Архитектура системы

Модульная архитектура с независимыми воркерами и очередями сообщений.

```
КЛИЕНТ → [INTAKE] → [RESEARCHER] → [PLANNER] → [GENERATOR] → [DEPLOYER] → [DOCUMENTS] → КЛИЕНТ
              ↓           ↓            ↓            ↓             ↓            ↓
           BullMQ      BullMQ      BullMQ       BullMQ        BullMQ      BullMQ
```

## Модули

### Module 1: INTAKE (Приём заявок)
- Модалка с бизнес-вопросами (без техники)
- Валидация данных
- Сохранение в БД
- Отправка в очередь researcher

**Вопросы клиенту:**
1. Название компании/проекта
2. Тип бизнеса (ниша)
3. Целевая аудитория
4. Основные конкуренты (или "найдите сами")
5. Что должен делать сайт? (цели)
6. Контакт (email, телефон)

### Module 2: RESEARCHER (Исследование)
- Web Search по нише
- Анализ конкурентов
- Тренды в индустрии
- Формирование insights

### Module 3: PLANNER (Планировщик)
- BMAD автоматически создаёт эпики
- Генерация user stories
- Структура сайта
- Подтверждение от клиента: "Это то что вы хотите?"

### Module 4: GENERATOR (Генератор)
- Claude API с tool use
- Генерация кода сайта
- Next.js шаблон
- Сборка проекта

### Module 5: DEPLOYER (Деплой)
- Vercel deployment
- Watermark ASYSTEM.KG (полупрозрачный)
- Генерация preview URL

### Module 6: DOCUMENTS (Документы)
- КП (коммерческое предложение) PDF
- Презентация по сайту PDF
- Отправка email клиенту

## Технологии

- **Queue**: BullMQ + Redis (уже есть)
- **DB**: Prisma + SQLite (уже есть)
- **Auth**: NextAuth (уже есть)
- **Deploy**: Vercel CLI
- **AI**: Anthropic Claude API
- **PDF**: jsPDF / Puppeteer

## Структура папок

```
/app/src/
├── /modules/
│   ├── /intake/
│   │   ├── worker.ts
│   │   ├── questions.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   │
│   ├── /researcher/
│   │   ├── worker.ts
│   │   ├── web-search.ts
│   │   ├── competitor-analyzer.ts
│   │   └── index.ts
│   │
│   ├── /planner/
│   │   ├── worker.ts
│   │   ├── bmad-runner.ts
│   │   ├── epic-generator.ts
│   │   └── index.ts
│   │
│   ├── /generator/
│   │   ├── worker.ts
│   │   ├── claude-agent.ts
│   │   ├── template/
│   │   └── index.ts
│   │
│   ├── /deployer/
│   │   ├── worker.ts
│   │   ├── vercel.ts
│   │   ├── watermark.ts
│   │   └── index.ts
│   │
│   └── /documents/
│       ├── worker.ts
│       ├── kp-generator.ts
│       ├── presentation.ts
│       ├── email-sender.ts
│       └── index.ts
│
├── /shared/
│   ├── queue.ts
│   ├── types.ts
│   └── constants.ts
│
└── /orchestrator/
    └── pipeline.ts
```

## Очереди BullMQ

```typescript
// Очереди для каждого модуля
const QUEUES = {
  INTAKE: 'intake-queue',
  RESEARCHER: 'researcher-queue',
  PLANNER: 'planner-queue',
  GENERATOR: 'generator-queue',
  DEPLOYER: 'deployer-queue',
  DOCUMENTS: 'documents-queue',
};
```

## Статусы заявки

```typescript
type ProjectStatus =
  | 'intake_pending'      // Ожидает заполнения
  | 'intake_complete'     // Данные собраны
  | 'researching'         // Исследование
  | 'planning'            // Создание эпиков
  | 'awaiting_approval'   // Ждём подтверждения клиента
  | 'generating'          // Генерация сайта
  | 'deploying'           // Деплой
  | 'documenting'         // Создание КП
  | 'completed'           // Готово
  | 'failed'              // Ошибка
```

## Watermark

```css
.asystem-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 120px;
  font-weight: bold;
  opacity: 0.07;
  pointer-events: none;
  z-index: 99999;
  white-space: nowrap;
  color: #000;
  font-family: system-ui, sans-serif;
}
```

## Порядок реализации

1. [x] Авторизация клиентов
2. [ ] Module 1: INTAKE
3. [ ] Module 2: RESEARCHER
4. [ ] Module 3: PLANNER
5. [ ] Module 4: GENERATOR
6. [ ] Module 5: DEPLOYER
7. [ ] Module 6: DOCUMENTS
