---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-complete']
inputDocuments: ['prd.md', 'architecture.md']
status: 'complete'
completedAt: '2026-01-30'
---

# calculator asystem - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for calculator asystem, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Пользователь может видеть список всех 14 категорий услуг
- FR2: Пользователь может выбрать категорию для просмотра её опций
- FR3: Пользователь может переключаться между категориями без потери выбранных опций
- FR4: Пользователь может выбирать опции с помощью чекбоксов
- FR5: Пользователь может указывать количество для опций с множителем
- FR6: Пользователь может видеть цену каждой отдельной опции
- FR7: Пользователь может видеть итоговую сумму всех выбранных опций
- FR8: Система пересчитывает итог мгновенно при изменении выбора
- FR9: Пользователь может применять скидку к итоговой сумме
- FR10: Пользователь может видеть объяснение каждой опции (tooltip)
- FR11: Система показывает понятные описания без технического жаргона
- FR12: Пользователь может задавать вопросы AI-помощнику в чате
- FR13: AI-помощник может рекомендовать опции на основе типа бизнеса
- FR14: AI-помощник может объяснять ценность опций
- FR15: AI-помощник отвечает на вопросы о ценах и услугах
- FR16: Пользователь может скачать расчёт в формате PDF
- FR17: PDF содержит все выбранные опции с ценами и итогом
- FR18: PDF содержит название компании и дату
- FR19: Пользователь может использовать калькулятор на десктопе
- FR20: Пользователь может использовать калькулятор на мобильном устройстве
- FR21: Итоговая сумма всегда видна на экране
- FR22: Пользователь может сбросить все выбранные опции

**NEW - AI контекст-трекинг:**
- FR23: AI отслеживает всю информацию, которую клиент уже сообщил в диалоге
- FR24: AI не переспрашивает информацию, которая уже известна из контекста
- FR25: AI определяет когда собрано достаточно данных для генерации КП
- FR26: AI показывает кнопку "Сгенерировать КП" когда данных достаточно

**NEW - BMAD интеграция:**
- FR27: Система может запустить BMAD workflow на сервере (Proxmox VM)
- FR28: Данные из AI-диалога автоматически передаются в BMAD как входные параметры
- FR29: Если BMAD нужно уточнение — вопрос отображается на сайте клиенту
- FR30: Ответ клиента на уточняющий вопрос передаётся обратно в BMAD
- FR31: Прогресс генерации отображается в реальном времени (WebSocket/SSE)

**NEW - Генерация КП и демо:**
- FR32: BMAD генерирует Product Brief, PRD, Architecture и код демо-сайта
- FR33: Система делает скриншоты демо-сайта (Puppeteer/Playwright)
- FR34: Система формирует PDF с презентацией и коммерческим предложением
- FR35: Пользователь может скачать КП (PDF) на сайте
- FR36: Пользователь может просмотреть скриншоты демо-сайта на сайте

**DEFERRED - Оплата:**
- FR37: Пользователь может оплатить генерацию КП (позже)

### Non-Functional Requirements

- NFR1: Первая отрисовка < 3 секунды
- NFR2: Пересчёт итога < 100ms
- NFR3: Генерация PDF расчёта < 5 секунд
- NFR4: Ответ AI в чате < 10 секунд
- NFR5: API ключи хранятся на сервере
- NFR6: HTTPS обязательно для продакшена
- **NFR7 (NEW): Полная генерация КП + демо 15-20 минут**
- **NFR8 (NEW): Обновление прогресса < 2 секунды задержка**
- **NFR9 (NEW): Отображение вопроса от BMAD < 3 секунды**

### Additional Requirements

- Starter: `npx create-next-app@latest calculator-asystem --typescript --tailwind --app --eslint --src-dir --turbopack`
- Dependencies: zustand, zod, html2pdf.js, **socket.io, bullmq, ioredis**
- State management: Zustand store
- AI proxy: Server Actions
- Data: Static TypeScript objects + Zod validation
- **Hosting: Proxmox VM (Debian) — свой сервер**
- **BMAD Worker: Отдельная Proxmox VM**
- **WebSocket: Socket.IO для real-time**
- **Job Queue: Redis + BullMQ**
- **Screenshots: Puppeteer на BMAD Worker VM**

