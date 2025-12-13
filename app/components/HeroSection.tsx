// app/components/HeroSection.tsx
import { TopButtons } from "./TopButtons";

const heroImage = "/hero-forest.jpg";

export function HeroSection() {
  return (
    <section className="relative w-full px-4 pt-8 pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        {/* Контейнер с фоновым изображением */}
        <div className="relative h-[60vh] w-full overflow-visible rounded-3xl md:h-[70vh] lg:h-[75vh] md:rounded-[40px]">
          {/* Фоновое изображение */}
          <img
            src={heroImage}
            alt="Тихая Память"
            className="absolute inset-0 h-full w-full rounded-3xl object-cover md:rounded-[40px]"
          />

          {/* Градиент поверх изображения */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/70 via-black/60 to-black/75 md:rounded-[40px]" />

          {/* Верхние кнопки – оставляем как были */}
          <div className="pointer-events-none absolute -top-10 left-0 right-0 z-20 flex justify-center md:-top-14">
            <div className="pointer-events-auto">
              <TopButtons />
            </div>
          </div>

          {/* Text Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-6 text-center -translate-y-[15%] z-0">
            {/* Main Heading */}
            <h1 className="text-white mb-4 max-w-3xl tracking-tight drop-shadow-2xl mx-auto" style={{ fontFamily: 'var(--font-family-serif)', textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}>
              {/* Mobile version */}
              <span className="md:hidden block text-2xl mx-auto" style={{ maxWidth: '340px', fontWeight: 40, transform: 'translateY(20%)' }}>
                Цифровой помощник по самостоятельной организации прощания без агентств и давления
              </span>
              {/* Desktop version */}
<span
  className="hidden md:block md:-translate-y-6 lg:-translate-y-8"
  style={{ fontFamily: 'var(--font-family-display)', fontWeight: 40 }}
>
  <span className="block text-3xl lg:text-4xl xl:text-4xl mb-1">
    Цифровой помощник по самостоятельной
  </span>
  <span className="block text-3xl lg:text-4xl xl:text-5xl">
    организации прощания без агентств и давления
  </span>
</span>
            </h1>
            
            {/* Subtitle */}

          </div>
        </div>
      </div>
    </section>
  );
}