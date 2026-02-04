---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
status: 'complete'
completedAt: '2026-01-30'
inputDocuments: ['prd.md', 'product-brief-calculator-asystem-2026-01-30.md']
workflowType: 'architecture'
project_name: 'calculator asystem'
user_name: 'Mac'
date: '2026-01-30'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
37 FR организованы в 10 capability areas:
- Каталог услуг (навигация по 14 категориям)
- Расчёт стоимости (чекбоксы, количество, скидки, мгновенный пересчёт)
- Информация об услугах (tooltips)
- AI-помощник (чат, рекомендации)
- **AI контекст-трекинг (NEW)** — умный сбор данных без повторных вопросов
- PDF экспорт расчёта
- **BMAD интеграция (NEW)** — двусторонняя связь Web ↔ BMAD Worker
- **Генерация КП и демо (NEW)** — автоматическое создание презентации и скриншотов
- Responsive UI
- Оплата (deferred)

**Non-Functional Requirements:**
- Performance: <3s загрузка, <100ms пересчёт, <5s PDF, <10s AI, **15-20 мин генерация КП**
- Integration: AI API, client-side PDF, **BMAD Worker, WebSocket/SSE, Puppeteer**
- Security: Server-side API keys, HTTPS only

**Scale & Complexity:**
- Primary domain: Web SPA с AI интеграцией **+ серверный BMAD pipeline**
- Complexity level: **Medium-High**
- Estimated architectural components: **10-12** (UI, State, Calculator Logic, AI Service, PDF Generator, Data Layer, SEO, **WebSocket Server, BMAD Worker, Screenshot Service, Job Queue**)

### Technical Constraints & Dependencies

**Frontend:**
- Framework: Next.js (SSR/SSG для SEO)
- Styling: Tailwind CSS
- PDF расчёта: html2pdf или jsPDF (client-side)
- Browsers: Modern only (Chrome, Safari, Firefox, Edge last 2 versions)

**Backend/Infrastructure:**
- **Server:** Proxmox на Debian (уже есть)
- **BMAD Worker:** Отдельная VM для запуска BMAD workflows
- **WebSocket/SSE:** Двусторонняя связь для прогресса и вопросов от BMAD
- **Puppeteer/Playwright:** Скриншоты демо-сайтов
- **Job Queue:** Redis + BullMQ для очереди задач генерации
- AI: Claude/OpenAI API (server-side proxy для ключей)
- Data: Static JSON (конвертировано из Excel)

### Cross-Cutting Concerns Identified

1. **State Persistence** — выбор опций сохраняется при переключении категорий
2. **Reactive Calculations** — мгновенный пересчёт при любом изменении
3. **AI Error Handling** — graceful degradation если API недоступен
4. **PDF Consistency** — генерация отражает текущее состояние
5. **SEO Optimization** — SSR для индексации калькулятора
6. **AI Context Tracking (NEW)** — отслеживание собранной информации, избежание повторных вопросов
7. **WebSocket Connection (NEW)** — стабильное соединение, reconnect при обрыве
8. **BMAD Job Management (NEW)** — очередь, статус, retry при ошибках
9. **Long-Running Task UX (NEW)** — прогресс-бар, уведомления, обработка таймаутов

---

## Starter Template Evaluation

### Primary Technology Domain

Web SPA с SSR/SSG — Next.js App Router для SEO и производительности.

### Starter Options Considered

1. **create-next-app (App Router)** — официальный, полный контроль
2. **T3 Stack** — overkill для проекта без БД/auth
3. **Vite + React** — нет SSR из коробки (плохо для SEO)

### Selected Starter: create-next-app (App Router)

**Rationale:**
- Официальный starter от Vercel
- App Router — стандарт для новых проектов 2026
- Tailwind CSS включён одним флагом
- Минимум зависимостей, максимум контроля
- Отличная документация

**Initialization Command:**

```bash
npx create-next-app@latest calculator-asystem --typescript --tailwind --app --eslint --src-dir --turbopack
```

**Architectural Decisions Provided:**

| Category | Decision |
|----------|----------|
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 3.x |
| Routing | App Router (file-based) |
| Rendering | Server Components + Client Components |
| Build | Next.js compiler + Turbopack |
| Linting | ESLint with Next.js config |
| Structure | src/ directory pattern |

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State management approach (Zustand)
- AI integration pattern (Server Actions)
- Data structure (TypeScript + Zod)
- **WebSocket/SSE for real-time (NEW)**
- **BMAD Worker architecture (NEW)**
- **Job Queue for generation tasks (NEW)**

