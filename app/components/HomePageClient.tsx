'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeroSection } from './HeroSection';
import { StepperWorkflow } from './StepperWorkflow';
import { PackagesSection } from './PackagesSection';
import { FloatingCalculator } from './FloatingCalculator';
import { cn } from './ui/utils';

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

const COORDINATOR_STAGES = [
  {
    id: 'before',
    title: 'До прощания',
    text: 'Сверяет документы, подтверждает место, транспорт и время.',
  },
  {
    id: 'ceremony',
    title: 'В день прощания',
    text: 'Следит за таймингом и решает организационные вопросы на месте.',
  },
  {
    id: 'after',
    title: 'После',
    text: 'Передаёт документы и остаётся на связи по следующим шагам.',
  },
] as const;

const SUPPORT_TEAM = [
  {
    id: 'support-elena',
    name: 'Елена',
    role: 'Площадки и церемония',
    imageSrc: '/team/elena-2.jpg',
    description: 'Проверяет доступность залов и площадок, согласует время и требования к церемонии.',
  },
  {
    id: 'support-denis',
    name: 'Денис',
    role: 'Документы и смета',
    imageSrc: '/team/male-1.jpg',
    description: 'Сверяет документы, договор и смету, чтобы состав и стоимость были понятны заранее.',
  },
  {
    id: 'support-anna',
    name: 'Анна',
    role: 'Маршрут прощания',
    imageSrc: '/team/female-1.jpg',
    description: 'Собирает маршрут между моргом, местом прощания и кладбищем, сообщает об изменениях.',
  },
  {
    id: 'support-sergey',
    name: 'Сергей',
    role: 'Транспорт и тайминг',
    imageSrc: '/team/male-3.jpg',
    description: 'Координирует катафалк, транспорт для близких и время подачи машин.',
  },
] as const;

const RESPONSIBILITY_CARDS = [
  {
    id: 'responsibility-service',
    number: '01',
    title: 'МЫ ОРГАНИЗУЕМ',
    text: 'Берём на себя согласованные задачи и контролируем исполнение.',
    items: ['Документы и морг', 'Место и транспорт', 'Подрядчики и тайминг'],
  },
  {
    id: 'responsibility-family',
    number: '02',
    title: 'ВЫ РЕШАЕТЕ',
    text: 'Мы объясняем варианты, окончательное решение остаётся за вами.',
    items: ['Формат прощания', 'Состав услуг', 'Итоговую сумму'],
  },
  {
    id: 'responsibility-consent',
    number: '03',
    title: 'ВСЁ СОГЛАСОВЫВАЕМ',
    text: 'Состав услуг и стоимость меняются только после вашего подтверждения.',
    items: ['Новые услуги', 'Изменение цены', 'Замена выбранного варианта'],
  },
] as const;

const TRUST_PROOFS = [
  {
    id: 'proof-contract',
    number: '01',
    title: 'Договор заранее',
    text: 'Состав заказа и условия доступны до подтверждения и оплаты.',
    href: '/docs/oferta',
    linkLabel: 'Открыть оферту',
  },
  {
    id: 'proof-estimate',
    number: '02',
    title: 'Фиксированная смета',
    text: 'Итоговая сумма и согласованный состав услуг закрепляются в договоре.',
    href: null,
    linkLabel: null,
  },
  {
    id: 'proof-details',
    number: '03',
    title: 'Реквизиты на сайте',
    text: 'ИНН 773438344967 · ОГРНИП 323774600033021',
    href: null,
    linkLabel: null,
  },
  {
    id: 'proof-payment',
    number: '04',
    title: 'Оплата и возврат',
    text: 'Порядок оплаты и условия возврата опубликованы заранее.',
    href: '/docs/payment-rules',
    linkLabel: 'Правила оплаты',
  },
] as const;

