import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 60;
    const connectionDistance = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 2,
      });
    }

    let animationId: number;
    let frameCount = 0;

    const animate = () => {
      frameCount++;
      // Render every 2nd frame for performance (30fps)
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Update and draw particles
        particles.forEach((particle, i) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.offsetWidth) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.offsetHeight) particle.vy *= -1;

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();

          // Draw connections (only check every 5th particle for performance)
          if (i % 5 === 0) {
            for (let j = i + 1; j < particles.length; j += 3) {
              const dx = particles[j].x - particle.x;
              const dy = particles[j].y - particle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - distance / connectionDistance)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          }
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const scrollToCalculator = () => {
    const element = document.querySelector('#calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen gradient-hero overflow-hidden"
    >
      {/* Particle Canvas */}
      <canvas
        ref={particlesRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-white/5 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white/5 animate-float"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          {/* Left: Text Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Интеллектуальная
                <br />
                платформа для
                <br />
                расчета стоимости
                <br />
                <span className="text-blue-200">IT-проектов</span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-blue-100 max-w-xl leading-relaxed">
              Получите точную смету, коммерческое предложение и демо-сайт за 5 минут
              с помощью AI-ассистента
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToCalculator}
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#2563EB] font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-0.5"
              >
                Рассчитать стоимость
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={scrollToCalculator}
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-medium px-8 py-4 rounded-xl border border-white/20 transition-all duration-200 hover:bg-white/20"
              >
                Посмотреть пример КП
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">500+ проектов рассчитано</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-sm">98% точность оценки</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Clock className="w-5 h-5 text-green-300" />
                <span className="text-sm">Среднее время: 3 мин</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">КП готово!</p>
                    <p className="text-blue-200 text-sm">Сгенерировано за 2 минуты</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Разработка сайта</span>
                    <span className="text-white font-semibold">$2,400</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">Дизайн</span>
                    <span className="text-white font-semibold">$800</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-blue-100">SEO-оптимизация</span>
                    <span className="text-white font-semibold">$500</span>
                  </div>
                  <div className="flex justify-between items-center py-3 mt-4 bg-white/10 rounded-lg px-4">
                    <span className="text-white font-semibold">Итого</span>
                    <span className="text-2xl font-bold text-white">$3,700</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <div className="flex-1 bg-white/20 rounded-lg py-2 px-3 text-center">
                    <p className="text-xs text-blue-200">PDF с КП</p>
                    <p className="text-white text-sm font-medium">Готово</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg py-2 px-3 text-center">
                    <p className="text-xs text-blue-200">Демо-сайт</p>
                    <p className="text-white text-sm font-medium">Готово</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg py-2 px-3 text-center">
                    <p className="text-xs text-blue-200">Презентация</p>
                    <p className="text-white text-sm font-medium">Готово</p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse-glow">
                AI-powered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