**Important Decisions (Shape Architecture):**
- PDF generation library (html2pdf.js)
- Hosting platform (Web App on Proxmox VM)
- **Screenshot library (Puppeteer) (NEW)**

**Deferred Decisions (Post-MVP):**
- Analytics integration
- History/persistence
- Share link generation
- **Payment gateway integration**

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Storage | TypeScript objects in code | Данные статические, небольшие (14 категорий) |
| Type Safety | Zod schemas | Runtime validation + TypeScript inference |
| Caching | Client-side only | Нет серверных данных для кэширования |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| User Auth | None | PRD: нет пользователей |
| API Keys | Server-side via env vars | Copilot API key не должен быть в клиентском коде |
| Transport | HTTPS only | Стандарт для продакшена |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Chat Proxy | Next.js Server Actions | Проще чем API Routes, type-safe |
| Error Handling | Try-catch + graceful fallback | AI может быть недоступен |
| Rate Limiting | None for MVP | Один пользователь, низкая нагрузка |
| **Real-time (NEW)** | **WebSocket (Socket.IO)** | **Двусторонняя связь, широкая поддержка** |
| **BMAD Communication (NEW)** | **REST API + WebSocket events** | **Запуск через REST, прогресс через WS** |
| **Job Queue (NEW)** | **Redis + BullMQ** | **Надёжная очередь, retry, мониторинг** |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Zustand | Простой API, лёгкий, persist middleware |
| Component Pattern | Feature-based folders | Логичная группировка по функционалу |
| PDF Generation | html2pdf.js | Клиентская генерация, простая интеграция |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Web App Hosting** | **Proxmox VM (Debian)** | **Свой сервер, полный контроль, WebSocket** |
| **BMAD Worker** | **Отдельная Proxmox VM** | **Изоляция, масштабирование** |
| **Process Manager** | **PM2** | **Авто-рестарт, логи, мониторинг** |
| **Reverse Proxy** | **Nginx (localhost)** | **WebSocket proxy, внутренний routing** |
| **Public Access** | **Cloudflare Tunnel** | **Без белого IP, бесплатный SSL, DDoS защита** |
| **Domain** | **asystem.kg (существующий)** | **calculator.asystem.kg для калькулятора** |
| CI/CD | Git pull + PM2 restart | Простой деплой на своём сервере |
| Environment | .env files + secrets | Безопасное хранение API ключей |
| **Redis** | **На Web App VM** | **Job queue, session store** |

### Cloudflare Tunnel Setup

```yaml
# ~/.cloudflared/config.yml на VM Web App
tunnel: calculator-asystem
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: calculator.asystem.kg
    service: http://localhost:3000
  - service: http_status:404
```

**Преимущества выбранного решения:**
- Не нужен белый IP от провайдера
- Автоматический SSL сертификат
- DDoS защита от Cloudflare
- Работает из любой сети (не привязан к локалке)
- WebSocket работает через Cloudflare Tunnel

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (create-next-app)
2. Data layer (TypeScript + Zod schemas)
3. Calculator state (Zustand store)
4. UI components (categories, options, totals)
5. AI integration (Server Actions)
6. PDF export
7. Deploy to Vercel

**Cross-Component Dependencies:**
- Zustand store → используется в UI и PDF генерации
- Zod schemas → используются в data layer и валидации
- Server Actions → изолированы, только для AI
- **WebSocket → используется в AI chat, BMAD progress, BMAD questions**
- **Redis/BullMQ → используется для очереди задач BMAD**

---

## BMAD Integration Architecture (NEW)

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROXMOX SERVER                               │
│                                                                      │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐ │
│  │      VM 1: WEB APP          │    │    VM 2: BMAD WORKER        │ │
│  │                             │    │                             │ │
│  │  ┌─────────────────────┐   │    │  ┌─────────────────────┐   │ │
│  │  │    Next.js App      │   │    │  │   BMAD Runner       │   │ │
│  │  │  (Calculator + AI)  │   │    │  │   (Claude API)      │   │ │
│  │  └──────────┬──────────┘   │    │  └──────────┬──────────┘   │ │
│  │             │              │    │             │              │ │
│  │  ┌──────────▼──────────┐   │    │  ┌──────────▼──────────┐   │ │
│  │  │   Socket.IO Server  │◄──┼────┼──│   BMAD API Client   │   │ │
│  │  └──────────┬──────────┘   │    │  └──────────┬──────────┘   │ │
│  │             │              │    │             │              │ │
│  │  ┌──────────▼──────────┐   │    │  ┌──────────▼──────────┐   │ │
│  │  │   Redis + BullMQ    │◄──┼────┼──│   Job Consumer      │   │ │
│  │  │   (Job Queue)       │   │    │  │   (Processes jobs)  │   │ │
│  │  └─────────────────────┘   │    │  └──────────┬──────────┘   │ │
│  │                            │    │             │              │ │
│  │  ┌─────────────────────┐   │    │  ┌──────────▼──────────┐   │ │
│  │  │   Nginx (Reverse    │   │    │  │   Puppeteer         │   │ │
│  │  │   Proxy + SSL)      │   │    │  │   (Screenshots)     │   │ │
│  │  └─────────────────────┘   │    │  └─────────────────────┘   │ │
│  │                            │    │                             │ │
│  └─────────────────────────────┘    └─────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow: КП Generation

