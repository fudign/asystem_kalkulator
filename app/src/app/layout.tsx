import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Калькулятор IT-услуг | Calculator Asystem',
  description: 'Интерактивный калькулятор стоимости IT-услуг. Подберите услуги и получите мгновенный расчет с возможностью скачать PDF.',
  keywords: ['калькулятор', 'IT-услуги', 'разработка', 'веб-сайт', 'приложение', 'стоимость'],
  authors: [{ name: 'Calculator Asystem' }],
  openGraph: {
    title: 'Калькулятор IT-услуг',
    description: 'Рассчитайте стоимость IT-услуг онлайн',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
