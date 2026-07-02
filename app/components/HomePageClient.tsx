'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeroSection } from './HeroSection';
import { StepperWorkflow } from './StepperWorkflow';
import { PackagesSection } from './PackagesSection';
import { FloatingCalculator } from './FloatingCalculator';

import {
  calculateTotal,
  calculateBreakdown,
  getTrackingSessionId,
  trackEvent,
} from './calculationUtils';
import { TELEGRAM_URL } from '@/lib/legalLinks';
import { widontRu } from '@/lib/typography';
import {
  MAIN_DRAFT_KEY,
  loadSessionDraft,
  saveSessionDraft,
} from '@/lib/draftStorage';

type BreakdownItem = { name: string; price?: number };
type BreakdownSection = { category: string; price: number; items?: BreakdownItem[] };
type RouteFlow = 'wizard' | 'packages' | 'how-it-works' | null;
type RouteType = 'cremation' | 'burial' | null;
export type HomeRouteState = {
  routeFlow: RouteFlow;
  routeType: RouteType;
  routeStep: number | null;
  routeHowItWorksStep: number | null;
  routePackage: string | null;
  ctaParam: string | null;
};

const EMPTY_ROUTE_STATE: HomeRouteState = {
  routeFlow: null,
  routeType: null,
  routeStep: null,
  routeHowItWorksStep: null,
  routePackage: null,
  ctaParam: null,
};

const HEARSE_CATEGORY_PRICE = {
  standard: 8000,
  comfort: 15000,
  premium: 35000,
} as const;

const HEARSE_CATEGORY_LABELS = {
  standard: 'Стандарт',
  comfort: 'Комфорт',
  premium: 'Премиум',
} as const;

