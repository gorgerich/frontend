// app/components/HeroSection.tsx
import { TopButtons } from "./TopButtons";

const heroImage = "/hero-forest.jpg";

// DESKTOP controls
const DESKTOP_TOP = "14%"; // опускай/поднимай весь заголовок на десктопе
const LINE1_SHIFT = "0px"; // сдвиг первой строки
const LINE2_SHIFT = "6px"; // сдвиг второй строки
const LINE1_LINE_HEIGHT = 1.15; // межстрочное 1-й строки
const LINE2_LINE_HEIGHT = 1.12; // межстрочное 2-й строки
const LINES_GAP = "-2px"; // расстояние между строками/предложениями

// MOBILE controls
const MOBILE_SHIFT = "20%"; // общий сдвиг мобайл-заголовка (как было translateY(20%))
const MOBILE_LINE1_SHIFT = "0px"; // сдвиг 1-й строки
const MOBILE_LINE2_SHIFT = "0px"; // сдвиг 2-й строки
const MOBILE_LINE1_LINE_HEIGHT = 1.18;
const MOBILE_LINE2_LINE_HEIGHT = 1.12;
const MOBILE_LINES_GAP = "8px"; // расстояние между строками на мобайле

export function HeroSection() {
  return (
    <section className="relative w-full px-4 pt-8 pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl relative">
        {/* Top buttons */}
        <div className="pointer-events-none absolute left-0 right-0 -top-10 z-50 flex justify-center md:-top-14">
          <div className="pointer-events-auto">
            <TopButtons />
          </div>
        </div>

        <div className="relative h-[60vh] w-full overflow-hidden rounded-3xl md:h-[70vh] lg:h-[75vh] md:rounded-[40px]">
          {/* Background (hero only) */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Тихая Память"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover md:rounded-[40px]"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/70 via-black/60 to-black/75 md:rounded-[40px]" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/50 via-black/25 to-black/10 md:hidden" />
          </div>

          {/* TEXT LAYER */}
          <div className="absolute inset-0 z-10">
            {/* MOBILE */}
            <div className="flex h-full items-center justify-center px-6 pb-24 text-center sm:pb-32 md:hidden">
              <h1
                className="mx-auto mb-4 max-w-[28rem] tracking-tight text-white drop-shadow-2xl sm:max-w-[32rem]"
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
                    transform: `translateY(${MOBILE_SHIFT})`,
                  }}
                >
                  <span
                    className="block"
                    style={{
                      transform: `translateY(${MOBILE_LINE1_SHIFT})`,
                      lineHeight: MOBILE_LINE1_LINE_HEIGHT,
                      marginBottom: MOBILE_LINES_GAP,
                    }}
                  >
                    Цифровой помощник по самостоятельной организации прощания без звонков и давления
                  </span>

                  <span
                    className="block"
                    style={{
                      transform: `translateY(${MOBILE_LINE2_SHIFT})`,
                      lineHeight: MOBILE_LINE2_LINE_HEIGHT,
                    }}
                  >
                    
                  </span>
                </span>
              </h1>
            </div>

            {/* DESKTOP */}
            <div
              className="absolute left-0 right-0 hidden px-6 text-center md:block"
              style={{ top: DESKTOP_TOP }}
            >
              <h1
                className="mx-auto mb-4 max-w-3xl tracking-tight text-white drop-shadow-2xl"
                style={{
                  fontFamily: "var(--font-family-serif)",
                  textShadow:
                    "0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                <span
                  className="block"
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontWeight: 40,
                  }}
                >
                  <span
                    className="block text-3xl lg:text-4xl xl:text-4xl"
                    style={{
                      transform: `translateY(${LINE1_SHIFT})`,
                      lineHeight: LINE1_LINE_HEIGHT,
                      marginBottom: LINES_GAP,
                    }}
                  >
                    Цифровой помощник по самостоятельной
                  </span>

                  <span
                    className="block text-4xl lg:text-3xl xl:text-4xl"
                    style={{
                      transform: `translateY(${LINE2_SHIFT})`,
                      lineHeight: LINE2_LINE_HEIGHT,
                    }}
                  >
                    организации прощания без звонков и давления
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
