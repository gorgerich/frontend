// app/components/HeroSection.tsx
import { TopButtons } from "./TopButtons";

const heroImage = "/hero-forest.jpg";

const DESKTOP_TOP = "14%";   // опускай/поднимай весь заголовок на десктопе
const LINE1_SHIFT = "0px";   // сдвиг первой строки
const LINE2_SHIFT = "6px";   // сдвиг второй строки (отдельно)


export function HeroSection() {
  return (
    <section className="relative w-full px-4 pt-8 pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative h-[60vh] w-full overflow-visible rounded-3xl md:h-[70vh] lg:h-[75vh] md:rounded-[40px]">
          {/* Background */}
          <img
            src={heroImage}
            alt="Тихая Память"
            className="absolute inset-0 h-full w-full rounded-3xl object-cover md:rounded-[40px]"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/70 via-black/60 to-black/75 md:rounded-[40px]" />

          {/* Top buttons */}
          <div className="pointer-events-none absolute -top-10 left-0 right-0 z-20 flex justify-center md:-top-14">
            <div className="pointer-events-auto">
              <TopButtons />
            </div>
          </div>

          {/* TEXT LAYER */}
          <div className="absolute inset-0 z-10">
            {/* MOBILE (оставляем как есть) */}
            <div className="flex h-full items-center justify-center px-6 text-center md:hidden">
              <h1
                className="mx-auto mb-4 max-w-3xl tracking-tight text-white drop-shadow-2xl"
                style={{
                  fontFamily: "var(--font-family-serif)",
                  textShadow:
                    "0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                <span
                  className="mx-auto block text-2xl"
                  style={{
                    maxWidth: "340px",
                    fontWeight: 40,
                    transform: "translateY(20%)",
                  }}
                >
                  Цифровой помощник по самостоятельной организации прощания без
                  агентств и давления
                </span>
              </h1>
            </div>

            {/* DESKTOP (настраиваемый) */}
<div
  className="absolute left-0 right-0 hidden px-6 text-center md:block"
  style={{ top: DESKTOP_TOP }}
>
  <h1
    className="mx-auto mb-4 max-w-3xl tracking-tight text-white drop-shadow-2xl"
    style={{
      fontFamily: "var(--font-family-serif)",
      textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)",
    }}
  >
    <span
      className="block"
      style={{ fontFamily: "var(--font-family-display)", fontWeight: 40 }}
    >
      <span
        className="mb-1 block text-3xl lg:text-4xl xl:text-4xl"
        style={{ transform: `translateY(${LINE1_SHIFT})` }}
      >
        Цифровой помощник по самостоятельной
      </span>

      <span
        className="block text-3xl lg:text-4xl xl:text-4xl"
        style={{ transform: `translateY(${LINE2_SHIFT})` }}
      >
        организации прощания без агентств и давления
      </span>
    </span>
  </h1>
</div>

          </div>
        </div>
      </div>
    </section>
  );
}