```
1. Клиент общается с AI в чате
   │
   ▼
2. AI собирает ProjectContext (не переспрашивает известное)
   │
   ▼
3. Когда данных достаточно → кнопка "Сгенерировать КП"
   │
   ▼
4. Web App создаёт Job в Redis Queue
   │
   ▼
5. BMAD Worker берёт Job из очереди
   │
   ├──▶ Запускает BMAD workflow с данными из чата
   │
   ├──▶ Если нужно уточнение:
   │    │
   │    ├── Отправляет вопрос через WebSocket → Web App → Client
   │    │
   │    ├── Клиент отвечает на сайте
   │    │
   │    └── Ответ возвращается в BMAD Worker → продолжает
   │
   ├──▶ Генерирует: Brief → PRD → Architecture → Demo Code
   │
   ├──▶ Запускает Demo сайт локально
   │
   ├──▶ Puppeteer делает скриншоты
   │
   └──▶ Собирает PDF (КП + презентация)
   │
   ▼
6. Отправляет результат через WebSocket → Web App → Client
   │
   ▼
7. Клиент скачивает PDF и смотрит скриншоты на сайте
```

### Context Tracking Schema

```typescript
interface ProjectContext {
  // Идентификация
  sessionId: string;

  // Собранные данные
  projectName?: string;
  businessType?: string;
  businessDescription?: string;
  targetAudience?: string;
  mainFeatures: string[];
  budget?: { min: number; max: number };
  designPreferences?: string;
  integrations: string[];
  timeline?: string;

  // Трекинг
  collectedFields: string[];
  missingRequiredFields: string[];
  conversationHistory: Message[];

  // Статус
  readyToGenerate: boolean;
  generationJobId?: string;
  generationStatus?: GenerationStatus;
}

interface GenerationStatus {
  state: 'queued' | 'processing' | 'waiting_for_input' | 'completed' | 'failed';
  currentStep?: string;
  progress: number; // 0-100
  question?: BmadQuestion;
  result?: GenerationResult;
  error?: string;
}

interface BmadQuestion {
  id: string;
  question: string;
  field: string;
  options?: string[]; // если multiple choice
}

interface GenerationResult {
  pdfUrl: string;
  screenshots: string[];
  createdAt: Date;
  expiresAt: Date; // автоудаление через N дней
}
```

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `generation:start` | Client → Server | `{ sessionId, context }` | Запуск генерации |
| `generation:progress` | Server → Client | `{ jobId, step, progress }` | Обновление прогресса |
| `generation:question` | Server → Client | `{ jobId, question }` | BMAD нужно уточнение |
| `generation:answer` | Client → Server | `{ jobId, questionId, answer }` | Ответ на вопрос |
| `generation:complete` | Server → Client | `{ jobId, result }` | Генерация завершена |
| `generation:error` | Server → Client | `{ jobId, error }` | Ошибка генерации |

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Файлы и папки:**

| Тип | Паттерн | Пример |
|-----|---------|--------|
| Компоненты | PascalCase.tsx | `CategorySelector.tsx` |
| Утилиты | camelCase.ts | `calculateTotal.ts` |
| Хуки | use*.ts | `useCalculator.ts` |
| Типы | *.types.ts | `calculator.types.ts` |
| Zustand stores | *Store.ts | `calculatorStore.ts` |
| Server Actions | *Actions.ts | `aiActions.ts` |

**Код:**

| Тип | Паттерн | Пример |
|-----|---------|--------|
| Компоненты | PascalCase | `CategoryCard` |
| Функции | camelCase | `calculateTotal()` |
| Константы | UPPER_SNAKE | `MAX_DISCOUNT` |
| Типы/Интерфейсы | PascalCase | `ServiceOption` |
| Zod schemas | camelCase + Schema | `serviceOptionSchema` |

### Structure Patterns

