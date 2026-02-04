import { create } from 'zustand';
import type { ProjectContext, Message, GenerationStatus } from '@/types/context.types';

// Required fields for КП generation
const REQUIRED_FIELDS = [
  'projectName',
  'businessType',
  'targetAudience',
  'mainFeatures',
] as const;

interface ContextState extends ProjectContext {
  // Actions
  updateField: <K extends keyof ProjectContext>(field: K, value: ProjectContext[K]) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setGenerationJobId: (jobId: string) => void;
  extractContextFromMessage: (message: string) => void;
  reset: () => void;
}

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initialState: ProjectContext = {
  sessionId: generateSessionId(),
  mainFeatures: [],
  integrations: [],
  collectedFields: [],
  missingRequiredFields: [...REQUIRED_FIELDS],
  conversationHistory: [],
  readyToGenerate: false,
};

export const useContextStore = create<ContextState>((set, get) => ({
  ...initialState,

  updateField: (field, value) => {
    set((state) => {
      const newState = { ...state, [field]: value };

      // Update collected fields tracking
      if (value !== undefined && value !== null && value !== '') {
        const isArrayWithItems = Array.isArray(value) && value.length > 0;
        const isNonEmptyValue = !Array.isArray(value) && value;

        if ((isArrayWithItems || isNonEmptyValue) && !state.collectedFields.includes(field)) {
          newState.collectedFields = [...state.collectedFields, field];
        }
      }

      // Update missing fields
      newState.missingRequiredFields = REQUIRED_FIELDS.filter(
        (f) => !newState.collectedFields.includes(f)
      );

      // Check if ready to generate
      newState.readyToGenerate = newState.missingRequiredFields.length === 0;

      return newState;
    });
  },

  addMessage: (message) => {
    set((state) => ({
      conversationHistory: [
        ...state.conversationHistory,
        {
          ...message,
          id: `msg_${Date.now()}`,
          timestamp: new Date(),
        },
      ],
    }));
  },

  // Extract context from user message using pattern matching
  extractContextFromMessage: (message: string) => {
    const lowerMessage = message.toLowerCase();
    const state = get();

    // Extract project name - look for "название" or "проект" patterns
    const namePatterns = [
      /назван\w*\s+(?:проекта\s+)?(\S+)/i,
      /проект\s+(\S+)/i,
      /название\s+(\S+)/i,
    ];
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && !state.projectName) {
        state.updateField('projectName', match[1]);
        break;
      }
    }

    // Extract business type - expanded keywords
    const businessKeywords: Record<string, string> = {
      'автомойк': 'Автомойка',
      'кофейн': 'Кофейня',
      'ресторан': 'Ресторан',
      'кафе': 'Кафе',
      'магазин': 'Магазин',
      'салон красот': 'Салон красоты',
      'барбершоп': 'Барбершоп',
      'фитнес': 'Фитнес-центр',
      'клиник': 'Клиника',
      'стомат': 'Стоматология',
      'юрид': 'Юридические услуги',
      'строител': 'Строительная компания',
      'недвижим': 'Агентство недвижимости',
      'гончар': 'Гончарная мастерская',
      'керамик': 'Керамическая студия',
      'мастер.класс': 'Мастер-классы',
      'студи': 'Творческая студия',
      'школ': 'Школа/Курсы',
      'курс': 'Образовательные курсы',
    };

    for (const [keyword, businessType] of Object.entries(businessKeywords)) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(lowerMessage) && !state.businessType) {
        state.updateField('businessType', businessType);
        break;
      }
    }

    // Extract target audience - look for ЦА patterns
    const audiencePatterns = [
      /цел\w*\s*аудитори\w*[:\s]+([^.!?]+)/i,
      /ца\s+(?:это\s+)?([^.!?]+)/i,
      /клиент\w*[:\s]+([^.!?]+)/i,
      /для\s+(молод\w+[^.!?]{10,50})/i,
    ];
    for (const pattern of audiencePatterns) {
      const match = message.match(pattern);
      if (match && !state.targetAudience) {
        state.updateField('targetAudience', match[1].trim());
        break;
      }
    }

    // Extract features - expanded
    const featureKeywords: Record<string, string> = {
      'онлайн.запис': 'Онлайн-запись',
      'онлайн запис': 'Онлайн-запись',
      'бронирован': 'Бронирование',
      'оплат': 'Онлайн-оплата',
      'каталог': 'Каталог товаров',
      'корзин': 'Корзина',
      'личн.*кабинет': 'Личный кабинет',
      'crm': 'CRM интеграция',
      '1с': 'Интеграция с 1С',
      'telegram': 'Telegram-бот',
      'телеграм': 'Telegram-бот',
      'whatsapp': 'WhatsApp интеграция',
      'чат': 'Онлайн-чат',
      'отзыв': 'Отзывы',
      'блог': 'Блог',
      'портфолио': 'Портфолио',
      'лендинг': 'Лендинг',
      'дизайн': 'Уникальный дизайн',
      'галере': 'Галерея работ',
    };

    const newFeatures: string[] = [];
    for (const [pattern, feature] of Object.entries(featureKeywords)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(message) && !state.mainFeatures.includes(feature)) {
        newFeatures.push(feature);
      }
    }

    if (newFeatures.length > 0) {
      state.updateField('mainFeatures', [...state.mainFeatures, ...newFeatures]);
    }

    // Extract budget
    const budgetMatch = message.match(/(\d+)\s*(-|до|—)\s*(\d+)\s*(долл|\$|usd)/i);
    if (budgetMatch && !state.budget) {
      state.updateField('budget', {
        min: parseInt(budgetMatch[1]),
        max: parseInt(budgetMatch[3]),
      });
    }
  },

  setGenerationStatus: (status) => {
    set({ generationStatus: status });
  },

  setGenerationJobId: (jobId) => {
    set({ generationJobId: jobId });
  },

  reset: () => {
    set({
      ...initialState,
      sessionId: generateSessionId(),
    });
  },
}));

// Selectors
export const useIsReadyToGenerate = () => {
  return useContextStore((state) => state.readyToGenerate);
};

export const useMissingFields = () => {
  return useContextStore((state) => state.missingRequiredFields);
};

export const useCollectedFields = () => {
  return useContextStore((state) => state.collectedFields);
};

export const useConversationHistory = () => {
  return useContextStore((state) => state.conversationHistory);
};

export const useGenerationStatus = () => {
  return useContextStore((state) => state.generationStatus);
};
