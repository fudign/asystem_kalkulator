// Site template configuration for GENERATOR module

export const SITE_TEMPLATE = {
  framework: 'nextjs',
  version: '14',
  styling: 'tailwindcss',
  language: 'typescript',
};

// Base package.json for generated sites
export const BASE_PACKAGE_JSON = {
  name: 'generated-site',
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  dependencies: {
    next: '^14.0.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  },
  devDependencies: {
    '@types/node': '^20',
    '@types/react': '^18',
    '@types/react-dom': '^18',
    autoprefixer: '^10',
    postcss: '^8',
    tailwindcss: '^3',
    typescript: '^5',
  },
};

// Base tailwind config
export const BASE_TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    },
  },
  plugins: [],
};
`;

// Base globals.css
export const BASE_GLOBALS_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;

// Base layout template
export const BASE_LAYOUT = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Watermark } from '@/components/Watermark';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: '{{companyName}}',
  description: '{{description}}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}
        <Watermark />
      </body>
    </html>
  );
}
`;

// Watermark component
export const WATERMARK_COMPONENT = `'use client';

export function Watermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="text-[120px] font-bold whitespace-nowrap select-none"
        style={{
          opacity: 0.07,
          transform: 'rotate(-30deg)',
          color: '#000',
        }}
      >
        ASYSTEM.KG
      </div>
    </div>
  );
}
`;

// Base page structure
export const PAGE_TEMPLATES = {
  home: `import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { CTA } from '@/components/CTA';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
`,

  about: `import { AboutSection } from '@/components/AboutSection';

export default function AboutPage() {
  return (
    <main className="py-16">
      <AboutSection />
    </main>
  );
}
`,

  services: `import { ServicesList } from '@/components/ServicesList';

export default function ServicesPage() {
  return (
    <main className="py-16">
      <ServicesList />
    </main>
  );
}
`,

  contacts: `import { ContactForm } from '@/components/ContactForm';
import { ContactInfo } from '@/components/ContactInfo';

export default function ContactsPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">
        <ContactForm />
        <ContactInfo />
      </div>
    </main>
  );
}
`,
};

// Component templates
export const COMPONENT_TEMPLATES = {
  Hero: `interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function Hero({ title, subtitle, ctaText, ctaLink, backgroundImage }: HeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
        <a
          href={ctaLink}
          className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
`,

  Features: `interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  features: Feature[];
}

export function Features({ features }: FeaturesProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Наши преимущества</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  ContactForm: `'use client';

import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // TODO: Implement form submission
    setTimeout(() => setStatus('sent'), 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Свяжитесь с нами</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Имя</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Сообщение</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          rows={4}
          required
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {status === 'sending' ? 'Отправка...' : status === 'sent' ? 'Отправлено!' : 'Отправить'}
      </button>
    </form>
  );
}
`,
};
