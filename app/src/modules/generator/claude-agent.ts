// Claude Agent for site generation
// Uses Claude API to generate complete site code

import Anthropic from '@anthropic-ai/sdk';
import type { IntakeData } from '@/modules/intake/validation';
import type { ProjectPlan, GeneratedSite, GeneratedFile } from '@/shared/types';
import { getBusinessImages, type ImageSearchResult } from '@/services/image-search';
import {
  BASE_PACKAGE_JSON,
  BASE_TAILWIND_CONFIG,
  BASE_GLOBALS_CSS,
  BASE_LAYOUT,
  WATERMARK_COMPONENT,
  PAGE_TEMPLATES,
  COMPONENT_TEMPLATES,
} from './template';

// Delay helper for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Image context for generation
interface ImageContext {
  hero: ImageSearchResult[];
  about: ImageSearchResult[];
  services: ImageSearchResult[];
  gallery: ImageSearchResult[];
}

// Generate complete site code
export async function generateSiteCode(
  intake: IntakeData,
  plan: ProjectPlan
): Promise<GeneratedSite> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const files: GeneratedFile[] = [];
  const errors: string[] = [];

  try {
    // 0. Fetch relevant images for the business type
    console.log('[GENERATOR] Fetching images for', intake.businessType);
    const rawImages = await getBusinessImages(
      intake.businessType || 'business',
      ['hero', 'about', 'services', 'gallery']
    );
    const images: ImageContext = {
      hero: rawImages.hero || [],
      about: rawImages.about || [],
      services: rawImages.services || [],
      gallery: rawImages.gallery || [],
    };

    // 1. Generate base config files
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        ...BASE_PACKAGE_JSON,
        name: slugify(intake.companyName || 'generated-site'),
      }, null, 2),
    });

    files.push({
      path: 'tailwind.config.js',
      content: BASE_TAILWIND_CONFIG,
    });

    files.push({
      path: 'src/app/globals.css',
      content: BASE_GLOBALS_CSS,
    });

    // 2. Generate layout with company info
    files.push({
      path: 'src/app/layout.tsx',
      content: BASE_LAYOUT
        .replace('{{companyName}}', intake.companyName || 'Сайт')
        .replace('{{description}}', intake.businessDescription || 'Современный сайт'),
    });

    // 3. Generate Watermark component
    files.push({
      path: 'src/components/Watermark.tsx',
      content: WATERMARK_COMPONENT,
    });

    // 4. Generate pages based on site structure (with rate limit delays)
    for (const page of plan.siteStructure) {
      const pageContent = await generatePageContent(anthropic, intake, plan, page, images);
      files.push({
        path: page.path === '/' ? 'src/app/page.tsx' : `src/app${page.path}/page.tsx`,
        content: pageContent,
      });
      // Delay to avoid rate limits (3 seconds between page generations)
      await delay(1500);
    }

    // 5. Generate components
    const components = await generateComponents(anthropic, intake, plan, images);
    files.push(...components);

    // 6. Generate next.config.js
    files.push({
      path: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
`,
    });

    // 6.5. Generate postcss.config.js (REQUIRED for Tailwind!)
    files.push({
      path: 'postcss.config.js',
      content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
    });

    // 7. Generate tsconfig.json
    files.push({
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      }, null, 2),
    });

    return {
      projectPath: '',
      files,
      buildStatus: 'success',
    };

  } catch (error) {
    console.error('[GENERATOR] Error generating site:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');

    return {
      projectPath: '',
      files,
      buildStatus: 'failed',
      errors,
    };
  }
}

// Generate page content using Claude
async function generatePageContent(
  anthropic: Anthropic,
  intake: IntakeData,
  plan: ProjectPlan,
  page: { name: string; path: string; purpose: string; components: string[] },
  images: ImageContext
): Promise<string> {
  // Get image URL - skip base64 images in prompt (too large)
  const heroImage = images.hero[0]?.url || '';
  const hasRealImage = heroImage && !heroImage.startsWith('data:');

  const prompt = `Создай React/Next.js страницу для:

Компания: ${intake.companyName}
Бизнес: ${intake.businessType}
Страница: ${page.name} (${page.path})
Цель: ${page.purpose}
Компоненты: ${page.components.join(', ')}

Контекст бизнеса: ${intake.businessDescription || 'Не указан'}
Целевая аудитория: ${intake.targetAudience}

КРИТИЧЕСКИ ВАЖНЫЕ требования:
- Используй TypeScript
- Используй Tailwind CSS для стилей
- Компоненты импортируй из @/components/
- КОМПОНЕНТЫ НЕ ПРИНИМАЮТ ПРОПСЫ - вызывай их как <Hero />, <Features />, <CTA /> без параметров
- Пример: <Hero /> НЕ <Hero title="..." />
- Сделай современный, привлекательный дизайн
${hasRealImage ? `- Используй изображение: ${heroImage}` : '- Используй градиентный фон вместо изображений'}
- НЕ добавляй пояснительный текст, ТОЛЬКО код

Верни ТОЛЬКО код страницы.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract code from response - robust extraction
    return extractCodeFromResponse(text, page.name);
  } catch (error) {
    console.error(`[GENERATOR] Error generating page ${page.name}:`, error);

    // Return fallback template
    return PAGE_TEMPLATES.home || `export default function ${page.name.replace(/\s/g, '')}Page() {
  return <div>Страница ${page.name}</div>;
}`;
  }
}

