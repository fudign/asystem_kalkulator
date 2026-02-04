import type { GenerationJobData } from '../types.js';

// Generate demo site HTML for screenshots
export async function generateDemoSite(
  brief: string,
  prd: string,
  architecture: string,
  context: GenerationJobData['context']
): Promise<string> {
  const projectName = context.projectName || 'ASYSTEM';
  const businessType = context.businessType || 'Бизнес';
  const description = context.businessDescription || 'Профессиональные услуги для вашего бизнеса';

  // Generate color scheme based on business type
  const colors = getColorScheme(businessType);

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
        }

        /* Header */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e5e7eb;
            z-index: 100;
            padding: 1rem 2rem;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: ${colors.primary};
            text-decoration: none;
        }

        .nav {
            display: flex;
            gap: 2rem;
        }

        .nav a {
            color: #4b5563;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav a:hover {
            color: ${colors.primary};
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
        }

        .btn-primary {
            background: ${colors.gradient};
            color: white;
            box-shadow: 0 4px 14px ${colors.shadow};
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${colors.shadow};
        }

        .btn-secondary {
            background: white;
            color: ${colors.primary};
            border: 2px solid ${colors.primary};
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 6rem 2rem 4rem;
            background: ${colors.lightBg};
        }

        .hero-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }

        .hero-text h1 {
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: ${colors.gradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-text p {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }

        .hero-buttons {
            display: flex;
            gap: 1rem;
        }

        .hero-image {
            position: relative;
        }

        .hero-image img {
            width: 100%;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .hero-badge {
            position: absolute;
            bottom: -1rem;
            left: -1rem;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .hero-badge-number {
            font-size: 2rem;
            font-weight: 700;
            color: ${colors.primary};
        }

        .hero-badge-text {
            font-size: 0.875rem;
            color: #6b7280;
        }

        /* Features Section */
        .features {
            padding: 6rem 2rem;
            background: white;
        }

        .section-title {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-title h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .section-title p {
            font-size: 1.125rem;
            color: #6b7280;
            max-width: 600px;
            margin: 0 auto;
        }

        .features-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
        }

        .feature-card {
            padding: 2rem;
            border-radius: 1rem;
            background: ${colors.lightBg};
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .feature-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            background: ${colors.gradient};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .feature-card p {
            color: #6b7280;
            font-size: 0.9375rem;
        }

        /* Stats Section */
        .stats {
            padding: 4rem 2rem;
            background: ${colors.gradient};
            color: white;
        }

        .stats-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
            text-align: center;
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 1rem;
            opacity: 0.9;
        }

        /* CTA Section */
        .cta {
            padding: 6rem 2rem;
            background: ${colors.lightBg};
            text-align: center;
        }

        .cta h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .cta p {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }

        /* Footer */
        .footer {
            padding: 3rem 2rem;
            background: #1f2937;
            color: white;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-logo {
            font-size: 1.25rem;
            font-weight: 700;
        }

        .footer-links {
            display: flex;
            gap: 2rem;
        }

        .footer-links a {
            color: #9ca3af;
            text-decoration: none;
            transition: color 0.2s;
        }

        .footer-links a:hover {
            color: white;
        }

        /* Demo badge */
        .demo-badge {
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            background: ${colors.gradient};
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 4px 14px ${colors.shadow};
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <a href="#" class="logo">${projectName}</a>
            <nav class="nav">
                <a href="#">Главная</a>
                <a href="#">Услуги</a>
                <a href="#">О нас</a>
                <a href="#">Контакты</a>
            </nav>
            <a href="#" class="btn btn-primary">Оставить заявку</a>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-text">
                <h1>${getHeroTitle(businessType)}</h1>
                <p>${description}</p>
                <div class="hero-buttons">
                    <a href="#" class="btn btn-primary">Начать сейчас →</a>
                    <a href="#" class="btn btn-secondary">Узнать больше</a>
                </div>
            </div>
            <div class="hero-image">
                <img src="${getHeroImage(businessType)}" alt="Hero">
                <div class="hero-badge">
                    <div class="hero-badge-number">500+</div>
                    <div class="hero-badge-text">Довольных клиентов</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features">
        <div class="section-title">
            <h2>Наши преимущества</h2>
            <p>Мы предлагаем комплексные решения для развития вашего бизнеса</p>
        </div>
        <div class="features-grid">
            ${getFeatureCards(context.mainFeatures, colors)}
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
        <div class="stats-grid">
            <div>
                <div class="stat-number">500+</div>
                <div class="stat-label">Клиентов</div>
            </div>
            <div>
                <div class="stat-number">98%</div>
                <div class="stat-label">Довольных</div>
            </div>
            <div>
                <div class="stat-number">5 лет</div>
                <div class="stat-label">На рынке</div>
            </div>
            <div>
                <div class="stat-number">24/7</div>
                <div class="stat-label">Поддержка</div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
        <h2>Готовы начать?</h2>
        <p>Оставьте заявку и мы свяжемся с вами в течение 15 минут</p>
        <a href="#" class="btn btn-primary">Получить консультацию</a>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-logo">${projectName}</div>
            <div class="footer-links">
                <a href="#">Политика конфиденциальности</a>
                <a href="#">Условия использования</a>
                <a href="tel:+996XXXXXXXXX">+996 XXX XXX XXX</a>
            </div>
        </div>
    </footer>

    <!-- Demo Badge -->
    <div class="demo-badge">
        🎨 Демо-версия сайта
    </div>
</body>
</html>`;

  // Simulate processing time
  await delay(4000);

  return html;
}

interface ColorScheme {
  primary: string;
  gradient: string;
  shadow: string;
  lightBg: string;
}

function getColorScheme(businessType: string): ColorScheme {
  const type = businessType.toLowerCase();

  if (type.includes('кофейн') || type.includes('ресторан') || type.includes('кафе')) {
    return {
      primary: '#92400e',
      gradient: 'linear-gradient(135deg, #92400e, #b45309)',
      shadow: 'rgba(146, 64, 14, 0.3)',
      lightBg: '#fffbeb',
    };
  }

  if (type.includes('салон') || type.includes('красот') || type.includes('барбер')) {
    return {
      primary: '#be185d',
      gradient: 'linear-gradient(135deg, #be185d, #db2777)',
      shadow: 'rgba(190, 24, 93, 0.3)',
      lightBg: '#fdf2f8',
    };
  }

  if (type.includes('фитнес') || type.includes('спорт')) {
    return {
      primary: '#059669',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      shadow: 'rgba(5, 150, 105, 0.3)',
      lightBg: '#ecfdf5',
    };
  }

  if (type.includes('клиник') || type.includes('медиц') || type.includes('стомат')) {
    return {
      primary: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
      shadow: 'rgba(8, 145, 178, 0.3)',
      lightBg: '#ecfeff',
    };
  }

  if (type.includes('юрид') || type.includes('консалт')) {
    return {
      primary: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      shadow: 'rgba(30, 64, 175, 0.3)',
      lightBg: '#eff6ff',
    };
  }

  if (type.includes('строит') || type.includes('недвижим')) {
    return {
      primary: '#ea580c',
      gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
      shadow: 'rgba(234, 88, 12, 0.3)',
      lightBg: '#fff7ed',
    };
  }

  // Pottery, ceramics, creative workshops - warm terracotta theme
  if (type.includes('гончарн') || type.includes('керамик') || type.includes('мастерская') ||
      type.includes('мастер-класс') || type.includes('творческ') || type.includes('студи') ||
      type.includes('лепк') || type.includes('художеств')) {
    return {
      primary: '#9a3412',
      gradient: 'linear-gradient(135deg, #9a3412, #c2410c)',
      shadow: 'rgba(154, 52, 18, 0.3)',
      lightBg: '#fef3f1',
    };
  }

  // Default blue theme
  return {
    primary: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    shadow: 'rgba(37, 99, 235, 0.3)',
    lightBg: '#f0f9ff',
  };
}

function getHeroTitle(businessType: string): string {
  const type = businessType.toLowerCase();

  if (type.includes('кофейн')) return 'Лучший кофе в городе';
  if (type.includes('ресторан')) return 'Изысканная кухня для вас';
  if (type.includes('салон')) return 'Красота начинается здесь';
  if (type.includes('фитнес')) return 'Путь к идеальной форме';
  if (type.includes('клиник')) return 'Забота о вашем здоровье';
  if (type.includes('юрид')) return 'Надёжная правовая защита';
  if (type.includes('строит')) return 'Строим ваше будущее';
  if (type.includes('магазин')) return 'Лучшие товары для вас';
  if (type.includes('автомойк')) return 'Чистота и блеск вашего авто';
  if (type.includes('гончарн') || type.includes('керамик')) return 'Откройте магию глины';
  if (type.includes('мастерская') || type.includes('мастер-класс')) return 'Творите своими руками';
  if (type.includes('студи') || type.includes('творческ')) return 'Пространство для творчества';

  return 'Профессиональные решения для бизнеса';
}

function getHeroImage(businessType: string): string {
  const type = businessType.toLowerCase();

  // Pottery/ceramics workshop
  if (type.includes('гончарн') || type.includes('керамик') || type.includes('лепк')) {
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop';
  }
  // Creative workshop/studio
  if (type.includes('мастерская') || type.includes('творческ') || type.includes('студи') || type.includes('мастер-класс')) {
    return 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop';
  }
  // Coffee shop
  if (type.includes('кофейн') || type.includes('кафе')) {
    return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop';
  }
  // Restaurant
  if (type.includes('ресторан')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop';
  }
  // Beauty salon
  if (type.includes('салон') || type.includes('красот')) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop';
  }
  // Fitness
  if (type.includes('фитнес') || type.includes('спорт')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop';
  }
  // Medical
  if (type.includes('клиник') || type.includes('медиц')) {
    return 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop';
  }
  // Car wash
  if (type.includes('автомойк') || type.includes('мойк')) {
    return 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop';
  }

  // Default - business/tech image
  return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop';
}

function getFeatureCards(features: string[], colors: ColorScheme): string {
  const defaultFeatures = [
    { icon: '⚡', title: 'Быстро', desc: 'Оперативное выполнение заказов' },
    { icon: '✨', title: 'Качественно', desc: 'Высокие стандарты обслуживания' },
    { icon: '💰', title: 'Выгодно', desc: 'Конкурентные цены на рынке' },
    { icon: '🛡️', title: 'Надёжно', desc: 'Гарантия на все услуги' },
    { icon: '📱', title: 'Удобно', desc: 'Онлайн-запись 24/7' },
    { icon: '🎯', title: 'Индивидуально', desc: 'Персональный подход к каждому' },
  ];

  const featureCards = features.length > 0
    ? features.slice(0, 6).map((f, i) => ({
        icon: ['⚡', '✨', '💰', '🛡️', '📱', '🎯'][i % 6],
        title: f,
        desc: `${f} для вашего удобства`,
      }))
    : defaultFeatures;

  return featureCards.map(f => `
            <div class="feature-card">
                <div class="feature-icon">${f.icon}</div>
                <h3>${f.title}</h3>
                <p>${f.desc}</p>
            </div>
  `).join('');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
