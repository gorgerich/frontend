import { TopButtons } from './TopButtons';

const heroImage =
  'https://images.unsplash.com/photo-1615403294586-8c6df4cab0b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMGNlbWV0ZXJ5JTIwdHJlZXN8ZW58MXx8fHwxNzYzNzYwMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

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

          {/* Верхние кнопки — «висят» над Hero */}
          <div className="pointer-events-none absolute -top-10 left-0 right-0 z-10 flex justify-center md:-top-14">
            <div className="pointer-events-auto">
              <TopButtons />
            </div>
          </div>

          {/* Текстовый блок */}
          <div className="relative z-0 flex h-full translate-y-[-15%] flex-col items-center justify-center px-6 text-center">
            <h1
              className="mx-auto mb-4 max-w-3xl tracking-tight text-white drop-shadow-2xl"
              style={{
                fontFamily: 'var(--font-family-serif)',
                textShadow:
                  '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {/* Мобильная версия заголовка */}
              <span
                className="block text-2xl md:hidden"
                style={{
                  maxWidth: '340px',
                  fontWeight: 400,
                  transform: 'translateY(20%)',
                }}
              >
                Цифровой помощник по самостоятельной организации прощания без
                агентств и давления
              </span>

              {/* Десктопная версия заголовка */}
              <span
                className="hidden md:block"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontWeight: 400,
                }}
              >
                <span className="mb-1 block text-3xl lg:text-4xl xl:text-5xl">
                  Цифровой помощник по самостоятельной
                </span>
                <span className="block text-3xl lg:text-4xl xl:text-5xl">
                  организации прощания без агентств и давления
                </span>
              </span>
            </h1>

            {/* Здесь потом добавим подзаголовок и кнопки, когда перенесём остальные части */}
          </div>
        </div>
      </div>
    </section>
  );
}