// Generate component files
async function generateComponents(
  anthropic: Anthropic,
  intake: IntakeData,
  plan: ProjectPlan,
  images: ImageContext
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Collect all unique components from site structure
  const componentNames = new Set<string>();
  for (const page of plan.siteStructure) {
    page.components.forEach(c => componentNames.add(c));
  }

  // Generate each component (with rate limit delays)
  for (const componentName of componentNames) {
    const content = await generateComponentContent(anthropic, intake, componentName, images);
    files.push({
      path: `src/components/${componentName}.tsx`,
      content,
    });
    // Delay to avoid rate limits (3 seconds between component generations)
    await delay(1500);
  }

  // Always add Header and Footer
  if (!componentNames.has('Header')) {
    files.push({
      path: 'src/components/Header.tsx',
      content: generateHeaderComponent(intake, plan),
    });
  }

  if (!componentNames.has('Footer')) {
    files.push({
      path: 'src/components/Footer.tsx',
      content: generateFooterComponent(intake),
    });
  }

  return files;
}

// Generate single component
async function generateComponentContent(
  anthropic: Anthropic,
  intake: IntakeData,
  componentName: string,
  images: ImageContext
): Promise<string> {
  // Check if we have a template
  if (COMPONENT_TEMPLATES[componentName as keyof typeof COMPONENT_TEMPLATES]) {
    return COMPONENT_TEMPLATES[componentName as keyof typeof COMPONENT_TEMPLATES];
  }

  // Get relevant images for this component - filter out base64 (too large for prompt)
  const componentImages = getImagesForComponent(componentName, images)
    .filter(img => img.url && !img.url.startsWith('data:'));

  const hasImages = componentImages.length > 0;
  const imageList = hasImages
    ? componentImages.map((img, i) => `${i + 1}. ${img.url}`).join('\n')
    : '';

  const prompt = `Создай React компонент ${componentName} для:

Компания: ${intake.companyName}
Бизнес: ${intake.businessType}
Аудитория: ${intake.targetAudience}

КРИТИЧЕСКИ ВАЖНЫЕ требования:
- TypeScript
- Tailwind CSS
- Современный дизайн
- Реальный контент для ${intake.businessType}
- КОМПОНЕНТ ДОЛЖЕН РАБОТАТЬ БЕЗ ПРОПСОВ - все данные должны быть захардкожены внутри компонента
- НЕ используй interface Props, НЕ принимай пропсы, используй хардкод данных внутри
- Компонент: export function ${componentName}() { ... }
${hasImages ? `- Используй изображения:\n${imageList}` : '- Используй градиентные фоны и иконки вместо изображений'}
- НЕ добавляй пояснительный текст, ТОЛЬКО код

Верни ТОЛЬКО код компонента без пропсов.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Extract code from response - robust extraction
    return extractCodeFromResponse(text, componentName);
  } catch (error) {
    console.error(`[GENERATOR] Error generating component ${componentName}:`, error);
    return `export function ${componentName}() {
  return <div>${componentName}</div>;
}`;
  }
}

// Generate Header component
function generateHeaderComponent(intake: IntakeData, plan: ProjectPlan): string {
  const navItems = plan.siteStructure
    .map(p => `{ name: '${p.name}', href: '${p.path}' }`)
    .join(',\n    ');

  return `'use client';

import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  ${navItems}
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary">
            ${intake.companyName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-600 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
`;
}

// Generate Footer component
function generateFooterComponent(intake: IntakeData): string {
  return `export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">${intake.companyName}</h3>
            <p className="text-gray-400">
              ${intake.businessDescription || 'Качественные услуги для наших клиентов.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <p className="text-gray-400">${intake.contactEmail || 'info@example.com'}</p>
            <p className="text-gray-400">${intake.contactPhone || '+996 XXX XXX XXX'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Мы в соцсетях</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; ${new Date().getFullYear()} ${intake.companyName}. Все права защищены.</p>
          <p className="mt-2 text-sm">Сайт создан с помощью ASYSTEM.KG</p>
        </div>
      </div>
    </footer>
  );
}
`;
}

// Helper: Get relevant images for a component
function getImagesForComponent(componentName: string, images: ImageContext): ImageSearchResult[] {
  const lowerName = componentName.toLowerCase();

  if (lowerName.includes('hero') || lowerName.includes('header')) {
    return images.hero;
  }
  if (lowerName.includes('about') || lowerName.includes('team')) {
    return images.about;
  }
  if (lowerName.includes('service') || lowerName.includes('feature')) {
    return images.services;
  }
  if (lowerName.includes('gallery') || lowerName.includes('portfolio') || lowerName.includes('work')) {
    return images.gallery;
  }

  // Return hero images as fallback
  return images.hero.slice(0, 1);
}

// Helper: slugify string
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper: Extract clean code from Claude response
// Handles cases where Claude adds explanatory text before/after code
function extractCodeFromResponse(text: string, componentName: string): string {
  // 1. Try to find code block with language tag
  const codeBlockMatch = text.match(/```(?:tsx?|jsx?|javascript|typescript)?\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 2. Try to find any code block
  const anyCodeBlock = text.match(/```\n?([\s\S]*?)```/);
  if (anyCodeBlock) {
    return anyCodeBlock[1].trim();
  }

  // 3. Look for code that starts with common patterns
  const codePatterns = [
    // 'use client' directive
    /('use client';[\s\S]*)/,
    // import statements
    /(import\s+[\s\S]*)/,
    // export function
    /(export\s+(?:default\s+)?function\s+[\s\S]*)/,
    // export const
    /(export\s+const\s+[\s\S]*)/,
    // function declaration
    /(function\s+\w+[\s\S]*)/,
    // const component
    /(const\s+\w+\s*[:=]\s*(?:\([^)]*\)|[^=])*=>[\s\S]*)/,
  ];

  for (const pattern of codePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up any trailing explanation text
      let code = match[1];

      // Remove common trailing phrases
      const trailingPatterns = [
        /\n\nЭтот компонент[\s\S]*/,
        /\n\nКомпонент [\s\S]*/,
        /\n\nДанный код[\s\S]*/,
        /\n\n---[\s\S]*/,
        /\n\nПримечание:[\s\S]*/,
        /\n\nОбратите внимание[\s\S]*/,
      ];

      for (const trailing of trailingPatterns) {
        code = code.replace(trailing, '');
      }

      return code.trim();
    }
  }

  // 4. If nothing works, return a safe fallback component
  console.warn(`[GENERATOR] Could not extract code for ${componentName}, using fallback`);
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '');
  return `export function ${safeName}() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center">${componentName}</h2>
      </div>
    </div>
  );
}`;
}