const TRUST_REVIEWS = [
  {
    id: 'review-1',
    name: 'Константин В.',
    date: '11 февраля 2026',
    service: 'Захоронение',
    rating: '5/5',
    headline: 'Оградили от агрессии морга и скрытых платежей',
    text: `Смерть произошла дома поздно вечером. Сначала была скорая, потом полиция, всё очень долго. Ночью почти не спали. Утром нужно было уже решать, что дальше, а я не понимала даже, какие документы должны быть на руках. Через сайт удалось спокойно собрать базовый вариант. Хорошо, что можно было не принимать все решения сразу. Отдельный момент — паспорт. Нам его забрали для оформления, и я переживала, что что-то потеряется. В итоге всё выдали корректно, данные проверили заранее, в документах ошибок не было. В день прощания всё прошло без накладок. Транспорт приехал вовремя, на кладбище никаких доплат на месте не возникло. Это было важно, потому что сил спорить уже не было. Не скажу, что это было легко. Но по крайней мере организационная часть прошла спокойно и предсказуемо. В такой ситуации это многое значит.`,
  },
  {
    id: 'review-2',
    name: 'Ирина Л.',
    date: '03 февраля 2026',
    service: 'Кремация',
    rating: '4.9/5',
    headline: 'Никто не торопил и не навязывал лишнего',
    text: `Сомневалась, можно ли вообще всё оформить онлайн. Оказалось — можно.

Собрала план на сайте, отправила себе на почту, позже всё проверила ещё раз. Удобно, что никто не торопил и не уговаривал на лучше и дороже.

Для меня было важно сохранить контроль. Здесь это получилось.`,
  },
  {
    id: 'review-3',
    name: 'Мария К.',
    date: '27 января 2026',
    service: 'Захоронение',
    rating: '5/5',
    headline: 'Удобно было согласовывать всё в чате',
    text: `Михаил, спасибо за вашу помощь. Самое тяжёлое были не эмоции даже, а необходимость сразу что-то решать. Сначала звонили знакомые, советовали своих людей, но от этих разговоров становилось только хуже. В итоге решила попробовать оформить всё через сайт.

Понравилось, что можно было спокойно читать и выбирать, без давления. Я несколько раз меняла детали — формат, транспорт, даже зал. Никто не говорил, что так уже нельзя. Всё подтверждали только после моего согласия.

В день прощания я боялась, что будет хаос, но всё прошло тихо и без суеты. Для меня это было важно, чтобы не было ощущения, что всё делается наспех. Спасибо за аккуратность и спокойствие.`,
  },
  {
    id: 'review-4',
    name: 'Наталья В.',
    date: '19 января 2026',
    service: 'Захоронение',
    rating: '4.9/5',
    headline: 'Скепсис ушел, когда увидела понятный процесс',
    text: `Сначала отнеслась с недоверием — всё онлайн, без личной встречи. В такой ситуации хочется, чтобы всё было “по-старому”, через живое общение.

Были переживания, что что-то упущу или неправильно выберу. Но в процессе стало понятно, что структура продумана, всё проверяется, итог виден заранее.

В итоге всё прошло спокойно. Не скажу, что было легко — но было понятно и без лишнего стресса.`,
  },
  {
    id: 'review-9',
    name: 'Константин В.',
    date: '05 января 2026',
    service: 'Организация похорон',
    rating: '4.9/5',
    headline: 'Помогли решить конфликт с моргом без переплат',
    text: `Если кто-то хоть раз сталкивался с нашими моргами, тот знает, что с ними общий язык не найти. В конце года хоронил отца, так мне тупо тело не отдавали. Мол хороните через нас и все. Насчитали мне космическую сумму за их услуги. Начал искать другие варианты, сравнил цены, разница оказалась ощутимой. Рассказал ребятам из тихого дома про конфликт с моргом, сказали не я первый. В итоге сами разобрались с моргом, похороны организовали, прошло без заминок.`,
  },
  {
    id: 'review-5',
    name: 'Елена М.',
    date: '03 декабря 2025',
    service: 'Организация церемонии',
    rating: '5/5',
    headline: 'Человечное сопровождение без формальности и давления',
    text: `Мне было важно, чтобы к маме отнеслись уважительно. Это звучит просто, но на практике часто чувствуется формальность. Здесь я этого не почувствовала.

Все вопросы решались без лишней драматизации. Я могла написать и уточнить любую мелочь от времени до одежды. Никто не торопил и не подталкивал к более дорогим решениям.

Когда всё закончилось, я поняла, что главное не цена даже, а ощущение, что ты не одна в этом процессе. Для меня это стало самой большой поддержкой.`,
  },
  {
    id: 'review-6',
    name: 'Ирина Л.',
    date: '11 ноября 2025',
    service: 'Организация церемонии',
    rating: '5/5',
    headline: 'Можно было всё оформить спокойно и без звонков',
    text: `Когда умер папа, я не могла нормально разговаривать по телефону. Поэтому искала вариант без постоянных звонков.

Собрала всё на сайте, получила договор на почту, спокойно всё перечитала. Только после этого подтвердили.

Очень ценно, что дали время и не давили.`,
  },
  {
    id: 'review-7',
    name: 'Алексей М.',
    date: '04 сентября 2025',
    service: 'Захоронение',
    rating: '4.9/5',
    headline: 'Прозрачная смета: сразу видно финальную сумму',
    text: `Спасибо за прозрачность.

Когда смотришь предложения других компаний, сложно понять финальную сумму. Здесь сразу видно итог и из чего он складывается.

Это даёт ощущение честности.`,
  },
  {
    id: 'review-8',
    name: 'Ольга С.',
    date: '14 июля 2025',
    service: 'Кремация',
    rating: '5/5',
    headline: 'Поддержали в самый тяжелый момент без лишнего давления',
    text: `Денис, хочу ещё раз сказать спасибо. В тот день я вообще плохо соображала, и если бы не ваши спокойные ответы на мои бесконечные вопросы, я бы просто растерялась. Всё объяснили, ничего не навязывали, дали время подумать. Для меня это было важно.`,
  },
];

const TRUST_REVIEWS_SORTED = [...TRUST_REVIEWS].sort((a, b) => {
  const aLength = a.text.replace(/\s+/g, ' ').trim().length + (a.headline?.length ?? 0);
  const bLength = b.text.replace(/\s+/g, ' ').trim().length + (b.headline?.length ?? 0);
  return bLength - aLength;
});