**Feature-based организация:**

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── actions/            # Server Actions
│       └── ai.ts
├── components/
│   ├── calculator/         # Feature: Calculator
│   ├── ai/                 # Feature: AI Chat
│   ├── pdf/                # Feature: PDF Export
│   └── ui/                 # Shared UI components
├── data/                   # Static data
├── store/                  # Zustand stores
├── types/                  # TypeScript types
├── lib/                    # Utilities
└── schemas/                # Zod schemas
```

### Format Patterns

**Zod Schema Pattern:**

```typescript
export const serviceOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  hasQuantity: z.boolean().default(false),
});
export type ServiceOption = z.infer<typeof serviceOptionSchema>;
```

**Zustand Store Pattern:**

```typescript
interface CalculatorState {
  selectedOptions: Map<string, SelectedOption>;
  discount: number;
  toggleOption: (optionId: string) => void;
  setQuantity: (optionId: string, qty: number) => void;
  setDiscount: (percent: number) => void;
  reset: () => void;
}
```

### Process Patterns

**Server Action Response:**

```typescript
return { success: true, data: response };
// or
return { success: false, error: 'AI временно недоступен' };
```

**Loading States:** `isAiLoading`, `isPdfGenerating`

### Enforcement Guidelines

**Обязательные правила:**

1. PascalCase для компонентов и их файлов
2. Feature-based папки в `components/`
3. Zod для валидации данных
4. `{ success, data/error }` из Server Actions
5. Zustand для состояния калькулятора (не useState)

**Anti-Patterns:**

- ❌ kebab-case для компонентов
- ❌ Разбросанные типы (собирать в `types/`)
- ❌ useState для глобального состояния
- ❌ Прямые вызовы AI API из клиента

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
calculator-asystem/
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .env.local                    # API_KEY, REDIS_URL, etc.
├── .env.example
├── .gitignore
├── .eslintrc.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── api/
│   │   │   ├── socket/           # WebSocket endpoint
│   │   │   │   └── route.ts
│   │   │   └── generation/       # Generation API
│   │   │       └── route.ts
│   │   └── actions/
│   │       └── ai.ts             # Server Action: AI proxy
│   │
│   ├── components/
│   │   ├── calculator/
│   │   │   ├── Calculator.tsx
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── OptionsList.tsx
│   │   │   ├── OptionItem.tsx
│   │   │   ├── QuantityInput.tsx
│   │   │   ├── DiscountPanel.tsx
│   │   │   └── TotalPanel.tsx
│   │   ├── ai/
│   │   │   ├── AiChat.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ContextTracker.tsx      # NEW: отображение собранного контекста
│   │   ├── generation/                  # NEW: компоненты генерации КП
│   │   │   ├── GenerateButton.tsx
│   │   │   ├── ProgressPanel.tsx
│   │   │   ├── QuestionModal.tsx       # Вопросы от BMAD
│   │   │   └── ResultPanel.tsx         # Скачивание PDF, просмотр скриншотов
│   │   ├── pdf/
│   │   │   ├── PdfButton.tsx
│   │   │   └── PdfTemplate.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Input.tsx
│   │       ├── Spinner.tsx
│   │       ├── ProgressBar.tsx         # NEW
│   │       └── Modal.tsx               # NEW
│   │
│   ├── data/
│   │   ├── categories.ts
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── landing.ts
│   │   │   ├── ecommerce.ts
│   │   │   ├── corporate.ts
│   │   │   └── ...
│   │   ├── tooltips.ts
│   │   └── requiredFields.ts           # NEW: обязательные поля для генерации
│   │
│   ├── store/
│   │   ├── calculatorStore.ts
│   │   └── contextStore.ts             # NEW: ProjectContext state
│   │
│   ├── types/
│   │   ├── calculator.types.ts
│   │   ├── service.types.ts
│   │   ├── ai.types.ts
│   │   ├── context.types.ts            # NEW: ProjectContext types
│   │   └── generation.types.ts         # NEW: Generation types
│   │
│   ├── schemas/
│   │   ├── service.schema.ts
│   │   ├── category.schema.ts
│   │   └── context.schema.ts           # NEW: Zod schema for context
│   │
│   ├── lib/
│   │   ├── calculations.ts
│   │   ├── formatters.ts
│   │   ├── pdf.ts
│   │   ├── cn.ts
│   │   ├── socket.ts                   # NEW: WebSocket client
│   │   └── contextAnalyzer.ts          # NEW: анализ собранных данных
│   │
│   └── server/                         # NEW: серверная часть
│       ├── socket.ts                   # Socket.IO server setup
│       ├── queue.ts                    # BullMQ queue setup
│       └── jobs/
│           └── generation.job.ts       # Job processor
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── tests/
│   ├── components/
│   └── lib/
│
└── worker/                             # NEW: BMAD Worker (отдельная VM)
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts                    # Entry point
    │   ├── bmadRunner.ts               # BMAD workflow runner
    │   ├── screenshotService.ts        # Puppeteer screenshots
    │   ├── pdfGenerator.ts             # КП PDF generation
    │   └── api.ts                      # Communication with Web App
    └── Dockerfile                      # Для деплоя на VM
```

