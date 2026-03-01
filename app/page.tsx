'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeroSection } from './components/HeroSection';
import { StepperWorkflow } from './components/StepperWorkflow';
import { PackagesSection } from './components/PackagesSection';
import { FloatingCalculator } from './components/FloatingCalculator';
import { Footer } from './components/Footer';

import {
  calculateTotal,
  calculateBreakdown,
  getTrackingSessionId,
  trackEvent,
} from './components/calculationUtils';
import { TELEGRAM_URL } from '../lib/legalLinks';
import { Menu, X } from 'lucide-react';

type BreakdownItem = { name: string; price?: number };
type BreakdownSection = { category: string; price: number; items?: BreakdownItem[] };

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
    name: 'Оксана Т.',
    date: '11 февраля 2026',
    service: 'Захоронение',
    rating: '5/5',
    text: `Смерть произошла дома поздно вечером. Сначала была скорая, потом полиция, всё очень долго. Ночью почти не спали. Утром нужно было уже решать, что дальше, а я не понимала даже, какие документы должны быть на руках. Через сайт удалось спокойно собрать базовый вариант. Хорошо, что можно было не принимать все решения сразу. Отдельный момент — паспорт. Нам его забрали для оформления, и я переживала, что что-то потеряется. В итоге всё выдали корректно, данные проверили заранее, в документах ошибок не было. В день прощания всё прошло без накладок. Транспорт приехал вовремя, на кладбище никаких доплат на месте не возникло. Это было важно, потому что сил спорить уже не было. Не скажу, что это было легко. Но по крайней мере организационная часть прошла спокойно и предсказуемо. В такой ситуации это многое значит.`,
  },
  {
    id: 'review-2',
    name: 'Марина С.',
    date: '03 февраля 2026',
    service: 'Кремация',
    rating: '4.9/5',
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
    text: `Если кто-то хоть раз сталкивался с нашими моргами, тот знает, что с ними общий язык не найти. В конце года хоронил отца, так мне тупо тело не отдавали. Мол хороните через нас и все. Насчитали мне космическую сумму за их услуги. Начал искать другие варианты, сравнил цены, разница оказалась ощутимой. Рассказал ребятам из тихого дома про конфликт с моргом, сказали не я первый. В итоге сами разобрались с моргом, похороны организовали, прошло без заминок.`,
  },
  {
    id: 'review-5',
    name: 'Елена М.',
    date: '03 декабря 2025',
    service: 'Организация церемонии',
    rating: '5/5',
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
    text: `Спасибо за прозрачность.

Когда смотришь предложения других компаний, сложно понять финальную сумму. Здесь сразу видно итог и из чего он складывается.

Это даёт ощущение честности.`,
  },
  {
    id: 'review-8',
    name: 'Ольга С.',
    date: '14 июля 2025',
    service: 'Кремация',
    rating: '4.9/5',
    text: `Денис, хочу ещё раз сказать спасибо. В тот день я вообще плохо соображала, и если бы не ваши спокойные ответы на мои бесконечные вопросы, я бы просто растерялась. Всё объяснили, ничего не навязывали, дали время подумать. Для меня это было важно.`,
  },
];

