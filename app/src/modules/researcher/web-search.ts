// Web Search functionality for RESEARCHER module
// Uses various methods to gather industry information

import Anthropic from '@anthropic-ai/sdk';

interface TrendResult {
  trends: string[];
  insights: string[];
  recommendations: string[];
}

// Search for industry trends and insights using Claude
export async function searchIndustryTrends(
  businessType: string,
  targetAudience: string,
  region: string = 'Кыргызстан'
): Promise<TrendResult> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Ты эксперт по маркетингу и веб-дизайну в регионе ${region}.

Бизнес: ${businessType}
Целевая аудитория: ${targetAudience}

Проанализируй и дай информацию в формате JSON:

{
  "trends": ["тренд 1", "тренд 2", ...], // 3-5 актуальных трендов в этой нише
  "insights": ["инсайт 1", "инсайт 2", ...], // 3-5 инсайтов о целевой аудитории
  "recommendations": ["рекомендация 1", ...] // 3-5 рекомендаций для сайта
}

Ответь ТОЛЬКО JSON без дополнительного текста.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      trends: ['Мобильная адаптация', 'Онлайн-бронирование', 'Интеграция соцсетей'],
      insights: ['Аудитория активно использует смартфоны', 'Важна скорость загрузки'],
      recommendations: ['Добавить онлайн-запись', 'Интегрировать отзывы'],
    };
  } catch (error) {
    console.error('[RESEARCHER] Web search error:', error);

    // Return default trends on error
    return {
      trends: ['Мобильная адаптация', 'Минималистичный дизайн', 'Быстрая загрузка'],
      insights: ['Пользователи ценят простоту', 'Важно первое впечатление'],
      recommendations: ['Оптимизировать для мобильных', 'Добавить call-to-action'],
    };
  }
}

// Generate industry-specific content suggestions
export async function generateContentSuggestions(
  businessType: string,
  siteGoals: string[]
): Promise<string[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Бизнес: ${businessType}
Цели сайта: ${siteGoals.join(', ')}

Предложи 5-7 разделов/страниц для сайта этого бизнеса.
Ответь JSON массивом: ["раздел1", "раздел2", ...]`;

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

    return ['Главная', 'О нас', 'Услуги', 'Контакты'];
  } catch (error) {
    console.error('[RESEARCHER] Content suggestions error:', error);
    return ['Главная', 'О нас', 'Услуги', 'Контакты'];
  }
}