### FR Coverage Map

| FR | Epic | Story |
|----|------|-------|
| FR1-FR3 | Epic 2 | 2.1, 2.2 |
| FR4-FR9 | Epic 3 | 3.1, 3.2, 3.3 |
| FR10-FR11 | Epic 2 | 2.3 |
| FR12-FR15 | Epic 4 | 4.1, 4.2 |
| FR16-FR18 | Epic 5 | 5.1 |
| FR19-FR22 | Epic 2, 3 | 2.1, 3.4 |
| **FR23-FR26** | **Epic 7** | **7.1, 7.2** |
| **FR27-FR31** | **Epic 8** | **8.1, 8.2, 8.3** |
| **FR32-FR36** | **Epic 9** | **9.1, 9.2, 9.3** |

## Epic List

| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| Epic 1 | Project Setup | 2 | Infrastructure |
| Epic 2 | Service Catalog UI | 3 | FR1-FR3, FR10-FR11, FR19-FR21 |
| Epic 3 | Price Calculator | 4 | FR4-FR9, FR22 |
| Epic 4 | AI Assistant | 2 | FR12-FR15 |
| Epic 5 | PDF Export | 1 | FR16-FR18 |
| Epic 6 | Polish & Deploy | 2 | NFR1-NFR6 |
| **Epic 7** | **AI Context Tracking (NEW)** | **2** | **FR23-FR26** |
| **Epic 8** | **BMAD Integration (NEW)** | **3** | **FR27-FR31** |
| **Epic 9** | **КП Generation (NEW)** | **3** | **FR32-FR36** |

---

## Epic 1: Project Setup

**Goal:** Создать базовую инфраструктуру проекта с настроенным стеком технологий и структурой папок.

### Story 1.1: Initialize Next.js Project

As a **developer**,
I want **to initialize the project with the correct starter template**,
So that **I have a properly configured development environment**.

**Acceptance Criteria:**

**Given** no project exists
**When** I run the initialization command
**Then** a new Next.js project is created with TypeScript, Tailwind, App Router, ESLint, src directory, and Turbopack
**And** the project starts successfully with `npm run dev`

**Tasks:**
- [ ] Run `npx create-next-app@latest calculator-asystem --typescript --tailwind --app --eslint --src-dir --turbopack`
- [ ] Verify project structure matches architecture document
- [ ] Test development server starts without errors

---

### Story 1.2: Setup Dependencies and Project Structure

As a **developer**,
I want **to install required dependencies and create the folder structure**,
So that **the codebase is organized according to the architecture**.

**Acceptance Criteria:**

**Given** the Next.js project is initialized
**When** I install dependencies and create folders
**Then** zustand, zod, and html2pdf.js are installed
**And** the folder structure matches the architecture document
**And** TypeScript compiles without errors

**Tasks:**
- [ ] Run `npm install zustand zod html2pdf.js`
- [ ] Create folder structure: `components/calculator`, `components/ai`, `components/pdf`, `components/ui`, `data`, `store`, `types`, `schemas`, `lib`
- [ ] Create `.env.local` with `COPILOT_API_KEY` placeholder
- [ ] Create `.env.example` for documentation
- [ ] Verify TypeScript compilation

---

## Epic 2: Service Catalog UI

**Goal:** Реализовать интерфейс каталога услуг с 14 категориями, навигацией и tooltips.

### Story 2.1: Create Category Navigation

As a **user**,
I want **to see all 14 service categories and switch between them**,
So that **I can browse different types of services**.

**Acceptance Criteria:**

**Given** I open the calculator page
**When** the page loads
**Then** I see tabs/buttons for all 14 categories
**And** the first category is selected by default
**And** clicking a category shows its options
**And** the UI works on desktop and mobile (FR19, FR20)

