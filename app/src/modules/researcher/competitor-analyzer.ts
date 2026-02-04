// Competitor Analysis for RESEARCHER module

import Anthropic from '@anthropic-ai/sdk';

export interface CompetitorAnalysis {
  name: string;
  url: string;
  strengths: string[];
  weaknesses: string[];
  features: string[];
}

// Analyze competitors using AI
export async function searchCompetitors(
  businessType: string,
  region: string = 'Кыргызстан',
  knownCompetitors?: string[]
): Promise<CompetitorAnalysis[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const competitorContext = knownCompetitors?.length
    ? `Известные конкуренты: ${knownCompetitors.join(', ')}`
    : 'Конкуренты не указаны, определи типичных конкурентов в этой нише';

  const prompt = `Ты эксперт по анализу рынка в ${region}.

Бизнес: ${businessType}
${competitorContext}

Проанализируй 3 типичных конкурентов в этой нише и верни JSON:

{
  "competitors": [
    {
      "name": "Название конкурента",
      "url": "https://example.com",
      "strengths": ["сильная сторона 1", "сильная сторона 2"],
      "weaknesses": ["слабая сторона 1", "слабая сторона 2"],
      "features": ["фича сайта 1", "фича сайта 2"]
    }
  ]
}

Ответь ТОЛЬКО JSON без дополнительного текста.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.competitors || [];
    }

    return getDefaultCompetitors(businessType);
  } catch (error) {
    console.error('[RESEARCHER] Competitor analysis error:', error);
    return getDefaultCompetitors(businessType);
  }
}

// Generate competitive advantages based on analysis
export async function generateCompetitiveAdvantages(
  businessType: string,
  businessDescription: string,
  competitors: CompetitorAnalysis[]
): Promise<string[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const competitorWeaknesses = competitors
    .flatMap(c => c.weaknesses)
    .slice(0, 5)
    .join(', ');

  const prompt = `Бизнес: ${businessType}
Описание: ${businessDescription}
Слабости конкурентов: ${competitorWeaknesses}

Предложи 3-5 конкурентных преимуществ для сайта этого бизнеса.
Ответь JSON массивом: ["преимущество1", "преимущество2", ...]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return ['Уникальный подход', 'Качественный сервис', 'Удобный сайт'];
  } catch (error) {
    console.error('[RESEARCHER] Advantages generation error:', error);
    return ['Уникальный подход', 'Качественный сервис', 'Удобный сайт'];
  }
}

// Default competitors based on business type
function getDefaultCompetitors(businessType: string): CompetitorAnalysis[] {
  const defaults: Record<string, CompetitorAnalysis[]> = {
    'Кофейня/Ресторан': [
      {
        name: 'Типичная кофейня',
        url: 'https://example.com',
        strengths: ['Узнаваемый бренд', 'Хорошая локация'],
        weaknesses: ['Устаревший сайт', 'Нет онлайн-заказа'],
        features: ['Меню', 'Контакты', 'Фото'],
      },
    ],
    'Салон красоты/Барбершоп': [
      {
        name: 'Типичный салон',
        url: 'https://example.com',
        strengths: ['Опытные мастера', 'Постоянные клиенты'],
        weaknesses: ['Нет онлайн-записи', 'Плохие фото работ'],
        features: ['Услуги', 'Цены', 'Контакты'],
      },
    ],
  };

  return defaults[businessType] || [
    {
      name: 'Типичный конкурент',
      url: 'https://example.com',
      strengths: ['Опыт на рынке'],
      weaknesses: ['Устаревший сайт'],
      features: ['Базовая информация'],
    },
  ];
}
