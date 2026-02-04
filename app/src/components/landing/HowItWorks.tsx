import { useEffect, useRef, useState } from 'react';
import { steps } from '@/data/services';
import { cn } from '@/lib/utils';

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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

  // Animate steps sequentially
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-20 lg:py-28 bg-[#F8F9FA]"
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
            Как это работает
          </h2>
          <p
            className={cn(
              'text-lg text-[#6B7280] max-w-2xl mx-auto transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Простой процесс от выбора услуг до готовых материалов
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-[#E5E7EB]">
            <div
              className="h-full bg-[#2563EB] transition-all duration-1000"
              style={{
                width: isVisible ? `${(activeStep / (steps.length - 1)) * 100}%` : '0%',
              }}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const isActive = index <= activeStep;
              const delay = 200 + index * 150;

              return (
                <div
                  key={step.number}
                  className={cn(
                    'relative text-center transition-all duration-700',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  )}
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  {/* Step Number */}
                  <div
                    className={cn(
                      'relative z-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold transition-all duration-500',
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                        : 'bg-white text-[#9CA3AF] border-2 border-[#E5E7EB]'
                    )}
                  >
                    {step.number}
                  </div>

                  {/* Content */}
                  <h3
                    className={cn(
                      'text-lg font-semibold mb-3 transition-colors duration-300',
                      isActive ? 'text-[#1F2937]' : 'text-[#9CA3AF]'
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      'text-sm leading-relaxed transition-colors duration-300',
                      isActive ? 'text-[#6B7280]' : 'text-[#9CA3AF]'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Badge */}
        <div
          className={cn(
            'mt-16 text-center transition-all duration-700 delay-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-md border border-[#E5E7EB]">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[#1F2937]">Всего 5 минут</p>
              <p className="text-xs text-[#6B7280]">от начала до готовых материалов</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