const TEAM_MEMBERS = [
  {
    id: 'member-1',
    name: 'Михаил',
    role: 'Старший координатор',
    imageSrc: '/team/male-2.jpg',
    description: 'Сопровождаю организационные вопросы и координирую день прощания.',
  },
  {
    id: 'member-2',
name: 'Елена',
    role: 'Координатор',
    imageSrc: '/team/elena-2.jpg',
    description: 'Согласовываю этапы с площадками и веду организацию в спокойном ритме.',
  },
  {
    id: 'member-3',
    name: 'Денис',
    role: 'Координатор',
    imageSrc: '/team/male-1.jpg',
    description: 'Проверяю документы, фиксирую план и держу связь без давления.',
  },
  {
    id: 'member-4',
    name: 'Анна',
    role: 'Координатор',
    imageSrc: '/team/female-1.jpg',
    description: 'Помогаю собрать маршрут церемонии и заранее проверить важные детали.',
  },
  {
    id: 'member-5',
    name: 'Сергей',
    role: 'Координатор',
    imageSrc: '/team/male-3.jpg',
    description: 'Контролирую транспорт и тайминг, чтобы в день прощания всё прошло ровно.',
  },
  {
    id: 'member-6',
    name: 'Ольга',
    role: 'Координатор',
    imageSrc: '/team/female-3.jpg',
    description: 'Подсказываю по документам и остаюсь на связи до полного подтверждения плана.',
  },
  {
    id: 'member-7',
    name: 'Павел',
    role: 'Координатор',
    imageSrc: '/team/male-4.jpg',
    description: 'Помогаю согласовать услуги без спешки и лишних решений.',
  },
  {
    id: 'member-8',
    name: 'Наталья',
    role: 'Координатор',
    imageSrc: '/team/female-4.jpg',
    description: 'Веду коммуникацию с родственниками и фиксирую все договорённости прозрачно.',
  },
] as const;

const TRUST_BLOCK_CARDS = [
  {
    id: 'trust-card-1',
    icon: '🛡️',
    title: 'РЯДОМ',
    text: 'Координатор ведёт весь процесс от начала до конца. На связи 24/7',
  },
  {
    id: 'trust-card-2',
    icon: '📄',
    title: 'ПРОЗРАЧНО',
    text: 'Вы видите итоговую сумму заранее, мы фиксируем её в договоре',
  },
  {
    id: 'trust-card-3',
    icon: '💬',
    title: 'БЕЗ ДАВЛЕНИЯ',
    text: 'Вы сами выбираете формат общения — можно полностью без звонков',
  },
] as const;

const HOT_GUIDE_ARTICLES = [
  {
    id: 'hot-morgue-clothes',
    imageSrc: '/hero-forest.jpg',
    title: 'Одежда и вещи для морга: точный список',
    description:
      'Что нужно передать в морг, в какие сроки и как ничего не забыть в самый тяжелый день.',
    href: '/articles/odezhda-i-veshi-dlya-morga',
  },
  {
    id: 'hot-benefit',
    imageSrc: '/images/hearse-lux.jpg',
    title: 'Как получить пособие?',
    description:
      'Пошаговый маршрут: куда обращаться, какие документы подготовить и как получить выплату.',
    href: '/articles/kak-poluchit-posobie-na-pogrebenie-v-2026-godu',
  },
  {
    id: 'hot-morgue-payments',
    imageSrc: '/heroIMGnew.PNG',
    title: 'Морг требует деньги: за что вы обязаны платить, а за что — нет',
    description:
      'Граница между бесплатными и платными услугами морга и защита от навязанных доплат.',
    href: '/articles/morg-trebuet-dengi',
  },
] as const;