### Architectural Boundaries

**Data Flow (Calculator):**
```
User → Calculator.tsx → Zustand Store → TotalPanel.tsx
                ↓                              ↓
         OptionsList.tsx               PdfButton.tsx
```

**Data Flow (AI Chat + Context):**
```
User → AiChat.tsx → Server Action → AI API
         ↓
   ContextTracker → contextStore → contextAnalyzer
         ↓                              ↓
   "Достаточно данных?"          missingFields
         ↓
   GenerateButton.tsx
```

**Data Flow (КП Generation):**
```
GenerateButton → WebSocket → Redis Queue → BMAD Worker
                     ↑                          ↓
              ProgressPanel              BMAD Workflow
                     ↑                          ↓
              QuestionModal ←──────── Вопрос от BMAD
                     ↓                          ↓
              Ответ клиента ──────────▶ Продолжение
                     ↑                          ↓
              ResultPanel ←──────────── PDF + Screenshots
```

**Integration Points:**

| Точка | Тип | Паттерн |
|-------|-----|---------|
| Zustand Store | Internal | Global state singleton |
| Server Actions | Internal → External | Async try-catch |
| html2pdf | External lib | Client-side |
| AI API | External | Server Action proxy |
| **WebSocket (Socket.IO)** | **Internal** | **Bidirectional events** |
| **Redis + BullMQ** | **Internal** | **Job queue pattern** |
| **BMAD Worker** | **External process** | **REST + WebSocket** |
| **Puppeteer** | **External lib** | **Server-side, isolated VM** |

### FR → Structure Mapping

| FR Category | Location |
|-------------|----------|
| Каталог услуг (FR1-3) | `components/calculator/` |
| Расчёт (FR4-9) | `store/`, `lib/calculations.ts` |
| Информация (FR10-11) | `components/ui/Tooltip.tsx`, `data/` |
| AI (FR12-15) | `components/ai/`, `app/actions/` |
| PDF расчёта (FR16-18) | `components/pdf/` |
| UI (FR19-22) | `components/calculator/`, `components/ui/` |
| **AI контекст-трекинг (FR23-26)** | **`store/contextStore.ts`, `lib/contextAnalyzer.ts`** |
| **BMAD интеграция (FR27-31)** | **`server/`, `lib/socket.ts`, `worker/`** |
| **Генерация КП (FR32-36)** | **`components/generation/`, `worker/`** |

---

## Architecture Validation Results

### Validation Summary

| Проверка | Статус |
|----------|--------|
| Coherence | ✅ PASS |
| Requirements Coverage | ✅ PASS |
| Implementation Readiness | ✅ PASS |

### Coherence Validation

**Decision Compatibility:** Все технологии совместимы
- Next.js 15 + TypeScript — нативная поддержка
- Next.js App Router + Zustand — работает в Client Components
- Server Actions + Copilot API — secure proxy pattern
- Tailwind CSS + Next.js — встроенная интеграция

**Pattern Consistency:** Единообразные соглашения
**Structure Alignment:** Структура поддерживает все решения

### Requirements Coverage

**Functional Requirements:** 37/37 FR покрыты архитектурно (включая NEW FR23-37)
**Non-Functional Requirements:** Все NFR адресованы (включая 15-20 мин генерация)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analyzed
- [x] Scale assessed (Medium)
- [x] Constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Stack fully specified
- [x] Integration patterns defined
- [x] Security addressed
- [x] Hosting decided

**✅ Implementation Patterns**
- [x] Naming conventions
- [x] Structure patterns
- [x] State patterns
- [x] Error handling

**✅ Project Structure**
- [x] Complete directory tree
- [x] FR → Structure mapping
- [x] Integration boundaries

### Architecture Readiness

**Status:** ✅ READY FOR IMPLEMENTATION
**Confidence:** HIGH

**First Implementation Step:**
```bash
npx create-next-app@latest calculator-asystem --typescript --tailwind --app --eslint --src-dir --turbopack
```
