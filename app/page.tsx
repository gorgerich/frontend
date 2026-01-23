'use client';

import { useEffect, useMemo, useState } from 'react';
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

type BreakdownItem = { name: string; price?: number };
type BreakdownSection = { category: string; price: number; items?: BreakdownItem[] };
const HERO_BG_SRC = "/hero-forest.jpg";

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

export default function Home() {
// Глобальный обработчик ошибок для предотвращения краша из-за hls.js и других внешних библиотек
useEffect(() => {
// В Next это должно быть внутри useEffect, чтобы не ломать SSR/сборку
const originalWorkerPostMessage = Worker.prototype.postMessage;
const originalPortPostMessage = MessagePort.prototype.postMessage;

const safePostMessage = (originalMethod: Function, instance: any, args: any[]) => {
try {
if (args[0]) {
try {
const dataStr = JSON.stringify(args[0]);
if (dataStr.length > 5000000) {
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
console.warn('Suppressed postMessage error:', error instanceof Error ? error.message : error);
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

// Принудительный скролл к началу при первой загрузке
useEffect(() => {
window.scrollTo(0, 0);
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
    hearseCategory: "standard" as "standard" | "comfort" | "premium",
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
// eslint-disable-next-line react-hooks/exhaustive-deps
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
};

const handleStepChange = (step: number) => setCurrentStep(step);
const handleModeChange = (mode: 'wizard' | 'package') => {
trackEvent(
  'mode_selected',
  { mode, flow: mode },
  `${trackingSessionId}:${mode}:mode_selected`,
);
};
const handleCemeteryCategoryChange = (category: 'standard' | 'comfort' | 'premium') =>
setSelectedCemeteryCategory(category);

return (
<main className="min-h-screen bg-white pt-8 flex flex-col">
{/* ВЕСЬ КОНТЕНТ */}
<div className="flex-1">
<div className="relative">
  <div className="pointer-events-none absolute inset-0 -z-10 md:hidden">
    <div
      className="absolute inset-0"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, rgba(0,0,0,1) 120px, rgba(0,0,0,1) 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, rgba(0,0,0,1) 120px, rgba(0,0,0,1) 100%)",
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center blur-[8px] scale-[1.05]"
        style={{ backgroundImage: `url(${HERO_BG_SRC})` }}
      />
      <div className="absolute inset-0 bg-black/35 md:bg-black/20" />
    </div>
  </div>

  <HeroSection />

  <div className="relative z-20 stepper-overlay-position">
    <StepperWorkflow
      formData={formData}
      onUpdateFormData={handleUpdateFormData}
      onStepChange={handleStepChange}
      onCemeteryCategoryChange={handleCemeteryCategoryChange}
      onModeChange={handleModeChange}
      onOrderConfirmed={setIsOrderConfirmed}
    />
  </div>

  {currentStep === 2 && (
    <PackagesSection formData={formData} onUpdateFormData={handleUpdateFormData} />
  )}
</div>
{currentStep >= 1 && !isOrderConfirmed && (
<FloatingCalculator
total={calculatorSummary.total}
breakdown={calculatorSummary.breakdown}
/>
)}
</div>

</main>
);
}
