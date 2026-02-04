// Epic Generator using BMAD methodology
// Creates epics and user stories for site generation

import Anthropic from '@anthropic-ai/sdk';
import type { IntakeData } from '@/modules/intake/validation';
import type { ResearchResult, ProjectPlan, Epic, UserStory, SitePage } from '@/shared/types';

// Generate complete project plan with epics and stories
export async function generateProjectPlan(
  intake: IntakeData,
  research: ResearchResult
): Promise<ProjectPlan> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Ты опытный продакт-менеджер и архитектор веб-проектов.

БИЗНЕС:
- Компания: ${intake.companyName}
- Тип: ${intake.businessType}
- Описание: ${intake.businessDescription || 'Не указано'}
- Целевая аудитория: ${intake.targetAudience}
- Цели сайта: ${intake.siteGoals?.join(', ')}
- Стиль дизайна: ${intake.designPreferences || 'Современный'}

ИССЛЕДОВАНИЕ:
- Тренды: ${research.industryTrends.join(', ')}
- Инсайты ЦА: ${research.targetAudienceInsights.join(', ')}
- Рекомендации: ${research.recommendations.join(', ')}

Создай план проекта в формате JSON:

{
  "summary": "Краткое описание проекта в 2-3 предложения",
  "epics": [
    {
      "id": "EPIC-1",
      "title": "Название эпика",
      "description": "Описание эпика",
      "stories": [
        {
          "id": "STORY-1.1",
          "title": "Название стори",
          "description": "Как [пользователь], я хочу [действие], чтобы [результат]",
          "acceptanceCriteria": ["критерий 1", "критерий 2"]
        }
      ]
    }
  ],
  "siteStructure": [
    {
      "name": "Название страницы",
      "path": "/путь",
      "purpose": "Цель страницы",
      "components": ["компонент1", "компонент2"]
    }
  ],
  "estimatedFeatures": ["фича 1", "фича 2"]
}

Создай 3-5 эпиков с 2-4 сториями каждый. Структура сайта должна включать 4-7 страниц.
Ответь ТОЛЬКО JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || generateDefaultSummary(intake),
        epics: parsed.epics || generateDefaultEpics(intake),
        siteStructure: parsed.siteStructure || generateDefaultStructure(intake),
        estimatedFeatures: parsed.estimatedFeatures || [],
      };
    }

    return generateDefaultPlan(intake);
  } catch (error) {
    console.error('[PLANNER] Epic generation error:', error);
    return generateDefaultPlan(intake);
  }
}

// Generate summary for client approval
export function generateApprovalSummary(plan: ProjectPlan, intake: IntakeData): string {
  const pages = plan.siteStructure.map(p => p.name).join(', ');
  const features = plan.estimatedFeatures.slice(0, 5).join(', ');

  return `
## Проект: ${intake.companyName}

### Что мы создадим:
${plan.summary}

### Страницы сайта:
${pages}

### Ключевые функции:
${features}

### Эпики (${plan.epics.length}):
${plan.epics.map(e => `- ${e.title}`).join('\n')}

---
**Это то, что вы хотите?**
  `.trim();
}

// Default plan generation
function generateDefaultPlan(intake: IntakeData): ProjectPlan {
  return {
    summary: generateDefaultSummary(intake),
    epics: generateDefaultEpics(intake),
    siteStructure: generateDefaultStructure(intake),
    estimatedFeatures: generateDefaultFeatures(intake),
  };
}

function generateDefaultSummary(intake: IntakeData): string {
  return `Современный сайт для ${intake.businessType} "${intake.companyName}", ориентированный на ${intake.targetAudience}. Сайт будет включать все необходимые функции для достижения бизнес-целей.`;
}

