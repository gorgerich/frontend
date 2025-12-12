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

          {/* Верхние кнопки */}
          <div className="pointer-events-none absolute -top-10 left-0 right-0 z-20 flex justify-center md:-top-14">
            <div className="pointer-events-auto">
              <TopButtons />
            </div>
          </div>
          
{/* Текстовый блок */}
<div className="relative z-0 flex h-full flex-col items-center justify-start md:mt-[60px] lg:mt-[80px] xl:mt-[96px]">
  <h1
    className="mx-auto mb-4 max-w-3xl tracking-tight text-white drop-shadow-2xl text-center"
    style={{
      fontFamily: "var(--font-family-serif)",
      textShadow:
        "0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)",
    }}
  >
    {/* Мобильная версия заголовка */}
    <span
      className="block text-2xl md:hidden"
      style={{
        maxWidth: "340px",
        fontWeight: 400,
        margin: "0 auto",
      }}
    >
      Цифровой помощник по самостоятельной организации прощания без
      агентств и давления
    </span>

    {/* Десктопная версия заголовка */}
    <span
      className="hidden md:block text-center"
      style={{
        fontFamily: "var(--font-family-display)",
        fontWeight: 400,
      }}
    >
      {/* первая строка */}
      <span className="block text-3xl lg:text-[40px] xl:text-[44px] leading-tight">
        Цифровой помощник по самостоятельной
      </span>

      {/* вторая строка */}
      <span className="mt-2 block text-2xl lg:text-[34px] xl:text-[38px] leading-tight">
        организации прощания без агентств&nbsp;и&nbsp;давления
      </span>
    </span>
  </h1>

  {/* сюда потом подзаголовок/кнопки */}
</div>
        </div>
      </div>
    </section>
  );
}