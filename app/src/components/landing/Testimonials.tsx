import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '@/data/services';
import { cn } from '@/lib/utils';

export function Testimonials() {
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
      id="testimonials"
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
            Отзывы клиентов
          </h2>
          <p
            className={cn(
              'text-lg text-[#6B7280] max-w-2xl mx-auto transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            Что говорят те, кто уже использовал нашу платформу
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => {
            const delay = 200 + index * 150;
            const rotations = [-1, 1, -2, 2];
            const rotation = rotations[index % rotations.length];

            return (
              <div
                key={testimonial.id}
                className={cn(
                  'bg-white border border-[#E5E7EB] rounded-xl p-6 transition-all duration-700 hover:shadow-lg hover:-translate-y-1',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                )}
                style={{
                  transitionDelay: `${delay}ms`,
                  transform: isVisible ? `rotate(${rotation}deg)` : 'rotate(0deg)',
                }}
              >
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-[#2563EB]/20" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-[#1F2937] mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[#1F2937] text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div
          className={cn(
            'mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {[
            { value: '500+', label: 'Проектов рассчитано' },
            { value: '98%', label: 'Точность оценки' },
            { value: '4.9', label: 'Средний рейтинг' },
            { value: '3 мин', label: 'Среднее время' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-[#F8F9FA] rounded-xl"
            >
              <p className="text-3xl font-bold text-[#2563EB] mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-[#6B7280]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
