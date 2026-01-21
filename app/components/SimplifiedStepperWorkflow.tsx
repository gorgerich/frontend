"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Stepper } from "./Stepper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import ContractButton from "./ContractButton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  ChevronDown as FloatingChevronDown,
  ChevronUp as FloatingChevronUp,
  Download,
  Share2,
} from "./Icons";
import {
ArrowLeft,
Check,
CheckCircle2,
ChevronDown,
ChevronLeft,
ChevronRight,
Church,
Car,
FileText,
Package,
Clock,
} from "lucide-react";
import { cn } from "./ui/utils";
import { SimpleCalendar } from "./SimpleCalendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { buildOrderSummary } from "@/lib/orderSummary";
import {
calculateOrder,
type CalculatorConfig,
type FormData as CalculatorFormData,
PRICES,
ADDITIONAL_SERVICES,
trackEvent,
getTrackingSessionId,
} from "./calculationUtils";

import type { ImgHTMLAttributes } from "react";

const YM_COUNTER_ID = 106219376;

const reachMetrikaGoal = (goal: string, params?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  const ymFn = (window as any).ym;
  if (typeof ymFn !== "function") return;
  try {
    ymFn(YM_COUNTER_ID, "reachGoal", goal, params);
  } catch (_) {
    // best-effort: ignore analytics failures
  }
};

function SafeImg(
  props: ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }
) {

  const { fallbackSrc, ...rest } = props;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      {...rest}
      onError={(e) => {
        if (!fallbackSrc) return;
        const target = e.currentTarget;
        if (target.src !== fallbackSrc) target.src = fallbackSrc;
      }}
    />
  );
}

type SimplifiedBreakdownItem = {
  name: string;
  price?: number;
};

type SimplifiedBreakdownSection = {
  category: string;
  price: number;
  items?: SimplifiedBreakdownItem[];
};

type SimplifiedFloatingCalculatorProps = {
  total: number;
  breakdown: SimplifiedBreakdownSection[];
  flow: "package";
  trackingSessionId: string;
};