**Tasks:**
- [ ] Create `CategoryTabs.tsx` component
- [ ] Create `data/categories.ts` with 14 category definitions
- [ ] Implement tab switching logic
- [ ] Add responsive styling for mobile
- [ ] Test category switching preserves state (FR3)

**FRs Covered:** FR1, FR2, FR3, FR19, FR20

---

### Story 2.2: Display Service Options List

As a **user**,
I want **to see all options within a selected category**,
So that **I can understand what services are available**.

**Acceptance Criteria:**

**Given** I have selected a category
**When** the options load
**Then** I see a list of all options for that category
**And** each option shows its name and price (FR6)
**And** options with quantity show a quantity input

**Tasks:**
- [ ] Create `OptionsList.tsx` component
- [ ] Create `OptionItem.tsx` component
- [ ] Create `data/services/*.ts` files for all 14 categories
- [ ] Create Zod schemas for service data validation
- [ ] Display price for each option

**FRs Covered:** FR6

---

### Story 2.3: Implement Tooltips for Options

As a **user**,
I want **to see explanations for each option when I hover/click the "?" icon**,
So that **I understand what each service includes without technical jargon**.

**Acceptance Criteria:**

**Given** I see an option with a "?" icon
**When** I hover (desktop) or tap (mobile) the icon
**Then** a tooltip appears with a clear, non-technical description (FR11)
**And** the tooltip disappears when I move away/tap elsewhere

**Tasks:**
- [ ] Create `Tooltip.tsx` UI component
- [ ] Add tooltip trigger to each `OptionItem`
- [ ] Create `data/tooltips.ts` with descriptions for all options
- [ ] Ensure tooltips work on both desktop (hover) and mobile (tap)

**FRs Covered:** FR10, FR11

---

## Epic 3: Price Calculator

**Goal:** Реализовать логику расчёта стоимости с чекбоксами, количеством, скидками и мгновенным пересчётом.

### Story 3.1: Implement Zustand Store for Calculator State

As a **developer**,
I want **to have a centralized state management for selected options**,
So that **all components can access and update the calculator state consistently**.

**Acceptance Criteria:**

**Given** the store is implemented
**When** I select/deselect options or change quantities
**Then** the state updates correctly
**And** state persists when switching categories (FR3)
**And** recalculation happens in < 100ms (NFR2)

**Tasks:**
- [ ] Create `store/calculatorStore.ts` with Zustand
- [ ] Implement `selectedOptions` Map
- [ ] Implement `toggleOption`, `setQuantity`, `setDiscount`, `reset` actions
- [ ] Create selectors for total calculation
- [ ] Test state persistence across category switches

**FRs Covered:** FR3, FR8 (partial)

---

### Story 3.2: Implement Option Selection with Checkboxes

As a **user**,
I want **to select services using checkboxes**,
So that **I can build my custom package**.

**Acceptance Criteria:**

**Given** I see a list of options
**When** I click a checkbox
**Then** the option is selected/deselected
**And** the total updates instantly (FR8)
**And** I can set quantity for options that support it (FR5)

**Tasks:**
- [ ] Create `Checkbox.tsx` UI component
- [ ] Connect checkboxes to Zustand store
- [ ] Create `QuantityInput.tsx` for options with multipliers
- [ ] Implement instant recalculation on change

**FRs Covered:** FR4, FR5, FR8

---

### Story 3.3: Implement Total Panel with Discount

As a **user**,
I want **to see the total price always visible and apply discounts**,
So that **I always know the current cost and can negotiate**.

**Acceptance Criteria:**

**Given** I have selected some options
**When** I view the calculator
**Then** I see a sticky total panel that's always visible (FR21)
**And** the total shows the sum of all selected options (FR7)
**And** I can enter a discount percentage (FR9)
**And** the discount is applied to the total

