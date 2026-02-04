import { useEffect, useRef, useState } from 'react';
import { 
  FileText, 
  Monitor, 
  Presentation, 
  Calculator, 
  FileCheck, 
  Map, 
  Sparkles, 
  GitCompare 
} from 'lucide-react';
import { features } from '@/data/services';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Monitor,
  Presentation,
  Calculator,
  FileCheck,
  Map,
  Sparkles,
  GitCompare,
};

export function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className={cn(
              'text-3xl sm:text-4xl font-bold text-[#1F2937] mb-4 transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Что вы получаете
          </h2>
          <p
            className={cn(
              'text-lg text-[#6B7280] max-w-2xl mx-auto transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Комплект документов и материалов для вашего проекта
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || FileText;
            const delay = 150 + index * 100;

            return (
              <div
                key={feature.id}
                className={cn(
                  'feature-card group cursor-pointer transition-all duration-700',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                )}
                style={{ transitionDelay: `${delay}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#2563EB] group-hover:scale-110">
                  <Icon className="w-6 h-6 text-[#2563EB] transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-2 group-hover:text-[#2563EB] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className={cn(
            'mt-16 text-center transition-all duration-700 delay-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="text-[#6B7280] mb-4">
            Все материалы готовятся автоматически на основе ваших требований
          </p>
          <a
            href="#calculator"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-[#2563EB] font-medium hover:underline"
          >
            Попробовать бесплатно
            <Sparkles className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
