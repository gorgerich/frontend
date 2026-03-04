// app/components/HeroSection.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { TopButtons } from "./TopButtons";
import { Button } from "./ui/button";
const heroImage = "/hero-forest.jpg";
const heroImageNew = "/heroIMGnew.PNG";

// DESKTOP controls
const DESKTOP_TOP = "12%"; // опускай/поднимай весь заголовок на десктопе
const LINE1_SHIFT = "0px"; // сдвиг первой строки
const LINE2_SHIFT = "6px"; // сдвиг второй строки
const LINE1_LINE_HEIGHT = 1.15; // межстрочное 1-й строки
const LINE2_LINE_HEIGHT = 1.12; // межстрочное 2-й строки
const LINES_GAP = "140px"; // расстояние между строками/предложениями

// MOBILE controls
const MOBILE_SHIFT = "-210%"; // общий сдвиг мобайл-заголовка
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
    "relative h-14 rounded-[20px] border border-black/10 bg-gradient-to-b from-white to-gray-100/80 px-[18px] text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.10)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12),0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 active:scale-[0.98] active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]";

  return (
    <section className="relative w-full px-4 pt-14 sm:pt-16 pb-16 md:pt-8 md:pb-20 lg:pb-24 md:translate-y-[4%]">
      <div className="mx-auto max-w-7xl relative" ref={wrapperRef}>
        <div
          className="pointer-events-none absolute left-6 right-6 top-0 z-40"
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
          <div className="absolute inset-0 z-30">
            {/* MOBILE */}
            <div className="flex h-full flex-col items-center justify-center px-4 pb-24 text-center sm:px-6 sm:pb-32 md:hidden">
              <h1
                className="font-heading mx-auto mb-0 w-full max-w-full whitespace-normal break-words tracking-tight text-white [text-wrap:balance]"
                style={{
                  textShadow: "0 10px 24px rgba(0,0,0,0.24)",
                }}
              >
                <span
                  className="mx-auto block w-full"
                  style={{
                    maxWidth: "100%",
                    transform: `translateY(${MOBILE_SHIFT})`,
                  }}
                  >
                  <span
                    className="font-heading block text-[24px] min-[375px]:text-[29px] sm:text-[32px] font-extrabold text-center whitespace-normal break-words leading-[1.05]"
                    style={{
                      fontWeight: 800,
                      transform: `translateY(${MOBILE_LINE2_SHIFT})`,
                    }}
                  >
                    Организация похорон под вашим полным контролем
                    
                  </span>
                </span>
              </h1>
              <div className="flex w-full flex-col items-center">
                <Button
                  type="button"
                  onClick={handlePlanActionsClick}
                  className={`${planCtaClass} order-1 md:order-2 -mt-30 w-full max-w-[22rem]`}
                >
                  <span className="flex w-full flex-col items-center text-center">
                    <span className="font-subheading text-gray-600">Что делать, если умер человек</span>
                    <span className="font-micro mt-0.5 text-[11px] font-normal text-gray-500">
                      Нажмите, чтобы показать
                    </span>
                  </span>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </Button>
                <p
                  className="font-body order-2 md:order-1 mt-6 w-full max-w-[22rem] text-[12px] min-[375px]:text-[13px] leading-[1.4] font-normal text-center text-white/80"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  Мы фиксируем цену до подписания договора. Никаких скрытых платежей, доплат в морге и навязывания услуг.
                </p>
              </div>
            </div>

            {/* DESKTOP */}
            <div
              className="absolute left-0 right-0 hidden px-6 text-center md:block z-30"
              style={{ top: DESKTOP_TOP }}
            >
              <h1
                ref={titleRef}
                className="font-heading mx-auto mb-4 w-full max-w-full md:max-w-[26ch] lg:max-w-[20ch] whitespace-normal break-words tracking-tight text-white [text-wrap:balance]"
                style={{
                  textShadow: "0 10px 24px rgba(0,0,0,0.24)",
                }}
              >
                <span className="block">
                  <span
                    className="font-heading mx-auto block w-full text-[42px] lg:text-[52px] xl:text-[58px] font-extrabold text-center leading-[1.03] whitespace-normal break-words"
                    style={{
                      fontWeight: 800,
                      transform: `translateY(${LINE2_SHIFT})`,
                    }}
                  >
                    Организация похорон под вашим полным контролем
                   
                  </span>
                  <span
                    className="font-body relative left-1/2 -translate-x-1/2 mt-4 block w-full md:w-[60ch] lg:w-[72ch] max-w-full text-[14px] lg:text-[16px] xl:text-[18px] leading-[1.4] font-normal text-center text-white/80"
                    style={{
                      fontWeight: 400,
                    }}
                  >
                  Мы фиксируем цену до подписания договора. Никаких скрытых платежей, доплат в морге и навязывания услуг.
                  </span>
                </span>
              </h1>
              <div className="mt-3 flex w-full items-center justify-center">
                <Button
                  type="button"
                  onClick={handlePlanActionsClick}
                  className={`${planCtaClass} w-full max-w-[26rem]`}
                >
                  <span className="flex w-full flex-col items-center text-center">
                    <span className="font-subheading text-gray-600">Что делать, если умер человек</span>
                    <span className="font-micro mt-0.5 text-[11px] font-normal text-gray-500">
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
