import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CTASection() {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToCalculator = () => {
    const element = document.querySelector('#calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 gradient-cta overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/5 animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-white/5 animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/5 animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className={cn(
            'text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          Готовы рассчитать стоимость вашего проекта?
        </h2>

        <p
          className={cn(
            'text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-150',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          Получите детальное КП, демо-сайт и презентацию за 5 минут
        </p>

        <div
          className={cn(
            'transition-all duration-700 delay-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <button
            onClick={scrollToCalculator}
            className="group inline-flex items-center justify-center gap-3 bg-white text-[#2563EB] font-semibold px-10 py-5 rounded-xl text-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1"
          >
            Начать расчет бесплатно
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div
          className={cn(
            'mt-8 flex flex-wrap justify-center gap-6 text-blue-200 transition-all duration-700 delay-450',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Без регистрации</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Мгновенный результат</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Точность 98%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
