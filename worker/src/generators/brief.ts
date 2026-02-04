import type { GenerationJobData } from '../types.js';

// Generate Product Brief based on context and selected services
export async function generateBrief(
  context: GenerationJobData['context'],
  services: GenerationJobData['selectedServices']
): Promise<string> {
  const servicesText = services
    .map(s => `- ${s.name} (${s.quantity} шт.)`)
    .join('\n');

  const featuresText = context.mainFeatures.length > 0
    ? context.mainFeatures.map(f => `- ${f}`).join('\n')
    : 'Не указаны';

  const budgetText = context.budget
    ? `$${context.budget.min} - $${context.budget.max}`
    : 'Не указан';

  const brief = `# Product Brief: ${context.projectName || 'Проект'}

## Обзор проекта

**Название:** ${context.projectName || 'Не указано'}
**Тип бизнеса:** ${context.businessType || 'Не указан'}
**Описание:** ${context.businessDescription || 'Не указано'}

## Целевая аудитория

${context.targetAudience || 'Не указана'}

## Выбранные услуги

${servicesText || 'Услуги не выбраны'}

## Основные функции

${featuresText}

## Бюджет

${budgetText}

## Сроки

${context.timeline || 'Не указаны'}

## Предпочтения по дизайну

${context.designPreferences || 'Нет особых предпочтений'}

## Интеграции

${context.integrations.length > 0 ? context.integrations.map(i => `- ${i}`).join('\n') : 'Не требуются'}

## Ключевые требования

1. Современный, профессиональный дизайн
2. Адаптивная вёрстка (мобильные устройства)
3. Быстрая загрузка страниц
4. SEO-оптимизация
5. Интуитивно понятный интерфейс

## Критерии успеха

- Увеличение конверсии посетителей в клиентов
- Улучшение пользовательского опыта
- Автоматизация бизнес-процессов
- Рост узнаваемости бренда

---
*Документ создан автоматически системой ASYSTEM*
`;

  // Simulate processing time
  await delay(2000);

  return brief;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
