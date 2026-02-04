'use server';

interface ServiceContext {
  name: string;
  quantity: number;
  price: number;
}

interface ServiceOption {
  id: string;
  name: string;
  categoryId: string;
  price: number;
}

interface CategoryContext {
  id: string;
  name: string;
  options: ServiceOption[];
}

interface AiContext {
  selectedServices: ServiceContext[];
  total: number;
  availableCategories: CategoryContext[];
}

interface ExtractedContext {
  projectName?: string;
  businessType?: string;
  targetAudience?: string;
  mainFeatures?: string[];
  budget?: { min: number; max: number };
  timeline?: string;
}

interface AiResponse {
  message: string;
  selectServices?: { id: string; categoryId: string; price: number; name: string }[];
  clearFirst?: boolean;
  extractedContext?: ExtractedContext;
}

export async function askAi(message: string, context: AiContext): Promise<AiResponse> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return getFallbackResponse(message, context);
  }

  try {
    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', response.status, errorData);
      return getFallbackResponse(message, context);
    }

    const data = await response.json();
    let text = data.content?.[0]?.text;

    if (!text) {
      return getFallbackResponse(message, context);
    }

    // Убираем markdown code fence если AI обернул JSON в ```json ... ```
    text = text.trim();
    if (text.startsWith('```')) {
      // Remove opening fence (```json or ```)
      text = text.replace(/^```(?:json)?\s*\n?/, '');
      // Remove closing fence
      text = text.replace(/\n?```\s*$/, '');
      text = text.trim();
    }

    console.log('[AI] Raw response text:', text.substring(0, 200));

    // Парсим JSON ответ от AI
    // Пробуем несколько стратегий если парсинг не удался
    let parsed: Record<string, unknown> | null = null;

    // Стратегия 1: прямой парсинг
    try {
      parsed = JSON.parse(text);
    } catch {
      // Стратегия 2: заменяем кавычки-ёлочки на экранированные
      try {
        const fixed = text
          .replace(/«/g, '\\"')
          .replace(/»/g, '\\"')
          .replace(/"/g, '\\"')
          .replace(/"/g, '\\"');
        parsed = JSON.parse(fixed);
      } catch {
        // Стратегия 3: извлекаем данные регулярками
        const messageMatch = text.match(/"message"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/s);
        const contextMatch = text.match(/"extractedContext"\s*:\s*(\{[^}]+\})/s);

        if (messageMatch) {
          parsed = { message: messageMatch[1].replace(/\\"/g, '"') };

          // Пытаемся извлечь контекст
          if (contextMatch) {
            try {
              parsed.extractedContext = JSON.parse(contextMatch[1]);
            } catch {
              // игнорируем
            }
          }
        }
      }
    }

    if (parsed) {
      const services = Array.isArray(parsed.selectServices) ? parsed.selectServices : [];
      console.log('[AI] Parsed response:', {
        hasMessage: !!parsed.message,
        servicesCount: services.length,
        hasContext: !!parsed.extractedContext,
        contextFields: parsed.extractedContext ? Object.keys(parsed.extractedContext) : []
      });
      return {
        message: (parsed.message as string) || text,
        selectServices: (parsed.selectServices as Array<{id: string; categoryId: string; price: number; name: string}>) || [],
        clearFirst: (parsed.clearFirst as boolean) || false,
        extractedContext: (parsed.extractedContext as ExtractedContext) || {},
      };
    }

    // Ничего не сработало — возвращаем сырой текст
    console.error('[AI] All parse strategies failed. Text was:', text.substring(0, 300));
    return { message: text, extractedContext: {} };
  } catch (error) {
    console.error('AI request error:', error);
    return getFallbackResponse(message, context);
  }
}

function buildSystemPrompt(context: AiContext): string {
  const selectedList = context.selectedServices.length > 0
    ? context.selectedServices.map((s) => `- ${s.name}`).join('\n')
    : 'Пока ничего не выбрано';

  // Формируем список услуг с ID для AI
  const servicesList = context.availableCategories
    .map((cat) => {
      const options = cat.options
        .map((opt) => `  - ID: "${opt.id}", Название: "${opt.name}", Цена: ${opt.price}₽, Категория: "${cat.id}"`)
        .join('\n');
      return `${cat.name}:\n${options}`;
    })
    .join('\n\n');

  return `Ты профессиональный менеджер по продажам IT-компании. Помогаешь клиентам подобрать услуги.

ТЕКУЩИЙ ВЫБОР КЛИЕНТА:
${selectedList}
Сумма: ${context.total} ₽

ВСЕ ДОСТУПНЫЕ УСЛУГИ (с ID):
${servicesList}

ВАЖНО! Ты ДОЛЖЕН отвечать ТОЛЬКО в формате JSON:
{
  "message": "Твой текстовый ответ клиенту на русском языке",
  "clearFirst": false,
  "selectServices": [
    {"id": "service-id", "categoryId": "category-id", "price": 1000, "name": "Название услуги"}
  ],
  "extractedContext": {
    "projectName": "Название проекта если клиент упомянул",
    "businessType": "Тип бизнеса/ниша клиента",
    "targetAudience": "Целевая аудитория если упомянута",
    "mainFeatures": ["Функция 1", "Функция 2"]
  }
}

ПРАВИЛА:
1. Когда клиент описывает НОВЫЙ проект (другой тип) — ставь "clearFirst": true чтобы сначала очистить старый выбор
2. Если клиент просит "убери всё", "очисти", "сбрось", "начать заново" — ставь "clearFirst": true и "selectServices": []
3. Если клиент просит ДОБАВИТЬ к текущему выбору — ставь "clearFirst": false
4. selectServices — массив услуг для АВТОМАТИЧЕСКОГО выбора в калькуляторе
5. Используй ТОЛЬКО ID из списка выше — не выдумывай
6. В message напиши что ты подобрал и что клиент может убрать лишнее
7. Если клиент просто здоровается — selectServices оставь пустым []
8. Отвечай КРАТКО (2-4 предложения в message)
9. НИКОГДА не обсуждай конкурентов, сроки, внутренние процессы
10. Будь позитивным и профессиональным
11. КРИТИЧНО: НЕ используй кавычки-ёлочки «» или "" внутри JSON! Только обычные кавычки или апострофы
12. ОБЯЗАТЕЛЬНО извлекай контекст проекта в extractedContext:
    - projectName: название проекта/компании если клиент упомянул
    - businessType: тип бизнеса (кофейня, автомойка, гончарная мастерская и т.д.)
    - targetAudience: целевая аудитория если описана
    - mainFeatures: массив нужных функций (онлайн-запись, каталог, бот и т.д.)
13. Извлекай ВСЁ что можешь из сообщения клиента — это нужно для генерации КП

ПРИМЕР 1 - Клиент описывает проект:
Сообщение: "Хочу сайт для кофейни CoffeeLab, наши клиенты молодёжь 20-35 лет, нужна онлайн-запись и меню"
{
  "message": "Отлично! Для кофейни CoffeeLab подобрал лендинг с формой записи — уже в калькуляторе!",
  "clearFirst": true,
  "selectServices": [{"id": "landing-basic", "categoryId": "landing", "price": 30000, "name": "Лендинг базовый"}],
  "extractedContext": {
    "projectName": "CoffeeLab",
    "businessType": "Кофейня",
    "targetAudience": "молодёжь 20-35 лет",
    "mainFeatures": ["Онлайн-запись", "Меню"]
  }
}

ПРИМЕР 2 - Добавить к текущему:
{
  "message": "Добавил SEO-оптимизацию к вашему выбору!",
  "clearFirst": false,
  "selectServices": [{"id": "seo-basic", "categoryId": "promotion", "price": 15000, "name": "SEO базовый"}],
  "extractedContext": {}
}

ПРИМЕР 3 - Приветствие (нет контекста):
{
  "message": "Здравствуйте! Расскажите о проекте — подберу услуги!",
  "clearFirst": false,
  "selectServices": [],
  "extractedContext": {}
}`;
}

function getFallbackResponse(message: string, context: AiContext): AiResponse {
  const lowerMessage = message.toLowerCase();
  const hasExistingSelection = context.selectedServices.length > 0;

  // Извлекаем контекст из сообщения
  const extractContext = (msg: string): ExtractedContext => {
    const ctx: ExtractedContext = {};
    const lower = msg.toLowerCase();

    // Извлекаем название проекта (после "название проекта", "проект", "компания")
    const nameMatch = msg.match(/(?:название проекта|проект|компани[яю]|называется)\s+([А-Яа-яЁёA-Za-z0-9]+)/i);
    if (nameMatch) ctx.projectName = nameMatch[1];

    // Извлекаем тип бизнеса
    if (lower.includes('гончарн') || lower.includes('керамик') || lower.includes('лепк')) {
      ctx.businessType = 'Гончарная мастерская';
    } else if (lower.includes('кофейн') || lower.includes('кафе')) {
      ctx.businessType = 'Кофейня';
    } else if (lower.includes('ресторан')) {
      ctx.businessType = 'Ресторан';
    } else if (lower.includes('салон') || lower.includes('красот')) {
      ctx.businessType = 'Салон красоты';
    } else if (lower.includes('автомойк') || lower.includes('мойк')) {
      ctx.businessType = 'Автомойка';
    } else if (lower.includes('мастер-класс') || lower.includes('мастерская') || lower.includes('студи')) {
      ctx.businessType = 'Творческая мастерская';
    }

    // Извлекаем ЦА
    const caMatch = msg.match(/(?:ЦА|целевая аудитория|клиенты|для)\s+(?:это\s+)?([^.!?]+)/i);
    if (caMatch) ctx.targetAudience = caMatch[1].trim();

    // Извлекаем функции
    const features: string[] = [];
    if (lower.includes('лендинг') || lower.includes('сайт')) features.push('Лендинг');
    if (lower.includes('бот') || lower.includes('телеграм')) features.push('Telegram-бот');
    if (lower.includes('онлайн-запись') || lower.includes('запись')) features.push('Онлайн-запись');
    if (lower.includes('каталог') || lower.includes('меню')) features.push('Каталог/меню');
    if (lower.includes('дизайн')) features.push('Уникальный дизайн');
    if (features.length > 0) ctx.mainFeatures = features;

    return ctx;
  };

  // Находим услуги по ключевым словам
  const findServices = (categoryIds: string[]): { id: string; categoryId: string; price: number; name: string }[] => {
    const services: { id: string; categoryId: string; price: number; name: string }[] = [];

    for (const cat of context.availableCategories) {
      if (categoryIds.includes(cat.id)) {
        const opt = cat.options[0];
        if (opt) {
          services.push({ id: opt.id, categoryId: cat.id, price: opt.price, name: opt.name });
        }
      }
    }
    return services;
  };

  // Извлекаем контекст для всех ответов
  const extractedContext = extractContext(message);

  // Команды очистки
  if (lowerMessage.includes('убери') || lowerMessage.includes('очист') || lowerMessage.includes('сброс') ||
      lowerMessage.includes('удали') || lowerMessage.includes('заново') || lowerMessage.includes('начать сначала')) {
    return {
      message: 'Готово, очистил весь выбор! Расскажите, какой проект хотите — подберу услуги заново.',
      selectServices: [],
      clearFirst: true,
      extractedContext,
    };
  }

  // Мастерская / мастер-классы / студия
  if (lowerMessage.includes('мастерская') || lowerMessage.includes('мастер-класс') || lowerMessage.includes('студия') ||
      lowerMessage.includes('гончарн') || lowerMessage.includes('керамик') || lowerMessage.includes('творческ')) {
    const services = findServices(['landing', 'bots', 'design']);
    return {
      message: hasExistingSelection
        ? 'Очистил старый выбор! Для мастерской подобрал лендинг с красивым дизайном и Telegram-бот для записи!'
        : 'Отлично! Для мастерской подобрал лендинг с уникальным дизайном и Telegram-бот — уже в калькуляторе!',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Лендинг
  if (lowerMessage.includes('лендинг') || lowerMessage.includes('landing') || lowerMessage.includes('одностраничн')) {
    const services = findServices(['landing', 'design', 'promotion']);
    return {
      message: hasExistingSelection
        ? 'Хорошо, очистил старый выбор! Для лендинга подобрал новый набор — смотрите в калькуляторе.'
        : 'Отлично! Для лендинга подобрал базовый набор — уже выбрано в калькуляторе. Уберите лишнее, если нужно!',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Магазин
  if (lowerMessage.includes('магазин') || lowerMessage.includes('интернет-магазин') || lowerMessage.includes('ecommerce') || lowerMessage.includes('продавать')) {
    const services = findServices(['ecommerce', 'integration', 'crm']);
    return {
      message: hasExistingSelection
        ? 'Очистил предыдущий выбор! Для интернет-магазина подобрал новый набор — в калькуляторе.'
        : 'Для интернет-магазина подобрал оптимальный набор — уже выбрано! Что-то лишнее можете убрать.',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Боты
  if (lowerMessage.includes('бот') || lowerMessage.includes('телеграм') || lowerMessage.includes('чат-бот') || lowerMessage.includes('whatsapp')) {
    const services = findServices(['bots']);
    return {
      message: hasExistingSelection
        ? 'Очистил старое! Для бота выбрал подходящий вариант — в калькуляторе.'
        : 'Для бота выбрал подходящий вариант — смотрите в калькуляторе!',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Приложение
  if (lowerMessage.includes('приложение') || lowerMessage.includes('мобильн') || lowerMessage.includes('ios') || lowerMessage.includes('android')) {
    const services = findServices(['apps', 'design']);
    return {
      message: hasExistingSelection
        ? 'Очистил предыдущее! Для приложения подобрал новый набор — в калькуляторе.'
        : 'Для мобильного приложения подобрал базовый набор — уже в калькуляторе!',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Корпоративный сайт
  if (lowerMessage.includes('корпоративн') || lowerMessage.includes('визитк') || lowerMessage.includes('компани')) {
    const services = findServices(['corporate', 'design', 'promotion']);
    return {
      message: hasExistingSelection
        ? 'Очистил старый выбор! Для корпоративного сайта подобрал новое — в калькуляторе.'
        : 'Для корпоративного сайта подобрал услуги — смотрите в калькуляторе!',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Ремонт/услуги
  if (lowerMessage.includes('ремонт') || lowerMessage.includes('сервис')) {
    const services = findServices(['landing', 'design', 'promotion', 'crm']);
    return {
      message: hasExistingSelection
        ? 'Очистил предыдущее! Для сайта услуг подобрал лендинг с продвижением — в калькуляторе.'
        : 'Для сайта услуг подобрал лендинг с формой заявки и продвижением — уже выбрано!',
      selectServices: services,
      clearFirst: hasExistingSelection,
      extractedContext,
    };
  }

  // Сайт общий
  if (lowerMessage.includes('сайт') || lowerMessage.includes('веб')) {
    return {
      message: 'Какой сайт вам нужен? Лендинг для продвижения продукта, корпоративный сайт-визитка, или интернет-магазин? Расскажите подробнее!',
      selectServices: [],
      extractedContext,
    };
  }

  // Цена
  if (lowerMessage.includes('цена') || lowerMessage.includes('стоимость') || lowerMessage.includes('сколько') || lowerMessage.includes('бюджет')) {
    if (context.selectedServices.length > 0) {
      return {
        message: `Текущая сумма: ${context.total} ₽. Отличный выбор! Хотите, подскажу что можно добавить?`,
        selectServices: [],
        extractedContext,
      };
    }
    return {
      message: 'Стоимость зависит от набора услуг. Расскажите о проекте — я подберу и сразу покажу цену!',
      selectServices: [],
      extractedContext,
    };
  }

  // Приветствия
  if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй') || lowerMessage.includes('добр') || lowerMessage.includes('хай')) {
    return {
      message: 'Здравствуйте! Расскажите, какой проект хотите реализовать — сайт, приложение, бот? Я подберу услуги и сразу выберу их в калькуляторе!',
      selectServices: [],
      extractedContext,
    };
  }

  if (context.selectedServices.length > 0) {
    return {
      message: `Вы выбрали ${context.selectedServices.length} услуг на ${context.total} ₽. Хороший набор! Могу подсказать, что добавить.`,
      selectServices: [],
      extractedContext,
    };
  }

  return {
    message: 'Расскажите о проекте — что хотите создать? Я подберу услуги и сразу выберу их в калькуляторе!',
    selectServices: [],
    extractedContext,
  };
}
