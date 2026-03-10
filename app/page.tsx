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

const TRUST_BLOCK_CARDS = [
  {
    id: 'trust-card-1',
    icon: '🛡️',
    title: 'Единый организатор, а не биржа заявок',
    text: 'Мы не передаем ваш номер телефона сторонним агентствам или случайным ритуальщикам. За вами закрепляется личный координатор «Тихого дома». Он управляет всем процессом — от морга до транспорта',
  },
  {
    id: 'trust-card-2',
    icon: '📄',
    title: 'Юридическая фиксация сметы',
    text: 'Никаких переводов на личные карты и внезапных доплат наличными в морге. После согласования плана мы присылаем вам официальный договор. Итоговая сумма замораживается. Оплата проходит через защищенный банковский шлюз с выдачей электронного чека.',
  },
  {
    id: 'trust-card-3',
    icon: '💬',
    title: 'Право на тишину и ваше расписание',
    text: 'Ритуальная сфера часто ассоциируется с агрессивными продажами и постоянными звонками. У нас вы можете выбрать формат «Общаться только текстом в чате». Никто не будет вас торопить, навязывать ненужные услуги или тревожить в моменты, когда вы хотите побыть с близкими.',
  },
] as const;

const HOT_GUIDE_ARTICLES = [
  {
    id: 'hot-morgue-clothes',
    title: 'Одежда и вещи для морга: точный список',
    description:
      'Что нужно передать в морг, в какие сроки и как ничего не забыть в самый тяжелый день.',
    href: '/articles/odezhda-i-veshi-dlya-morga',
  },
  {
    id: 'hot-benefit',
    title: 'Как получить пособие?',
    description:
      'Пошаговый маршрут: куда обращаться, какие документы подготовить и как получить выплату.',
    href: '/articles/kak-poluchit-posobie-na-pogrebenie-v-2026-godu',
  },
  {
    id: 'hot-morgue-payments',
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

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastCtaRef = useRef<string | null>(null);
  const teamCarouselRef = useRef<HTMLDivElement | null>(null);
  const teamPauseTimeoutRef = useRef<number | null>(null);
  const teamDragStateRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0 });
  const [isTeamDragging, setIsTeamDragging] = useState(false);
  const [isTeamPaused, setIsTeamPaused] = useState(false);

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

  return (
    <main className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <div className="flex-1">
        <div className="relative">
          <section className="relative overflow-visible">
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
            <div className="mt-6 bg-white">
              <p className="mb-3 whitespace-nowrap text-[clamp(9px,2.6vw,14px)] font-medium leading-tight tracking-[-0.02em] text-gray-900">
                Михаил Семенов, старший координатор сервиса «Тихий дом»:
              </p>
              <div className="flex flex-row items-start gap-3 md:gap-4">
                <Image
                  src="/team/male-2(bg).PNG"
                  alt="Денис, старший координатор сервиса Тихий дом"
                  width={220}
                  height={260}
                  className="h-[120px] w-[96px] shrink-0 rounded-xl object-cover md:h-[260px] md:w-[220px]"
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
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                За каждой заявкой в «Тихом доме» стоит не робот, а ваш личный координатор. Мы берем на себя всю бюрократию и защиту от скрытых наценок.
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

            <section className="mt-10 rounded-3xl border border-gray-200 bg-[#f6f6f4] p-5 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Почему нам доверяют</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">
                Наша цель — не просто оказать услугу, а стать вашим щитом от бюрократии, скрытых наценок и давления в дни прощания.
              </p>

              <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-3">
                {TRUST_BLOCK_CARDS.map((card) => (
                  <article
                    key={card.id}
                    className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base leading-none shrink-0" aria-hidden="true">
                        {card.icon}
                      </span>
                      <h3 className="min-w-0 flex-1 whitespace-nowrap text-[clamp(11px,3.2vw,16px)] font-semibold leading-none tracking-[-0.01em] text-gray-900">
                        {card.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {card.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Ответы на сложные вопросы
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 md:text-base">
                  
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
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {article.description}
                    </p>
                  </Link>
                ))}
                </div>
              </div>

              <div className="mt-5 flex justify-center">
                <Link
                  href="/articles"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  Перейти в справочник
                </Link>
              </div>
            </section>

            <div className="mt-8 flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Отзывы клиентов</h2>
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
                  {review.headline ? (
                    <p className="mt-3 mb-2 text-sm font-bold text-gray-900">
                      {review.headline}
                    </p>
                  ) : null}
                  <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
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