**Tasks:**
- [ ] Create `TotalPanel.tsx` component with sticky positioning
- [ ] Create `DiscountPanel.tsx` or `DiscountInput.tsx`
- [ ] Connect to Zustand store for real-time updates
- [ ] Implement discount calculation logic in `lib/calculations.ts`
- [ ] Format prices with currency in `lib/formatters.ts`

**FRs Covered:** FR7, FR9, FR21

---

### Story 3.4: Implement Reset Functionality

As a **user**,
I want **to reset all selected options**,
So that **I can start a new calculation from scratch**.

**Acceptance Criteria:**

**Given** I have selected multiple options
**When** I click the "Reset" button
**Then** all options are deselected
**And** the total becomes 0
**And** the discount is cleared

**Tasks:**
- [ ] Add reset button to UI
- [ ] Connect to `reset()` action in Zustand store
- [ ] Confirm reset clears all state

**FRs Covered:** FR22

---

## Epic 4: AI Assistant

**Goal:** Интегрировать AI-помощника для консультаций и рекомендаций.

### Story 4.1: Create AI Chat UI

As a **user**,
I want **to see a chat interface for the AI assistant**,
So that **I can ask questions and get recommendations**.

**Acceptance Criteria:**

**Given** I open the calculator
**When** I view the AI chat panel
**Then** I see a chat window with message history
**And** I see an input field to type my question
**And** I see a loading indicator while AI is thinking

**Tasks:**
- [ ] Create `AiChat.tsx` container component
- [ ] Create `ChatInput.tsx` for message input
- [ ] Create `MessageBubble.tsx` for displaying messages
- [ ] Create `Spinner.tsx` for loading state
- [ ] Style chat window for desktop and mobile

**FRs Covered:** FR12 (partial)

---

### Story 4.2: Implement AI Server Action and Integration

As a **user**,
I want **to send messages to the AI and receive helpful responses**,
So that **I can get recommendations based on my business type**.

**Acceptance Criteria:**

**Given** I type a question in the chat
**When** I send the message
**Then** the AI responds within 10 seconds (NFR4)
**And** the AI can recommend options based on my business type (FR13)
**And** the AI explains the value of options (FR14)
**And** the AI answers questions about prices and services (FR15)
**And** API key is kept secure on server (NFR5)

**Tasks:**
- [ ] Create `app/actions/ai.ts` Server Action
- [ ] Implement Copilot API integration
- [ ] Create system prompt for calculator context
- [ ] Handle errors gracefully (show fallback message)
- [ ] Connect chat UI to Server Action
- [ ] Test with various business type questions

**FRs Covered:** FR12, FR13, FR14, FR15

---

## Epic 5: PDF Export

**Goal:** Реализовать экспорт расчёта в PDF.

### Story 5.1: Implement PDF Generation and Download

As a **user**,
I want **to download my calculation as a PDF**,
So that **I can share it or review it later**.

**Acceptance Criteria:**

**Given** I have selected options and see a total
**When** I click "Download PDF"
**Then** a PDF is generated within 5 seconds (NFR3)
**And** the PDF contains all selected options with prices (FR17)
**And** the PDF shows the total (with discount if applied)
**And** the PDF includes ASYSTEM company name and current date (FR18)
**And** the PDF downloads to my device (FR16)

**Tasks:**
- [ ] Create `PdfButton.tsx` component
- [ ] Create `PdfTemplate.tsx` for PDF layout
- [ ] Create `lib/pdf.ts` with html2pdf.js integration
- [ ] Read selected options from Zustand store
- [ ] Style PDF to match ASYSTEM branding
- [ ] Test PDF generation on different browsers

**FRs Covered:** FR16, FR17, FR18

---

## Epic 6: Polish & Deploy

**Goal:** Финальная полировка, оптимизация производительности и деплой.

### Story 6.1: Performance Optimization

As a **user**,
I want **the calculator to load fast and respond instantly**,
So that **I have a smooth experience**.

**Acceptance Criteria:**

**Given** I open the calculator
**When** the page loads
**Then** first render happens in < 3 seconds (NFR1)
**And** all interactions feel instant (< 100ms for recalculations)

