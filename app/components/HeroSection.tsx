// app/components/HeroSection.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { TopButtons } from "./TopButtons";
import { Button } from "./ui/button";
const heroImage = "/hero-forest.jpg";
const heroImageNew = "/heroIMGnew.PNG";

// DESKTOP controls
const DESKTOP_TOP = "14%"; // опускай/поднимай весь заголовок на десктопе
const LINE1_SHIFT = "0px"; // сдвиг первой строки
const LINE2_SHIFT = "6px"; // сдвиг второй строки
const LINE1_LINE_HEIGHT = 1.15; // межстрочное 1-й строки
const LINE2_LINE_HEIGHT = 1.12; // межстрочное 2-й строки
const LINES_GAP = "140px"; // расстояние между строками/предложениями

// MOBILE controls
const MOBILE_SHIFT = "20%"; // общий сдвиг мобайл-заголовка (как было translateY(20%))
const MOBILE_LINE1_SHIFT = "0px"; // сдвиг 1-й строки
const MOBILE_LINE2_SHIFT = "0px"; // сдвиг 2-й строки
const MOBILE_LINE1_LINE_HEIGHT = 1.18;
const MOBILE_LINE2_LINE_HEIGHT = 1.12;
const MOBILE_LINES_GAP = "8px"; // расстояние между строками на мобайле

export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const questionRef = useRef<HTMLButtonElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [connectorStyle, setConnectorStyle] = useState<{ top: number; left: number; height: number; opacity: number }>({
    top: 0,
    left: 0,
    height: 0,
    opacity: 0,
  });

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const question = questionRef.current;
    const title = titleRef.current;
    if (!wrapper || !question || !title) return;

    const measure = () => {
      const w = wrapper.getBoundingClientRect();
      const q = question.getBoundingClientRect();
      const t = title.getBoundingClientRect();
      const top = q.bottom - w.top;
      const height = Math.max(0, t.top - q.bottom);
      const left = q.left + q.width / 2 - w.left;
      setConnectorStyle({
        top,
        left,
        height,
        opacity: height > 0 ? 1 : 0,
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(question);
    resizeObserver.observe(title);
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const handlePlanActionsClick = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("td:toggle-how-it-works"));
  };

  const planCtaClass =
    "relative h-14 w-full rounded-[20px] border border-black/10 bg-gradient-to-b from-white to-gray-100/80 px-[18px] text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.10)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12),0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 active:scale-[0.98] active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]";

  return (
    <section className="relative w-full px-4 pt-14 sm:pt-16 pb-16 md:pt-8 md:pb-20 lg:pb-24 md:translate-y-[4%]">
      <div className="mx-auto max-w-7xl relative" ref={wrapperRef}>
        <div
          className="pointer-events-none absolute left-6 right-6 top-0 z-30"
          style={{ transform: "translateY(-44px)" }}
        >
          <div className="pointer-events-auto">
            <TopButtons questionButtonRef={questionRef} />
          </div>
        </div>
        <div
          className="pointer-events-none absolute hidden md:block"
          style={{
            top: connectorStyle.top,
            left: connectorStyle.left,
            height: connectorStyle.height,
            opacity: connectorStyle.opacity,
            width: 1,
            background: "rgba(255,255,255,0.35)",
            borderRadius: 9999,
            transform: "translateX(-50%)",
          }}
        />
        <div className="relative h-[80vh] w-full overflow-hidden rounded-3xl md:h-[82vh] lg:h-[88vh] md:rounded-[40px]">
          {/* Background (hero only) */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src={heroImageNew}
              alt="Тихая Память"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover md:rounded-[40px]"
            />
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="hidden"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/24 via-black/20 to-black/30 md:rounded-[40px]" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/12 via-black/7 to-black/3 md:hidden" />
          </div>

          {/* TEXT LAYER */}
          <div className="absolute inset-0 z-10">
            {/* MOBILE */}
            <div className="flex h-full flex-col items-center justify-center px-6 pb-24 text-center sm:pb-32 md:hidden">
              <h1
                className="mx-auto mb-4 max-w-[28rem] tracking-tight text-white drop-shadow-2xl sm:max-w-[32rem]"
                style={{
                  fontFamily: "var(--font-family-serif)",
                  textShadow:
                    "0 4px 20px rgba(0,0,0,0.8), 0 0px 0px rgba(0,0,0,0.6)",
                }}
              >
                <span
                  className="mx-auto block text-2xl font-semibold"
                  style={{
                    maxWidth: "340px",
                    fontWeight: 100,
                    transform: `translateY(${MOBILE_SHIFT})`,
                  }}
                  >
                  <span
                    className="block text-lg sm:text-xl font-semibold text-left"
                    style={{
                      fontFamily: "\"Golos\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
                      transform: `translateY(${MOBILE_LINE2_SHIFT})`,
                      lineHeight: MOBILE_LINE2_LINE_HEIGHT,
                    }}
                  >
                    Организация похорон под вашим полным контролем. 
                    <br className="hidden md:block" /> Мы берем на себя всю работу, вы принимаете решения без давления
                  </span>
                </span>
              </h1>
              <Button
                type="button"
                onClick={handlePlanActionsClick}
                className={`${planCtaClass} mt-6 max-w-[22rem]`}
              >
                <span className="flex w-full flex-col items-center text-center">
                  <span className="text-gray-800">Что делать, если умер человек</span>
                  <span className="mt-0.5 text-[11px] font-normal text-gray-500">
                    Нажмите, чтобы показать
                  </span>
                </span>
                <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </Button>
            </div>

            {/* DESKTOP */}
            <div
              className="absolute left-0 right-0 hidden px-6 text-center md:block"
              style={{ top: DESKTOP_TOP }}
            >
              <h1
                ref={titleRef}
                className="mx-auto mb-4 max-w-3xl tracking-tight text-white drop-shadow-2xl"
                style={{
                  fontFamily: "var(--font-family-serif)",
                  textShadow:
                    "0 4px 20px rgba(0,0,0,0.8), 0 0px 0px rgba(0,0,0,0.6)",
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
                    className="mx-auto block max-w-[56rem] text-xl lg:text-2xl xl:text-2xl font-bold text-center"
                    style={{
                      fontFamily: "\"Golos\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif",
                      fontWeight: 600,
                      transform: `translateY(${LINE2_SHIFT})`,
                      lineHeight: LINE2_LINE_HEIGHT,
                    }}
                  >
                    Организация похорон под вашим полным контролем. 
                    <br className="hidden md:block" /> Мы берем на себя всю работу, вы принимаете решения без давления
                  </span>
                </span>
              </h1>
              <div className="mt-8 flex w-full items-center justify-center">
                <Button
                  type="button"
                  onClick={handlePlanActionsClick}
                  className={`${planCtaClass} max-w-[26rem]`}
                >
                  <span className="flex w-full flex-col items-center text-center">
                    <span className="text-gray-800">Что делать, если умер человек</span>
                    <span className="mt-0.5 text-[11px] font-normal text-gray-500">
                      Нажмите, чтобы показать
                    </span>
                  </span>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
