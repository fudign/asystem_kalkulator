// КП (Commercial Proposal) PDF Generator
// Generates professional commercial proposals

import Anthropic from '@anthropic-ai/sdk';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import type { IntakeData } from '@/modules/intake/validation';
import type { ProjectPlan, ResearchResult } from '@/shared/types';

interface KPGeneratorInput {
  projectId: string;
  intake: IntakeData;
  plan: ProjectPlan;
  research: ResearchResult;
  deploymentUrl: string;
  previewUrl: string;
}

interface KPContent {
  title: string;
  executiveSummary: string;
  businessAnalysis: string;
  proposedSolution: string;
  siteFeatures: string[];
  competitiveAdvantages: string[];
  timeline: string;
  investment: string;
  guarantee: string;
  callToAction: string;
}

// Generate KP content using Claude
async function generateKPContent(input: KPGeneratorInput): Promise<KPContent> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Создай профессиональное коммерческое предложение (КП) для клиента.

## Данные о клиенте:
- Компания: ${input.intake.companyName}
- Бизнес: ${input.intake.businessType}
- Описание: ${input.intake.businessDescription || 'Не указано'}
- Целевая аудитория: ${input.intake.targetAudience}

## Результаты исследования рынка:
${JSON.stringify(input.research, null, 2)}

## План сайта:
${JSON.stringify(input.plan, null, 2)}

## Готовый демо-сайт:
- Ссылка: ${input.deploymentUrl}
- Предпросмотр: ${input.previewUrl}

Сгенерируй КП в формате JSON со следующими полями:
{
  "title": "Заголовок КП",
  "executiveSummary": "Краткое резюме (2-3 предложения)",
  "businessAnalysis": "Анализ бизнеса клиента и его потребностей (3-4 абзаца)",
  "proposedSolution": "Описание предлагаемого решения (3-4 абзаца)",
  "siteFeatures": ["Функция 1", "Функция 2", ...],
  "competitiveAdvantages": ["Преимущество 1", "Преимущество 2", ...],
  "timeline": "Сроки реализации",
  "investment": "Стоимость и условия",
  "guarantee": "Гарантии",
  "callToAction": "Призыв к действию"
}

Верни ТОЛЬКО JSON без дополнительного текста.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as KPContent;
    }

    throw new Error('Failed to parse KP content');
  } catch (error) {
    console.error('[KP-GENERATOR] Error generating content:', error);

    // Return fallback content
    return {
      title: `Коммерческое предложение для ${input.intake.companyName}`,
      executiveSummary: `Предлагаем разработку современного веб-сайта для ${input.intake.companyName}. Сайт уже готов к просмотру по ссылке.`,
      businessAnalysis: `Компания ${input.intake.companyName} работает в сфере ${input.intake.businessType}. ${input.intake.businessDescription || ''}`,
      proposedSolution: 'Мы предлагаем создание современного, адаптивного веб-сайта с учетом всех современных требований и тенденций.',
      siteFeatures: ['Адаптивный дизайн', 'SEO-оптимизация', 'Быстрая загрузка', 'Современный интерфейс'],
      competitiveAdvantages: ['Уникальный дизайн', 'Индивидуальный подход', 'Техническая поддержка'],
      timeline: '2-4 недели',
      investment: 'По договоренности',
      guarantee: '12 месяцев гарантийной поддержки',
      callToAction: 'Свяжитесь с нами для обсуждения деталей!',
    };
  }
}

// Generate HTML for KP
function generateKPHTML(content: KPContent, input: KPGeneratorInput): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #2563eb;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }

    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 10px;
    }

    .date {
      color: #64748b;
      font-size: 14px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-content {
      color: #475569;
    }

    .section-content p {
      margin-bottom: 12px;
    }

    .highlight-box {
      background: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }

    .feature-list {
      list-style: none;
      padding: 0;
    }

    .feature-list li {
      padding: 10px 0;
      padding-left: 30px;
      position: relative;
      border-bottom: 1px solid #e2e8f0;
    }

    .feature-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: bold;
    }

    .demo-link {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }

    .demo-link:hover {
      background: #1d4ed8;
    }

    .cta-box {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin-top: 40px;
    }

    .cta-box h3 {
      font-size: 24px;
      margin-bottom: 15px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }

    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: bold;
      opacity: 0.03;
      color: #000;
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    }

    @media print {
      .container {
        padding: 20px;
      }
      .demo-link {
        background: #2563eb !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">ASYSTEM.KG</div>

  <div class="container">
    <header class="header">
      <div class="logo">ASYSTEM.KG</div>
      <h1 class="title">${content.title}</h1>
      <p class="date">Дата: ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </header>

    <section class="section">
      <h2 class="section-title">Резюме</h2>
      <div class="section-content highlight-box">
        <p>${content.executiveSummary}</p>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Анализ бизнеса</h2>
      <div class="section-content">
        <p>${content.businessAnalysis}</p>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Предлагаемое решение</h2>
      <div class="section-content">
        <p>${content.proposedSolution}</p>

        <div style="text-align: center; margin: 30px 0;">
          <p><strong>Ваш сайт уже готов к просмотру!</strong></p>
          <a href="${input.deploymentUrl}" class="demo-link">Посмотреть демо-версию →</a>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Функционал сайта</h2>
      <ul class="feature-list">
        ${content.siteFeatures.map(f => `<li>${f}</li>`).join('\n        ')}
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">Наши преимущества</h2>
      <ul class="feature-list">
        ${content.competitiveAdvantages.map(a => `<li>${a}</li>`).join('\n        ')}
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">Сроки и стоимость</h2>
      <div class="section-content">
        <p><strong>Сроки реализации:</strong> ${content.timeline}</p>
        <p><strong>Инвестиции:</strong> ${content.investment}</p>
        <p><strong>Гарантия:</strong> ${content.guarantee}</p>
      </div>
    </section>

    <div class="cta-box">
      <h3>Готовы начать?</h3>
      <p>${content.callToAction}</p>
      <p style="margin-top: 15px;">
        <strong>Email:</strong> ${input.intake.contactEmail || 'info@asystem.kg'}<br>
        <strong>Телефон:</strong> ${input.intake.contactPhone || '+996 XXX XXX XXX'}
      </p>
    </div>

    <footer class="footer">
      <p>© ${new Date().getFullYear()} ASYSTEM.KG. Все права защищены.</p>
      <p>Это коммерческое предложение подготовлено автоматически на основе анализа вашего бизнеса.</p>
    </footer>
  </div>
</body>
</html>`;
}

// Generate PDF from HTML using Puppeteer
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
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
  } finally {
    await browser.close();
  }
}

// Main export: Generate KP PDF
export async function generateKP(input: KPGeneratorInput): Promise<string> {
  console.log(`[KP-GENERATOR] Generating KP for project ${input.projectId}`);

  // Generate content
  const content = await generateKPContent(input);

  // Generate HTML
  const html = generateKPHTML(content, input);

  // Ensure output directory exists
  const outputDir = process.env.KP_OUTPUT_PATH || '/tmp/asystem-kp';
  await fs.mkdir(outputDir, { recursive: true });

  // Generate PDF
  const outputPath = path.join(outputDir, `kp-${input.projectId}.pdf`);
  await htmlToPdf(html, outputPath);

  console.log(`[KP-GENERATOR] KP generated at ${outputPath}`);

  return outputPath;
}

// Export for potential HTML-only use
export { generateKPContent, generateKPHTML };