**Tasks:**
- [ ] Optimize bundle size (check with `npm run build`)
- [ ] Implement code splitting if needed
- [ ] Optimize images and assets
- [ ] Test performance with Lighthouse
- [ ] Fix any performance issues found

**FRs Covered:** NFR1, NFR2

---

### Story 6.2: Deploy to Proxmox VM with Cloudflare Tunnel

As a **product owner**,
I want **the calculator deployed to production on my server with public access**,
So that **I can use it with clients from anywhere, not just local network**.

**Acceptance Criteria:**

**Given** all features are implemented and tested
**When** I deploy to Proxmox VM with Cloudflare Tunnel
**Then** the site is accessible via HTTPS at calculator.asystem.kg
**And** environment variables are configured securely
**And** the calculator works correctly in production
**And** PM2 manages the Node.js process
**And** Cloudflare provides SSL and DDoS protection

**Tasks:**
- [ ] Setup Proxmox VM for Web App (Debian)
- [ ] Install Node.js, PM2, Nginx
- [ ] Configure Nginx as local reverse proxy (localhost:3000)
- [ ] Install cloudflared on VM
- [ ] Create Cloudflare Tunnel (`cloudflared tunnel create`)
- [ ] Configure tunnel (`~/.cloudflared/config.yml`)
- [ ] Add DNS record in Cloudflare (calculator.asystem.kg → tunnel)
- [ ] Run cloudflared as systemd service
- [ ] Configure environment variables (.env)
- [ ] Deploy app with PM2
- [ ] Test all features in production via public URL

**FRs Covered:** NFR5, NFR6

---

---

## Epic 7: AI Context Tracking (NEW)

**Goal:** Реализовать умный сбор данных через AI-диалог без повторных вопросов.

### Story 7.1: Implement Context Store and Analyzer

As a **developer**,
I want **to track all information collected from the user in the chat**,
So that **we can determine when we have enough data for КП generation**.

**Acceptance Criteria:**

**Given** a user is chatting with the AI
**When** the user provides information (business type, features, budget, etc.)
**Then** the context store is updated with the new information
**And** the system knows which required fields are still missing
**And** the AI does NOT ask for information that's already known

**Tasks:**
- [ ] Create `types/context.types.ts` with ProjectContext interface
- [ ] Create `schemas/context.schema.ts` with Zod validation
- [ ] Create `store/contextStore.ts` with Zustand
- [ ] Create `lib/contextAnalyzer.ts` to extract data from AI responses
- [ ] Create `data/requiredFields.ts` with minimum fields for generation
- [ ] Implement `collectedFields` and `missingRequiredFields` tracking

**FRs Covered:** FR23, FR24, FR25

---

### Story 7.2: Implement Generate Button Logic

As a **user**,
I want **to see a "Generate КП" button when I've provided enough information**,
So that **I know when I can get my commercial proposal**.

**Acceptance Criteria:**

**Given** I have provided all required information in the chat
**When** the context analyzer detects sufficient data
**Then** a "Сгенерировать КП" button appears
**And** the button shows what data was collected (optional summary)
**And** clicking the button starts the generation process

**Tasks:**
- [ ] Create `components/generation/GenerateButton.tsx`
- [ ] Connect to contextStore to check readiness
- [ ] Show collected context summary (optional)
- [ ] Implement click handler to start generation
- [ ] Add loading state when generation starts

**FRs Covered:** FR26

---

## Epic 8: BMAD Integration (NEW)

**Goal:** Интегрировать BMAD Worker для генерации проектов с двусторонней связью.

### Story 8.1: Setup BMAD Worker Infrastructure

As a **developer**,
I want **to setup the BMAD Worker on a separate VM**,
So that **we can run BMAD workflows in isolation**.

**Acceptance Criteria:**

**Given** a Proxmox VM is available
**When** I setup the BMAD Worker
**Then** Node.js, BMAD, Puppeteer are installed
**And** the worker can communicate with the Web App via API
**And** the worker can process jobs from Redis queue