const TEAM_MEMBERS = [
  {
    id: 'member-1',
    name: 'Михаил',
    role: 'Координатор',
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

const TRUST_METRICS = [
  { label: 'Средняя оценка', value: '4.9/5' },
  { label: 'Рекомендации', value: '97%' },
  { label: 'Обращений в месяц', value: '120+' },
  { label: 'Срок подтверждения', value: 'от 30 минут' },
];

const TRUST_RATINGS = [
  { label: 'Яндекс Карты', url: 'https://yandex.ru/maps' },
  { label: 'Google', url: 'https://www.google.com/maps' },
  { label: '2ГИС', url: 'https://2gis.ru' },
];

const TRUST_LEGAL = [
  'ИП Пачулия Ричард Гарегинович',
  'ИНН: 773438344967',
  'ОГРНИП: 323774600033021',
  'Лицензии: при необходимости предоставляются по запросу',
];

const TRUST_PARTNERS = [
  'Митинский крематорий',
  'Николо-Архангельский крематорий',
  'Хованский крематорий',
  'Кладбища Москвы и МО',
  
];

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

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastCtaRef = useRef<string | null>(null);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [isDesktopNav, setIsDesktopNav] = useState(false);
  const teamCarouselRef = useRef<HTMLDivElement | null>(null);
  const teamFirstSetRef = useRef<HTMLDivElement | null>(null);
  const teamSetWidthRef = useRef(0);
  const teamPauseTimeoutRef = useRef<number | null>(null);
  const teamIsInteractingRef = useRef(false);
  const teamDragStateRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0 });
  const [isTeamDragging, setIsTeamDragging] = useState(false);

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

  const pauseTeamAutoscroll = () => {
    teamIsInteractingRef.current = true;
    if (teamPauseTimeoutRef.current) {
      window.clearTimeout(teamPauseTimeoutRef.current);
    }
    teamPauseTimeoutRef.current = window.setTimeout(() => {
      teamIsInteractingRef.current = false;
    }, 1500);
  };

  useEffect(() => {
    const firstSet = teamFirstSetRef.current;
    const container = teamCarouselRef.current;
    if (!firstSet || !container) return;

    const updateSetWidth = () => {
      const measured = firstSet.scrollWidth || Math.round(firstSet.getBoundingClientRect().width);
      teamSetWidthRef.current = measured;
    };

    updateSetWidth();
    container.scrollLeft = 1;
    const raf = window.requestAnimationFrame(updateSetWidth);
    const timeout = window.setTimeout(updateSetWidth, 250);
    window.addEventListener('resize', updateSetWidth);
    window.addEventListener('orientationchange', updateSetWidth);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSetWidth();
      });
      resizeObserver.observe(firstSet);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener('resize', updateSetWidth);
      window.removeEventListener('orientationchange', updateSetWidth);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = teamCarouselRef.current;
    if (!container) return;

    let rafId = 0;
    let lastTs = performance.now();
    const speedPxPerMs = 0.05;

    const animate = (ts: number) => {
      const dt = ts - lastTs;
      lastTs = ts;

      if (!teamIsInteractingRef.current) {
        let setWidth = teamSetWidthRef.current;
        if (setWidth <= 0 && teamFirstSetRef.current) {
          setWidth =
            teamFirstSetRef.current.scrollWidth
            || Math.round(teamFirstSetRef.current.getBoundingClientRect().width);
          teamSetWidthRef.current = setWidth;
        }
        if (setWidth > 0) {
          container.scrollLeft += dt * speedPxPerMs;

          if (container.scrollLeft >= setWidth) {
            container.scrollLeft -= setWidth;
          } else if (container.scrollLeft < 0) {
            container.scrollLeft += setWidth;
          }
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (teamPauseTimeoutRef.current) {
        window.clearTimeout(teamPauseTimeoutRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    const originalWorkerPostMessage = Worker.prototype.postMessage;
    const originalPortPostMessage = MessagePort.prototype.postMessage;

    const safePostMessage = (originalMethod: Function, instance: any, args: any[]) => {
      try {
        if (args[0]) {
          try {
            const dataStr = JSON.stringify(args[0]);
            if (dataStr.length > 5_000_000) {
              console.warn('Suppressed postMessage: data too large', dataStr.length);
              return;
            }
          } catch {
            console.warn('Suppressed postMessage: cannot stringify data');
            return;
          }
        }
        return originalMethod.apply(instance, args);
      } catch (error) {
        console.warn(
          'Suppressed postMessage error:',
          error instanceof Error ? error.message : error,
        );
        return;
      }
    };

    Worker.prototype.postMessage = function (...args) {
      return safePostMessage(originalWorkerPostMessage, this, args);
    };

    MessagePort.prototype.postMessage = function (...args) {
      return safePostMessage(originalPortPostMessage, this, args);
    };

    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes('DataCloneError') ||
          event.message.includes('postMessage') ||
          event.message.includes('hls.js') ||
          event.message.includes('out of memory') ||
          event.message.includes('esm.sh/hls') ||
          event.message.includes('cannot be cloned') ||
          event.message.includes('DedicatedWorkerGlobalScope'))
      ) {
        console.warn('Intercepted and suppressed worker error:', event.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      if (
        event.error instanceof Error &&
        (event.error.name === 'DataCloneError' ||
          event.error.message.includes('out of memory') ||
          event.error.message.includes('cannot be cloned'))
      ) {
        console.warn('Intercepted worker error object:', event.error.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      if (
        message &&
        (message.includes('DataCloneError') ||
          message.includes('postMessage') ||
          message.includes('hls.js') ||
          message.includes('out of memory') ||
          message.includes('esm.sh/hls') ||
          message.includes('cannot be cloned') ||
          message.includes('DedicatedWorkerGlobalScope'))
      ) {
        console.warn('Intercepted and suppressed worker promise rejection:', message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      Worker.prototype.postMessage = originalWorkerPostMessage;
      MessagePort.prototype.postMessage = originalPortPostMessage;
    };
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
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<'standard' | 'comfort' | 'premium'>('standard');
  const trackingSessionId = getTrackingSessionId();
  const calculatorSummary = useMemo(() => {
    const baseTotal = calculateTotal(formData, selectedCemeteryCategory);
    const baseBreakdown = calculateBreakdown(formData, selectedCemeteryCategory);
    return applyHearseCategoryToCalculator(baseTotal, baseBreakdown, formData);
  }, [formData, selectedCemeteryCategory]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('funeral-workflow-draft');
      if (saved) {
        if (saved.length > 1000000) {
          console.warn('Saved draft too large, removing...');
          localStorage.removeItem('funeral-workflow-draft');
          return;
        }

        try {
          const parsed = JSON.parse(saved);
          const loadedFormData = {
            ...initialFormData,
            ...parsed.formData,
            hearseRoute: {
              ...initialFormData.hearseRoute,
              ...(parsed.formData.hearseRoute || {}),
            },
            selectedAdditionalServices: parsed.formData.selectedAdditionalServices || [],
            birthDate: parsed.formData.birthDate === '—' ? '' : parsed.formData.birthDate,
            deathDate: parsed.formData.deathDate === '—' ? '' : parsed.formData.deathDate,
          };
          setFormData(loadedFormData);
        } catch (e) {
          console.error('Failed to parse draft:', e);
          localStorage.removeItem('funeral-workflow-draft');
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
      try {
        localStorage.removeItem('funeral-workflow-draft');
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const draft = { formData, savedAt: new Date().toISOString() };
      const draftString = JSON.stringify(draft);

      if (draftString.length > 500000) {
        console.warn('Draft too large, skipping save');
        return;
      }

      localStorage.setItem('funeral-workflow-draft', draftString);
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  }, [formData]);

  const handleUpdateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'serviceType') {
      const type = value === 'cremation' ? 'cremation' : 'burial';
      const flow = searchParams.get('flow');
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
  const routeFlow = routeFlowRaw ?? (ctaParam === 'start' ? 'wizard' : null);
  const routeType =
    typeParam === 'cremation' ? 'cremation' : typeParam === 'burial' ? 'burial' : null;
  const routeStep = stepParam ? Math.max(1, Number(stepParam)) : null;
  const routeHowItWorksStep = hiwParam ? Math.max(1, Number(hiwParam)) : null;
  const routePackage = packageParam ? String(packageParam) : null;

  useEffect(() => {
    if (routeFlow === 'wizard' || routeFlow === 'packages') {
      modeRef.current = routeFlow;
    }
  }, [routeFlow]);

  useEffect(() => {
    if (routeType && routeType !== formData.serviceType) {
      handleUpdateFormData('serviceType', routeType);
    }
  }, [routeType]);

  useEffect(() => {
    if (routeFlow === 'wizard' && routeStep) {
      const nextStep = Math.max(1, routeStep);
      setCurrentStep(nextStep - 1);
    }
  }, [routeFlow, routeStep]);

  useEffect(() => {
    if (routePackage) {
      setSelectedPackageSlug(routePackage);
    }
  }, [routePackage]);

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

  useEffect(() => {
    if (!topMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTopMenuOpen(false);
    };
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [topMenuOpen]);

  const handleTopContacts = () => {
    setTopMenuOpen(false);
    const contactsEl = document.getElementById("contacts");
    if (!contactsEl) return;
    contactsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    contactsEl.setAttribute("data-highlight", "true");
    window.setTimeout(() => {
      contactsEl.setAttribute("data-highlight", "false");
    }, 1500);
  };

  const handleTopOpenPackages = () => {
    setTopMenuOpen(false);
    window.dispatchEvent(new Event("td:open-packages"));
    window.setTimeout(() => {
      const packagesEl = document.getElementById("packages");
      packagesEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const topNavItems: Array<
    | { id: string; label: string; href: string }
    | { id: string; label: string; onClick: () => void }
  > = [
    { id: 'faq', label: 'Частые вопросы', href: '/faq' },
    { id: 'contacts', label: 'Контакты', onClick: handleTopContacts },
    { id: 'articles', label: 'Статьи', href: '/articles' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 768px)');
    const applyMediaState = (matches: boolean) => {
      setIsDesktopNav(matches);
      if (matches) setTopMenuOpen(false);
    };
    const handleMediaChange = (event: MediaQueryListEvent) => {
      applyMediaState(event.matches);
    };
    applyMediaState(media.matches);
    media.addEventListener('change', handleMediaChange);
    return () => media.removeEventListener('change', handleMediaChange);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 w-full bg-white">
        <div className="w-full px-6 sm:px-7">
          <div className="flex h-16 w-full items-center gap-4">
            <Link
              href="/"
              onClick={() => setTopMenuOpen(false)}
              className="mr-0 inline-flex shrink-0 items-center gap-3 text-gray-900 transition hover:text-gray-700"
            >
              <Image
                src="/logo.PNG"
                alt="Тихий дом"
                width={33}
                height={33}
                className="h-[33px] w-[33px] rounded-[7px]"
              />
              <span className="inline-flex h-[33px] items-center text-2xl leading-none font-semibold">
                Тихий дом
              </span>
            </Link>
            {isDesktopNav ? (
              <nav
                className="ml-auto flex items-center justify-end gap-6"
                style={{ marginRight: 0 }}
              >
                {topNavItems.map((item) =>
                  'href' in item ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="text-sm font-medium text-gray-700 transition hover:text-black whitespace-nowrap"
                      style={{ marginRight: 0 }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className="text-sm font-medium text-gray-700 transition hover:text-black whitespace-nowrap"
                      style={{ marginRight: 0 }}
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </nav>
            ) : (
              <button
                type="button"
                onClick={() => setTopMenuOpen((prev) => !prev)}
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/60 text-gray-700 shadow-sm transition hover:bg-white/85"
                aria-expanded={topMenuOpen}
                aria-label="Открыть меню"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      {topMenuOpen && !isDesktopNav && (
        <div className="fixed inset-0 z-[9999] transition-opacity duration-300">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setTopMenuOpen(false)}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
          />
          <div className="relative mx-auto w-full max-w-7xl px-4 transition-all duration-300 ease-out translate-y-0">
            <div className="min-h-[230px] rounded-b-3xl border border-white/45 bg-white/95 px-5 pb-6 pt-5 shadow-[0_24px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setTopMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-base font-semibold text-gray-900 transition hover:text-gray-700"
                >
                  <Image
                    src="/logo.PNG"
                    alt="Тихий дом"
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] rounded-[5px]"
                  />
                  <span>Тихий дом</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setTopMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 shadow-sm transition hover:bg-white"
                  aria-label="Закрыть меню"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-5 flex flex-col gap-1">
                {topNavItems.map((item) =>
                  'href' in item ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setTopMenuOpen(false)}
                      className="rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-100/80"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className="rounded-xl px-3 py-3 text-left text-base font-medium text-gray-800 transition hover:bg-gray-100/80"
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </nav>
              <div className="mt-4 grid gap-2">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTopMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#63ADEC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ED]"
                >
                  Написать координатору
                </a>
                <button
                  type="button"
                  onClick={handleTopOpenPackages}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Рассчитать стоимость
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">
        <div className="relative">
          <section className="relative z-0 overflow-visible">
            <HeroSection />
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
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                Кто будет вам помогать
              </h2>
            </div>
            <div className="relative left-1/2 right-1/2 mt-5 w-screen -ml-[50vw] -mr-[50vw]">
              <div className="px-2 sm:px-3 md:px-4">
                <div
                  ref={teamCarouselRef}
                  onMouseDown={(event) => {
                    const container = teamCarouselRef.current;
                    if (!container) return;
                    teamDragStateRef.current = {
                      isDown: true,
                      startX: event.clientX,
                      startScrollLeft: container.scrollLeft,
                    };
                    setIsTeamDragging(true);
                    pauseTeamAutoscroll();
                  }}
                  onMouseMove={(event) => {
                    const container = teamCarouselRef.current;
                    if (!container || !teamDragStateRef.current.isDown) return;
                    event.preventDefault();
                    pauseTeamAutoscroll();
                    const delta = event.clientX - teamDragStateRef.current.startX;
                    container.scrollLeft = teamDragStateRef.current.startScrollLeft - delta;
                  }}
                  onMouseUp={() => {
                    teamDragStateRef.current.isDown = false;
                    setIsTeamDragging(false);
                  }}
                  onMouseLeave={() => {
                    teamDragStateRef.current.isDown = false;
                    setIsTeamDragging(false);
                  }}
                  onTouchStart={() => {
                    pauseTeamAutoscroll();
                  }}
                  onTouchMove={() => {
                    pauseTeamAutoscroll();
                  }}
                  onTouchEnd={() => {
                    pauseTeamAutoscroll();
                  }}
                  onPointerDown={() => {
                    pauseTeamAutoscroll();
                  }}
                  className={`overflow-x-auto overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isTeamDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                  <div className="flex w-max gap-2.5 py-1 md:gap-3">
                    <div ref={teamFirstSetRef} className="flex gap-2.5 md:gap-3">
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
                          <div className="mt-2 text-[13px] font-semibold text-gray-900 leading-tight">
                            {member.name} — {member.role.toLowerCase()}
                          </div>
                          <p className="mt-1.5 text-[11px] leading-snug text-gray-600">
                            {member.description}
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
                          <div className="mt-2 text-[13px] font-semibold text-gray-900 leading-tight">
                            {member.name} — {member.role.toLowerCase()}
                          </div>
                          <p className="mt-1.5 text-[11px] leading-snug text-gray-600">
                            {member.description}
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
                className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                Написать дежурному координатору
              </a>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Почему нам доверяют</h2>
              <p className="text-sm text-gray-500 md:text-base">
                Реальный опыт клиентов: что получилось, что волновало и как всё прошло в итоге.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {TRUST_REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="absolute right-4 top-4 rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {review.rating}
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{review.name}</div>
                      <div className="text-xs text-gray-500">
                        {review.date} · {review.service}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {currentStep >= 1 && !isOrderConfirmed && (
          <FloatingCalculator total={calculatorSummary.total} breakdown={calculatorSummary.breakdown} />
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
