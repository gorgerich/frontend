// app/components/HeroSection.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { TopButtons } from "./TopButtons";
import { Button } from "./ui/button";

const heroImage = "/hero-forest.jpg";
const DESKTOP_TOP = "3%";
const LINE2_SHIFT = "6px";
const MOBILE_SHIFT = "0px";
const MOBILE_LINE2_SHIFT = "0px";
const HERO_BULLETS = [
  "Без звонков",
  "Фиксированная цена",
  "Личный координатор",
];
const MOBILE_HERO_BULLETS = HERO_BULLETS.filter(
  (bullet) => bullet !== "Фиксированная цена",
);

interface HeroSectionProps {
  isEmergencyChecklistOpen: boolean;
  onOpenEmergencyChecklist: () => void;
}

export function HeroSection({
  isEmergencyChecklistOpen,
  onOpenEmergencyChecklist,
}: HeroSectionProps) {
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

      if (
        wrapperRect.width === 0 ||
        questionRect.width === 0 ||
        titleRect.height === 0
      ) {
        setTopButtonsStyle((current) => ({ ...current, visible: false }));
        setConnectorStyle({
          top: 0,
          left: 0,
          height: 0,
          opacity: 0,
        });
        return;
      }

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
    onOpenEmergencyChecklist();
  };

  const planCtaClass =
    "relative h-14 rounded-full !border-[#1794FD]/18 !bg-[#1794FD] px-[18px] text-sm font-semibold !text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.10)] transition-colors duration-200 hover:!bg-[#1b58c5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/25 active:scale-[0.98] active:!bg-[#184fb0] active:shadow-[0_1px_2px_rgba(0,0,0,0.08)] [&_.font-subheading]:!text-white [&_.font-micro]:!text-white/85 [&_svg]:!text-white/90";

  return (
    <section className="relative w-full pt-4 pb-5 sm:pt-5 md:pt-8 md:pb-7 lg:pb-9">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-0 h-[68vh] sm:top-5 md:hidden">
        <div className="absolute left-1/2 h-full w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-[28px] sm:w-[calc(100vw-36px)]">
          <Image
            src={heroImage}
            alt="Белые цветы"
            fill
            priority
            sizes="(max-width: 767px) calc(100vw - 32px), 1px"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/20 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/7 to-black/3" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[70vh] md:block lg:h-[74vh]">
        <div className="absolute left-1/2 h-full w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-[40px] lg:w-[calc(100vw-48px)]">
          <Image
            src={heroImage}
            alt="Белые цветы"
            fill
            sizes="(min-width: 1024px) calc(100vw - 48px), calc(100vw - 32px)"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/20 to-black/30" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl overflow-visible px-4 md:hidden">
        <div className="relative h-[68vh] w-full">
          <div className="absolute inset-0 z-30">
            <div className="flex h-full flex-col items-start justify-start px-4 pt-4 pb-16 text-left translate-y-[10%] max-[375px]:translate-y-0 max-[375px]:pt-6 sm:px-6 sm:pt-6 sm:pb-20">
              <div className="-translate-y-[25%] max-[375px]:-translate-y-[8%]">
                <div className="mb-5 flex w-full max-w-[20rem] flex-wrap gap-2 sm:max-w-[24rem]">
                {MOBILE_HERO_BULLETS.map((bullet) => (
                  <span
                    key={bullet}
                    className="inline-flex min-h-[34px] items-center rounded-full border border-white/30 bg-white/14 px-3.5 text-[12px] font-medium leading-none text-white shadow-[0_6px_20px_rgba(15,23,42,0.10)] backdrop-blur-md sm:min-h-[36px] sm:px-4 sm:text-[13px]"
                  >
                    {bullet}
                  </span>
                ))}
                </div>
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
                      className="font-heading block text-[24px] font-black leading-[1.05] text-left whitespace-normal break-words max-[375px]:text-[21px] max-[375px]:leading-[1.02] min-[390px]:text-[29px] sm:text-[32px]"
                      style={{
                        fontWeight: 900,
                        transform: `translateY(${MOBILE_LINE2_SHIFT})`,
                      }}
                  >
                    Достойная организация похорон в Москве и Московской области
                  </span>
                </span>
                </h1>
                <p
                className="font-body mt-3 w-full max-w-[22rem] text-[12px] font-normal leading-[1.4] text-left text-white/80 max-[375px]:mt-2 max-[375px]:text-[11px] max-[375px]:leading-[1.32] min-[390px]:text-[13px]"
                style={{
                  fontWeight: 400,
                }}
                >
                Онлайн сервис организации прощания. Расчет без скрытых платежей и
                доплат. Фиксируем итоговую цену в договоре.
                </p>
              </div>
              <div className="mt-2 flex w-full flex-col items-stretch max-[375px]:mt-1 sm:mt-16">
                <Button
                  type="button"
                  onClick={handlePlanActionsClick}
                  aria-expanded={isEmergencyChecklistOpen}
                  aria-controls="how-it-works"
                  className={`${planCtaClass} mt-4 w-full max-[375px]:mt-2 max-[375px]:h-12`}
                >
                  <span className="flex w-full flex-col items-center text-center">
                    <span className="font-subheading text-gray-600">
                      Что делать, если умер человек?
                    </span>
                  </span>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 mx-auto hidden max-w-7xl overflow-visible px-4 md:block"
        ref={wrapperRef}
      >
        <div
          className="pointer-events-none absolute"
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
        <div className="relative h-[70vh] w-full lg:h-[74vh]">
          <div className="absolute inset-0 z-30">
            <div className="absolute inset-x-0 z-30 px-3 lg:px-4" style={{ top: DESKTOP_TOP }}>
              <div className="mx-auto max-w-7xl px-1 lg:px-2 xl:px-3">
                <div className="max-w-[68rem] text-left lg:-translate-x-[7%]">
                  <div className="mb-6 flex w-full max-w-[42rem] flex-wrap gap-3 xl:max-w-[46rem]">
                    {HERO_BULLETS.map((bullet) => (
                      <span
                        key={bullet}
                        className="inline-flex min-h-[40px] items-center rounded-full border border-white/26 bg-white/12 px-5 text-[15px] font-medium leading-none text-white shadow-[0_8px_26px_rgba(15,23,42,0.10)] backdrop-blur-md"
                      >
                        {bullet}
                      </span>
                    ))}
                  </div>
                  <h1
                    ref={titleRef}
                    className="mb-4 w-full max-w-[54rem] whitespace-normal break-normal font-heading tracking-tight text-white [text-wrap:balance] xl:max-w-[58rem]"
                    style={{
                      textShadow: "0 10px 24px rgba(0,0,0,0.24)",
                    }}
                  >
                    <span className="block">
                      <span
                        className="block w-full whitespace-normal break-normal text-left font-heading text-[42px] font-extrabold leading-[1.03] lg:text-[52px] xl:text-[58px]"
                        style={{
                          fontWeight: 800,
                          transform: `translateY(${LINE2_SHIFT})`,
                        }}
                      >
                        Достойная организация похорон в Москве и Московской области
                      </span>
                      <span
                        className="mt-4 block max-w-[40rem] text-left font-body text-[14px] font-normal leading-[1.4] text-white/80 lg:max-w-[68rem] lg:whitespace-nowrap lg:text-[15px] xl:max-w-[72rem] xl:text-[16px]"
                        style={{
                          fontWeight: 400,
                        }}
                      >
                        Онлайн сервис организации прощания. Расчет без скрытых
                        платежей и доплат. Фиксируем итоговую цену в договоре.
                      </span>
                    </span>
                  </h1>

                  <div className="mt-2 flex w-full items-center justify-start lg:mt-1">
                    <Button
                      type="button"
                      onClick={handlePlanActionsClick}
                      ref={questionRef}
                      aria-expanded={isEmergencyChecklistOpen}
                      aria-controls="how-it-works"
                      className={`${planCtaClass} w-full max-w-[20rem]`}
                    >
                      <span className="flex w-full flex-col items-center text-center">
                        <span className="font-subheading text-gray-600">
                          Что делать, если умер человек?
                        </span>
                      </span>
                      <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </Button>
                  </div>
                </div>
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
