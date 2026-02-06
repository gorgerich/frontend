'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
import { HelpCircle, Menu } from 'lucide-react';
import { TopSearch, TopTelegramButton } from './components/TopButtons';

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
    name: 'Ирина П.',
    date: '12.12.2025',
    service: 'Захоронение',
    text:
      'Очень аккуратный и спокойный процесс. Всё объяснили, помогли с документами и организацией. Спасибо за тактичность.',
    photo: '/avatar.jpg',
  },
  {
    id: 'review-2',
    name: 'Алексей Н.',
    date: '03.02.2025',
    service: 'Кремация',
    text:
      'Быстро согласовали детали, всё прошло без лишних звонков. Понравилась прозрачность по стоимости.',
    photo: '/avatar.jpg',
  },
  {
    id: 'review-3',
    name: 'Марина С.',
    date: '27.10.2024',
    service: 'Организация церемонии',
    text:
      'Поддержка 24/7 — действительно работает. Координатор был на связи и помогал с мелочами.',
    photo: '/avatar.jpg',
  },
];

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
  const topMenuRef = useRef<HTMLDivElement | null>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (!topMenuRef.current) return;
      if (!topMenuRef.current.contains(event.target as Node)) {
        setTopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTopFaq = () => {
    const faqButton = document.getElementById('td-faq-button') as HTMLButtonElement | null;
    if (faqButton) {
      faqButton.click();
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 w-full">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="flex h-12 w-full items-center justify-between gap-3 rounded-3xl md:rounded-[40px] border border-gray-200 bg-gray-100/90 backdrop-blur overflow-hidden px-2 sm:px-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTopFaq}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-300 bg-white/70 px-3 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-white"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden md:inline">Частые вопросы</span>
              </button>
              <TopSearch />
            </div>
            <div className="relative flex items-center gap-3" ref={topMenuRef}>
              <TopTelegramButton className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-300 bg-white/70 px-3 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-white [&>span]:hidden md:[&>span]:inline" />
              <button
                type="button"
                onClick={() => setTopMenuOpen((prev) => !prev)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-300 bg-white/70 px-3 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-white"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden md:inline">Меню</span>
              </button>
              {topMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  {[
                    { label: 'План действий', href: '#how-it-works' },
                    { label: 'Тариф/настройка', href: '#packages' },
                    { label: 'Частые вопросы', href: '#faq' },
                    { label: 'Контакты', href: '#contacts' },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setTopMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
        <section className="mt-12 md:mt-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Нам доверяют</h2>
              <p className="text-sm text-gray-500 md:text-base">
                Реальные отзывы клиентов, показатели качества и партнёры.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {TRUST_REVIEWS.map((review) => (
                <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.photo}
                      alt={review.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{review.name}</div>
                      <div className="text-xs text-gray-500">{review.date} · {review.service}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Показатели качества</div>
                <div className="mt-3 grid gap-2">
                  {TRUST_METRICS.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between text-sm text-gray-600">
                      <span>{metric.label}</span>
                      <span className="font-semibold text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Мы работаем с</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {TRUST_PARTNERS.map((partner) => (
                  <div
                    key={partner}
                    className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600"
                  >
                    {partner}
                  </div>
                ))}
              </div>
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