const HOT_GUIDE_ARTICLES = [
  {
    id: 'hot-morgue-clothes',
    label: 'Перед моргом',
    title: 'Одежда и вещи для морга: точный список',
    question: 'Что подготовить в первые часы?',
    description:
      'Что нужно передать в морг, в какие сроки и как ничего не забыть в самый тяжелый день.',
    href: '/articles/odezhda-i-veshi-dlya-morga',
  },
  {
    id: 'hot-benefit',
    label: 'Деньги и документы',
    title: 'Как получить пособие?',
    question: 'Какие выплаты можно получить?',
    description:
      'Пошаговый маршрут: куда обращаться, какие документы подготовить и как получить выплату.',
    href: '/articles/kak-poluchit-posobie-na-pogrebenie-v-2026-godu',
  },
  {
    id: 'hot-morgue-payments',
    label: 'Защита от доплат',
    title: 'Морг требует деньги: за что вы обязаны платить, а за что — нет',
    question: 'Где граница между обязательным и навязанным?',
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
  const [selectedSupportMemberId, setSelectedSupportMemberId] = useState<string | null>(null);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<'standard' | 'comfort' | 'premium'>('standard');
  const selectedSupportMemberIndex = selectedSupportMemberId
    ? SUPPORT_TEAM.findIndex((member) => member.id === selectedSupportMemberId)
    : -1;
  const selectedSupportMember =
    selectedSupportMemberIndex >= 0 ? SUPPORT_TEAM[selectedSupportMemberIndex] ?? null : null;
  const showPreviousSupportMember = () => {
    setSelectedSupportMemberId((currentId) => {
      const currentIndex = SUPPORT_TEAM.findIndex((member) => member.id === currentId);
      const nextIndex =
        currentIndex <= 0 ? SUPPORT_TEAM.length - 1 : currentIndex - 1;
      return SUPPORT_TEAM[nextIndex].id;
    });
  };
  const showNextSupportMember = () => {
    setSelectedSupportMemberId((currentId) => {
      const currentIndex = SUPPORT_TEAM.findIndex((member) => member.id === currentId);
      const nextIndex =
        currentIndex < 0 || currentIndex >= SUPPORT_TEAM.length - 1 ? 0 : currentIndex + 1;
      return SUPPORT_TEAM[nextIndex].id;
    });
  };
  const trackingSessionId = getTrackingSessionId();
  const calculatorSummary = useMemo(() => {
    const baseTotal = calculateTotal(formData, selectedCemeteryCategory);
    const baseBreakdown = calculateBreakdown(formData, selectedCemeteryCategory);
    return applyHearseCategoryToCalculator(baseTotal, baseBreakdown, formData);
  }, [formData, selectedCemeteryCategory]);

  useEffect(() => {
    if (!selectedSupportMember) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSupportMemberId(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        setSelectedSupportMemberId((currentId) => {
          const currentIndex = SUPPORT_TEAM.findIndex((member) => member.id === currentId);
          const nextIndex =
            currentIndex <= 0 ? SUPPORT_TEAM.length - 1 : currentIndex - 1;
          return SUPPORT_TEAM[nextIndex].id;
        });
        return;
      }
      if (event.key === 'ArrowRight') {
        setSelectedSupportMemberId((currentId) => {
          const currentIndex = SUPPORT_TEAM.findIndex((member) => member.id === currentId);
          const nextIndex =
            currentIndex < 0 || currentIndex >= SUPPORT_TEAM.length - 1 ? 0 : currentIndex + 1;
          return SUPPORT_TEAM[nextIndex].id;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSupportMember]);

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
            <section aria-labelledby="coordinator-heading">
              <div className="flex max-w-3xl flex-col gap-2">
                <h2 id="coordinator-heading" className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Один координатор на всём пути
                </h2>
                <p className="text-base leading-relaxed text-gray-700">
                  {widontRu('После подтверждения плана все вопросы можно решать с одним человеком. Координатор знает вашу ситуацию, согласованный состав услуг и остаётся на связи до завершения прощания.')}
                </p>
              </div>

              <article className="mt-5 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="relative min-h-[260px] overflow-hidden bg-[#eef0f2] md:min-h-full">
                    <Image
                      src="/team/male-2(bg).PNG"
                      alt="Михаил Семенов, старший координатор сервиса Тихий дом"
                      fill
                      sizes="(max-width: 768px) 100vw, 220px"
                      className="object-contain object-bottom"
                    />
                  </div>
                  <div className="min-w-0 px-5 py-6 md:px-7 md:py-7">
                    <div className="text-[14px] font-semibold leading-snug text-gray-600">
                      Михаил Семенов · старший координатор
                    </div>
                    <p className="mt-4 max-w-3xl text-[17px] font-medium leading-relaxed text-[#24364a] md:text-xl">
                      {widontRu('«Моя задача — заранее проверить договорённости, скоординировать участников и спокойно провести семью через весь процесс».')}
                    </p>

                    <div className="mt-6 grid border-t border-zinc-200 md:grid-cols-3">
                      {COORDINATOR_STAGES.map((stage, index) => (
                        <div
                          key={stage.id}
                          className={`py-4 md:px-4 md:py-5 ${index > 0 ? 'border-t border-zinc-200 md:border-l md:border-t-0' : ''} ${index === 0 ? 'md:pl-0' : ''}`}
                        >
                          <h3 className="text-sm font-semibold text-gray-900">{stage.title}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                            {widontRu(stage.text)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-zinc-200 pt-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Команда рядом</h3>
                          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
                            Координатор остаётся вашим основным контактом, а коллеги помогают ему с документами, площадками, маршрутом и транспортом.
                          </p>
                        </div>
                        <a
                          href={TELEGRAM_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[13px] border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/30"
                        >
                          Написать координатору
                        </a>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                        {SUPPORT_TEAM.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded={selectedSupportMemberId === member.id}
                            aria-controls="support-member-details"
                            onClick={() => setSelectedSupportMemberId(member.id)}
                            className={cn(
                              "flex min-h-[72px] min-w-0 items-center gap-2.5 rounded-[14px] p-2.5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35",
                              selectedSupportMemberId === member.id
                                ? "bg-[#eef7ff] shadow-[inset_0_0_0_1.5px_#1794FD,0_4px_12px_rgba(23,148,253,0.08)]"
                                : "bg-[#f9f9f9] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-white",
                            )}
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#eef0f2]">
                              <Image
                                src={member.imageSrc}
                                alt={`${member.name}, команда сервиса Тихий дом`}
                                fill
                                sizes="48px"
                                className="object-cover object-top"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold leading-tight text-gray-900">
                                {member.name}
                              </div>
                              <div className="mt-1 text-[14px] leading-snug text-gray-600">
                                {widontRu(member.role)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-10" aria-labelledby="responsibility-heading">
              <div className="flex max-w-3xl flex-col gap-2">
                <h2 id="responsibility-heading" className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Зона ответственности
                </h2>
                <p className="text-base leading-relaxed text-gray-700">
                  Вы заранее знаете, какие задачи берём на себя и какие решения остаются за вами.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {RESPONSIBILITY_CARDS.map((card) => (
                  <article
                    key={card.id}
                    className="flex min-h-full flex-col rounded-[28px] border border-zinc-200/80 bg-white px-5 py-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] md:px-7 md:py-7"
                  >
                    <div className="text-[11px] font-semibold tracking-[0.18em] text-gray-400">
                      {card.number}
                    </div>
                    <h3 className="mt-5 break-words text-[clamp(24px,5vw,34px)] font-black uppercase leading-[0.95] tracking-[-0.05em] text-[#1794FD] md:text-[clamp(21px,2vw,30px)]">
                      {widontRu(card.title)}
                    </h3>
                    <p className="mt-6 max-w-[25ch] text-[15px] font-medium leading-[1.4] text-[#24364a] md:text-[17px]">
                      {widontRu(card.text)}
                    </p>
                    <ul className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm leading-snug text-gray-700">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1794FD]" aria-hidden="true" />
                          <span>{widontRu(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section
              className="mt-10 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
              aria-labelledby="trust-heading"
            >
              <div className="border-b border-zinc-200 px-5 py-6 md:px-7 md:py-7">
                <h2 id="trust-heading" className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Проверяемое доверие
                </h2>
                <p className="mt-2 max-w-3xl text-base leading-relaxed text-gray-700">
                  Важные условия можно проверить заранее: договор, смету, реквизиты и правила оплаты.
                </p>
              </div>

              <div className="grid md:grid-cols-2">
                {TRUST_PROOFS.map((proof, index) => (
                  <article
                    key={proof.id}
                    className={`px-5 py-6 md:px-7 md:py-7 ${index > 0 ? 'border-t border-zinc-200' : ''} ${index % 2 === 1 ? 'md:border-l' : ''} ${index === 1 ? 'md:border-t-0' : ''}`}
                  >
                    <div className="text-[11px] font-semibold tracking-[0.18em] text-[#1794FD]">
                      {proof.number}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">{proof.title}</h3>
                    <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-gray-600">
                      {widontRu(proof.text)}
                    </p>
                    {proof.href && proof.linkLabel ? (
                      <Link
                        href={proof.href}
                        className="mt-4 inline-flex min-h-11 items-center border-b border-gray-300 text-sm font-semibold text-gray-900 transition hover:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/30"
                      >
                        {proof.linkLabel}
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-200 bg-[#f9f9f9] px-5 py-4 text-sm md:px-7">
                <Link href="/docs/refund" className="inline-flex min-h-11 items-center font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-700">
                  Политика возврата
                </Link>
                <Link href="/info" className="inline-flex min-h-11 items-center font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-700">
                  Политика конфиденциальности
                </Link>
              </div>
            </section>

            <section className="mt-10" aria-labelledby="reviews-heading">
              <div className="flex flex-col gap-2">
                <h2 id="reviews-heading" className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Отзывы клиентов
                </h2>
                <p className="text-base text-gray-600">
                  {widontRu('Что волновало семьи, как проходила организация и что получилось в итоге.')}
                </p>
              </div>

              <div className="mt-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max items-start gap-4 pb-1">
                  {TRUST_REVIEWS_SORTED.map((review) => (
                    <article
                      key={review.id}
                      className="h-fit w-[340px] shrink-0 self-start rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:w-[390px] lg:w-[420px] xl:w-[460px]"
                    >
                      <div className="text-base font-semibold text-gray-900">{widontRu(review.name)}</div>
                      <div className="text-sm text-gray-600">
                        {widontRu(`${review.date} · ${review.service}`)}
                      </div>
                      {review.headline ? (
                        <p className="mb-2 mt-3 text-base font-bold text-gray-900">
                          {widontRu(review.headline)}
                        </p>
                      ) : null}
                      <p className="text-base leading-relaxed text-gray-700">{widontRu(review.text)}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-10 overflow-hidden rounded-[30px] bg-[#f7f7f4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
              <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
                <div className="flex flex-col justify-between gap-8 p-5 md:p-7">
                  <div>
                    <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Справочник
                    </div>
                    <h2 className="mt-3 max-w-[12em] text-2xl font-semibold leading-tight tracking-[-0.02em] text-gray-900 md:text-3xl">
                      Ответы на сложные вопросы
                    </h2>
                    <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-gray-700">
                      {widontRu('Когда нужно быстро понять порядок действий, лучше читать короткую инструкцию, а не искать ответы по разным сайтам.')}
                    </p>
                  </div>

                  <Link
                    href="/articles"
                    className="inline-flex min-h-11 w-fit items-center justify-center rounded-[13px] bg-gray-950 px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.16),0_8px_18px_rgba(0,0,0,0.12)] transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
                  >
                    Открыть весь справочник
                  </Link>
                </div>

                <div className="min-w-0 border-t border-zinc-200 bg-white lg:border-l lg:border-t-0">
                  <Link
                    href={HOT_GUIDE_ARTICLES[0].href}
                    className="group block p-5 transition hover:bg-[#fbfbfa] md:p-7"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-snug text-gray-500">
                          {HOT_GUIDE_ARTICLES[0].label}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.01em] text-gray-900 md:text-2xl">
                          {widontRu(HOT_GUIDE_ARTICLES[0].question)}
                        </h3>
                        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-gray-700">
                          {widontRu(HOT_GUIDE_ARTICLES[0].description)}
                        </p>
                      </div>
                      <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[12px] bg-[#f4f4f2] px-3 text-sm font-semibold text-gray-900 transition group-hover:bg-[#ececea]">
                        Читать
                      </span>
                    </div>
                  </Link>

                  <div className="border-t border-zinc-200">
                    {HOT_GUIDE_ARTICLES.slice(1).map((article) => (
                      <Link
                        key={article.id}
                        href={article.href}
                        className="group grid gap-3 border-b border-zinc-200 px-5 py-4 transition last:border-b-0 hover:bg-[#fbfbfa] md:grid-cols-[150px_minmax(0,1fr)_auto] md:items-center md:px-7"
                      >
                        <div className="text-[13px] font-semibold leading-snug text-gray-500">
                          {article.label}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[16px] font-semibold leading-snug text-gray-900">
                            {widontRu(article.question)}
                          </h3>
                          <p className="mt-1 text-[14px] leading-relaxed text-gray-600">
                            {widontRu(article.title)}
                          </p>
                        </div>
                        <span className="text-[14px] font-semibold text-gray-500 transition group-hover:text-gray-900">
                          Читать
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
        {currentStep >= 1 && !isOrderConfirmed && (
          <FloatingCalculator total={calculatorSummary.total} breakdown={calculatorSummary.breakdown} />
        )}
      </div>
      {selectedSupportMember ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(3,7,18,0.34)] px-3 pb-3 pt-10 backdrop-blur-[2px] sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSupportMemberId(null);
            }
          }}
        >
          <section
            id="support-member-details"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-member-title"
            className="teamDialogEnter w-full max-w-[520px] overflow-hidden rounded-[26px] bg-[#fbfbf9] shadow-[0_24px_70px_rgba(15,23,42,0.26),0_0_0_1px_rgba(255,255,255,0.72)]"
          >
            <div className="relative h-[300px] bg-[#eef0f2] sm:h-[340px]">
              <Image
                src={selectedSupportMember.imageSrc}
                alt={`${selectedSupportMember.name}, команда сервиса Тихий дом`}
                fill
                sizes="(max-width: 640px) 100vw, 520px"
                className="object-contain object-center p-3 sm:p-4"
                priority={false}
              />
              <button
                type="button"
                onClick={() => setSelectedSupportMemberId(null)}
                aria-label="Закрыть карточку участника команды"
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-2xl leading-none text-gray-700 shadow-[0_2px_10px_rgba(15,23,42,0.16)] transition-[background-color,color,transform] duration-150 hover:bg-white hover:text-gray-950 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Команда рядом
                  </div>
                  <h3
                    id="support-member-title"
                    className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-gray-900"
                  >
                    {selectedSupportMember.name}
                  </h3>
                  <p className="mt-1 text-[15px] font-medium leading-snug text-gray-600">
                    {widontRu(selectedSupportMember.role)}
                  </p>
                </div>
                <div className="shrink-0 pt-1 text-[13px] font-semibold tabular-nums text-gray-500">
                  {selectedSupportMemberIndex + 1} / {SUPPORT_TEAM.length}
                </div>
              </div>

              <p className="mt-4 text-[16px] leading-relaxed text-gray-700">
                {widontRu(selectedSupportMember.description)}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                <button
                  type="button"
                  onClick={showPreviousSupportMember}
                  aria-label="Показать предыдущего участника команды"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-white px-4 text-sm font-semibold text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition-[background-color,transform] duration-150 hover:bg-[#f2f2f0] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
                >
                  <span aria-hidden="true">←</span>
                  Назад
                </button>
                <button
                  type="button"
                  onClick={showNextSupportMember}
                  aria-label="Показать следующего участника команды"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-gray-950 px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(15,23,42,0.18)] transition-[background-color,transform] duration-150 hover:bg-gray-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                >
                  Далее
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