const applyHearseCategoryToCalculator = (
  total: number,
  breakdown: BreakdownSection[],
  formData: { needsHearse?: boolean; hearseCategory?: keyof typeof HEARSE_CATEGORY_PRICE },
) => {
  if (!formData.needsHearse) {
    return { total, breakdown };
  }

  const category =
    (formData.hearseCategory as keyof typeof HEARSE_CATEGORY_PRICE) || 'standard';
  const categoryPrice = HEARSE_CATEGORY_PRICE[category] ?? 0;
  const categoryLabel = HEARSE_CATEGORY_LABELS[category] || 'Стандарт';
  const hearseLabel =
    category === 'standard' ? 'Катафалк' : `Катафалк (${categoryLabel})`;

  let applied = false;
  let deltaTotal = 0;
  const nextBreakdown = breakdown.map((section) => {
    if (section.category !== 'Логистика' || !section.items?.length) return section;

    let hasHearse = false;
    let sectionDelta = 0;
    const items = section.items.map((item) => {
      if (item.name !== 'Катафалк') return item;
      hasHearse = true;
      const prevPrice = typeof item.price === 'number' ? item.price : 0;
      const delta = categoryPrice - prevPrice;
      sectionDelta += delta;
      return {
        ...item,
        name: hearseLabel,
        price: categoryPrice,
      };
    });

    if (!hasHearse) return section;
    applied = true;
    deltaTotal += sectionDelta;
    return { ...section, price: section.price + sectionDelta, items };
  });

  return {
    total: applied ? total + deltaTotal : total,
    breakdown: nextBreakdown,
  };
};

function normalizeRouteStateFromString(search: string): HomeRouteState {
  const searchParams = new URLSearchParams(search);
  const flowParam = searchParams.get('flow');
  const typeParam = searchParams.get('type');
  const stepParam = searchParams.get('step');
  const packageParam = searchParams.get('package');
  const hiwParam = searchParams.get('hiw');
  const ctaParam = searchParams.get('cta');

  const routeFlowRaw =
    flowParam === 'wizard' || flowParam === 'packages' || flowParam === 'how-it-works'
      ? flowParam
      : null;

  return {
    routeFlow: routeFlowRaw ?? (ctaParam === 'start' ? 'wizard' : null),
    routeType:
      typeParam === 'cremation' ? 'cremation' : typeParam === 'burial' ? 'burial' : null,
    routeStep: stepParam ? Math.max(1, Number(stepParam)) : null,
    routeHowItWorksStep: hiwParam ? Math.max(1, Number(hiwParam)) : null,
    routePackage: packageParam ? String(packageParam) : null,
    ctaParam,
  };
}

