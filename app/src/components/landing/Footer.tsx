import { 
  Calculator, 
  Bot, 
  FileText, 
  Code,
  Building,
  BookOpen,
  Briefcase,
  Mail,
  HelpCircle,
  FileCode,
  Activity,
  MessageSquare
} from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Продукт',
    links: [
      { label: 'Калькулятор', href: '#calculator', icon: Calculator },
      { label: 'AI-ассистент', href: '#', icon: Bot },
      { label: 'Примеры КП', href: '#', icon: FileText },
      { label: 'API', href: '#', icon: Code },
    ],
  },
  company: {
    title: 'Компания',
    links: [
      { label: 'О нас', href: '#', icon: Building },
      { label: 'Блог', href: '#', icon: BookOpen },
      { label: 'Карьера', href: '#', icon: Briefcase },
      { label: 'Контакты', href: '#', icon: Mail },
    ],
  },
  support: {
    title: 'Поддержка',
    links: [
      { label: 'Помощь', href: '#', icon: HelpCircle },
      { label: 'Документация', href: '#', icon: FileCode },
      { label: 'Статус', href: '#', icon: Activity },
      { label: 'Обратная связь', href: '#', icon: MessageSquare },
    ],
  },
};

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-white border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <a
              href="#"
              className="flex items-center gap-2 mb-4"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg text-[#1F2937]">
                ASYSTEM<span className="text-[#2563EB]">.KG</span>
              </span>
            </a>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Интеллектуальная платформа для расчета стоимости IT-проектов
            </p>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-[#1F2937] mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm text-[#6B7280] hover:text-[#2563EB] transition-colors flex items-center gap-2"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#6B7280]">
            © 2025 ASYSTEM.KG. Все права защищены.
          </p>
          <div className="flex gap-6 text-sm">
            <button className="text-[#6B7280] hover:text-[#2563EB] transition-colors">
              Политика конфиденциальности
            </button>
            <button className="text-[#6B7280] hover:text-[#2563EB] transition-colors">
              Условия использования
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
