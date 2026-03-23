// app/components/HeroSection.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { TopButtons } from "./TopButtons";
import { Button } from "./ui/button";

const heroImage = "/hero-forest.jpg";
const heroImageNew = "/heroIMGnew.PNG";
const DESKTOP_TOP = "5%";
const LINE2_SHIFT = "6px";
const MOBILE_SHIFT = "0px";
const MOBILE_LINE2_SHIFT = "0px";

export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const questionRef = useRef<HTMLButtonElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [topButtonsStyle, setTopButtonsStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    visible: false,
  });
  const [connectorStyle, setConnectorStyle] = useState({
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
      const wrapperRect = wrapper.getBoundingClientRect();
      const questionRect = question.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const top = questionRect.bottom - wrapperRect.top;
      const height = Math.max(0, titleRect.top - questionRect.bottom);
      const left = questionRect.left + questionRect.width / 2 - wrapperRect.left;

      setTopButtonsStyle({
        top: window.scrollY + wrapperRect.top - 44,
        left: window.scrollX + wrapperRect.left + 24,
        width: Math.max(0, wrapperRect.width - 48),
        visible: true,
      });
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
    resizeObserver.observe(wrapper);
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
    "relative h-14 rounded-full !border-white/18 !bg-[rgba(15,23,42,0.9)] px-[18px] text-sm font-semibold !text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.10)] transition-colors duration-200 hover:!bg-[rgba(15,23,42,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.98] active:!bg-[rgba(15,23,42,0.96)] active:shadow-[0_1px_2px_rgba(0,0,0,0.08)] [&_.font-subheading]:!text-white [&_.font-micro]:!text-white/85 [&_svg]:!text-white/90";

  return (
    <section className="relative w-full px-4 pt-14 pb-5 sm:pt-16 md:pt-8 md:pb-7 lg:pb-9">
      <div className="relative mx-auto max-w-7xl overflow-visible" ref={wrapperRef}>
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
        <div className="relative h-[68vh] w-full overflow-hidden rounded-3xl md:h-[70vh] lg:h-[74vh] md:rounded-[40px]">
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src={heroImageNew}
              alt="Белые цветы"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover md:rounded-[40px]"
            />
            <img src={heroImage} alt="" aria-hidden="true" className="hidden" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/24 via-black/20 to-black/30 md:rounded-[40px]" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/12 via-black/7 to-black/3 md:hidden" />
          </div>

          <div className="absolute inset-0 z-30">
            <div className="flex h-full flex-col items-start justify-start px-4 pt-4 pb-16 text-left sm:px-6 sm:pt-6 sm:pb-20 md:hidden">
              <h1
                className="font-heading mb-0 w-full max-w-full whitespace-normal break-words tracking-tight text-white [text-wrap:balance]"
                style={{
                  textShadow: "0 10px 24px rgba(0,0,0,0.24)",
                }}
              >
                <span
                  className="block w-full"
                  style={{
                    maxWidth: "100%",
                    transform: `translateY(${MOBILE_SHIFT})`,
                  }}
                >
                  <span
                    className="font-heading block text-[24px] font-extrabold leading-[1.05] text-left whitespace-normal break-words min-[375px]:text-[29px] sm:text-[32px]"
                    style={{
                      fontWeight: 800,
                      transform: `translateY(${MOBILE_LINE2_SHIFT})`,
                    }}
                  >
                    Достойная организация похорон в Москве и Московской области
                  </span>
                </span>
              </h1>
              <p
                className="font-body mt-3 w-full max-w-[22rem] text-[12px] font-normal leading-[1.4] text-left text-white/80 min-[375px]:text-[13px]"
                style={{
                  fontWeight: 400,
                }}
              >
                Онлайн сервис организации прощания. Рассчет без скрытых платежей и доплат.  Фиксируем итоговую цену в договоре.
              </p>
              <div className="mt-24 flex w-full flex-col items-center sm:mt-28">
                <Button
                  type="button"
                  onClick={handlePlanActionsClick}
                  className={`${planCtaClass} mt-4 w-full max-w-[18rem]`}
                >
                  <span className="flex w-full flex-col items-center text-center">
                    <span className="font-subheading text-gray-600">Что делать, если умер человек?</span>
                  </span>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </Button>
              </div>
            </div>

            <div
              className="absolute left-0 right-0 hidden z-30 px-6 text-center md:block"
              style={{ top: DESKTOP_TOP }}
            >
              <h1
                ref={titleRef}
                className="mx-auto mb-4 w-full max-w-full whitespace-normal break-words font-heading tracking-tight text-white md:max-w-[26ch] lg:max-w-[20ch] [text-wrap:balance]"
                style={{
                  textShadow: "0 10px 24px rgba(0,0,0,0.24)",
                }}
              >
                <span className="block">
                  <span
                    className="mx-auto block w-full whitespace-normal break-words text-center font-heading text-[42px] font-extrabold leading-[1.03] lg:text-[52px] xl:text-[58px]"
                    style={{
                      fontWeight: 800,
                      transform: `translateY(${LINE2_SHIFT})`,
                    }}
                  >
                    Достойная организация похорон в Москве и Московской области
                  </span>
                  <span
                    className="relative left-1/2 mt-4 block w-full max-w-full -translate-x-1/2 text-center font-body text-[14px] font-normal leading-[1.4] text-white/80 md:w-[60ch] lg:w-[72ch] lg:text-[16px] xl:text-[18px]"
                    style={{
                      fontWeight: 400,
                    }}
                  >
                    Онлайн сервис организации прощания. Рассчет без скрытых платежей и доплат.  Фиксируем итоговую цену в договоре.
                  </span>
                </span>
              </h1>

              <div className="mt-3 flex w-full items-center justify-center">
                <Button
                  type="button"
                  onClick={handlePlanActionsClick}
                  ref={questionRef}
                  className={`${planCtaClass} w-full max-w-[20rem]`}
                >
                  <span className="flex w-full flex-col items-center text-center">
                    <span className="font-subheading text-gray-600">Что делать, если умер человек?</span>
                  </span>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Temporarily hidden to reduce cognitive load and keep an easy rollback path. */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none absolute z-[1200] hidden"
            style={{
              top: topButtonsStyle.top,
              left: topButtonsStyle.left,
              width: topButtonsStyle.width,
              visibility: topButtonsStyle.visible ? "visible" : "hidden",
            }}
          >
            <div className="pointer-events-auto">
              <TopButtons questionButtonRef={questionRef} />
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