**Tasks:**
- [ ] Setup Proxmox VM for BMAD Worker (Debian)
- [ ] Install Node.js, npm, git
- [ ] Install BMAD globally or as dependency
- [ ] Install Puppeteer with dependencies (chromium)
- [ ] Create `worker/` folder structure
- [ ] Create `worker/src/index.ts` entry point
- [ ] Create `worker/src/api.ts` for communication with Web App
- [ ] Setup PM2 for worker process management
- [ ] Test basic connectivity

**FRs Covered:** FR27 (partial)

---

### Story 8.2: Implement WebSocket and Job Queue

As a **developer**,
I want **real-time communication between Web App and BMAD Worker**,
So that **users can see progress and answer BMAD questions**.

**Acceptance Criteria:**

**Given** a user starts КП generation
**When** the job is created
**Then** it's added to Redis queue
**And** BMAD Worker picks up the job
**And** progress updates are sent via WebSocket
**And** BMAD questions are displayed to the user
**And** user answers are sent back to BMAD Worker

**Tasks:**
- [ ] Install Redis on Web App VM (or separate)
- [ ] Install `socket.io`, `bullmq`, `ioredis` on Web App
- [ ] Create `src/server/socket.ts` Socket.IO setup
- [ ] Create `src/server/queue.ts` BullMQ queue setup
- [ ] Create `src/lib/socket.ts` client-side WebSocket
- [ ] Implement WebSocket events (progress, question, answer, complete, error)
- [ ] Create `worker/src/bmadRunner.ts` to process jobs
- [ ] Implement BMAD question → WebSocket → client flow
- [ ] Implement client answer → WebSocket → BMAD flow

**FRs Covered:** FR28, FR29, FR30, FR31

---

### Story 8.3: Implement Progress UI

As a **user**,
I want **to see the progress of my КП generation**,
So that **I know what's happening and how long to wait**.

**Acceptance Criteria:**

**Given** I started КП generation
**When** the generation is in progress
**Then** I see a progress panel with current step and percentage
**And** completed steps are marked with ✅
**And** current step shows 🔄
**And** pending steps show ⏳
**And** if BMAD asks a question, I see a modal to answer

**Tasks:**
- [ ] Create `components/generation/ProgressPanel.tsx`
- [ ] Create `components/generation/QuestionModal.tsx`
- [ ] Create `components/ui/ProgressBar.tsx`
- [ ] Create `components/ui/Modal.tsx`
- [ ] Connect to WebSocket for real-time updates
- [ ] Handle question modal flow
- [ ] Style for desktop and mobile

**FRs Covered:** FR29, FR31

---

## Epic 9: КП Generation (NEW)

**Goal:** Реализовать полный цикл генерации КП с презентацией и скриншотами демо.

### Story 9.1: Implement BMAD Workflow Runner

As a **developer**,
I want **to run BMAD workflows with pre-filled data from chat**,
So that **КП is generated automatically without manual input**.

**Acceptance Criteria:**

**Given** a generation job is received
**When** BMAD Worker processes it
**Then** BMAD runs new-project workflow with data from chat
**And** generates Product Brief, PRD, Architecture
**And** generates demo site code
**And** if BMAD needs clarification, sends question via WebSocket
**And** waits for answer before continuing

**Tasks:**
- [ ] Create `worker/src/bmadRunner.ts` workflow orchestration
- [ ] Map ProjectContext fields to BMAD workflow inputs
- [ ] Implement non-interactive BMAD execution
- [ ] Implement question hook to send questions via WebSocket
- [ ] Implement answer wait mechanism
- [ ] Handle BMAD errors gracefully
- [ ] Store generated files in temp directory

**FRs Covered:** FR27, FR28, FR32

---

### Story 9.2: Implement Screenshot Service

As a **developer**,
I want **to capture screenshots of the generated demo site**,
So that **clients can preview their site without getting the code**.

