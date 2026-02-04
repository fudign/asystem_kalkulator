// Presentation PDF Generator
// Generates visual presentations for clients

import Anthropic from '@anthropic-ai/sdk';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import type { IntakeData } from '@/modules/intake/validation';
import type { ProjectPlan, ResearchResult } from '@/shared/types';

interface PresentationInput {
  projectId: string;
  intake: IntakeData;
  plan: ProjectPlan;
  research: ResearchResult;
  deploymentUrl: string;
  previewUrl: string;
}

interface Slide {
  title: string;
  content: string[];
  type: 'title' | 'content' | 'features' | 'showcase' | 'contact';
}

// Generate slides content using Claude
async function generateSlides(input: PresentationInput): Promise<Slide[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Создай контент для презентации коммерческого предложения.

## Данные о клиенте:
- Компания: ${input.intake.companyName}
- Бизнес: ${input.intake.businessType}
- Описание: ${input.intake.businessDescription || 'Не указано'}
- Целевая аудитория: ${input.intake.targetAudience}

## Демо-сайт:
${input.deploymentUrl}

## Результаты исследования рынка:
${JSON.stringify(input.research.industryTrends?.slice(0, 3) || [], null, 2)}

## Структура сайта:
${input.plan.siteStructure.map(p => p.name).join(', ')}

Создай 7-8 слайдов для презентации. Верни JSON массив:
[
  { "title": "Заголовок", "content": ["Пункт 1", "Пункт 2"], "type": "title" },
  { "title": "О вашем бизнесе", "content": ["...", "..."], "type": "content" },
  ...
]

Типы слайдов:
- "title" - титульный слайд
- "content" - обычный слайд с текстом
- "features" - слайд с функциями сайта
- "showcase" - слайд с демо сайта
- "contact" - контактный слайд

Верни ТОЛЬКО JSON массив.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Slide[];
    }

    throw new Error('Failed to parse slides');
  } catch (error) {
    console.error('[PRESENTATION] Error generating slides:', error);

    // Return default slides
    return [
      {
        title: input.intake.companyName || 'Ваш бизнес',
        content: ['Коммерческое предложение', 'от ASYSTEM.KG'],
        type: 'title',
      },
      {
        title: 'О вашем бизнесе',
        content: [
          `Сфера деятельности: ${input.intake.businessType}`,
          `Целевая аудитория: ${input.intake.targetAudience}`,
          input.intake.businessDescription || 'Современный бизнес',
        ],
        type: 'content',
      },
      {
        title: 'Что мы предлагаем',
        content: [
          'Современный адаптивный сайт',
          'Уникальный дизайн под ваш бренд',
          'SEO-оптимизация с первого дня',
          'Техническая поддержка 12 месяцев',
        ],
        type: 'features',
      },
      {
        title: 'Ваш сайт готов!',
        content: [
          'Мы уже создали демо-версию вашего сайта',
          `Посмотреть: ${input.deploymentUrl}`,
        ],
        type: 'showcase',
      },
      {
        title: 'Функционал сайта',
        content: input.plan.siteStructure.map((p) => translateComponentName(p.name)),
        type: 'features',
      },
      {
        title: 'Почему ASYSTEM.KG?',
        content: [
          'Быстрая разработка с помощью AI',
          'Доступные цены',
          'Индивидуальный подход',
          'Гарантия качества',
        ],
        type: 'content',
      },
      {
        title: 'Свяжитесь с нами',
        content: [
          input.intake.contactEmail || 'info@asystem.kg',
          input.intake.contactPhone || '+996 XXX XXX XXX',
          'asystem.kg',
        ],
        type: 'contact',
      },
    ];
  }
}