export default function HomePageClient() {
  const router = useRouter();
  const lastCtaRef = useRef<string | null>(null);
  const teamCarouselRef = useRef<HTMLDivElement | null>(null);
  const teamPauseTimeoutRef = useRef<number | null>(null);
  const teamDragStateRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0 });
  const [isTeamDragging, setIsTeamDragging] = useState(false);
  const [isTeamPaused, setIsTeamPaused] = useState(false);
  const [routeState, setRouteState] = useState<HomeRouteState>(EMPTY_ROUTE_STATE);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const frame = window.requestAnimationFrame(() => {
      setRouteState(normalizeRouteStateFromString(window.location.search));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  const pauseTeamAutoscroll = (resumeDelay = 1500) => {
    setIsTeamPaused(true);
    if (teamPauseTimeoutRef.current) {
      window.clearTimeout(teamPauseTimeoutRef.current);
    }
    if (resumeDelay > 0) {
      teamPauseTimeoutRef.current = window.setTimeout(() => {
        setIsTeamPaused(false);
      }, resumeDelay);
    }
  };

  const resumeTeamAutoscroll = () => {
    if (teamPauseTimeoutRef.current) {
      window.clearTimeout(teamPauseTimeoutRef.current);
    }
    setIsTeamPaused(false);
  };

  useEffect(() => {
    const container = teamCarouselRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        pauseTeamAutoscroll();
        container.scrollLeft += event.deltaY;
        return;
      }

      if (event.deltaX !== 0) {
        pauseTeamAutoscroll();
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const initialFormData = {
    serviceType: 'burial' as 'burial' | 'cremation',
    hasHall: true,
    hallDuration: 30,
    ceremonyType: 'civil',
    confession: '',
    ceremonyOrder: 'civil-first',
    cemetery: '',
    selectedSlot: '',
    needsHearse: true,
    hearseCategory: 'standard' as 'standard' | 'comfort' | 'premium',
    hearseRoute: {
      morgue: true,
      hall: true,
      church: true,
      cemetery: true,
    },
    needsFamilyTransport: false,
    familyTransportSeats: 5,
    distance: '',
    needsPallbearers: true,
    packageType: '' as 'basic' | 'standard' | 'premium' | 'custom' | '',
    selectedAdditionalServices: [] as string[],
    specialRequests: '',
    fullName: '',
    birthDate: '',
    deathDate: '',
    deathCertificate: '',
    relationship: '',
    dataConsent: false,
    clientName: '',
    clientEmail: '',
    userEmail: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isEmergencyChecklistOpen, setIsEmergencyChecklistOpen] = useState(false);
  const [emergencyChecklistScrollRequest, setEmergencyChecklistScrollRequest] = useState(0);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<'standard' | 'comfort' | 'premium'>('standard');
  const trackingSessionId = getTrackingSessionId();
  const calculatorSummary = useMemo(() => {
    const baseTotal = calculateTotal(formData, selectedCemeteryCategory);
    const baseBreakdown = calculateBreakdown(formData, selectedCemeteryCategory);
    return applyHearseCategoryToCalculator(baseTotal, baseBreakdown, formData);
  }, [formData, selectedCemeteryCategory]);

  useEffect(() => {
    const saved = loadSessionDraft(MAIN_DRAFT_KEY);
    if (!saved) return;

    const frame = window.requestAnimationFrame(() => {
      setFormData((current) => ({
        ...current,
        ...saved.formData,
        hearseRoute: {
          ...current.hearseRoute,
          ...((saved.formData.hearseRoute as Partial<typeof current.hearseRoute> | undefined) ?? {}),
        },
        selectedAdditionalServices: Array.isArray(saved.formData.selectedAdditionalServices)
          ? saved.formData.selectedAdditionalServices.filter(
              (item): item is string => typeof item === 'string',
            )
          : [],
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    saveSessionDraft(MAIN_DRAFT_KEY, formData);
  }, [formData]);

  const handleUpdateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as typeof prev);
    if (field === 'serviceType') {
      const type = value === 'cremation' ? 'cremation' : 'burial';
      const flow = modeRef.current;
      if (flow === 'wizard') {
        router.push(`/wizard/${type}/step-${currentStep + 1}`);
      } else if (flow === 'packages') {
        if (selectedPackageSlug) {
          router.push(`/packages/${type}/${selectedPackageSlug}`);
        } else {
          router.push(`/packages/${type}`);
        }
      }
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    if (modeRef.current === 'wizard') {
      const type = formData.serviceType === 'cremation' ? 'cremation' : 'burial';
      router.push(`/wizard/${type}/step-${step + 1}`);
    }
  };

  const modeRef = useRef<'wizard' | 'packages' | null>(null);
  const handleModeChange = (mode: 'wizard' | 'package') => {
    modeRef.current = mode === 'wizard' ? 'wizard' : 'packages';
    trackEvent('mode_selected', { mode, flow: mode }, `${trackingSessionId}:${mode}:mode_selected`);
    const type = formData.serviceType === 'cremation' ? 'cremation' : 'burial';
    if (mode === 'wizard') {
      router.push(`/wizard/${type}/step-${currentStep + 1}`);
    } else {
      if (selectedPackageSlug) {
        router.push(`/packages/${type}/${selectedPackageSlug}`);
      } else {
        router.push(`/packages/${type}`);
      }
    }
  };

  const handleCemeteryCategoryChange = (category: 'standard' | 'comfort' | 'premium') =>
    setSelectedCemeteryCategory(category);
  const { routeFlow, routeType, routeStep, routeHowItWorksStep, routePackage, ctaParam } =
    routeState;

  useEffect(() => {
    if (routeFlow === 'wizard' || routeFlow === 'packages') {
      modeRef.current = routeFlow;
    }
  }, [routeFlow]);

  useEffect(() => {
    if (routeType && routeType !== formData.serviceType) {
      const frame = window.requestAnimationFrame(() => {
        setFormData((current) => ({ ...current, serviceType: routeType }));
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [formData.serviceType, routeType]);

  useEffect(() => {
    if (routeFlow === 'wizard' && routeStep) {
      const nextStep = Math.max(1, routeStep);
      const frame = window.requestAnimationFrame(() => setCurrentStep(nextStep - 1));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [routeFlow, routeStep]);

  useEffect(() => {
    if (routePackage) {
      const frame = window.requestAnimationFrame(() => setSelectedPackageSlug(routePackage));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [routePackage]);

  useEffect(() => {
    if (routeFlow !== 'how-it-works') return;
    const frame = window.requestAnimationFrame(() => {
      setIsEmergencyChecklistOpen(true);
      setEmergencyChecklistScrollRequest((value) => value + 1);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [routeFlow, routeHowItWorksStep]);

  useEffect(() => {
    if (ctaParam && ctaParam !== lastCtaRef.current) {
      lastCtaRef.current = ctaParam;
      if (ctaParam === 'call') {
        window.location.href = 'tel:+79852489425';
      } else if (ctaParam === 'telegram') {
        window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
      }
    }
  }, [ctaParam]);

  const handleOpenEmergencyChecklist = () => {
    setIsEmergencyChecklistOpen((current) => {
      if (current) {
        return false;
      }
      setEmergencyChecklistScrollRequest((value) => value + 1);
      return true;
    });
  };

  return (
    <main className="min-h-screen bg-[#f6f5f3] flex flex-col overflow-x-hidden">
      <div className="flex-1">
        <div className="relative">
          <section className="relative overflow-visible">
            <HeroSection
              isEmergencyChecklistOpen={isEmergencyChecklistOpen}
              onOpenEmergencyChecklist={handleOpenEmergencyChecklist}
            />
            <div className="relative z-20 stepper-overlay-position">
              <StepperWorkflow
                formData={formData}
                onUpdateFormData={handleUpdateFormData}
                onStepChange={handleStepChange}
                onCemeteryCategoryChange={handleCemeteryCategoryChange}
                onModeChange={handleModeChange}
                onOrderConfirmed={setIsOrderConfirmed}
                routeFlow={routeFlow}
                routeType={routeType}
                routeStep={routeStep}
                routePackageSlug={routePackage}
                routeHowItWorksStep={routeHowItWorksStep}
                isEmergencyChecklistOpen={isEmergencyChecklistOpen}
                emergencyChecklistScrollRequest={emergencyChecklistScrollRequest}
                onPackageSelect={(slug) => {
                  setSelectedPackageSlug(slug);
                  const type = formData.serviceType === 'cremation' ? 'cremation' : 'burial';
                  router.push(`/packages/${type}/${slug}`);
                }}
              />
            </div>
          </section>
        </div>
        {currentStep === 2 && (
          <div id="packages">
            <PackagesSection formData={formData} onUpdateFormData={handleUpdateFormData} />
          </div>
        )}
        <section className="mt-12 md:mt-16 mb-12 md:mb-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <p className="mb-4 max-w-full whitespace-normal break-words text-[clamp(15px,3.8vw,22px)] font-semibold leading-snug tracking-[-0.02em] text-gray-900 [text-wrap:balance]">
                Михаил Семенов, старший координатор сервиса «Тихий дом»:
              </p>
              <div className="flex flex-row items-start gap-3 md:gap-4">
                <Image
                  src="/team/male-2(bg).PNG"
                  alt="Денис, старший координатор сервиса Тихий дом"
                  width={220}
                  height={260}
                  className="-mt-1 h-[120px] w-[96px] shrink-0 rounded-xl object-cover object-top md:-mt-2 md:h-[260px] md:w-[220px]"
                />
                <div className="min-w-0 flex-1 border-l border-gray-200 pl-3">
                  <p className="whitespace-normal break-words text-sm leading-relaxed text-gray-700 md:text-base">
                    «Каждый день мы видим, как люди теряются, сталкиваясь с системой моргов и кладбищ. Моя личная задача и задача моей команды — забрать у вас этот стресс. Мы создали «Тихий дом» для того, чтобы в самые тяжелые дни вы могли сфокусироваться на семье и памяти о близком, а не на спорах с грузчиками и поиске правильных справок. Я лично гарантирую, что мы проведем прощание достойно и честно».
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                Кто будет вам помогать
              </h2>
                <p className="text-base leading-relaxed text-gray-700">
                  {widontRu('За каждой заявкой в «Тихом доме» стоит не робот, а ваш личный координатор. Мы берем на себя всю бюрократию и защиту от скрытых наценок.')}
                </p>
              </div>
            <div className="relative left-1/2 right-1/2 mt-5 w-screen -ml-[50vw] -mr-[50vw]">
              <div className="px-2 sm:px-3 md:px-4">
                <div
                  ref={teamCarouselRef}
                  onMouseEnter={() => pauseTeamAutoscroll(0)}
                  onMouseDown={(event) => {
                    const container = teamCarouselRef.current;
                    if (!container) return;
                    teamDragStateRef.current = {
                      isDown: true,
                      startX: event.clientX,
                      startScrollLeft: container.scrollLeft,
                    };
                    setIsTeamDragging(true);
                    pauseTeamAutoscroll(0);
                  }}
                  onMouseMove={(event) => {
                    const container = teamCarouselRef.current;
                    if (!container || !teamDragStateRef.current.isDown) return;
                    event.preventDefault();
                    pauseTeamAutoscroll(0);
                    const delta = event.clientX - teamDragStateRef.current.startX;
                    container.scrollLeft = teamDragStateRef.current.startScrollLeft - delta;
                  }}
                  onMouseUp={() => {
                    teamDragStateRef.current.isDown = false;
                    setIsTeamDragging(false);
                    pauseTeamAutoscroll(800);
                  }}
                  onMouseLeave={() => {
                    teamDragStateRef.current.isDown = false;
                    setIsTeamDragging(false);
                    resumeTeamAutoscroll();
                  }}
                  onTouchStart={() => {
                    pauseTeamAutoscroll(0);
                  }}
                  onTouchMove={() => {
                    pauseTeamAutoscroll(0);
                  }}
                  onTouchEnd={() => {
                    pauseTeamAutoscroll(800);
                  }}
                  onPointerDown={() => {
                    pauseTeamAutoscroll(0);
                  }}
                  className={`overflow-x-auto overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isTeamDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                  <div className={`flex w-max gap-2.5 py-1 md:gap-3 coordinatorMarqueeTrack${isTeamPaused ? ' isPaused' : ''}`}>
                    <div className="flex gap-2.5 md:gap-3">
                      {TEAM_MEMBERS.map((member) => (
                        <article
                          key={`${member.id}-set-1`}
                          className="w-[148px] rounded-xl border border-gray-200 bg-white p-2 shadow-sm md:w-[164px]"
                        >
                          {/* TODO: replace with real photo */}
                          <div className="relative aspect-[3/5] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <Image
                              src={member.imageSrc}
                              alt={`${member.name}, ${member.role}`}
                              fill
                              sizes="(max-width: 768px) 148px, 164px"
                              className="object-cover"
                            />
                          </div>
                          <div className="mt-2 text-sm font-semibold text-gray-900 leading-tight">
                            {widontRu(`${member.name} — ${member.role.toLowerCase()}`)}
                          </div>
                          <p className="mt-1.5 text-sm leading-snug text-gray-700">
                            {widontRu(member.description)}
                          </p>
                        </article>
                      ))}
                    </div>
                    <div className="flex gap-2.5 md:gap-3" aria-hidden="true">
                      {TEAM_MEMBERS.map((member) => (
                        <article
                          key={`${member.id}-set-2`}
                          className="w-[148px] rounded-xl border border-gray-200 bg-white p-2 shadow-sm md:w-[164px]"
                        >
                          {/* TODO: replace with real photo */}
                          <div className="relative aspect-[3/5] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <Image
                              src={member.imageSrc}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 148px, 164px"
                              className="object-cover"
                            />
                          </div>
                          <div className="mt-2 text-sm font-semibold text-gray-900 leading-tight">
                            {widontRu(`${member.name} — ${member.role.toLowerCase()}`)}
                          </div>
                          <p className="mt-1.5 text-sm leading-snug text-gray-700">
                            {widontRu(member.description)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                Написать дежурному координатору
              </a>
            </div>

            <div className="mt-10 flex flex-col gap-8">
            <section className="order-2">
              <div className="grid gap-4 md:grid-cols-3">
                {TRUST_BLOCK_CARDS.map((card) => (
                  <article
                    key={card.id}
                    className="rounded-[28px] border border-zinc-200/80 bg-white px-5 py-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] md:px-7 md:py-7"
                  >
                    <h3 className="max-w-full whitespace-nowrap text-[clamp(24px,6vw,38px)] font-black uppercase leading-none tracking-[-0.05em] text-[#1794FD] md:text-[clamp(18px,2vw,30px)]">
                      {widontRu(card.title)}
                    </h3>
                    <p className="mt-7 max-w-[22ch] text-[15px] font-medium leading-[1.35] text-[#24364a] md:mt-8 md:text-[18px]">
                      {widontRu(card.text)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <div className="order-1 flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Отзывы клиентов</h2>
              <p className="text-base text-gray-600">
                {widontRu('Реальный опыт клиентов: что получилось, что волновало и как всё прошло в итоге.')}
              </p>
            </div>
            <div className="order-1 mt-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max items-start gap-4 pb-1">
              {TRUST_REVIEWS_SORTED.map((review) => (
                <div
                  key={review.id}
                  className="relative h-fit w-[340px] shrink-0 self-start rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:w-[390px] lg:w-[420px] xl:w-[460px]"
                >
                  <div className="absolute right-4 top-4 rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-sm font-semibold text-gray-700">
                    {review.rating}
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-base font-semibold text-gray-900">{widontRu(review.name)}</div>
                      <div className="text-sm text-gray-600">
                        {widontRu(`${review.date} · ${review.service}`)}
                      </div>
                    </div>
                  </div>
                  {review.headline ? (
                    <p className="mt-3 mb-2 text-base font-bold text-gray-900">
                      {widontRu(review.headline)}
                    </p>
                  ) : null}
                  <p className="text-base text-gray-700 leading-relaxed">{widontRu(review.text)}</p>
                </div>
              ))}
              </div>
            </div>
            </div>

            <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Ответы на сложные вопросы
                </h2>
                <p className="mt-1 text-base leading-relaxed text-gray-600">
                  
                </p>
              </div>

              <div className="mt-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-x-visible md:overflow-y-visible">
                <div className="flex w-max gap-4 pb-1 md:grid md:w-full md:grid-cols-3 md:justify-items-center md:pb-0">
                {HOT_GUIDE_ARTICLES.map((article) => (
                  <Link
                    key={article.id}
                    href={article.href}
                    className="w-[280px] max-w-[320px] shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[320px] sm:max-w-[360px] md:min-w-0 md:shrink md:w-full md:max-w-[230px] lg:max-w-[270px] xl:max-w-[300px] md:break-words"
                  >
                    <h3 className="text-base font-semibold leading-snug text-gray-900">
                      {widontRu(article.title)}
                    </h3>
                    <div className="relative mt-3 h-28 overflow-hidden rounded-xl sm:h-32">
                      <Image
                        src={article.imageSrc}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 300px"
                      />
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-gray-700">
                      {widontRu(article.description)}
                    </p>
                  </Link>
                ))}
                </div>
              </div>

              <div className="mt-5 flex justify-center">
                <Link
                  href="/articles"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  Перейти в справочник
                </Link>
              </div>
            </section>
          </div>
        </section>
        {currentStep >= 1 && !isOrderConfirmed && (
          <FloatingCalculator total={calculatorSummary.total} breakdown={calculatorSummary.breakdown} />
        )}
      </div>
    </main>
  );
}