function generateDefaultEpics(intake: IntakeData): Epic[] {
  const epics: Epic[] = [
    {
      id: 'EPIC-1',
      title: 'Главная страница',
      description: 'Создание привлекательной главной страницы',
      stories: [
        {
          id: 'STORY-1.1',
          title: 'Hero секция',
          description: 'Как посетитель, я хочу видеть яркую hero секцию, чтобы понять суть бизнеса',
          acceptanceCriteria: ['Заголовок с УТП', 'CTA кнопка', 'Фоновое изображение'],
        },
        {
          id: 'STORY-1.2',
          title: 'Секция преимуществ',
          description: 'Как посетитель, я хочу видеть преимущества, чтобы принять решение',
          acceptanceCriteria: ['3-4 преимущества', 'Иконки', 'Краткие описания'],
        },
      ],
    },
    {
      id: 'EPIC-2',
      title: 'Страница услуг/товаров',
      description: 'Презентация услуг или товаров компании',
      stories: [
        {
          id: 'STORY-2.1',
          title: 'Список услуг',
          description: 'Как посетитель, я хочу видеть список услуг с ценами',
          acceptanceCriteria: ['Карточки услуг', 'Цены', 'Описания'],
        },
      ],
    },
    {
      id: 'EPIC-3',
      title: 'Контакты и связь',
      description: 'Способы связи с компанией',
      stories: [
        {
          id: 'STORY-3.1',
          title: 'Форма обратной связи',
          description: 'Как посетитель, я хочу отправить заявку',
          acceptanceCriteria: ['Форма с полями', 'Валидация', 'Отправка'],
        },
        {
          id: 'STORY-3.2',
          title: 'Контактная информация',
          description: 'Как посетитель, я хочу найти контакты',
          acceptanceCriteria: ['Телефон', 'Email', 'Адрес', 'Карта'],
        },
      ],
    },
  ];

  // Add booking epic if needed
  if (intake.siteGoals?.includes('booking')) {
    epics.push({
      id: 'EPIC-4',
      title: 'Онлайн-запись',
      description: 'Система онлайн-бронирования',
      stories: [
        {
          id: 'STORY-4.1',
          title: 'Форма записи',
          description: 'Как клиент, я хочу записаться онлайн',
          acceptanceCriteria: ['Выбор услуги', 'Выбор даты/времени', 'Подтверждение'],
        },
      ],
    });
  }

  return epics;
}

function generateDefaultStructure(intake: IntakeData): SitePage[] {
  const pages: SitePage[] = [
    {
      name: 'Главная',
      path: '/',
      purpose: 'Первое впечатление, УТП, призыв к действию',
      components: ['Hero', 'Features', 'CTA', 'Testimonials'],
    },
    {
      name: 'О нас',
      path: '/about',
      purpose: 'История компании, команда, ценности',
      components: ['About', 'Team', 'Values'],
    },
    {
      name: 'Услуги',
      path: '/services',
      purpose: 'Список услуг с описанием и ценами',
      components: ['ServiceList', 'PriceTable'],
    },
    {
      name: 'Контакты',
      path: '/contacts',
      purpose: 'Способы связи, форма, карта',
      components: ['ContactForm', 'Map', 'ContactInfo'],
    },
  ];

  // Add portfolio if needed
  if (intake.siteGoals?.includes('portfolio')) {
    pages.push({
      name: 'Портфолио',
      path: '/portfolio',
      purpose: 'Галерея работ',
      components: ['Gallery', 'ProjectCard'],
    });
  }

  // Add blog if needed
  if (intake.siteGoals?.includes('blog')) {
    pages.push({
      name: 'Блог',
      path: '/blog',
      purpose: 'Статьи и новости',
      components: ['BlogList', 'BlogPost'],
    });
  }

  return pages;
}

function generateDefaultFeatures(intake: IntakeData): string[] {
  const features = [
    'Адаптивный дизайн',
    'SEO оптимизация',
    'Быстрая загрузка',
    'Форма обратной связи',
  ];

  if (intake.siteGoals?.includes('booking')) {
    features.push('Онлайн-запись');
  }
  if (intake.siteGoals?.includes('catalog')) {
    features.push('Каталог товаров');
  }
  if (intake.siteGoals?.includes('sales')) {
    features.push('Корзина и оформление заказа');
  }

  return features;
}