// Generate HTML for presentation
function generatePresentationHTML(slides: Slide[], input: PresentationInput): string {
  const slideColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
    'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  ];

  const renderSlide = (slide: Slide, index: number): string => {
    const bgColor = slideColors[index % slideColors.length];

    let contentHtml = '';

    switch (slide.type) {
      case 'title':
        contentHtml = `
          <h1 class="slide-title title-slide">${slide.title}</h1>
          <div class="slide-subtitle">
            ${slide.content.map((c) => `<p>${c}</p>`).join('')}
          </div>
        `;
        break;

      case 'showcase':
        contentHtml = `
          <h2 class="slide-title">${slide.title}</h2>
          <div class="showcase-content">
            ${slide.content.map((c) => `<p>${c}</p>`).join('')}
            <div class="demo-frame">
              <div class="browser-bar">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="url">${input.deploymentUrl}</span>
              </div>
              <div class="frame-content">
                <p>🌐 Нажмите, чтобы открыть сайт</p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'features':
        contentHtml = `
          <h2 class="slide-title">${slide.title}</h2>
          <ul class="feature-list">
            ${slide.content.map((c) => `<li>✓ ${c}</li>`).join('')}
          </ul>
        `;
        break;

      case 'contact':
        contentHtml = `
          <h2 class="slide-title">${slide.title}</h2>
          <div class="contact-info">
            ${slide.content.map((c) => `<p class="contact-item">${c}</p>`).join('')}
          </div>
          <div class="qr-code">
            <img src="${generateQRCodeUrl(input.deploymentUrl, 150)}" alt="QR код сайта" />
            <p>Сканируйте для перехода на сайт</p>
          </div>
        `;
        break;

      default:
        contentHtml = `
          <h2 class="slide-title">${slide.title}</h2>
          <ul class="content-list">
            ${slide.content.map((c) => `<li>${c}</li>`).join('')}
          </ul>
        `;
    }

    return `
      <div class="slide" style="background: ${bgColor};">
        <div class="slide-number">${index + 1}</div>
        <div class="slide-content">
          ${contentHtml}
        </div>
        <div class="slide-footer">
          <span>ASYSTEM.KG</span>
          <span>${input.intake.companyName}</span>
        </div>
      </div>
    `;
  };

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Презентация - ${input.intake.companyName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .slide {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      position: relative;
      padding: 60px 80px;
      page-break-after: always;
    }

    .slide-number {
      position: absolute;
      top: 30px;
      right: 40px;
      font-size: 24px;
      opacity: 0.5;
    }

    .slide-content {
      max-width: 900px;
      width: 100%;
      text-align: center;
    }

    .slide-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 40px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .slide-title.title-slide {
      font-size: 64px;
    }

    .slide-subtitle {
      font-size: 28px;
      opacity: 0.9;
    }

    .slide-subtitle p {
      margin: 10px 0;
    }

    .content-list, .feature-list {
      list-style: none;
      text-align: left;
      font-size: 28px;
    }

    .content-list li, .feature-list li {
      margin: 25px 0;
      padding-left: 20px;
    }

    .feature-list li {
      background: rgba(255,255,255,0.1);
      padding: 15px 25px;
      border-radius: 10px;
      margin: 15px 0;
    }

    .showcase-content {
      font-size: 24px;
    }

    .showcase-content p {
      margin: 15px 0;
    }

    .demo-frame {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .browser-bar {
      background: #e5e7eb;
      padding: 12px 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ef4444;
    }

    .dot:nth-child(2) {
      background: #eab308;
    }

    .dot:nth-child(3) {
      background: #22c55e;
    }

    .url {
      margin-left: 15px;
      color: #6b7280;
      font-size: 14px;
    }

    .frame-content {
      padding: 40px;
      color: #333;
      font-size: 20px;
    }

    .contact-info {
      font-size: 32px;
      margin: 30px 0;
    }

    .contact-item {
      margin: 25px 0;
      background: rgba(255,255,255,0.15);
      padding: 20px 40px;
      border-radius: 50px;
      display: inline-block;
    }

    .qr-code {
      margin-top: 40px;
      padding: 30px;
      background: white;
      border-radius: 12px;
      color: #333;
      display: inline-block;
    }

    .qr-code img {
      display: block;
      margin: 0 auto 15px;
    }

    .qr-code p {
      font-size: 14px;
      color: #666;
    }

    .slide-footer {
      position: absolute;
      bottom: 30px;
      left: 40px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      opacity: 0.7;
    }

    @media print {
      .slide {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${slides.map((slide, i) => renderSlide(slide, i)).join('\n')}
</body>
</html>`;
}

// Generate PDF from HTML
async function htmlToPdf(html: string, outputPath: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
}

// Main export: Generate Presentation PDF
export async function generatePresentation(input: PresentationInput): Promise<string> {
  console.log(`[PRESENTATION] Generating presentation for project ${input.projectId}`);

  // Generate slides
  const slides = await generateSlides(input);

  // Generate HTML
  const html = generatePresentationHTML(slides, input);

  // Ensure output directory exists
  const outputDir = process.env.PRESENTATION_OUTPUT_PATH || '/tmp/asystem-presentations';
  await fs.mkdir(outputDir, { recursive: true });

  // Generate PDF
  const outputPath = path.join(outputDir, `presentation-${input.projectId}.pdf`);
  await htmlToPdf(html, outputPath);

  console.log(`[PRESENTATION] Presentation generated at ${outputPath}`);

  return outputPath;
}

// Translate technical component names to Russian
function translateComponentName(name: string): string {
  const translations: Record<string, string> = {
    'Hero': 'Главный экран',
    'Header': 'Шапка сайта',
    'Footer': 'Подвал сайта',
    'About': 'О компании',
    'Services': 'Услуги',
    'ServiceList': 'Список услуг',
    'Features': 'Преимущества',
    'Testimonials': 'Отзывы клиентов',
    'Reviews': 'Отзывы',
    'CTA': 'Запись/Заказ',
    'Contact': 'Контакты',
    'ContactForm': 'Форма обратной связи',
    'Gallery': 'Галерея работ',
    'Portfolio': 'Портфолио',
    'Team': 'Команда',
    'Pricing': 'Цены',
    'PriceTable': 'Таблица цен',
    'FAQ': 'Вопросы и ответы',
    'Blog': 'Блог',
    'Map': 'Карта',
    'Values': 'Наши ценности',
    'Partners': 'Партнеры',
    'Stats': 'Статистика',
  };

  return translations[name] || name;
}

// Generate QR code URL using QR Server API
function generateQRCodeUrl(url: string, size: number = 150): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

// Export for potential HTML-only use
export { generateSlides, generatePresentationHTML, translateComponentName };