**Acceptance Criteria:**

**Given** BMAD has generated demo site code
**When** screenshot service runs
**Then** demo site is started locally (next dev or static serve)
**And** Puppeteer captures screenshots of key pages
**And** screenshots are saved and accessible via URL
**And** demo site is stopped after screenshots

**Tasks:**
- [ ] Create `worker/src/screenshotService.ts`
- [ ] Implement demo site launcher (npm run dev or serve)
- [ ] Configure Puppeteer for headless screenshots
- [ ] Capture multiple pages/viewports (desktop, mobile)
- [ ] Save screenshots to accessible storage
- [ ] Generate screenshot URLs for client
- [ ] Cleanup temp files after completion

**FRs Covered:** FR33

---

### Story 9.3: Implement Result Delivery

As a **user**,
I want **to download my КП and view demo screenshots on the site**,
So that **I can review what I'll get before contacting ASYSTEM**.

**Acceptance Criteria:**

**Given** КП generation is complete
**When** I view the results
**Then** I can download КП as PDF (presentation + commercial proposal)
**And** I can view demo site screenshots in a gallery
**And** results are available for N days before auto-deletion
**And** I receive notification that generation is complete

**Tasks:**
- [ ] Create `worker/src/pdfGenerator.ts` for КП PDF
- [ ] Design КП PDF template (ASYSTEM branding)
- [ ] Create `components/generation/ResultPanel.tsx`
- [ ] Implement PDF download functionality
- [ ] Implement screenshot gallery viewer
- [ ] Add expiration notice ("доступно N дней")
- [ ] Send completion notification via WebSocket

**FRs Covered:** FR34, FR35, FR36

---

## Implementation Order

**Recommended sequence:**

1. **Epic 1** (Project Setup) — foundation
2. **Epic 2** (Service Catalog UI) — core UI
3. **Epic 3** (Price Calculator) — core functionality
4. **Epic 4** (AI Assistant) — basic AI chat
5. **Epic 5** (PDF Export) — calculator PDF
6. **Epic 7** (AI Context Tracking) — smart data collection ← NEW
7. **Epic 8** (BMAD Integration) — WebSocket, queue, worker ← NEW
8. **Epic 9** (КП Generation) — full generation flow ← NEW
9. **Epic 6** (Polish & Deploy) — ship it

**Total:** 9 Epics, 22 Stories

---

## Story Status Tracking

| Story | Status | Notes |
|-------|--------|-------|
| 1.1 | ✅ Done | Initialize Next.js Project |
| 1.2 | ✅ Done | Setup Dependencies and Structure |
| 2.1 | ✅ Done | Category Navigation |
| 2.2 | ✅ Done | Service Options List |
| 2.3 | ✅ Done | Tooltips |
| 3.1 | ⬜ Pending | Zustand Store |
| 3.2 | ⬜ Pending | Checkboxes |
| 3.3 | ⬜ Pending | Total Panel + Discount |
| 3.4 | ⬜ Pending | Reset |
| 4.1 | ⬜ Pending | AI Chat UI |
| 4.2 | ⬜ Pending | AI Server Action |
| 5.1 | ⬜ Pending | PDF Generation |
| 6.1 | ⬜ Pending | Performance Optimization |
| 6.2 | ⬜ Pending | Deploy to Proxmox |
| **7.1** | ⬜ Pending | **Context Store + Analyzer (NEW)** |
| **7.2** | ⬜ Pending | **Generate Button (NEW)** |
| **8.1** | ⬜ Pending | **BMAD Worker Infrastructure (NEW)** |
| **8.2** | ⬜ Pending | **WebSocket + Job Queue (NEW)** |
| **8.3** | ⬜ Pending | **Progress UI (NEW)** |
| **9.1** | ⬜ Pending | **BMAD Workflow Runner (NEW)** |
| **9.2** | ⬜ Pending | **Screenshot Service (NEW)** |
| **9.3** | ⬜ Pending | **Result Delivery (NEW)** |
