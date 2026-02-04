# TODO: Исправить отображение вопросов BMAD

## Текущий статус (2026-02-03)

### Что работает:
- AI чат извлекает контекст (projectName, businessType, targetAudience, mainFeatures)
- Кнопка "Сгенерировать КП" появляется когда контекст собран
- Job добавляется в Redis и воркер его подхватывает
- BMAD агент начинает работу и задаёт вопросы

### Что НЕ работает:
- Модалка с вопросом от BMAD не появляется на фронтенде
- Пользователь не видит вопросы и не может на них ответить

## Проблема

BMAD воркер отправляет вопрос через WebSocket (`worker:question`), но модалка `QuestionModal` не отображается.

**Цепочка доставки вопроса:**
1. Worker → `socket.emit('worker:question', { jobId, sessionId, question })`
2. Server → находит клиентский сокет по sessionId → `clientSocket.emit('generation:question', ...)`
3. Client → `socket.on('generation:question')` → устанавливает `status.state = 'waiting_for_input'`
4. React → `QuestionModal` проверяет `status.state === 'waiting_for_input'` → показывает модалку

**Где-то в этой цепочке разрыв!**

## Что нужно проверить

### 1. Проверить что сервер получает вопрос от воркера
Добавлено логирование в `app/src/server/socket.ts`:
```
[Socket] Worker question for session {sessionId}: {question}
[Socket] Available sessions: [...]
```

### 2. Проверить что клиентский сокет найден
Если в логах видно `No client socket found for session`, значит:
- sessionSockets не содержит сокет для этой сессии
- Возможно сокет отключился

### 3. Проверить браузерную консоль
Открыть DevTools → Console и искать:
```
[Socket] Question received: {...}
```

### 4. Проверить состояние React store
В браузере проверить что `generationStatus.state === 'waiting_for_input'` и есть `question`

## Файлы для изучения

- `app/src/server/socket.ts` - обработка `worker:question` (строка ~386)
- `app/src/lib/socket.ts` - клиентская обработка `generation:question` (строка ~93)
- `app/src/components/generation/QuestionModal.tsx` - модалка вопроса
- `app/src/app/page.tsx` - где рендерится QuestionModal (строка 38)
- `app/src/store/contextStore.ts` - хранилище состояния

## Команды для тестирования

```bash
# Запустить сервер
cd "/Users/mac/Desktop/calculator asystem/app"
npm run dev:socket

# Смотреть логи сервера
tail -f /private/tmp/claude-501/-Users-mac-Desktop-calculator-asystem/tasks/party-server.output

# Смотреть логи воркера
cd "/Users/mac/Desktop/calculator asystem"
docker compose logs -f worker
```

## Шаблон текста для теста

```
Привет! Хочу заказать сайт для своей гончарной мастерской "Глиняные истории".

Мы проводим мастер-классы по гончарному делу для взрослых и детей. Наша целевая аудитория - творческие люди 25-45 лет, которые ищут интересный досуг и хотят научиться работать на гончарном круге.

Нужен сайт с расписанием мастер-классов, галереей работ учеников, онлайн-записью и информацией о ценах. Бюджет примерно 80-150 тысяч рублей, хотим запуститься через 2 месяца.
```

## Важно помнить

- Локальный Redis (brew) был остановлен - используем Docker Redis
- Если `brew services start redis` запустится автоматически - снова будет конфликт!
- Проверить: `lsof -i :6379` должен показывать только Docker