function SimplifiedFloatingCalculator({
  total,
  breakdown,
  flow,
  trackingSessionId,
}: SimplifiedFloatingCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const portalRoot = typeof document !== "undefined" ? document.body : null;

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
    trackEvent(
      "calculator_shared",
      { method: "pdf", flow },
      `${trackingSessionId}:${flow}:calculator_shared:pdf`,
    );
  };

  const handleShare = () => {
    console.log("Sharing...");
    trackEvent(
      "calculator_shared",
      { method: "messenger", flow },
      `${trackingSessionId}:${flow}:calculator_shared:messenger`,
    );
  };

  if (!portalRoot) return null;

  return createPortal(
    <div
      data-simplified-floating="true"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-300 ease-out"
    >
      <Card className="bg-[#eef5f5]/80 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden rounded-[32px] ring-1 ring-white/50">
        <CardContent
          className={cn(
            "relative z-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            isExpanded ? "p-6" : "p-4"
          )}
        >
          <div
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              !isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
            )}
          >
            {/* Закрытое состояние */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 drop-shadow-sm">
                  Итого
                </span>
                <span className="text-2xl font-light text-slate-800 tracking-tight tabular-nums drop-shadow-sm">
                  {total.toLocaleString("ru-RU")}{" "}
                  <span className="text-base text-slate-400">₽</span>
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#fff] to-[#eef5f5] text-slate-600 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-white/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1)] active:scale-95"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <FloatingChevronUp className="h-6 w-6 drop-shadow-sm text-slate-700" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
            )}
          >
            {/* Открытое состояние */}
            <div className="space-y-5">
              {/* Заголовок */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <h3 className="text-sm font-bold text-slate-700 tracking-widest uppercase drop-shadow-sm">
                  Детализация
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 rounded-full bg-white/40 hover:bg-white/80 flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 backdrop-blur-sm border border-white/50 shadow-sm"
                >
                  <FloatingChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Список разбивки */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-400/50">
                {breakdown.map((section, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 border border-white/50 hover:border-white/80 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl ring-1 ring-white/40 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:scale-[1.01]"
                  >
                    {/* Категория */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[15px] text-slate-700 font-semibold tracking-wide group-hover:text-slate-900 transition-colors">
                        {section.category}
                      </span>
                      <span className="text-[15px] text-slate-700 font-semibold tabular-nums bg-white/50 px-2 py-0.5 rounded-lg shadow-sm border border-white/50">
                        {section.price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>

                    {/* Подпункты */}
                    {section.items && section.items.length > 0 && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/60">
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-start justify-between text-sm text-slate-500 group-hover:text-slate-600 transition-colors"
                          >
                            <span className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50 mt-2 shrink-0 shadow-[0_0_8px_rgba(148,163,184,0.5)]" />
                              <span className="leading-relaxed font-medium">{item.name}</span>
                            </span>
                            {item.price !== undefined && (
                              <span className="ml-3 whitespace-nowrap tabular-nums opacity-70 font-medium">
                                {item.price.toLocaleString("ru-RU")} ₽
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Итого */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-200/60">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest drop-shadow-sm">
                  Итого к оплате
                </span>
                <span className="text-3xl font-light text-slate-800 tabular-nums drop-shadow-sm">
                  {total.toLocaleString("ru-RU")}{" "}
                  <span className="text-lg text-slate-400 font-thin">₽</span>
                </span>
              </div>

              {/* Кнопки действий */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 border-white/60 bg-white/40 hover:bg-white/60 text-slate-600 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ring-1 ring-white/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Download className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity text-slate-700" />
                  <span>PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 border-white/60 bg-white/40 hover:bg-white/60 text-slate-600 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ring-1 ring-white/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Share2 className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity text-slate-700" />
                  <span>Поделиться</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    portalRoot
  );
}


// Упрощенные шаги для готовых решений
const simplifiedSteps = [
{ id: "attributes", label: "Атрибутика", description: "Персонализация" },
{ id: "format", label: "Формат", description: "Тип церемонии" },
{ id: "logistics", label: "Логистика", description: "Место и время" },
{ id: "documents", label: "Документы", description: "Основная информация" },
{ id: "confirmation", label: "Подтверждение", description: "Проверка данных" },
];

// Справочник кладбищ и крематориев
interface CemeteryData {
id: string;
name: string;
type: "cemetery" | "crematorium" | "both";
district: string;
address: string;
categories: {
standard?: number;
comfort?: number;
premium?: number;
};
hasColumbarium?: boolean;
working: boolean;
}

const MOSCOW_CEMETERIES: CemeteryData[] = [
{
id: "khovanskoe-south",
name: "Хованское кладбище (Южное)",
type: "cemetery",
district: "ЮЗАО",
address: "ул. Поляны, вл. 42",
categories: { standard: 100000, comfort: 200000, premium: 300000 },
working: true,
},
{
id: "troyekurovskoye",
name: "Троекуровское кладбище",
type: "cemetery",
district: "ЗАО",
address: "Рябиновая ул., вл. 28А",
categories: { standard: 120000, comfort: 220000, premium: 350000 },
hasColumbarium: true,
working: true,
},
{
id: "mitinskoye",
name: "Митинское кладбище",
type: "cemetery",
district: "СЗАО",
address: "Пятницкое шоссе, 6-й км",
categories: { standard: 100000, comfort: 200000, premium: 300000 },
hasColumbarium: true,
working: true,
},
{
id: "nikolo-arhangelskoe",
name: "Николо-Архангельское кладбище",
type: "both",
district: "ЗАО",
address: "д. Сабурово, ул. Центральная, вл. 21",
categories: { standard: 100000, comfort: 200000, premium: 300000 },
hasColumbarium: true,
working: true,
},
{
id: "crematorium-nikolo",
name: "Николо-Архангельский крематорий",
type: "crematorium",
district: "ЗАО",
address: "д. Сабурово, ул. Центральная, вл. 21",
categories: { standard: 15000, comfort: 25000, premium: 40000 },
hasColumbarium: true,
working: true,
},
{
id: "crematorium-mitino",
name: "Митинский крематорий",
type: "crematorium",
district: "СЗАО",
address: "Пятницкое шоссе, 6-й км",
categories: { standard: 15000, comfort: 25000, premium: 40000 },
hasColumbarium: true,
working: true,
},
{
id: "crematorium-khovansky",
name: "Хованский крематорий",
type: "crematorium",
district: "ЮЗАО",
address: "ул. Поляны, вл. 42",
categories: { standard: 15000, comfort: 25000, premium: 40000 },
hasColumbarium: true,
working: true,
},
];

const MO_CEMETERIES: CemeteryData[] = [
{
id: "mytishchinskoe",
name: "Мытищинское кладбище (Волковское)",
type: "cemetery",
district: "Мытищинский р-н",
address: "Волковское шоссе, вл. 1",
categories: { standard: 80000, comfort: 150000, premium: 250000 },
working: true,
},
{
id: "krasnogorskoe",
name: "Красногорское кладбище",
type: "cemetery",
district: "Красногорский р-н",
address: "г. Красногорск, Ильинское шоссе, 1",
categories: { standard: 85000, comfort: 160000, premium: 260000 },
working: true,
},
];

// Опции для цвета внутренней отделки
const liningOptions = [
  {
    id: "satin-white",
    name: "Атлас белый",
    description: "Классическая белая отделка",
    price: 0,
    texture: "/images/coffin/fabric/atlas-white.jpg",
  },
  {
    id: "silk-cream",
    name: "Шелк кремовый",
    description: "Премиальная шелковая ткань",
    price: 0,
    texture: "/images/coffin/fabric/silk-cream.jpg",
  },
  {
    id: "velvet-burgundy",
    name: "Бархат бордовый",
    description: "Роскошный бархат",
    price: 0,
    texture: "/images/coffin/fabric/velvet-bordo.jpg",
  },
];


const COFFIN_PHOTOS: Record<string, string> = {
  // pine
  "pine-satin-white": "/coffins/pine/pine-atlas.jpg",
  "pine-silk-cream": "/coffins/pine/pine-silk-cream.jpg",
  "pine-velvet-burgundy": "/coffins/pine/pine-velvet-burgundy.jpg",

  // oak
  "oak-satin-white": "/coffins/oak/oak-satin-white.jpg",
  "oak-silk-cream": "/coffins/oak/oak-silk-cream.jpg",
  "oak-velvet-burgundy": "/coffins/oak/oak-velvet-burgundy.jpg",

  // elite
  "elite-satin-white": "/coffins/elite/elite-satin-white.jpg",
  "elite-silk-cream": "/coffins/elite/elite-silk-cream.jpg",
  "elite-velvet-burgundy": "/coffins/elite/elite-velvet-burgundy.jpg",
};



const PACKAGE_TO_MATERIAL: Record<string, "pine" | "oak" | "elite"> = {
  base: "pine",
  standard: "pine",
  comfort: "oak",
  premium: "elite",
};

const LINING_LABELS: Record<string, { title: string; subtitle?: string }> = {
  "satin-white": {
    title: "Атлас белый",
    subtitle: "Классическая светлая отделка",
  },
  "silk-cream": {
    title: "Шёлк кремовый",
    subtitle: "Тёплый благородный оттенок",
  },
  "velvet-burgundy": {
    title: "Бархат бордовый",
    subtitle: "Глубокий насыщенный цвет",
  },
};


type HearseRoute = {
morgue: boolean;
hall: boolean;
church: boolean;
cemetery: boolean;
};

type FormDataShape = {
serviceType: string; // "burial" | "cremation" (но у тебя строка)
hasHall: boolean;
hallDuration?: number;
ceremonyType: string; // "civil" | "religious" | "combined"
confession: string;
ceremonyOrder: string;
cemetery: string;
hearseRoute: HearseRoute;
needsPallbearers: boolean;
specialRequests: string;
fullName: string;
birthDate: string;
deathDate: string;
deathCertificate: string;
relationship: string;
dataConsent: boolean;
userEmail: string;
paymentPlan?: "full" | "deposit" | "split";
paidNowRub?: string;
splitSchedule?: string;
liningColor?: string;
pickupDateTime?: { date?: string | Date; timeSlot?: TimeSlot; time?: string };
farewellDateTime?: { date?: string | Date; timeSlot?: TimeSlot; time?: string };
burialDateTime?: { date?: string | Date; timeSlot?: TimeSlot; time?: string };
};

type PaymentMethod = "card" | "sbp" | "transfer";

interface SimplifiedStepperWorkflowProps {
selectedPackage: {
id: string;
name: string;
price: number;
description: string;
features: string[];
};
onBack: () => void;
formData: FormDataShape | undefined;
onUpdateFormData: (field: string, value: any) => void;
}

const DEFAULT_FORM_DATA: FormDataShape = {
serviceType: "",
hasHall: true,
hallDuration: 60,
ceremonyType: "",
confession: "",
ceremonyOrder: "",
cemetery: "",
hearseRoute: { morgue: true, hall: true, church: true, cemetery: true },
needsPallbearers: false,
specialRequests: "",
fullName: "",
birthDate: "",
deathDate: "",
deathCertificate: "",
relationship: "",
dataConsent: false,
userEmail: "",
liningColor: "satin-white",
};

const SIMPLIFIED_FORM_STORAGE_KEY = "TIHIYDOM_SIMPLIFIED_FORM_V1";

type TimeSlot = "morning" | "afternoon" | "evening" | "night";

const TIME_SLOT_OPTIONS: Array<{ id: TimeSlot; label: string; range: string }> = [
  { id: "morning", label: "Первая половина дня", range: "09:00–13:00" },
  { id: "afternoon", label: "Вторая половина дня", range: "13:00–17:00" },
  { id: "evening", label: "Вечер", range: "17:00–21:00" },
  { id: "night", label: "Ночь", range: "21:00–09:00" },
];

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Первая половина дня",
  afternoon: "Вторая половина дня",
  evening: "Вечер",
  night: "Ночь",
};

const TIME_SLOT_IDS = new Set<TimeSlot>(TIME_SLOT_OPTIONS.map((slot) => slot.id));

const inferTimeSlotFromTime = (time?: string): TimeSlot | undefined => {
  if (!time) return undefined;
  const [h] = time.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour)) return undefined;
  if (hour >= 21 || hour < 9) return "night";
  if (hour >= 17) return "evening";
  if (hour >= 13) return "afternoon";
  if (hour >= 9) return "morning";
  return "night";
};

const normalizeDateTimeSlot = (
  value?: { date?: string | Date; timeSlot?: TimeSlot; time?: string },
) => {
  const rawDate = value?.date;
  const parsedDate =
    rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : undefined;
  const date =
    parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;
  const timeSlot =
    value?.timeSlot && TIME_SLOT_IDS.has(value.timeSlot)
      ? value.timeSlot
      : inferTimeSlotFromTime(value?.time);
  return { date, timeSlot };
};

const formatDateTimeSlot = (dt: { date?: Date; timeSlot?: TimeSlot }) =>
  dt.date && dt.timeSlot
    ? `${dt.date.toLocaleDateString("ru-RU")} — ${TIME_SLOT_LABELS[dt.timeSlot]}`
    : "—";

export function SimplifiedStepperWorkflow({
selectedPackage,
onBack,
formData,
onUpdateFormData,
}: SimplifiedStepperWorkflowProps) {
const containerRef = useRef<HTMLDivElement>(null);

const [currentStep, setCurrentStep] = useState(0);
const [completedSteps, setCompletedSteps] = useState<number[]>([]);
const [isTransitioning, setIsTransitioning] = useState(false);

const [showConsentError, setShowConsentError] = useState(false);

const isInitialMountRef = useRef(true);
const previousStepRef = useRef(0);
const wizardStartedRef = useRef(false);
const attributesStartedRef = useRef(false);
const logisticsStartedRef = useRef(false);
const documentsStartedRef = useRef(false);
const calculatorViewedRef = useRef(false);
const contactsStartedRef = useRef(false);
const trackingSessionId = getTrackingSessionId();
const trackingFlow: "package" = "package";

const [localFormData, setLocalFormData] = useState<FormDataShape>(() => {
  if (typeof window === "undefined") return DEFAULT_FORM_DATA;
  try {
    const saved = localStorage.getItem(SIMPLIFIED_FORM_STORAGE_KEY);
    if (!saved) return DEFAULT_FORM_DATA;
    const parsed = JSON.parse(saved);
    const data = parsed?.formData ?? parsed;
    return {
      ...DEFAULT_FORM_DATA,
      ...(data || {}),
      hearseRoute: {
        ...DEFAULT_FORM_DATA.hearseRoute,
        ...(data?.hearseRoute || {}),
      },
    };
  } catch {
    return DEFAULT_FORM_DATA;
  }
});

// ВСЕГДА безопасный объект для рендера (главное исправление: ВСЕГДА использовать его в JSX)
const safeFormData: FormDataShape = localFormData ?? DEFAULT_FORM_DATA;
const lastPayPlanRef = useRef<"full" | "deposit" | "split">(
  (safeFormData.paymentPlan || "full") as "full" | "deposit" | "split",
);
const payPlanSelectionSeqRef = useRef(0);


// 1) Маппинг пакета -> дерево (исправляем: базовый = дуб, премиум = элитное)
const PACKAGE_TO_WOOD: Record<string, "pine" | "oak" | "elite"> = {
  // БАЗОВЫЙ -> СОСНА
  base: "pine",
  basic: "pine",
  "базовый": "pine",

  // СТАНДАРТ -> ДУБ
  standard: "oak",
  "стандарт": "oak",

  // ПРЕМИУМ -> КРАСНОЕ ДЕРЕВО
  premium: "elite",
  "премиум": "elite",
};


// 2) Сопоставление id ткани -> часть имени файла (у тебя pine-ATLAS.jpg, а id = satin-white)
const LINING_TO_FILE: Record<string, string> = {
  "satin-white": "atlas",
  "silk-cream": "silk-cream",
  "velvet-burgundy": "velvet-burgundy",
};

const packageWoodId = useMemo<"pine" | "oak" | "elite">(() => {
  const id = (selectedPackage?.id || "").toLowerCase();
  if (PACKAGE_TO_WOOD[id]) return PACKAGE_TO_WOOD[id];

  const name = (selectedPackage?.name || "").toLowerCase();

  if (name.includes("премиум")) return "elite";
  if (name.includes("стандарт")) return "oak";
  if (name.includes("баз")) return "pine"; // важно: базовый = pine

  return "pine";
}, [selectedPackage?.id, selectedPackage?.name]);

const currentLiningId = safeFormData.liningColor || "satin-white";
const liningFileKey = LINING_TO_FILE[currentLiningId] || "atlas";

// ключ для словаря фоток (если используешь COFFIN_PHOTOS)
const previewKey = `${packageWoodId}-${currentLiningId}`;

// если у тебя есть COFFIN_PHOTOS — оставляем поддержку,
// но чтобы всегда работало даже без него — строим путь напрямую:
const currentCoffinPreview = useMemo(() => {
  // 1) если есть словарь COFFIN_PHOTOS (как в основном мастере)
  // @ts-ignore
  if (typeof COFFIN_PHOTOS !== "undefined" && COFFIN_PHOTOS?.[previewKey]) {
    // @ts-ignore
    return COFFIN_PHOTOS[previewKey];
  }

  // 2) fallback: путь по твоей структуре public/coffins/{wood}/{wood}-{lining}.jpg
  return `/coffins/${packageWoodId}/${packageWoodId}-${liningFileKey}.jpg`;
}, [packageWoodId, liningFileKey, previewKey]);




// Состояния для поиска кладбищ
const [cemeterySearchQuery, setCemeterySearchQuery] = useState("");
const [showCemeteryResults, setShowCemeteryResults] = useState(false);

const [selectedCemeteryCategory, setSelectedCemeteryCategory] = useState<
"standard" | "comfort" | "premium"
>("standard");

// Состояния для выбора даты и времени
const [pickupDateTime, setPickupDateTime] = useState<{ date?: Date; timeSlot?: TimeSlot }>({});
const [farewellDateTime, setFarewellDateTime] = useState<{ date?: Date; timeSlot?: TimeSlot }>({});
const [burialDateTime, setBurialDateTime] = useState<{ date?: Date; timeSlot?: TimeSlot }>({});
const [showPickupDialog, setShowPickupDialog] = useState(false);
const [showFarewellDialog, setShowFarewellDialog] = useState(false);
const [showBurialDialog, setShowBurialDialog] = useState(false);

const savedPickupDateTime = normalizeDateTimeSlot(safeFormData.pickupDateTime);
const savedFarewellDateTime = normalizeDateTimeSlot(safeFormData.farewellDateTime);
const savedBurialDateTime = normalizeDateTimeSlot(safeFormData.burialDateTime);

useEffect(() => {
if (!pickupDateTime.date && !pickupDateTime.timeSlot) {
if (savedPickupDateTime.date || savedPickupDateTime.timeSlot) {
setPickupDateTime(savedPickupDateTime);
}
}
}, [pickupDateTime.date, pickupDateTime.timeSlot, savedPickupDateTime.date, savedPickupDateTime.timeSlot]);

useEffect(() => {
if (!farewellDateTime.date && !farewellDateTime.timeSlot) {
if (savedFarewellDateTime.date || savedFarewellDateTime.timeSlot) {
setFarewellDateTime(savedFarewellDateTime);
}
}
}, [farewellDateTime.date, farewellDateTime.timeSlot, savedFarewellDateTime.date, savedFarewellDateTime.timeSlot]);

useEffect(() => {
if (!burialDateTime.date && !burialDateTime.timeSlot) {
if (savedBurialDateTime.date || savedBurialDateTime.timeSlot) {
setBurialDateTime(savedBurialDateTime);
}
}
}, [burialDateTime.date, burialDateTime.timeSlot, savedBurialDateTime.date, savedBurialDateTime.timeSlot]);

// Состояния для оплаты
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
const [orderConfirmation, setOrderConfirmation] = useState<{
  emailSent: boolean;
  paymentLink?: string | null;
} | null>(null);

const simplifiedCalculatorConfig = useMemo<CalculatorConfig>(() => {
  const packages = selectedPackage
    ? [
        {
          id: selectedPackage.id,
          name: selectedPackage.name,
          price: selectedPackage.price,
          features: [...(selectedPackage.features || [])],
        },
      ]
    : [];

  return {
    base: {
      title: "Базовые услуги",
      price: 25000,
      items: [
        "Оформление документов",
        "Подтверждение места захоронения",
        "Хранение и базовая подготовка тела",
        "Гроб, подушка и покрывало",
        "Транспортировка покойного и перенос",
        "Кладбищенские работы",
      ],
    },
    prices: {
      hallDuration: { ...PRICES.hallDuration },
      ceremonyType: { ...PRICES.ceremonyType },
      hearse: PRICES.hearse,
      familyTransport: { ...PRICES.familyTransport },
      pallbearers: PRICES.pallbearers,
    },
    packages,
    additionalServices: ADDITIONAL_SERVICES.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
    })),
    cemeteries: [...MOSCOW_CEMETERIES, ...MO_CEMETERIES].map((cemetery) => ({
      name: cemetery.name,
      categories: { ...cemetery.categories },
    })),
    cemeteryCategoryLabels: {
      standard: "Стандарт",
      comfort: "Комфорт",
      premium: "Премиум",
    },
    cemeterySectionTitle: (categoryLabel) => `Место на кладбище (${categoryLabel})`,
    includeCemeteryCategoryItem: false,
    includeCemeteryWithPackage: true,
    includeLogisticsWithPackage: true,
    includeFormatWithPackage: true,
    includeAdditionalWithPackage: true,
    includeBaseWithPackage: false,
    packageSectionMinPrice: 0,
  };
}, [selectedPackage]);

const calculatorFormData: CalculatorFormData = {
  serviceType: safeFormData.serviceType,
  hasHall: false,
  hallDuration: 0,
  ceremonyType: "",
  packageType: selectedPackage?.id ?? "",
  needsHearse: false,
  needsFamilyTransport: false,
  familyTransportSeats: 0,
  needsPallbearers: false,
  selectedAdditionalServices: [],
  cemetery: "",
};

const order = calculateOrder(calculatorFormData, simplifiedCalculatorConfig, selectedCemeteryCategory);
const formatRubLocal = (v: number) => Math.round(v).toLocaleString("ru-RU");
const fallbackTariffSection =
  selectedPackage
    ? {
        title: `Пакет "${selectedPackage.name}"`,
        total: selectedPackage.price ?? 0,
        items: (selectedPackage.features || []).map((feature) => ({
          label: feature,
          included: true,
          price: undefined,
        })),
      }
    : null;
const tariffSection =
  order.sections.find((section) => section.title.startsWith('Пакет "')) ?? fallbackTariffSection;
const simplifiedSections = tariffSection ? [tariffSection] : [];
const totalRub = Math.max(0, Math.round(tariffSection?.total || 0));
const floatingBreakdown = simplifiedSections.map((section) => ({
  category: section.title,
  price: Math.round(section.total || 0),
  items: section.items?.map((item) => ({
    name: item.label,
    price: typeof item.price === "number" ? Math.round(item.price) : undefined,
  })),
}));
const selectedPayPlan = (safeFormData.paymentPlan || "full") as "full" | "deposit" | "split";
const getPayNowRub = (plan: "full" | "deposit" | "split", total: number) => {
  const normalized = Math.max(0, Math.round(total || 0));
  if (plan === "deposit") return Math.max(0, Math.round(normalized * 0.05));
  if (plan === "split") return Math.floor(normalized / 4);
  return normalized;
};

const handleInputChange = (field: keyof FormDataShape | "hearseRoute", value: any) => {
setLocalFormData((prev) => ({
  ...prev,
  [field]: value,
}));
};

const handleSkipField = (field: "birthDate" | "deathDate" | "deathCertificate") => {
handleInputChange(field, "—");
};

// Инициализация внутренней отделки по умолчанию
useEffect(() => {
if (!safeFormData.liningColor) {
handleInputChange("liningColor", "satin-white");
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [safeFormData.liningColor]);

// Сохранение состояния simplified в отдельный ключ
useEffect(() => {
  if (typeof window === "undefined") return;
  try {
    const draft = { formData: localFormData, savedAt: new Date().toISOString() };
    const draftString = JSON.stringify(draft);
    if (draftString.length > 500000) return;
    localStorage.setItem(SIMPLIFIED_FORM_STORAGE_KEY, draftString);
  } catch {
    // ignore
  }
}, [localFormData]);

// Автоматический скролл вверх при смене шага
useEffect(() => {
if (!isInitialMountRef.current && previousStepRef.current !== currentStep) {
window.scrollTo({ top: 0, behavior: "smooth" });
}
if (isInitialMountRef.current) isInitialMountRef.current = false;
previousStepRef.current = currentStep;
}, [currentStep]);

useEffect(() => {
  if (currentStep !== 0) return;
  if (wizardStartedRef.current) return;
  wizardStartedRef.current = true;
  trackEvent(
    "wizard_started",
    { entry_mode: "package", flow: trackingFlow },
    `${trackingSessionId}:${trackingFlow}:step1`,
  );
}, [currentStep]);

useEffect(() => {
  if (currentStep !== 0) return;
  if (attributesStartedRef.current) return;
  attributesStartedRef.current = true;
  trackEvent(
    "attributes_started",
    { flow: trackingFlow },
    `${trackingSessionId}:${trackingFlow}:step1`,
  );
}, [currentStep]);

useEffect(() => {
  if (currentStep !== 0) return;
  const liningName = liningOptions.find((l) => l.id === currentLiningId)?.name;
  const wishesFilled = Boolean((safeFormData.specialRequests || "").trim());
  trackEvent(
    "attributes_selected",
    {
      coffin_type: packageWoodId,
      lining: liningName,
      has_flowers: false,
      has_cross: false,
      wishes_filled: wishesFilled,
      value: totalRub,
      currency: "RUB",
      flow: trackingFlow,
    },
    `${trackingSessionId}:${trackingFlow}:attributes:${packageWoodId}:${liningName || ""}:${wishesFilled}`,
  );
}, [currentStep, packageWoodId, currentLiningId, safeFormData.specialRequests]);

useEffect(() => {
  if (currentStep !== 1) return;
  if (!safeFormData.serviceType) return;
  trackEvent(
    "ceremony_type_selected",
    {
      burial_type: safeFormData.serviceType,
      has_hall: !!safeFormData.hasHall,
      value: totalRub,
      currency: "RUB",
      flow: trackingFlow,
    },
    `${trackingSessionId}:${trackingFlow}:ceremony_type:${safeFormData.serviceType}:${safeFormData.hasHall}`,
  );
}, [currentStep, safeFormData.serviceType, safeFormData.hasHall]);

useEffect(() => {
  if (currentStep !== 1) return;
  if (!safeFormData.hasHall) return;
  const ceremonyFormat =
    safeFormData.ceremonyType === "civil"
      ? "secular"
      : safeFormData.ceremonyType === "religious"
        ? "religious"
        : safeFormData.ceremonyType === "combined"
          ? "combined"
          : undefined;
  const hallDuration = Number(safeFormData.hallDuration || 0);
  if (!ceremonyFormat || !hallDuration) return;
  trackEvent(
    "ceremony_format_selected",
    {
      ceremony_format: ceremonyFormat,
      hall_duration: hallDuration,
      value: totalRub,
      currency: "RUB",
      flow: trackingFlow,
    },
    `${trackingSessionId}:${trackingFlow}:ceremony_format:${ceremonyFormat}:${hallDuration}`,
  );
}, [currentStep, safeFormData.hasHall, safeFormData.ceremonyType, safeFormData.hallDuration]);

useEffect(() => {
  if (currentStep !== 2) return;
  if (logisticsStartedRef.current) return;
  logisticsStartedRef.current = true;
  const dedupeKey = `${trackingSessionId}:${trackingFlow}:step3`;
  trackEvent(
    "logistics_started",
    { flow: trackingFlow },
    dedupeKey,
  );
  reachMetrikaGoal("logistics_started");
}, [currentStep, trackingFlow, trackingSessionId]);

useEffect(() => {
  if (currentStep !== 3) return;
  if (documentsStartedRef.current) return;
  documentsStartedRef.current = true;
  trackEvent(
    "documents_started",
    { flow: trackingFlow },
    `${trackingSessionId}:${trackingFlow}:step4`,
  );
}, [currentStep]);

useEffect(() => {
  if (currentStep !== 4) return;
  if (!calculatorViewedRef.current) {
    const itemsCount = floatingBreakdown.reduce(
      (acc, section) => acc + (section.items?.length || 0),
      0,
    );
    calculatorViewedRef.current = true;
    trackEvent(
      "calculator_viewed",
      {
        value: totalRub,
        currency: "RUB",
        burial_type: safeFormData.serviceType,
        items_count: itemsCount,
        flow: trackingFlow,
      },
      `${trackingSessionId}:${trackingFlow}:step5`,
    );
  }

  if (!contactsStartedRef.current) {
    contactsStartedRef.current = true;
    trackEvent(
      "contacts_started",
      { flow: trackingFlow },
      `${trackingSessionId}:${trackingFlow}:contacts`,
    );
  }
}, [currentStep, totalRub, floatingBreakdown, safeFormData.serviceType]);

useEffect(() => {
  if (currentStep !== 4) return;
  if (lastPayPlanRef.current === selectedPayPlan) return;
  lastPayPlanRef.current = selectedPayPlan;
  payPlanSelectionSeqRef.current += 1;
  const payNowRub = getPayNowRub(selectedPayPlan, totalRub);
  trackEvent(
    "pay_plan_selected",
    {
      pay_plan: selectedPayPlan,
      payment_method: "card",
      flow: trackingFlow,
      value: payNowRub,
      currency: "RUB",
    },
    `${trackingSessionId}:${trackingFlow}:pay_plan:${selectedPayPlan}:${payPlanSelectionSeqRef.current}`,
  );
}, [currentStep, selectedPayPlan, totalRub]);

// Скрываем глобальный floating-калькулятор, чтобы остался только simplified.
useEffect(() => {
  if (typeof document === "undefined") return;
  const hidden = new Set<HTMLElement>();

  const hideGlobalFloating = () => {
    const candidates = Array.from(document.querySelectorAll("div"));
    for (const el of candidates) {
      if (!(el instanceof HTMLElement)) continue;
      const classList = el.classList;
      if (
        !classList.contains("fixed") ||
        !classList.contains("bottom-6") ||
        !classList.contains("left-1/2") ||
        !classList.contains("-translate-x-1/2") ||
        !classList.contains("max-w-md")
      ) {
        continue;
      }
      if (el.dataset.simplifiedFloating === "true") continue;
      if (hidden.has(el)) continue;
      el.style.display = "none";
      hidden.add(el);
    }
  };

  hideGlobalFloating();
  const observer = new MutationObserver(hideGlobalFloating);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    hidden.forEach((el) => {
      el.style.display = "";
    });
  };
}, []);

const handleNext = () => {
// Проверка согласия на шаге документов
if (currentStep === 3 && !safeFormData.dataConsent) {
setShowConsentError(true);
setTimeout(() => {
const consentElement = document.getElementById("data-consent");
consentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
}, 100);
return;
}

if (currentStep < simplifiedSteps.length - 1 && !isTransitioning) {
setIsTransitioning(true);
setShowConsentError(false);

if (currentStep === 1) {
  const ceremonyFormat =
    safeFormData.ceremonyType === "civil"
      ? "secular"
      : safeFormData.ceremonyType === "religious"
        ? "religious"
        : safeFormData.ceremonyType === "combined"
          ? "combined"
          : undefined;
  const hallDuration = Number(safeFormData.hallDuration || 0);
  trackEvent(
    "format_step_completed",
    {
      final_burial_type: safeFormData.serviceType,
      final_has_hall: !!safeFormData.hasHall,
      ceremony_format: ceremonyFormat,
      hall_duration: hallDuration,
      value: totalRub,
      currency: "RUB",
      flow: trackingFlow,
    },
    `${trackingSessionId}:${trackingFlow}:step2`,
  );
}

if (currentStep === 2) {
  const hasLocation = Boolean(safeFormData.cemetery);
  const hasPickup = Boolean(pickupDateTime.date && pickupDateTime.timeSlot);
  const hasBurial = Boolean(burialDateTime.date && burialDateTime.timeSlot);
  const hasFarewell = !safeFormData.hasHall
    || Boolean(farewellDateTime.date && farewellDateTime.timeSlot);
  const hasTimes = hasPickup && hasBurial && hasFarewell;
  const routePoints = Object.values(safeFormData.hearseRoute || {}).filter(Boolean).length;
  if (hasLocation && hasTimes) {
    trackEvent(
      "logistics_filled",
      {
        has_location: hasLocation,
        has_times: hasTimes,
        route_points: routePoints,
        value: totalRub,
        currency: "RUB",
        flow: trackingFlow,
      },
      `${trackingSessionId}:${trackingFlow}:step3:filled`,
    );
  }
}

if (currentStep === 3) {
  trackEvent(
    "documents_completed",
    {
      consent_checked: !!safeFormData.dataConsent,
      kinship: safeFormData.relationship || undefined,
      value: totalRub,
      currency: "RUB",
      flow: trackingFlow,
    },
    `${trackingSessionId}:${trackingFlow}:step4:completed`,
  );
}

if (!completedSteps.includes(currentStep)) {
setCompletedSteps((prev) => [...prev, currentStep]);
}

setTimeout(() => {
setCurrentStep((prev) => prev + 1);
setIsTransitioning(false);
window.scrollTo({ top: 0, behavior: "smooth" });
}, 200);
}
};

const handlePrev = () => {
if (currentStep > 0) {
setCurrentStep((prev) => prev - 1);
window.scrollTo({ top: 0, behavior: "smooth" });
}
};

const handleStepClick = (stepIndex: number) => {
setCurrentStep(stepIndex);
window.scrollTo({ top: 0, behavior: "smooth" });
};

// Фильтрация кладбищ по поисковому запросу
const filteredCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES].filter((cemetery) => {
if (!cemeterySearchQuery.trim()) return false;

const query = cemeterySearchQuery.toLowerCase();

const matchesType =
safeFormData.serviceType === "burial"
? cemetery.type === "cemetery" || cemetery.type === "both"
: cemetery.type === "crematorium" || cemetery.type === "both";

const matchesSearch =
cemetery.name.toLowerCase().includes(query) ||
cemetery.address.toLowerCase().includes(query) ||
cemetery.district.toLowerCase().includes(query);

// Доп. фильтр: показываем только working, если burial (как у тебя было)
if (safeFormData.serviceType === "burial") {
return matchesType && matchesSearch && cemetery.working;
}

return matchesType && matchesSearch;
});

const handleCemeterySelect = (cemetery: CemeteryData) => {
handleInputChange("cemetery", cemetery.name);
setCemeterySearchQuery("");
setShowCemeteryResults(false);
};

const material =
  PACKAGE_TO_MATERIAL[selectedPackage?.id] ?? "pine";

const coffinPreviewSrc = `/coffins/${material}/${safeFormData.liningColor}.jpg`;


const renderStepContent = () => {
switch (currentStep) {
case 0: {
  return (
    <div className="space-y-8">

      {/* ✅ Превью гроба */}
<div className="bg-[#1a1c23] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
  <div className="aspect-[16/9] md:aspect-[2/1] relative">
    <SafeImg
      src={currentCoffinPreview}
      fallbackSrc="/coffins/pine/pine-atlas.jpg"
      alt="Превью гроба"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    {/* Инфо-панель */}
    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="text-white/80 text-xs truncate">
          Отделка: {liningOptions.find((l) => l.id === currentLiningId)?.name ?? "—"}
        </div>
      </div>
    </div>
  </div>
</div>

{/* ✅ Заголовок блока */}
<div className="space-y-4">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
    <Label className="text-base font-medium text-gray-900">Внутренняя отделка</Label>
    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
      Ткань и цвет
    </span>
  </div>

  {/* ✅ Карточки как в основном мастере */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
    {liningOptions.map((lining) => (
      <button
        key={lining.id}
        type="button"
        onClick={() => handleInputChange("liningColor", lining.id)}
        className={cn(
          "group relative rounded-2xl overflow-hidden transition-all duration-300 text-left",
          currentLiningId === lining.id
            ? "ring-2 ring-purple-600 ring-offset-2 shadow-xl scale-[1.02]"
            : "ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5"
        )}
      >
        <div className="aspect-[16/9] sm:aspect-[4/3] w-full relative">
          <SafeImg
            src={lining.texture}
            fallbackSrc="https://images.unsplash.com/photo-1619043519379-99df2736108d?w=800"
            alt={lining.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* градиент/оверлей */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

          {/* галочка */}
          {currentLiningId === lining.id && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          {/* подписи */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-white/90 backdrop-blur-sm border-t border-white/50">
            <div className="text-gray-900 font-medium text-sm truncate">
              {lining.name}
            </div>
            <div className="text-gray-500 text-xs">
              {lining.description}
            </div>
          </div>
        </div>
      </button>
    ))}
  </div>
</div>


      <Separator />

      {/* ОСОБЫЕ ПОЖЕЛАНИЯ */}
      <div>
        <Label>Особые пожелания</Label>
        <Textarea
          value={safeFormData.specialRequests}
          onChange={(e) =>
            handleInputChange("specialRequests", e.target.value)
          }
          rows={4}
          maxLength={300}
          className="mt-2"
        />
      </div>
    </div>
  );
}

case 1: {
return (
<div className="space-y-6">
<div>
<div className="grid grid-cols-2 gap-3">
<button
type="button"
onClick={() => handleInputChange("serviceType", "burial")}
className={cn(
"px-5 py-2 border-2 rounded-full text-left transition-all backdrop-blur-sm",
safeFormData.serviceType === "burial"
? "border-gray-900 bg-white/60"
: "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40"
)}
>
<div className="text-sm text-gray-900">Захоронение</div>
<div className="text-xs text-gray-600">Традиционное погребение</div>
</button>

<button
type="button"
onClick={() => handleInputChange("serviceType", "cremation")}
className={cn(
"px-5 py-2 border-2 rounded-full text-left transition-all backdrop-blur-sm",
safeFormData.serviceType === "cremation"
? "border-gray-900 bg-white/60"
: "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40"
)}
>
<div className="text-sm text-gray-900">Кремация</div>
<div className="text-xs text-gray-600">С выдачей урны</div>
</button>
</div>
</div>

<Separator />

<div>
<div className="flex items-center justify-between mb-3">
<div>
<Label className="text-gray-900">Зал прощания</Label>
<p className="text-xs text-gray-700 mt-1">Церемония прощания с родными</p>
</div>
<Switch checked={safeFormData.hasHall} onCheckedChange={(checked) => handleInputChange("hasHall", checked)} />
</div>

{!safeFormData.hasHall && (
<div className="bg-amber-500/10 backdrop-blur-sm border border-amber-400/30 rounded-full p-4">
<p className="text-sm text-amber-900">
Без зала — технологическая кремация без церемонии. Можно попрощаться в зале морга.
</p>
</div>
)}
</div>

{safeFormData.hasHall && (
<>
<div>
<Label className="mb-3 block">Тип церемонии</Label>
<RadioGroup
value={safeFormData.ceremonyType}
onValueChange={(value) => handleInputChange("ceremonyType", value)}
className="space-y-3"
>
<div
className={cn(
"flex items-start space-x-3 p-4 border rounded-full transition-all",
safeFormData.ceremonyType === "civil" && "border-black bg-gray-50"
)}
>
<RadioGroupItem value="civil" id="civil" className="mt-0.5" />
<div className="flex-1">
<Label htmlFor="civil" className="cursor-pointer">
Светская
</Label>
<p className="text-xs text-gray-500 mt-1">Без религиозных обрядов</p>
</div>
</div>

<div
className={cn(
"flex items-start space-x-3 p-4 border rounded-full transition-all",
safeFormData.ceremonyType === "religious" && "border-black bg-gray-50"
)}
>
<RadioGroupItem value="religious" id="religious" className="mt-0.5" />
<div className="flex-1">
<Label htmlFor="religious" className="cursor-pointer">
Религиозная
</Label>
<p className="text-xs text-gray-500 mt-1">С участием священнослужителя</p>
</div>
</div>

<div
className={cn(
"flex items-start space-x-3 p-4 border rounded-full transition-all",
safeFormData.ceremonyType === "combined" && "border-black bg-gray-50"
)}
>
<RadioGroupItem value="combined" id="combined" className="mt-0.5" />
<div className="flex-1">
<Label htmlFor="combined" className="cursor-pointer">
Комбинированная
</Label>
<p className="text-xs text-gray-500 mt-1">Светская + религиозная часть</p>
</div>
</div>
</RadioGroup>
</div>

{safeFormData.ceremonyType === "combined" && (
<div>
<Label htmlFor="ceremonyOrder">Последовательность</Label>
<Select value={safeFormData.ceremonyOrder} onValueChange={(value) => handleInputChange("ceremonyOrder", value)}>
<SelectTrigger className="mt-2">
<SelectValue placeholder="Выберите порядок" />
</SelectTrigger>
<SelectContent>
<SelectItem value="civil-first">Светская → Религиозная</SelectItem>
<SelectItem value="religious-first">Религиозная → Светская</SelectItem>
</SelectContent>
</Select>
</div>
)}

<Separator />

<div>
<Label className="mb-3 block">Длительность</Label>
<p className="text-xs text-gray-500 mb-3">Рекомендуем 60–90 мин</p>
<div className="grid grid-cols-3 gap-3">
{[30, 60, 90].map((duration) => (
<button
key={duration}
type="button"
onClick={() => handleInputChange("hallDuration", duration)}
className={cn(
"p-4 border-2 rounded-full text-center transition-all",
safeFormData.hallDuration === duration
? "border-gray-900 bg-gray-50"
: "border-gray-200 hover:border-gray-300"
)}
>
<div className="text-sm mb-1">{duration} мин</div>
<div className="text-xs text-gray-500">
{(PRICES.hallDuration as any)[duration].toLocaleString("ru-RU")} ₽
</div>
</button>
))}
</div>
</div>
</>
)}
</div>
);
}

case 2: {
// Шаг 3: Логистика
const totalActive = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES].filter((c) => {
if (safeFormData.serviceType === "burial") {
return (c.type === "cemetery" || c.type === "both") && c.working;
}
return c.type === "crematorium" || c.type === "both";
}).length;

return (
<div className="space-y-6">
<div className="relative">
<Label htmlFor="cemetery" className="mb-3 block">
{safeFormData.serviceType === "burial" ? "Выбор кладбища" : "Выбор крематория"}
</Label>

<div className="relative">
<Input
id="cemetery"
value={cemeterySearchQuery || safeFormData.cemetery}
onChange={(e) => {
setCemeterySearchQuery(e.target.value);
setShowCemeteryResults(true);
if (!e.target.value) {
handleInputChange("cemetery", "");
}
}}
onFocus={() => {
if (cemeterySearchQuery) setShowCemeteryResults(true);
}}
placeholder="Начните вводить название или адрес..."
className="mt-2 rounded-full"
/>

<p className="text-xs text-gray-500 mt-2">
Единый поиск по Москве и области • {totalActive} активных{" "}
{safeFormData.serviceType === "burial" ? "кладбищ" : "крематориев"}
</p>

{/* Результаты поиска */}
{showCemeteryResults && filteredCemeteries.length > 0 && (
<div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-96 overflow-y-auto">
<div className="p-2">
{filteredCemeteries.map((cemetery) => (
<button
type="button"
key={cemetery.id}
onClick={() => handleCemeterySelect(cemetery)}
className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
>
<div className="flex items-start justify-between gap-3">
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1">
<span className="text-sm text-gray-900">{cemetery.name}</span>

{!cemetery.working && (
<Badge variant="secondary" className="text-xs">
Закрыто
</Badge>
)}

{cemetery.hasColumbarium && safeFormData.serviceType === "cremation" && (
<Badge variant="outline" className="text-xs">
Колумбарий
</Badge>
)}
</div>

<div className="text-xs text-gray-500">{cemetery.address}</div>

<div className="flex items-center gap-2 mt-1">
<Badge variant="outline" className="text-xs">
{cemetery.district}
</Badge>

{cemetery.working && cemetery.categories.standard && (
<span className="text-xs text-gray-600">
от {cemetery.categories.standard.toLocaleString("ru-RU")} ₽
</span>
)}
</div>
</div>
</div>
</button>
))}
</div>
</div>
)}

{/* Сообщение если нет результатов */}
{showCemeteryResults && cemeterySearchQuery && filteredCemeteries.length === 0 && (
<div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
<p className="text-sm text-gray-500 text-center">Ничего не найдено. Попробуйте изменить запрос.</p>
</div>
)}
</div>

{/* Категория места (если кладбище выбрано) */}
{safeFormData.cemetery && (
<div className="mt-4 space-y-3">
<Label className="text-gray-900">Категория места</Label>
<div className="grid grid-cols-3 gap-3">
{(["standard", "comfort", "premium"] as const).map((category) => {
const allCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
const selectedCemetery = allCemeteries.find((c) => c.name === safeFormData.cemetery);
const price = selectedCemetery?.categories?.[category];

if (!price) return null;

return (
<button
type="button"
key={category}
onClick={() => setSelectedCemeteryCategory(category)}
className={cn(
"p-4 border-2 rounded-full text-center transition-all",
selectedCemeteryCategory === category
? "border-gray-900 bg-gray-50"
: "border-gray-200 hover:border-gray-300"
)}
>
<div className="text-sm mb-1">
{category === "standard" ? "Стандарт" : category === "comfort" ? "Комфорт" : "Премиум"}
</div>
<div className="text-xs text-gray-500">{price.toLocaleString("ru-RU")} ₽</div>
</button>
);
})}
</div>
</div>
)}
</div>

<div className="space-y-6">
{/* Время забора тела */}
<div className="space-y-2">
<Label className="text-gray-900">Время забора тела</Label>
<Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
<DialogTrigger asChild>
<Button
variant="outline"
className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
type="button"
>
<Clock className="h-4 w-4 mr-3 text-gray-500" />
<span className={cn(pickupDateTime.date && pickupDateTime.timeSlot ? "text-gray-900" : "text-gray-600")}>
{pickupDateTime.date && pickupDateTime.timeSlot
? formatDateTimeSlot(pickupDateTime)
: "Выбрать время забора"}
</span>
</Button>
</DialogTrigger>

<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden !flex !flex-col">
<DialogHeader className="shrink-0">
<DialogTitle>Выбор даты и времени забора</DialogTitle>
<DialogDescription>Выберите дату и время, когда требуется забрать тело</DialogDescription>
</DialogHeader>

<div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-6 pt-2 pb-6">
<div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
<SimpleCalendar
selected={pickupDateTime.date}
onSelect={(date: Date | undefined) =>
setPickupDateTime({
date,
timeSlot: undefined,
})
}
className="mx-auto w-full"
/>
</div>

{pickupDateTime.date && (
<div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
<div className="flex items-center justify-between px-1">
<div className="flex flex-col">
<span className="text-sm font-medium text-gray-900">Время</span>
<span className="text-xs text-gray-500">Выберите удобный слот</span>
</div>
{pickupDateTime.timeSlot && (
<Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900">
{TIME_SLOT_LABELS[pickupDateTime.timeSlot]}
</Badge>
)}
</div>

<div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
{TIME_SLOT_OPTIONS.map((slot) => (
<button
type="button"
key={slot.id}
onClick={() => setPickupDateTime({ ...pickupDateTime, timeSlot: slot.id })}
className={cn(
"px-3 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border",
pickupDateTime.timeSlot === slot.id
? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
: "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
)}
>
<div className="text-sm font-semibold">{slot.label}</div>
<div className="text-[11px] opacity-70 mt-1">{slot.range}</div>
</button>
))}
</div>
</div>
)}

</div>
<div className="shrink-0 pt-4 border-t border-gray-100 bg-white">
<Button
onClick={() => {
handleInputChange("pickupDateTime", pickupDateTime);
setShowPickupDialog(false);
}}
className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
disabled={!pickupDateTime.date || !pickupDateTime.timeSlot}
type="button"
>
Подтвердить
</Button>
</div>
</DialogContent>
</Dialog>
</div>

{/* Зал прощания / Церковь */}
<div className="space-y-2">
<Label className="text-gray-900">Зал прощания / Церковь</Label>
<Dialog open={showFarewellDialog} onOpenChange={setShowFarewellDialog}>
<DialogTrigger asChild>
<Button
variant="outline"
className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
type="button"
>
<Church className="h-4 w-4 mr-3 text-gray-500" />
<span className={cn(farewellDateTime.date && farewellDateTime.timeSlot ? "text-gray-900" : "text-gray-600")}>
{farewellDateTime.date && farewellDateTime.timeSlot
? formatDateTimeSlot(farewellDateTime)
: "Выбрать время прощания"}
</span>
</Button>
</DialogTrigger>

<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden !flex !flex-col">
<DialogHeader className="shrink-0">
<DialogTitle>Выбор даты и времени прощания</DialogTitle>
<DialogDescription>Выберите дату и время прощания в зале или церкви</DialogDescription>
</DialogHeader>

<div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-6 pt-2 pb-6">
<div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
<SimpleCalendar
selected={farewellDateTime.date}
onSelect={(date: Date | undefined) =>
setFarewellDateTime({
date,
timeSlot: undefined,
})
}
className="mx-auto w-full"
/>
</div>

{farewellDateTime.date && (
<div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
<div className="flex items-center justify-between px-1">
<div className="flex flex-col">
<span className="text-sm font-medium text-gray-900">Время прощания</span>
<span className="text-xs text-gray-500">Выберите удобный слот</span>
</div>
{farewellDateTime.timeSlot && (
<Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900">
{TIME_SLOT_LABELS[farewellDateTime.timeSlot]}
</Badge>
)}
</div>

<div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
{TIME_SLOT_OPTIONS.map((slot) => (
<button
type="button"
key={slot.id}
onClick={() => setFarewellDateTime({ ...farewellDateTime, timeSlot: slot.id })}
className={cn(
"px-3 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border",
farewellDateTime.timeSlot === slot.id
? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
: "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
)}
>
<div className="text-sm font-semibold">{slot.label}</div>
<div className="text-[11px] opacity-70 mt-1">{slot.range}</div>
</button>
))}
</div>
</div>
)}

</div>
<div className="shrink-0 pt-4 border-t border-gray-100 bg-white">
<Button
onClick={() => {
handleInputChange("farewellDateTime", farewellDateTime);
setShowFarewellDialog(false);
}}
className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
disabled={!farewellDateTime.date || !farewellDateTime.timeSlot}
type="button"
>
<Check className="h-4 w-4 mr-2" />
Подтвердить выбор
</Button>
</div>
</DialogContent>
</Dialog>
</div>

{/* Время захоронения / кремации */}
<div className="space-y-2">
<Label className="text-gray-900">Время захоронения / кремации</Label>
<Dialog open={showBurialDialog} onOpenChange={setShowBurialDialog}>
<DialogTrigger asChild>
<Button
variant="outline"
className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
type="button"
>
<Clock className="h-4 w-4 mr-3 text-gray-500" />
<span className={cn(burialDateTime.date && burialDateTime.timeSlot ? "text-gray-900" : "text-gray-600")}>
{burialDateTime.date && burialDateTime.timeSlot
? formatDateTimeSlot(burialDateTime)
: "Выбрать время"}
</span>
</Button>
</DialogTrigger>

<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden !flex !flex-col">
<DialogHeader className="shrink-0">
<DialogTitle>
Выбор даты и времени{" "}
{safeFormData.serviceType === "cremation" ? "кремации" : "захоронения"}
</DialogTitle>
<DialogDescription>
Выберите дату и время{" "}
{safeFormData.serviceType === "cremation" ? "кремации" : "захоронения"}
</DialogDescription>
</DialogHeader>

<div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-6 pt-2 pb-6">
<div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
<SimpleCalendar
selected={burialDateTime.date}
onSelect={(date: Date | undefined) =>
setBurialDateTime({
date,
timeSlot: undefined,
})
}
className="mx-auto w-full"
/>
</div>

{burialDateTime.date && (
<div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
<div className="flex items-center justify-between px-1">
<div className="flex flex-col">
<span className="text-sm font-medium text-gray-900">
Время {safeFormData.serviceType === "cremation" ? "кремации" : "захоронения"}
</span>
<span className="text-xs text-gray-500">Выберите удобный слот</span>
</div>
{burialDateTime.timeSlot && (
<Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900">
{TIME_SLOT_LABELS[burialDateTime.timeSlot]}
</Badge>
)}
</div>

<div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
{TIME_SLOT_OPTIONS.map((slot) => (
<button
type="button"
key={slot.id}
onClick={() => setBurialDateTime({ ...burialDateTime, timeSlot: slot.id })}
className={cn(
"px-3 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border",
burialDateTime.timeSlot === slot.id
? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
: "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
)}
>
<div className="text-sm font-semibold">{slot.label}</div>
<div className="text-[11px] opacity-70 mt-1">{slot.range}</div>
</button>
))}
</div>
</div>
)}

</div>
<div className="shrink-0 pt-4 border-t border-gray-100 bg-white">
<Button
onClick={() => {
handleInputChange("burialDateTime", burialDateTime);
setShowBurialDialog(false);
}}
className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
disabled={!burialDateTime.date || !burialDateTime.timeSlot}
type="button"
>
Подтвердить
</Button>
</div>
</DialogContent>
</Dialog>
</div>

<p className="text-xs text-gray-500 pt-2">
Время и слоты бронируются онлайн. Подтверждение придёт в интерфейс и на почту.
</p>
</div>

<Separator />

{/* Маршрут катафалка */}
<div>
<Label className="text-sm mb-3 block">Маршрут катафалка:</Label>
<div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2 pl-4 border-l-2 border-gray-200">
<Button
type="button"
variant={safeFormData.hearseRoute?.morgue ? "default" : "outline"}
className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
onClick={() =>
handleInputChange("hearseRoute", {
...safeFormData.hearseRoute,
morgue: !safeFormData.hearseRoute.morgue,
})
}
>
Морг
</Button>

{safeFormData.hearseRoute?.morgue && (
<div className="flex justify-center md:block">
<ChevronDown className="h-5 w-5 text-gray-400 md:hidden" />
<ChevronRight className="h-5 w-5 text-gray-400 hidden md:block" />
</div>
)}

<Button
type="button"
variant={safeFormData.hearseRoute?.hall ? "default" : "outline"}
className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
onClick={() =>
handleInputChange("hearseRoute", {
...safeFormData.hearseRoute,
hall: !safeFormData.hearseRoute.hall,
})
}
>
Зал прощания
</Button>

{safeFormData.hearseRoute?.hall && (
<div className="flex justify-center md:block">
<ChevronDown className="h-5 w-5 text-gray-400 md:hidden" />
<ChevronRight className="h-5 w-5 text-gray-400 hidden md:block" />
</div>
)}

<Button
type="button"
variant={safeFormData.hearseRoute?.church ? "default" : "outline"}
className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
onClick={() =>
handleInputChange("hearseRoute", {
...safeFormData.hearseRoute,
church: !safeFormData.hearseRoute.church,
})
}
>
Церковь
</Button>

{safeFormData.hearseRoute?.church && (
<div className="flex justify-center md:block">
<ChevronDown className="h-5 w-5 text-gray-400 md:hidden" />
<ChevronRight className="h-5 w-5 text-gray-400 hidden md:block" />
</div>
)}

<Button
type="button"
variant={safeFormData.hearseRoute?.cemetery ? "default" : "outline"}
className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
onClick={() =>
handleInputChange("hearseRoute", {
...safeFormData.hearseRoute,
cemetery: !safeFormData.hearseRoute.cemetery,
})
}
>
{safeFormData.serviceType === "burial" ? "Кладбище" : "Крематорий"}
</Button>
</div>
</div>
</div>
);
}

case 3: {
// Шаг 4: Документы
return (
<div className="space-y-6">
<div>
<Label htmlFor="fullName">ФИО усопшего *</Label>
<Input
id="fullName"
value={safeFormData.fullName}
onChange={(e) => handleInputChange("fullName", e.target.value)}
placeholder="Иванов Иван Иванович"
className="mt-2"
/>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<Label htmlFor="birthDate">Дата рождения</Label>
<div className="flex gap-2 mt-2">
<Input
id="birthDate"
type={safeFormData.birthDate === "—" ? "text" : "date"}
value={safeFormData.birthDate}
onChange={(e) => handleInputChange("birthDate", e.target.value)}
className="flex-1"
/>
<Button
variant="outline"
size="sm"
type="button"
onClick={() => handleSkipField("birthDate")}
className="whitespace-nowrap rounded-[30px]"
>
Не знаю
</Button>
</div>
</div>

<div>
<Label htmlFor="deathDate">Дата смерти</Label>
<div className="flex gap-2 mt-2">
<Input
id="deathDate"
type={safeFormData.deathDate === "—" ? "text" : "date"}
value={safeFormData.deathDate}
onChange={(e) => handleInputChange("deathDate", e.target.value)}
className="flex-1"
/>
<Button
variant="outline"
size="sm"
type="button"
onClick={() => handleSkipField("deathDate")}
className="whitespace-nowrap rounded-[30px]"
>
Не знаю
</Button>
</div>
</div>
</div>

<div>
<Label htmlFor="deathCertificate">№ свидетельства о смерти</Label>
<div className="flex gap-2 mt-2">
<Input
id="deathCertificate"
value={safeFormData.deathCertificate}
onChange={(e) => handleInputChange("deathCertificate", e.target.value)}
placeholder="AA-000 № 000000"
className="flex-1"
/>
<Button
variant="outline"
size="sm"
type="button"
onClick={() => handleSkipField("deathCertificate")}
className="whitespace-nowrap rounded-[30px]"
>
Не знаю
</Button>
</div>
</div>

<Separator />

<div>
<Label htmlFor="relationship">Ваше отношение к усопшему</Label>
<Select value={safeFormData.relationship} onValueChange={(value) => handleInputChange("relationship", value)}>
<SelectTrigger className="mt-2">
<SelectValue placeholder="Выберите из списка" />
</SelectTrigger>
<SelectContent>
<SelectItem value="spouse">Супруг(а)</SelectItem>
<SelectItem value="child">Сын / Дочь</SelectItem>
<SelectItem value="parent">Родитель</SelectItem>
<SelectItem value="sibling">Брат / Сестра</SelectItem>
<SelectItem value="relative">Дальний родственник</SelectItem>
<SelectItem value="friend">Друг</SelectItem>
<SelectItem value="other">Доверенное лицо</SelectItem>
</SelectContent>
</Select>
</div>

<Separator />

<div
id="data-consent"
className={cn(
"flex items-start space-x-3 p-4 border rounded-full transition-all",
showConsentError && "border-red-500 bg-red-50"
)}
>
<Checkbox
id="consent"
checked={safeFormData.dataConsent}
onCheckedChange={(checked) => {
// shadcn Checkbox отдаёт boolean | "indeterminate"
handleInputChange("dataConsent", checked === true);
}}
className="mt-1"
/>
<div className="flex-1">
<Label htmlFor="consent" className="cursor-pointer text-sm">
Я согласен(а) на обработку персональных данных и подтверждаю, что ознакомлен(а) с{" "}
<a
  href="/info"
  className="underline text-blue-600"
  target="_blank"
  rel="noreferrer"
>
политикой конфиденциальности
</a>
</Label>
{showConsentError && (
<p className="text-xs text-red-600 mt-2">Необходимо дать согласие для продолжения</p>
)}
</div>
</div>
</div>
);
}

case 4: {
// Шаг 5: Подтверждение и оплата
const emailValue = (safeFormData.userEmail || "").trim();
const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
const canSubmit = totalRub > 0 && emailOk;

const breakdown = simplifiedSections;
const cemeteryCategoryLabel =
selectedCemeteryCategory === "standard"
? "Тихая церемония"
: selectedCemeteryCategory === "comfort"
? "Традиционное прощание"
: selectedCemeteryCategory === "premium"
? "Особое внимание"
: undefined;
const orderSummary = buildOrderSummary(safeFormData, {
totalRub,
packageLabel: selectedPackage?.name,
cemeteryCategoryLabel,
});
const summarySections = orderSummary.sections;

const onPayClick = async () => {
if (isSubmittingOrder || !canSubmit) return;

try {
setIsSubmittingOrder(true);

await new Promise((r) => setTimeout(r, 400));

const emailOkLocal = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
if (!emailOkLocal) {
alert("Укажите корректный email для получения договора и деталей заказа.");
return;
}

trackEvent(
  "contacts_filled",
  { has_phone: false, has_email: true, flow: trackingFlow },
  `${trackingSessionId}:${trackingFlow}:contacts_filled:${emailValue}`,
);

const packageInfo = selectedPackage
? {
    id: selectedPackage.id,
    name: selectedPackage.name,
    price: selectedPackage.price,
    features: selectedPackage.features ?? [],
  }
: undefined;

const payloadFormData = {
...safeFormData,
pickupDateTime,
farewellDateTime,
burialDateTime,
};

const ceremonyDateTime = safeFormData.hasHall ? farewellDateTime : burialDateTime;

const payload = {
orderFlow: "simplified",
customer: {
email: emailValue,
name: safeFormData.fullName || undefined,
},
userEmail: emailValue,
userName: safeFormData.fullName || undefined,
total: totalRub,
breakdown: floatingBreakdown,
package: packageInfo,
addons: [],
formData: payloadFormData,
paymentMethod,
deceased: {
name: safeFormData.fullName || undefined,
birthDate: safeFormData.birthDate || undefined,
deathDate: safeFormData.deathDate || undefined,
relationship: safeFormData.relationship || undefined,
},
ceremony: {
type: safeFormData.ceremonyType || undefined,
order: safeFormData.ceremonyOrder || undefined,
serviceType: safeFormData.serviceType || undefined,
cemetery: safeFormData.cemetery || undefined,
date: ceremonyDateTime.date ? ceremonyDateTime.date.toLocaleDateString("ru-RU") : undefined,
timeSlot: ceremonyDateTime.timeSlot,
},
notes: safeFormData.specialRequests || undefined,
};

const res = await fetch("/api/orders", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});

if (!res.ok) {
const data = await res.json().catch(() => ({}));
console.error("Order error:", data);
if (res.status === 400) {
alert("Укажите корректный email.");
} else {
alert(
(data as any)?.error ||
"Ошибка отправки письма или создания заказа. Попробуйте ещё раз."
);
}
return;
}

const data = await res.json();
console.log("Order created:", data);
trackEvent(
  "order_created",
  {
    order_id: data?.orderId,
    value: data?.totalRub ?? totalRub,
    currency: "RUB",
    flow: trackingFlow,
  },
  data?.orderId,
);
setOrderConfirmation({
  emailSent: Boolean(data?.emailSent),
  paymentLink: data?.paymentLink ?? null,
});
} catch (e) {
console.error("Order request failed:", e);
alert("Не удалось оформить бронирование. Попробуйте ещё раз или свяжитесь с поддержкой.");
} finally {
setIsSubmittingOrder(false);
}
};

return (
<div className="space-y-6">

{/* Формат */}
{summarySections.map((section) => (
<div key={section.title} className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
<h4 className="text-sm text-gray-500 mb-3">{section.title}</h4>
<div className="space-y-2 text-sm">
{section.items.map((item, idx) => (
<div key={`${section.title}-${idx}`} className="flex items-start justify-between gap-3">
<span className="text-gray-600">{item.label}:</span>
<span className="text-gray-900 text-right whitespace-pre-line">{item.value}</span>
</div>
))}
</div>
</div>
))}

{/* СОСТАВ ЗАКАЗА */}
<div className="bg-white border border-gray-200 rounded-[30px] p-5 shadow-sm">
<div className="flex items-center justify-between mb-4">
<div>
<div className="text-sm font-semibold text-gray-900">Состав заказа</div>
<div className="text-xs text-gray-500 mt-1">Полный перечень услуг, которые входят в итоговую стоимость</div>
</div>
<div className="text-sm font-semibold text-gray-900">{formatRubLocal(totalRub)} ₽</div>
</div>

<div className="space-y-4">
{breakdown.map((block, idx) => (
<div key={`${block.title}-${idx}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
<div className="flex items-start justify-between gap-3">
<div className="text-sm font-semibold text-gray-900">{block.title}</div>
<div className="text-sm font-semibold text-gray-900">{formatRubLocal(block.total)} ₽</div>
</div>

{block.items?.length ? (
<div className="mt-3 space-y-2">
{block.items.map((it, i) => (
<div key={`${block.title}-it-${i}`} className="flex items-start justify-between gap-3 text-sm">
<div className="text-gray-700">
<span className="text-gray-900">•</span> {it.label}
</div>
<div className="text-gray-600 whitespace-nowrap">
{typeof it.price === "number" ? `${formatRubLocal(it.price)} ₽` : "включено"}
</div>
</div>
))}
</div>
) : null}
</div>
))}
</div>
</div>

{/* Оплата */}
<div className="pt-2">
<div className="text-sm font-semibold text-gray-900 mb-3">Оплата</div>

{orderConfirmation?.emailSent ? (
  <div className="bg-white border border-gray-200 rounded-[30px] p-6 shadow-sm">
    <div className="text-sm font-semibold text-gray-900">Бронирование оформлено</div>
    <p className="mt-2 text-sm text-gray-600">
      {orderConfirmation.paymentLink
        ? "Бронирование оформлено. Договор, детали заказа и ссылка на оплату отправлены вам на почту."
        : "Бронирование оформлено. Договор и детали заказа отправлены вам на почту. Ссылку на оплату пришлём отдельным письмом."}
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
    <div className="bg-white border border-gray-200 rounded-[30px] p-6 shadow-sm">
      <div className="text-sm font-semibold text-gray-900 mb-2">Email для получения информации</div>
      <input
        value={emailValue}
        onChange={(e) => handleInputChange("userEmail", e.target.value)}
        placeholder="name@email.com"
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-400"
        inputMode="email"
      />
      {!emailOk && (
        <div className="mt-2 text-xs text-red-600">
          Проверьте корректность e-mail.
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        На этот адрес придёт подтверждение заказа, детали церемонии и документы.
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-900 mb-3">Способ оплаты</div>
        <div className="space-y-2">
          {[
          { id: "card", title: "Картой по защищённой ссылке", subtitle: "Онлайн-оплата через банк" },
          { id: "transfer", title: "Оплата по банковским реквизитам", subtitle: "Реквизиты в письме" },
          { id: "sbp", title: "СБП по QR", subtitle: "Перевод по СБП" },
        ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPaymentMethod(option.id as PaymentMethod)}
              className={[
                "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                paymentMethod === option.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className={paymentMethod === option.id ? "mt-1 h-4 w-4 rounded-full bg-gray-900" : "mt-1 h-4 w-4 rounded-full border border-gray-400"} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{option.title}</div>
                  <div className="text-xs text-gray-500">{option.subtitle}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-[30px] p-5 shadow-sm">
        <div className="mt-1 flex items-center justify-between rounded-2xl bg-gray-900 text-white px-4 py-4">
          <div>
            <div className="text-[11px] text-white/70">К оплате</div>
            <div className="text-xl font-semibold">{formatRubLocal(totalRub)} ₽</div>
          </div>

          <Button
            type="button"
            onClick={onPayClick}
            disabled={!canSubmit || isSubmittingOrder}
            className="rounded-2xl bg-white text-gray-900 hover:bg-gray-100 px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmittingOrder ? "Оформление..." : "Оформить"}
          </Button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          После оформления мы отправим договор и детали заказа на email. Ссылку на оплату пришлём, если она доступна.
        </div>
      </div>
    </div>
  </div>
)}
</div>
</div>
);
}

default:
return null;
}
};

return (
<div ref={containerRef} className="w-full">
<Card className="bg-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/30 relative">
<CardHeader className="space-y-6 pb-6">
<Button
variant="ghost"
onClick={onBack}
className="self-start text-white md:text-gray-900 hover:bg-gray/10 md:hover:bg-gray-100 gap-2 rounded-full -ml-2"
type="button"
>
<ArrowLeft className="h-4 w-4" />
Назад к пакетам
</Button>

<div className="text-center">
<CardTitle className="text-2xl sm:text-3xl mb-2 text-white md:text-gray-900">
Настройка пакета
</CardTitle>
<CardDescription className="text-base text-white md:text-gray-900">
Персонализируйте выбранное решение под ваши потребности
</CardDescription>
</div>

<Stepper
steps={simplifiedSteps}
currentStep={currentStep}
completedSteps={completedSteps}
onStepClick={handleStepClick}
/>

<div className="text-center mb-2 mt-4">
  <div className="relative overflow-hidden rounded-xl border border-white/25 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.12)] md:border-zinc-200 md:bg-zinc-55/50 md:shadow-none p-5 transition-all md:hover:bg-zinc-55">
    <div className="flex gap-4 items-start">
      <div className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-700">
        {currentStep === 0 && <Package className="h-5 w-5" />}
        {currentStep === 1 && <Church className="h-5 w-5" />}
        {currentStep === 2 && <Car className="h-5 w-5" />}
        {currentStep === 3 && <FileText className="h-5 w-5" />}
        {currentStep === 4 && <CheckCircle2 className="h-5 w-5" />}
      </div>
      <div className="space-y-1.5 text-left">
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-900 md:text-zinc-500">
          <span className="flex md:hidden h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] text-white">
            {currentStep + 1}
          </span>
          {currentStep === 0 && "Этап 1: Атрибутика"}
          {currentStep === 1 && "Этап 2: Формат"}
          {currentStep === 2 && "Этап 3: Логистика"}
          {currentStep === 3 && "Этап 4: Документы"}
          {currentStep === 4 && "Этап 5: Итог"}
        </h4>
        <p className="text-[15px] leading-relaxed text-gray-900 md:text-zinc-800 font-normal">
          {currentStep === 0 && "Подберите атрибутику: выберите гроб, внутреннее убранство и другие ритуальные принадлежности."}
          {currentStep === 1 && "Настройте формат прощания: выберите тип церемонии (светская или религиозная) и длительность аренды зала."}
          {currentStep === 2 && "Спланируйте логистику: укажите дату и время прощания, выберите транспорт для усопшего и гостей."}
          {currentStep === 3 && "Заполните документы: укажите паспортные данные заявителя и информацию об усопшем для оформления."}
          {currentStep === 4 && "Проверьте и подтвердите: внимательно ознакомьтесь со всеми деталями заказа перед финальным оформлением."}
        </p>
      </div>
    </div>
  </div>
</div>
</CardHeader>

<CardContent className="px-6 sm:px-8 pb-8">
<div
className={cn(
"transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
isTransitioning
? "opacity-0 translate-y-8 scale-[0.96] blur-sm"
: "opacity-100 translate-y-0 scale-100 blur-0"
)}
>
{renderStepContent()}
</div>

<div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
<Button
variant="outline"
onClick={handlePrev}
disabled={currentStep === 0}
className="gap-2 rounded-[30px]"
type="button"
>
<ChevronLeft className="h-4 w-4" />
Назад
</Button>

<div className="text-sm text-gray-500">
Шаг {currentStep + 1} из {simplifiedSteps.length}
</div>

<Button
onClick={handleNext}
disabled={currentStep === simplifiedSteps.length - 1}
className="gap-2 bg-gray-900 hover:bg-gray-800 rounded-[30px]"
type="button"
>
Далее
<ChevronRight className="h-4 w-4" />
</Button>
</div>
</CardContent>
</Card>
<SimplifiedFloatingCalculator
  total={totalRub}
  breakdown={floatingBreakdown}
  flow={trackingFlow}
  trackingSessionId={trackingSessionId}
/>
</div>
);
}
