"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";

import { User, CircleDot } from "lucide-react";
import { PackagesSelection, type Package as PackagesSelectionPackage } from "./PackagesSelection";

import { PersonalAccountModal } from "./PersonalAccountModal";
import { SimpleCalendar } from "./SimpleCalendar";
import { SimplifiedStepperWorkflow } from "./SimplifiedStepperWorkflow";
import { buildOrderSummary } from "@/lib/orderSummary";

import { Stepper } from "./Stepper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Church,
  Edit2,
  Info,
  Search,
  Check,
  Snowflake,
  Sparkles,
  Shirt,
  Building,
  UserCheck,
  Users,
  Route,
  Bus,
  Package,
  Palette,
  Video,
  Cross,
  FileText,
  Utensils,
  Landmark,
  Camera,
  Car,
  Flower2,
  Music,
  RubleSign,
  Download,
  Share2,
} from "./Icons";

import { cn } from "./ui/utils";
import { UnifiedCoffinConfigurator } from "./UnifiedCoffinConfigurator";
import {
  calculateBreakdown as calculateBreakdownFromUtils,
  calculateTotal as calculateTotalFromUtils,
  type CalculatorConfig,
  trackEvent,
  getTrackingSessionId,
  reachMetrikaGoal,
  setMetrikaVisitParams,
  buildGoalName,
} from "./calculationUtils";


type PaymentMethod = "deposit_10" | "call_rep";
const SUPPORT_PHONE_DISPLAY = "+7 (985) 248-94-25";
const SUPPORT_PHONE_TEL = "+79852489425";
const SUPPORT_TELEGRAM_URL = "https://t.me/tihiydominfo";
const HERO_BG_SRC = "/hero-forest.jpg";

const steps = [
  { id: "format", label: "Формат", description: "Выбор церемонии" },
  { id: "logistics", label: "Логистика", description: "Место и транспорт" },
  { id: "attributes", label: "Атрибутика", description: "Выбор материалов" },
  { id: "documents", label: "Документы", description: "Основная информация" },
  { id: "confirmation", label: "Подтверждение", description: "Проверка данных" },
] as const;

const WIZARD_LOGISTICS_STEP_INDEX = 1;

const PRICES = {
  hallDuration: { 30: 0, 60: 8000, 90: 12000 },
  ceremonyType: { civil: 0, religious: 15000, combined: 20000 },
  hearse: 8000,
  familyTransport: { 5: 5000, 10: 8000, 15: 12000 },
  pallbearers: 6000,
} as const;

const HEARSE_CATEGORY_PRICE = {
  standard: 8000,
  comfort: 15000,
  premium: 35000,
} as const;

const HEARSE_CATEGORY_LABELS = {
  standard: "Стандарт",
  comfort: "Комфорт",
  premium: "Премиум",
} as const;

const HEARSE_CATEGORY_INFO = {
  standard: {
    title: "Стандарт",
    description:
      "Базовый катафалк. Чистый и исправный автомобиль для достойной перевозки усопшего.",
    imageSrc: "/images/hearse-lux.jpg",
  },
  comfort: {
    title: "Комфорт",
    description:
      "Улучшенный катафалк с кондиционером и декоративной отделкой салона. Повышенный комфорт для достойной церемонии.",
    imageSrc: "/images/hearse-lux.jpg",
  },
  premium: {
    title: "Премиум",
    description:
      "Mercedes-Benz с кондиционером, подиумом и декоративным оформлением. Высший класс для торжественной церемонии.",
    imageSrc: "/images/hearse-lux.jpg",
  },
} as const;

const PACKAGES = [
  {
    id: "basic",
    name: "Тихая церемония",
    price: 200000,
    description: "Необходимый минимум",
    features: ["Оформление документов",
      "Помощь в оформлении захоронения",
      "Базовая подготовка тела",
      "Перевозка к месту прощания/захоронения",
      "Носильщики",
      "Катафалк (стандарт)",
      "Гроб для захоронения (сосна)",
      "Венок (искусственный)",
      "Базовая отделка (обивка)",
      "Зал прощания",
      "Транспорт для близких (до 5 человек)",
      "Координатор в день церемонии"],
    popular: false,
  },
  {
    id: "standard",
    name: "Традиционное прощание",
    price: 400000,
    description: "Оптимальный вариант",
    features: [
      "Оформление документов",
      "Помощь в оформлении захоронения",
      "Базовая подготовка тела",
      "Перевозка к месту прощания/захоронения",
      "Носильщики",
      "Катафалк (комфорт)",
      "Гроб для захоронения (дуб)",
      "Венок (искусственный/живая композиция)",
      "Улучшенная отделка (обивка)",
      "Зал прощания",
      "Транспорт для близких (до 10 человек)",
      "Координатор в день церемонии",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Особое внимание",
    price: 600000,
    description: "Максимальный комфорт",
    features: [
      "Оформление документов",
      "Помощь в оформлении захоронения",
      "Базовая подготовка тела",
      "Перевозка к месту прощания/захоронения,",
      "Носильщики",
      "Катафалк (премиальный)",
      "Гроб для захоронения (ценное дерево)",
      "Венок (премиальная флористика)",
      "Премиальная отделка (обивка)",
      "Зал прощания",
      "Транспорт для близких повышенного комфорта (до 15 человек)",
      "Старший координатор церемонии",
    ],
    popular: false,
  },
] as const;

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
}

const PACKAGES_BURIAL = PACKAGES;

const PACKAGES_CREMATION = [
  {
    id: "cremation-standard",
    name: "Тихая церемония",
    price: 200000,
    description: "Базовый комплект услуг для кремации",
    features: [
      "Оформление документов",
      "Бронирование места в колумбарии",
      "Хранение и базовая подготовка тела",
      "Гроб-контейнер для кремации",
      "Транспортировка до крематория",
      "Кремация + урна стандартная",
    ],
    popular: false,
  },
  {
    id: "cremation-comfort",
    name: "Традиционное прощание",
    price: 400000,
    description: "Расширенный набор услуг для кремации",
    features: [
      "Оформление документов",
      "Бронирование места в колумбарии",
      "Хранение и подготовка тела",
      "Гроб для прощания + гроб-контейнер",
      "Транспортировка до крематория",
      "Кремация",
      "Урна керамическая",
      "Зал прощания на 2 часа",
      "Поминальный обед (до 20 человек)",
    ],
    popular: true,
  },
  {
    id: "cremation-premium",
    name: "Особое внимание",
    price: 600000,
    description: "Полный спектр услуг премиум класса",
    features: [
      "Оформление документов",
      "Бронирование места в колумбарии премиум",
      "Хранение и подготовка тела",
      "Гроб элитный для прощания + контейнер",
      "Транспортировка покойного",
      "Кремация",
      "Урна премиум (мрамор/гранит)",
      "Композиция из живых цветов",
      "Ритуальные принадлежности премиум",
      "Ритуальный зал на 4 часа",
      "Поминальный обед (до 40 человек)",
      "Индивидуальный координатор",
    ],
    popular: false,
  },
] as const;

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

type AttributesPresetId = "minimal" | "recommended" | "extended";

const WOOD_ID_BY_NAME: Record<string, string> = {
  "Сосна": "pine",
  "Дуб": "oak",
  "Элитное дерево": "elite",
};

const LINING_ID_BY_NAME: Record<string, string> = {
  "Атлас белый": "satin-white",
  "Шелк кремовый": "silk-cream",
  "Бархат бордовый": "velvet-burgundy",
};

const HARDWARE_ID_BY_NAME: Record<string, string> = {
  "Латунь": "brass",
  "Серебро": "silver",
  "Золото": "gold",
};

const DEFAULT_WREATH_PRESET = {
  type: "artificial",
  size: "M",
  text: "",
  quantity: 1,
  price: 4500,
};

const ATTRIBUTES_PRESETS: Array<{
  id: AttributesPresetId;
  badge: string;
  title: string;
  priceText: string;
  imageSrc: string;
  bullets: string[];
  coffin: {
    wood: { id: string; name: string; price: number };
    lining: { id: string; name: string; price: number };
    hardware: { id: string; name: string; price: number };
  };
}> = [
  {
    id: "minimal",
    badge: "Самый доступный",
    title: "Минимальный набор",
    priceText: "25 000 ₽",
    imageSrc: "/images/coffin/previews/pine-atlas.jpg",
    bullets: ["Гроб из сосны", "Атлас белый", "Фурнитура латунь"],
    coffin: {
      wood: { id: "pine", name: "Сосна", price: 0 },
      lining: { id: "satin-white", name: "Атлас белый", price: 0 },
      hardware: { id: "brass", name: "Латунь", price: 0 },
    },
  },
  {
    id: "recommended",
    badge: "Самый популярный",
    title: "Рекомендуемый набор",
    priceText: "45 000 ₽",
    imageSrc: "/images/coffin/previews/oak-silk-cream.jpg",
    bullets: ["Гроб из дуба", "Шелк кремовый", "Фурнитура серебро"],
    coffin: {
      wood: { id: "oak", name: "Дуб", price: 20000 },
      lining: { id: "silk-cream", name: "Шелк кремовый", price: 5000 },
      hardware: { id: "silver", name: "Серебро", price: 8000 },
    },
  },
  {
    id: "extended",
    badge: "Долговечный материал",
    title: "Расширенный набор",
    priceText: "95 000 ₽",
    imageSrc: "/images/coffin/previews/elite-velvet-burgundy.jpg",
    bullets: ["Элитное дерево", "Бархат бордовый", "Фурнитура золото"],
    coffin: {
      wood: { id: "elite", name: "Элитное дерево", price: 50000 },
      lining: { id: "velvet-burgundy", name: "Бархат бордовый", price: 7500 },
      hardware: { id: "gold", name: "Золото", price: 15000 },
    },
  },
];

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

const formatDateTimeSlot = (value: { date?: Date; timeSlot?: TimeSlot }) =>
  value.date && value.timeSlot
    ? `${value.date.toLocaleDateString("ru-RU")} — ${TIME_SLOT_LABELS[value.timeSlot]}`
    : "—";


const additionalServices: AdditionalService[] = [
  { id: "morgue-storage", name: "Хранение в морге", price: 2500, description: "Резерв времени до церемонии", icon: Snowflake },
  { id: "sanitary-prep", name: "Санитарная подготовка и бальзамирование", price: 12000, description: "Аккуратный внешний вид", icon: Sparkles },
  { id: "clothing", name: "Одежда и облачение", price: 8000, description: "Подбор, подготовка, укладка", icon: Shirt },
  { id: "hall-rental", name: "Аренда зала прощания", price: 15000, description: "60–90 мин, подготовка площадки", icon: Building },
  { id: "coordinator", name: "Координатор церемонии", price: 18000, description: "Сценарий, тайминг", icon: UserCheck },
  { id: "pallbearers", name: "Носильщики (4–6 чел.)", price: 6000, description: "Церемониальная группа", icon: Users },
  { id: "hearse-premium", name: "Катафалк премиум-класса", price: 14000, description: "Комфорт/бизнес-класс", icon: Car },
  { id: "hearse-extra-trips", name: "Дополнительные рейсы", price: 5000, description: "Морг → зал → кладбище", icon: Route },
  { id: "transport-family", name: "Транспорт для близких", price: 10000, description: "Микроавтобус/автобус", icon: Bus },
  { id: "fresh-flowers", name: "Живая флористика", price: 12000, description: "Композиции, гирлянды", icon: Flower2 },
  { id: "textile-premium", name: "Текстиль премиум", price: 7000, description: "Покрывало, подушка улучшенные", icon: Package },
  { id: "decor", name: "Декор зала и места", price: 15000, description: "Свечи, стойки, шатёр", icon: Palette },
  { id: "music", name: "Музыкальное сопровождение", price: 8000, description: "Живые инструменты/фон", icon: Music },
  { id: "photo-video", name: "Фото и видеосъёмка", price: 15000, description: "Памятный ролик", icon: Camera },
  { id: "online-stream", name: "Онлайн-трансляция", price: 8000, description: "Для родственников на расстоянии", icon: Video },
  { id: "priest", name: "Религиозный обряд", price: 9000, description: "По конфессии", icon: Church },
  { id: "memorial-cross", name: "Памятный крест временный", price: 5000, description: "До установки памятника", icon: Cross },
  { id: "printing", name: "Печать и полиграфия", price: 4000, description: "Ленты, программки, карточки", icon: FileText },
  { id: "memorial-meal", name: "Поминальный обед", price: 35000, description: "Подбор зала, меню", icon: Utensils },
  { id: "monument", name: "Памятник и благоустройство", price: 85000, description: "Проект, изготовление, установка", icon: Landmark },
];

interface CemeteryData {
  id: string;
  name: string;
  type: "cemetery" | "crematorium" | "both";
  district: string;
  address: string;
  categories: { standard?: number; comfort?: number; premium?: number };
  hasColumbarium?: boolean;
  working: boolean;
}

const MOSCOW_CEMETERIES: CemeteryData[] = [
  // Крупные муниципальные кладбища
  {
    id: "khovanskoe-south",
    name: "Хованское кладбище (Южное)",
    type: "cemetery",
    district: "ЮЗАО",
    address: "ул. Поляны, вл. 42",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    working: true,
  },
  {
    id: "khovanskoe-north",
    name: "Хованское кладбище (Северное)",
    type: "cemetery",
    district: "ЮЗАО",
    address: "ул. Поляны, вл. 42",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    working: true,
  },
  {
    id: "khovanskoe-west",
    name: "Хованское кладбище (Западное)",
    type: "cemetery",
    district: "ЮЗАО",
    address: "ул. Поляны, вл. 42",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    working: true,
  },
  {
    id: "khovanskoe-central",
    name: "Хованское кладбище (Центральное)",
    type: "cemetery",
    district: "ЮЗАО",
    address: "ул. Поляны, вл. 42",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    working: true,
  },
  {
    id: "troyekurovskoye",
    name: "Троекуровское кладбище",
    type: "cemetery",
    district: "ЗАО",
    address: "Рябиновая ул., вл. 28А",
    categories: {
      standard: 120000,
      comfort: 220000,
      premium: 350000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "mitinskoye",
    name: "Митинское кладбище",
    type: "cemetery",
    district: "СЗАО",
    address: "Пятницкое шоссе, 6-й км",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "nikolo-arhangelskoe",
    name: "Николо-Архангельское кладбище",
    type: "both",
    district: "ЗАО",
    address: "д. Сабурово, ул. Центральная, вл. 21",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "vostryakovskoye",
    name: "Востряковское кладбище",
    type: "cemetery",
    district: "ЮЗАО",
    address: "ул. Летняя, д. 2",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "dolgoprudnenskoe",
    name: "Долгопрудненское кладбище",
    type: "cemetery",
    district: "САО",
    address: "Долгопрудненское шоссе, вл. 46",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    working: true,
  },
  {
    id: "perepechinckoe",
    name: "Перепечинское кладбище",
    type: "cemetery",
    district: "ВАО",
    address: "Перепечинская ул., вл. 15",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
    working: true,
  },
  {
    id: "rogovskoye",
    name: "Роговское кладбище",
    type: "cemetery",
    district: "ЮВАО",
    address: "Михайловское шоссе, вл. 9",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
    working: true,
  },
  {
    id: "almazovskoe",
    name: "Алмазовское кладбище",
    type: "cemetery",
    district: "ЗАО",
    address: "д. Алмазово",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
    working: true,
  },
  {
    id: "khokhlovskoye",
    name: "Хохловское кладбище",
    type: "cemetery",
    district: "СВАО",
    address: "д. Хохлово",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
    working: true,
  },
  {
    id: "babushkinskoe",
    name: "Бабушкинское кладбище",
    type: "cemetery",
    district: "СВАО",
    address: "Ярославское шоссе, вл. 52",
    categories: {
      standard: 110000,
      comfort: 210000,
      premium: 310000,
    },
    working: true,
  },
  {
    id: "golovinskoe",
    name: "Головинское кладбище",
    type: "cemetery",
    district: "САО",
    address: "Головинское шоссе, д. 13",
    categories: {
      standard: 120000,
      comfort: 220000,
      premium: 320000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "perovskoe",
    name: "Перовское кладбище",
    type: "cemetery",
    district: "ВАО",
    address: "ул. Кетчерская, д. 20",
    categories: {
      standard: 95000,
      comfort: 190000,
      premium: 290000,
    },
    hasColumbarium: true,
    working: true,
  },
  // Крематории
  {
    id: "crematorium-nikolo",
    name: "��иколо-Архангельский крематорий",
    type: "crematorium",
    district: "ЗАО",
    address: "д. Сабурово, ул. Центральная, вл. 21",
    categories: {
      standard: 15000,
      comfort: 25000,
      premium: 40000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "crematorium-mitino",
    name: "Митинский крематорий",
    type: "crematorium",
    district: "СЗАО",
    address: "Пятницкое шоссе, 6-й км",
    categories: {
      standard: 15000,
      comfort: 25000,
      premium: 40000,
    },
    hasColumbarium: true,
    working: true,
  },
  {
    id: "crematorium-khovansky",
    name: "Хованский крематорий",
    type: "crematorium",
    district: "ЮЗАО",
    address: "ул. Поляны, вл. 42",
    categories: {
      standard: 15000,
      comfort: 25000,
      premium: 40000,
    },
    hasColumbarium: true,
    working: true,
  },
  // Закрытые кладбища (для справки)
  {
    id: "vagankovskoye",
    name: "Ваганьковское кладбище",
    type: "cemetery",
    district: "ЦАО",
    address: "Сергея Макеева ул., д. 15",
    categories: {},
    working: false,
  },
  {
    id: "novodevichy",
    name: "Новодевичье кладбище",
    type: "cemetery",
    district: "ЦАО",
    address: "Лужнецкий проезд, ���. 2",
    categories: {},
    working: false,
  },
  {
    id: "danilovskoye",
    name: "Даниловское кладбище",
    type: "cemetery",
    district: "ЮА��",
    address: "Духовской пер., д. 5",
    categories: {},
    working: false,
  },
  {
    id: "donskoe",
    name: "Донское кладбище",
    type: "cemetery",
    district: "ЮАО",
    address: "пл. Гагарина, д. 1, стр. 1",
    categories: {},
    working: false,
  },
];

type SimplifiedPackage = PackagesSelectionPackage;

const MO_CEMETERIES: CemeteryData[] = [
  {
    id: "mytishchinskoe",
    name: "Мытищинское кладбище (Волковское)",
    type: "cemetery",
    district: "Мытищинский р-н",
    address: "Волковское шоссе, вл. 1",
    categories: {
      standard: 80000,
      comfort: 150000,
      premium: 250000,
    },
    working: true,
  },
  {
    id: "krasnogorskoe",
    name: "Красногорс��о���� кладбище",
    type: "cemetery",
    district: "Красногорский р-н",
    address: "г. Красногорск, Ильинское шоссе, 1",
    categories: {
      standard: 85000,
      comfort: 160000,
      premium: 260000,
    },
    working: true,
  },
  {
    id: "novolyuberetskoe",
    name: "Новолюберецкое кладбище",
    type: "cemetery",
    district: "Люберецкий р-н",
    address: "г. Люберцы, Новорязанское шоссе",
    categories: {
      standard: 75000,
      comfort: 140000,
      premium: 240000,
    },
    working: true,
  },
  {
    id: "sheremetyevskoe",
    name: "Шереметьевское кладбище",
    type: "cemetery",
    district: "Долгопрудный",
    address: "г. Долгопрудный, мкр. Шереметьевский",
    categories: {
      standard: 70000,
      comfort: 130000,
      premium: 220000,
    },
    working: true,
  },
  {
    id: "nevzorovskoe",
    name: "Невзоровское кладбище",
    type: "cemetery",
    district: "Пушкинский р-н",
    address: "д. Невзорово",
    categories: {
      standard: 65000,
      comfort: 120000,
      premium: 200000,
    },
    working: true,
  },
  {
    id: "ostrovtsy",
    name: "Островецкое кладбище",
    type: "cemetery",
    district: "Раменский р-н",
    address: "д. Островцы",
    categories: {
      standard: 60000,
      comfort: 110000,
      premium: 190000,
    },
    working: true,
  },
  {
    id: "domodedovskoe-mo",
    name: "Домодедовское городское кладбище",
    type: "cemetery",
    district: "Домодедово",
    address: "г. Домодедово",
    categories: {
      standard: 70000,
      comfort: 130000,
      premium: 220000,
    },
    working: true,
  },
  {
    id: "balashikhinskoe",
    name: "Балашихинское (Новое) кладбище",
    type: "cemetery",
    district: "Балашиха",
    address: "г. Балашиха, Новское шоссе",
    categories: {
      standard: 75000,
      comfort: 140000,
      premium: 230000,
    },
    working: true,
  },
  {
    id: "khimkinskoe",
    name: "Химкинское кладбище",
    type: "cemetery",
    district: "Химки",
    address: "г. Химки, Новосходненское шоссе",
    categories: {
      standard: 90000,
      comfort: 170000,
      premium: 270000,
    },
    working: true,
  },
  {
    id: "odin-laykovskoe",
    name: "Лайковское кладбище",
    type: "cemetery",
    district: "Одинцовский р-н",
    address: "с. Лайково",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
    working: true,
  },
  {
    id: "nakhabinskoe",
    name: "Нахабинское кладбище",
    type: "cemetery",
    district: "Красногорский р-н",
    address: "п. Нахабино",
    categories: {
      standard: 70000,
      comfort: 130000,
      premium: 220000,
    },
    working: true,
  },
  {
    id: "kashirskoe",
    name: "Каширское кладбище",
    type: "cemetery",
    district: "Кашира",
    address: "г. Кашира",
    categories: {
      standard: 50000,
      comfort: 90000,
      premium: 150000,
    },
    working: true,
  },
];

const STEPPER_CALCULATOR_CONFIG: CalculatorConfig = {
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
    hallDuration: PRICES.hallDuration,
    ceremonyType: PRICES.ceremonyType,
    hearse: PRICES.hearse,
    familyTransport: PRICES.familyTransport,
    pallbearers: PRICES.pallbearers,
  },
  packages: PACKAGES.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    features: [...pkg.features],
  })),
  additionalServices: additionalServices.map((service) => ({
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

type CemeteryCategory = "standard" | "comfort" | "premium";

const CATEGORY_INFO: Record<
CemeteryCategory,
{ subtitle: string; title: string; description: string }
> = {
standard: {
subtitle: "Обычное место",
title: "Стандарт",
description:
"Стандартное место включает участок 2×2.5 м в общедоступных секторах кладбища. Подходит для установки традиционного памятника и базового благоустройства. Размещение в зонах с удобным подъездом.",
},
comfort: {
subtitle: "Удобное расположение",
title: "Комфорт",
description:
"Место в более удобных секторах: проще подъезд и логистика, комфортнее для гостей. Обычно ближе к аллеям/ориентирам.",
},
premium: {
subtitle: "Престижная зона",
title: "Премиум",
description:
"Престижная зона: наиболее удобное и статусное расположение, минимальная сложность подъезда и организации церемонии.",
},
};

interface StepperWorkflowProps {
  formData: {
    serviceType: string;
    hasHall: boolean;
    hallDuration: number;
    ceremonyType: string;
    confession: string;
    ceremonyOrder: string;

paymentPlan?: "full" | "deposit" | "split";
paidNowRub?: string;
splitSchedule?: string;


    cemetery: string;
    selectedSlot: string;
    pickupDateTime?: { date?: string | Date; timeSlot?: TimeSlot; time?: string };
    farewellDateTime?: { date?: string | Date; timeSlot?: TimeSlot; time?: string };
    burialDateTime?: { date?: string | Date; timeSlot?: TimeSlot; time?: string };

    needsHearse: boolean;
    hearseCategory: "standard" | "comfort" | "premium";
    hearseRoute: { morgue: boolean; hall: boolean; church: boolean; cemetery: boolean };

    needsFamilyTransport: boolean;
    familyTransportSeats: number;

    distance: string;

    clientName: string;
    clientEmail: string;

    userEmail: string;

    needsPallbearers: boolean;

    packageType: string;
    selectedAdditionalServices: string[];

    specialRequests: string;
    coffinConfig?: {
      coffin?: {
        wood?: { name?: string };
        lining?: { name?: string };
        hardware?: { name?: string };
        quantity?: number;
      };
      wreath?: {
        type?: string;
        size?: string;
        text?: string;
        quantity?: number;
      };
    };

    fullName: string;
    birthDate: string;
    deathDate: string;
    deathCertificate: string;
    relationship: string;

    dataConsent: boolean;
  };
  onUpdateFormData: (field: string, value: any) => void;
  onStepChange?: (step: number) => void;
  onCemeteryCategoryChange?: (category: "standard" | "comfort" | "premium") => void;
  onModeChange?: (mode: "wizard" | "package") => void;
  onOrderConfirmed?: (confirmed: boolean) => void;
}

export function StepperWorkflow({
  formData,
  onUpdateFormData,
  onStepChange,
  onCemeteryCategoryChange,
  onModeChange,
  onOrderConfirmed,
}: StepperWorkflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bgEndWizardRef = useRef<HTMLDivElement | null>(null);
  const bgEndPackagesRef = useRef<HTMLDivElement | null>(null);
  const [bgH, setBgH] = useState(0);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ флаг: скроллим только если переход был через "Далее"
  const shouldScrollOnStepChangeRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const previousStepRef = useRef(0);

  const [workflowMode, setWorkflowMode] = useState<"wizard" | "packages">("packages");
  const [selectedPackageForSimplified, setSelectedPackageForSimplified] =
    useState<SimplifiedPackage | null>(null);

  const trackingSessionId = getTrackingSessionId();
  const trackingFlow: "wizard" = "wizard";
  const metrikaVisitSessionRef = useRef<string | null>(null);

  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [showConsentError, setShowConsentError] = useState(false);

  const [cemeterySearchQuery, setCemeterySearchQuery] = useState("");
  const [showCemeteryResults, setShowCemeteryResults] = useState(false);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<"standard" | "comfort" | "premium">("standard");

  const [showHearseDialog, setShowHearseDialog] = useState(false);

  useLayoutEffect(() => {
    const calc = () => {
      requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        const end =
          (workflowMode === "wizard" ? bgEndWizardRef.current : bgEndPackagesRef.current) ??
          bgEndWizardRef.current ??
          bgEndPackagesRef.current;
        if (!wrap || !end) return;
        const wrapTop = wrap.getBoundingClientRect().top;
        const endBottom = end.getBoundingClientRect().bottom;
        const offset = workflowMode === "packages" ? 32 : 0;
        const height = Math.max(0, Math.round(endBottom - wrapTop + offset));
        if (height > 0) setBgH(height);
      });
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [workflowMode, currentStep, selectedPackageForSimplified]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (metrikaVisitSessionRef.current === trackingSessionId) return;
    metrikaVisitSessionRef.current = trackingSessionId;
    setMetrikaVisitParams({ td_flow: "wizard" });
  }, [workflowMode, trackingSessionId]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("deposit_10");
  const didInitDefaultsRef = useRef(false);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    emailSent: boolean;
    paymentLink?: string | null;
  } | null>(null);
  const lastPaymentSnapshotRef = useRef<string>("");
  const lastPayPlanRef = useRef<"full" | "deposit" | "split">(
    (formData.paymentPlan || "full") as "full" | "deposit" | "split",
  );
  const payPlanSelectionSeqRef = useRef(0);
  const selectedPayPlan = (formData.paymentPlan || "full") as "full" | "deposit" | "split";
  const getPayNowRub = (plan: "full" | "deposit" | "split", total: number) => {
    const normalized = Math.max(0, Math.round(total || 0));
    if (plan === "deposit") return Math.max(0, Math.round(normalized * 0.05));
    if (plan === "split") return Math.floor(normalized / 4);
    return normalized;
  };
  const getPaymentSnapshot = (
    plan: "full" | "deposit" | "split",
    email: string,
    method: PaymentMethod,
  ) =>
    JSON.stringify({
      plan,
      email: email.trim(),
      method,
    });

  const howItWorksScrollRef = useRef<HTMLDivElement | null>(null);
  const howItWorksCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeHowItWorksIndex, setActiveHowItWorksIndex] = useState(0);
  const activeHowItWorksRef = useRef(0);

  const howItWorksSteps = [
    {
      title: "Вы выбираете удобный способ начала",
      subtitle: "Готовый сценарий — если нужно быстро.",
      text: [
        "Пошаговый мастер — если хотите настроить всё детально.",
        "Вы можете изменить любые решения позже.",
      ],
      icon: Sparkles,
    },
    {
      title: "Формируете формат прощания",
      subtitle: "Выбираете тип церемонии, атрибутику, логистику и предпочтительное время.",
      text: [
        "Система сразу показывает структуру и ориентиры по стоимости.",
        "Без звонков. Без давления.",
      ],
      icon: Church,
    },
    {
      title: "Уточняете детали и проверяете итог",
      subtitle: "Указываете необходимые данные.",
      text: [
        "Видите полную детализацию: что включено, как всё будет происходить и итоговую сумму.",
        "Никаких скрытых пунктов.",
      ],
      icon: CheckCircle2,
    },
    {
      title: "Подтверждаете и выбираете способ оплаты",
      subtitle: "Вы выбираете способ оплаты и указываете email для договора.",
      text: [
        "Мы отправляем вам подтверждение и документы на почту.",
        "Вы ничего не оплачиваете, пока всё не проверите.",
      ],
      icon: FileText,
    },
    {
      title: "Мы закрепляем за вами координатора",
      subtitle: "Ваш заказ передаётся специалисту с полной детализацией.",
      text: [
        "Он связывается с вами только для уточнений и подтверждений.",
        "Без навязывания услуг.",
      ],
      icon: UserCheck,
    },
  ];

  useEffect(() => {
    activeHowItWorksRef.current = activeHowItWorksIndex;
  }, [activeHowItWorksIndex]);

  useEffect(() => {
    const root = howItWorksScrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let nextIndex = activeHowItWorksRef.current;
        let maxRatio = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLElement).dataset.index || 0);
          if (entry.intersectionRatio >= maxRatio) {
            maxRatio = entry.intersectionRatio;
            nextIndex = idx;
          }
        });
        if (nextIndex !== activeHowItWorksRef.current) {
          setActiveHowItWorksIndex(nextIndex);
        }
      },
      { root, threshold: [0.6, 0.75, 0.9] },
    );

    howItWorksCardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const handleHowItWorksSelect = (index: number) => {
    setActiveHowItWorksIndex(index);
    const target = howItWorksCardRefs.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const resetOrderConfirmation = () => {
    if (!orderConfirmation) return;
    setOrderConfirmation(null);
  };

  useEffect(() => {
    if (didInitDefaultsRef.current) return;
    const updates: Array<[string, any]> = [];

    if (!formData.serviceType) updates.push(["serviceType", "burial"]);
    if (formData.hasHall == null) updates.push(["hasHall", true]);
    if (!formData.hallDuration) updates.push(["hallDuration", 30]);
    if (!formData.ceremonyType) updates.push(["ceremonyType", "civil"]);
    if (!formData.ceremonyOrder) updates.push(["ceremonyOrder", "civil-first"]);
    if (!formData.paymentPlan) updates.push(["paymentPlan", "full"]);
    if (!formData.hearseCategory) updates.push(["hearseCategory", "standard"]);
    if (formData.needsHearse == null) updates.push(["needsHearse", true]);
    if (formData.needsFamilyTransport == null) updates.push(["needsFamilyTransport", false]);
    if (!formData.familyTransportSeats) updates.push(["familyTransportSeats", 5]);
    if (formData.needsPallbearers == null) updates.push(["needsPallbearers", true]);
    if (!formData.hearseRoute) {
      updates.push([
        "hearseRoute",
        { morgue: true, hall: true, church: true, cemetery: true },
      ]);
    }
    if (!Array.isArray(formData.selectedAdditionalServices)) {
      updates.push(["selectedAdditionalServices", []]);
    }

    updates.forEach(([field, value]) => onUpdateFormData(field, value));
    didInitDefaultsRef.current = true;
  }, [formData, onUpdateFormData]);

  const scrollToWizardTop = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEntryMethod = (method: "self" | "call" | "telegram") => {
    trackEvent("entry_method_selected", { method, flow: trackingFlow });
  };

  const handleStartOnline = () => {
    openPackagesMode();
    scrollToWizardTop();
    handleEntryMethod("self");
  };

  const handleViewPackages = () => {
    const packagesEl = document.getElementById("packages");
    if (packagesEl) {
      packagesEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      openPackagesMode();
      scrollToWizardTop();
    }
  };

  // ✅ “первое монтирование”
  useEffect(() => {
    const t = setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const minStep = 0;
    const maxStep = steps.length - 1;
    if (currentStep < minStep) {
      setCurrentStep(minStep);
      return;
    }
    if (currentStep > maxStep) {
      setCurrentStep(maxStep);
    }
  }, [currentStep]);

  // ✅ notify parent step change
  useEffect(() => {
    if (!isInitialMountRef.current && onStepChange) onStepChange(currentStep);
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (!onOrderConfirmed) return;
    onOrderConfirmed(Boolean(orderConfirmation?.emailSent));
  }, [orderConfirmation, onOrderConfirmed]);

  // ✅ скролл-триггер: только по флагу (т.е. "Далее")
  useEffect(() => {
    if (!isInitialMountRef.current && previousStepRef.current !== currentStep) {
      if (shouldScrollOnStepChangeRef.current) {
        scrollToWizardTop();
      }
      shouldScrollOnStepChangeRef.current = false;
    }
    previousStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (onCemeteryCategoryChange) onCemeteryCategoryChange(selectedCemeteryCategory);
  }, [selectedCemeteryCategory, onCemeteryCategoryChange]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== 0) return;
    if (wizardStartedRef.current) return;
    wizardStartedRef.current = true;
    trackEvent(
      "wizard_started",
      { entry_mode: "wizard", flow: trackingFlow },
      `${trackingSessionId}:${trackingFlow}:step1`,
    );
  }, [workflowMode, currentStep, trackingFlow, trackingSessionId]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== 0) return;
    if (formatStartedRef.current) return;
    formatStartedRef.current = true;
    reachMetrikaGoal(buildGoalName(trackingFlow, "format_started"), {
      flow: trackingFlow,
    });
  }, [workflowMode, currentStep, trackingFlow]);

  useEffect(() => {
    if (workflowMode !== "wizard" || currentStep !== 0) return;
    if (!formData.serviceType) return;
    const totalRub = Math.max(0, Math.round(calculateTotal() || 0));
    trackEvent(
      "ceremony_type_selected",
      {
        burial_type: formData.serviceType,
        has_hall: !!formData.hasHall,
        value: totalRub,
        currency: "RUB",
        flow: trackingFlow,
      },
      `${trackingSessionId}:${trackingFlow}:ceremony_type:${formData.serviceType}:${formData.hasHall}`,
    );
  }, [workflowMode, currentStep, formData.serviceType, formData.hasHall]);

  useEffect(() => {
    if (workflowMode !== "wizard" || currentStep !== 0) return;
    if (!formData.hasHall) return;
    const ceremonyFormat =
      formData.ceremonyType === "civil"
        ? "secular"
        : formData.ceremonyType === "religious"
          ? "religious"
          : formData.ceremonyType === "combined"
            ? "combined"
            : undefined;
    const hallDuration = Number(formData.hallDuration || 0);
    if (!ceremonyFormat || !hallDuration) return;
    const totalRub = Math.max(0, Math.round(calculateTotal() || 0));
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
  }, [workflowMode, currentStep, formData.hasHall, formData.ceremonyType, formData.hallDuration]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== 2) return;
    if (attributesStartedRef.current) return;
    attributesStartedRef.current = true;
    trackEvent(
      "attributes_started",
      { flow: trackingFlow },
      `${trackingSessionId}:${trackingFlow}:step2`,
    );
  }, [workflowMode, currentStep]);

  useEffect(() => {
    if (workflowMode !== "wizard" || currentStep !== 2) return;
    const coffinType = formData.coffinConfig?.coffin?.wood?.name;
    const lining = formData.coffinConfig?.coffin?.lining?.name;
    const hasFlowers = Boolean(
      formData.coffinConfig?.wreath?.type
        || formData.selectedAdditionalServices?.includes("fresh-flowers"),
    );
    const hasCross = Boolean(
      formData.selectedAdditionalServices?.includes("memorial-cross"),
    );
    const wishesFilled = Boolean((formData.specialRequests || "").trim());
    if (!coffinType && !lining && !hasFlowers && !hasCross && !wishesFilled) return;
    const totalRub = Math.max(0, Math.round(calculateTotal() || 0));
    trackEvent(
      "attributes_selected",
      {
        coffin_type: coffinType,
        lining,
        has_flowers: hasFlowers,
        has_cross: hasCross,
        wishes_filled: wishesFilled,
        value: totalRub,
        currency: "RUB",
        flow: trackingFlow,
      },
      `${trackingSessionId}:${trackingFlow}:attributes:${coffinType || ""}:${lining || ""}:${hasFlowers}:${hasCross}:${wishesFilled}`,
    );
  }, [
    workflowMode,
    currentStep,
    formData.coffinConfig,
    formData.selectedAdditionalServices,
    formData.specialRequests,
  ]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== WIZARD_LOGISTICS_STEP_INDEX) return;
    if (logisticsStartedRef.current) return;
    logisticsStartedRef.current = true;
    const dedupeKey = `${trackingSessionId}:${trackingFlow}:step4`;
    trackEvent(
      "logistics_started",
      { flow: trackingFlow },
      dedupeKey,
    );
  }, [workflowMode, currentStep, trackingFlow, trackingSessionId]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== 3) return;
    if (documentsStartedRef.current) return;
    documentsStartedRef.current = true;
    trackEvent(
      "documents_started",
      { flow: trackingFlow },
      `${trackingSessionId}:${trackingFlow}:step5`,
    );
  }, [workflowMode, currentStep]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== 4) return;
    if (!confirmationViewedRef.current) {
      confirmationViewedRef.current = true;
      reachMetrikaGoal(buildGoalName(trackingFlow, "confirmation_viewed"), {
        flow: trackingFlow,
      });
    }
    if (!calculatorViewedRef.current) {
      const totalRub = Math.max(0, Math.round(calculateTotal() || 0));
      const breakdown = calculateBreakdown();
      const itemsCount = breakdown.reduce(
        (acc, section) => acc + (section.items?.length || 0),
        0,
      );
      calculatorViewedRef.current = true;
      trackEvent(
        "calculator_viewed",
        {
          value: totalRub,
          currency: "RUB",
          burial_type: formData.serviceType,
          items_count: itemsCount,
          flow: trackingFlow,
        },
        `${trackingSessionId}:${trackingFlow}:step6`,
      );
      reachMetrikaGoal(buildGoalName(trackingFlow, "calculator_viewed"), {
        flow: trackingFlow,
      });
    }

    if (!contactsStartedRef.current) {
      contactsStartedRef.current = true;
      trackEvent(
        "contacts_started",
        { flow: trackingFlow },
        `${trackingSessionId}:${trackingFlow}:contacts`,
      );
    }
  }, [workflowMode, currentStep, formData.serviceType]);

  useEffect(() => {
    if (workflowMode !== "wizard") return;
    if (currentStep !== 4) return;
    if (lastPayPlanRef.current === selectedPayPlan) return;
    lastPayPlanRef.current = selectedPayPlan;
    payPlanSelectionSeqRef.current += 1;
    const totalRub = Math.max(0, Math.round(calculateTotal() || 0));
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
  }, [workflowMode, currentStep, selectedPayPlan]);

  useEffect(() => {
    if (!isSubmittingOrder) return;
    if (!lastPaymentSnapshotRef.current) return;
    const currentSnapshot = getPaymentSnapshot(
      (formData.paymentPlan || "full") as "full" | "deposit" | "split",
      formData.userEmail || "",
      paymentMethod,
    );
    if (currentSnapshot !== lastPaymentSnapshotRef.current) {
      setIsSubmittingOrder(false);
    }
  }, [
    isSubmittingOrder,
    formData.paymentPlan,
    formData.userEmail,
    paymentMethod,
  ]);

  // ✅ закрытие результатов поиска при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#cemetery") && !target.closest(".cemetery-results")) {
        setShowCemeteryResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: any) => onUpdateFormData(field, value);

  // В wizard не допускаем пакет из "Готовых решений"
  useEffect(() => {
    if (workflowMode === "wizard" && formData.packageType) {
      handleInputChange("packageType", "");
    }
  }, [workflowMode, formData.packageType, onUpdateFormData]);

  const handleSkipField = (field: string) => {
    const currentValue = (formData as any)[field];
    onUpdateFormData(field, currentValue === "—" ? "" : "—");
  };

  // ✅ КЛЮЧЕВОЕ: если выключили зал — чистим маршрут и время
  const [farewellDateTime, setFarewellDateTime] = useState<{ date?: Date; timeSlot?: TimeSlot }>({});
  const [pickupDateTime, setPickupDateTime] = useState<{ date?: Date; timeSlot?: TimeSlot }>({});
  const [burialDateTime, setBurialDateTime] = useState<{ date?: Date; timeSlot?: TimeSlot }>({});

  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [showFarewellDialog, setShowFarewellDialog] = useState(false);
  const [showBurialDialog, setShowBurialDialog] = useState(false);

  const [attributesMode, setAttributesMode] = useState<"preset" | "custom">("preset");
  const [selectedAttributesPreset, setSelectedAttributesPreset] =
    useState<AttributesPresetId>("recommended");
  const presetInitializedRef = useRef(false);
  const [isHearseInfoOpen, setIsHearseInfoOpen] = useState(false);
  const [openHearseCategoryInfo, setOpenHearseCategoryInfo] = useState<
    "standard" | "comfort" | "premium" | null
  >(null);
  const [canHoverHearseInfo, setCanHoverHearseInfo] = useState(false);
  const hearseInfoRef = useRef<HTMLDivElement>(null);
  const hearseCategoryInfoRef = useRef<HTMLDivElement>(null);
  const wizardStartedRef = useRef(false);
  const attributesStartedRef = useRef(false);
  const formatStartedRef = useRef(false);
  const formatFilledRef = useRef(false);
  const attributesFilledRef = useRef(false);
  const logisticsFilledRef = useRef(false);
  const documentsFilledRef = useRef(false);
  const confirmationViewedRef = useRef(false);
  const logisticsStartedRef = useRef(false);
  const logisticsSessionRef = useRef(trackingSessionId);
  const documentsStartedRef = useRef(false);
  const calculatorViewedRef = useRef(false);
  const contactsStartedRef = useRef(false);

  const savedPickupDateTime = normalizeDateTimeSlot(formData.pickupDateTime);
  const savedFarewellDateTime = normalizeDateTimeSlot(formData.farewellDateTime);
  const savedBurialDateTime = normalizeDateTimeSlot(formData.burialDateTime);
  const activeHearseInfo = openHearseCategoryInfo
    ? HEARSE_CATEGORY_INFO[openHearseCategoryInfo]
    : null;

  useEffect(() => {
    if (logisticsSessionRef.current === trackingSessionId) return;
    logisticsSessionRef.current = trackingSessionId;
    logisticsStartedRef.current = false;
  }, [trackingSessionId]);

  const handlePickupDialogOpenChange = (open: boolean) => {
    setShowPickupDialog(open);
    if (open) {
      setPickupDateTime(savedPickupDateTime);
    }
  };

  useEffect(() => {
    if (currentStep !== 1) return;
    if (pickupDateTime.date || pickupDateTime.timeSlot) return;
    const normalized = normalizeDateTimeSlot(formData.pickupDateTime);
    if (!normalized.date && !normalized.timeSlot) return;
    setPickupDateTime(normalized);
  }, [currentStep, formData.pickupDateTime, pickupDateTime.date, pickupDateTime.timeSlot]);

  useEffect(() => {
    if (currentStep !== 1) return;
    if (farewellDateTime.date || farewellDateTime.timeSlot) return;
    const normalized = normalizeDateTimeSlot(formData.farewellDateTime);
    if (!normalized.date && !normalized.timeSlot) return;
    setFarewellDateTime(normalized);
  }, [currentStep, formData.farewellDateTime, farewellDateTime.date, farewellDateTime.timeSlot]);

  useEffect(() => {
    if (currentStep !== 1) return;
    if (burialDateTime.date || burialDateTime.timeSlot) return;
    const normalized = normalizeDateTimeSlot(formData.burialDateTime);
    if (!normalized.date && !normalized.timeSlot) return;
    setBurialDateTime(normalized);
  }, [currentStep, formData.burialDateTime, burialDateTime.date, burialDateTime.timeSlot]);

  const getPresetCoffinConfig = (presetId: AttributesPresetId) => {
    const preset = ATTRIBUTES_PRESETS.find((item) => item.id === presetId);
    if (!preset) return undefined;
    const basePrice = 15000;
    const coffinPrice =
      basePrice +
      preset.coffin.wood.price +
      preset.coffin.lining.price +
      preset.coffin.hardware.price;

    const existingWreath = formData.coffinConfig?.wreath;
    const wreath =
      existingWreath && typeof existingWreath === "object"
        ? existingWreath
        : DEFAULT_WREATH_PRESET;

    return {
      coffin: {
        wood: preset.coffin.wood,
        lining: preset.coffin.lining,
        hardware: preset.coffin.hardware,
        quantity: 1,
        price: coffinPrice,
      },
      wreath,
    };
  };

  const applyAttributesPreset = (presetId: AttributesPresetId) => {
    const config = getPresetCoffinConfig(presetId);
    if (!config) return;
    setSelectedAttributesPreset(presetId);
    handleInputChange("coffinConfig", config);
  };

  const detectPresetIdFromConfig = () => {
    const coffin = formData.coffinConfig?.coffin as
      | {
          wood?: { id?: string; name?: string };
          lining?: { id?: string; name?: string };
          hardware?: { id?: string; name?: string };
        }
      | undefined;
    if (!coffin) return undefined;

    const woodId = coffin.wood?.id || WOOD_ID_BY_NAME[coffin.wood?.name || ""];
    const liningId =
      coffin.lining?.id || LINING_ID_BY_NAME[coffin.lining?.name || ""];
    const hardwareId =
      coffin.hardware?.id ||
      HARDWARE_ID_BY_NAME[coffin.hardware?.name || ""];

    if (!woodId || !liningId || !hardwareId) return undefined;

    return ATTRIBUTES_PRESETS.find(
      (preset) =>
        preset.coffin.wood.id === woodId &&
        preset.coffin.lining.id === liningId &&
        preset.coffin.hardware.id === hardwareId,
    )?.id;
  };

  const attributesInitialSelection = (() => {
    const coffin = formData.coffinConfig?.coffin as
      | {
          wood?: { id?: string; name?: string };
          lining?: { id?: string; name?: string };
          hardware?: { id?: string; name?: string };
        }
      | undefined;
    const wreath = formData.coffinConfig?.wreath as
      | { type?: string; size?: string; text?: string; quantity?: number }
      | undefined;

    if (!coffin && !wreath) return undefined;

    const woodId = coffin?.wood?.id || WOOD_ID_BY_NAME[coffin?.wood?.name || ""];
    const liningId =
      coffin?.lining?.id || LINING_ID_BY_NAME[coffin?.lining?.name || ""];
    const hardwareId =
      coffin?.hardware?.id ||
      HARDWARE_ID_BY_NAME[coffin?.hardware?.name || ""];

    return {
      woodId,
      liningId,
      hardwareId,
      wreathType: wreath?.type,
      wreathSize: wreath?.size,
      wreathText: wreath?.text,
      wreathQuantity: wreath?.quantity,
    };
  })();

  useEffect(() => {
    if (currentStep !== 2) return;
    if (presetInitializedRef.current) return;

    const hasCoffinPreset =
      formData.coffinConfig?.coffin?.wood ||
      formData.coffinConfig?.coffin?.lining ||
      formData.coffinConfig?.coffin?.hardware;

    if (hasCoffinPreset) {
      const detected = detectPresetIdFromConfig();
      if (detected) setSelectedAttributesPreset(detected);
      presetInitializedRef.current = true;
      return;
    }

    applyAttributesPreset("recommended");
    presetInitializedRef.current = true;
  }, [currentStep, formData.coffinConfig]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHoverHearseInfo(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (!isHearseInfoOpen && !openHearseCategoryInfo) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const insideHearseInfo = hearseInfoRef.current?.contains(target);
      const insideCategoryInfo = hearseCategoryInfoRef.current?.contains(target);
      if (!insideHearseInfo && !insideCategoryInfo) {
        setIsHearseInfoOpen(false);
        setOpenHearseCategoryInfo(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHearseInfoOpen(false);
        setOpenHearseCategoryInfo(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHearseInfoOpen, openHearseCategoryInfo]);

  useEffect(() => {
    const list = formData.serviceType === "cremation" ? PACKAGES_CREMATION : PACKAGES_BURIAL;
    const exists = list.some((p) => p.id === formData.packageType);

    if (!exists && formData.packageType) {
      handleInputChange("packageType", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.serviceType, formData.packageType]);

  useEffect(() => {
    if (!formData.hasHall) {
      // hallDuration у тебя number → ставим 0
      onUpdateFormData("hallDuration", 0);

      // маршруту hall/church = false
      onUpdateFormData("hearseRoute", {
        ...formData.hearseRoute,
        hall: false,
        church: false,
      });

      // время прощания убрать
      setFarewellDateTime({});
      setShowFarewellDialog(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasHall]);

  const buildCalculatorConfig = () => {
    const category =
      (formData.hearseCategory as keyof typeof HEARSE_CATEGORY_PRICE) || "standard";
    const hearsePrice = HEARSE_CATEGORY_PRICE[category] ?? 0;

    return {
      ...STEPPER_CALCULATOR_CONFIG,
      prices: {
        ...STEPPER_CALCULATOR_CONFIG.prices,
        hearse: hearsePrice,
      },
    };
  };

  const calculateTotal = () =>
    calculateTotalFromUtils(formData as any, selectedCemeteryCategory, buildCalculatorConfig());

  const calculateBreakdown = () => {
    const breakdown = calculateBreakdownFromUtils(
      formData as any,
      selectedCemeteryCategory,
      buildCalculatorConfig(),
    );

    if (!formData.needsHearse) return breakdown;

    const category =
      (formData.hearseCategory as keyof typeof HEARSE_CATEGORY_LABELS) || "standard";
    const categoryLabel = HEARSE_CATEGORY_LABELS[category] || "Стандарт";
    const hearseLabel =
      category === "standard" ? "Катафалк" : `Катафалк (${categoryLabel})`;

    return breakdown.map((section) => {
      if (section.category !== "Логистика" || !section.items?.length) return section;
      const items = section.items.map((item) =>
        item.name === "Катафалк" ? { ...item, name: hearseLabel } : item,
      );
      return { ...section, items };
    });
  };

  const handleConfirmBooking = async () => {
    try {
      const orderEmail = (formData.userEmail || "").trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail);
      if (!emailOk) {
        alert("Укажите корректный email для получения подтверждения.");
        setIsSubmittingOrder(false);
        return;
      }

      trackEvent(
        "contacts_filled",
        { has_phone: false, has_email: true, flow: trackingFlow },
        `${trackingSessionId}:${trackingFlow}:contacts_filled:${orderEmail}`,
      );

      const total = calculateTotal();
      const breakdown = calculateBreakdown();

      const payloadFormData = {
        ...formData,
        pickupDateTime,
        farewellDateTime,
        burialDateTime,
      };

      const ceremonyDateTime = formData.hasHall ? farewellDateTime : burialDateTime;

      const payload = {
        userEmail: orderEmail,
        userName: (formData.clientName || formData.fullName || "").trim() || undefined,
        formData: payloadFormData,
        total,
        breakdown,
        paymentMethod,
        customer: { email: orderEmail },
        deceased: {
          name: formData.fullName || undefined,
          birthDate: formData.birthDate || undefined,
          deathDate: formData.deathDate || undefined,
          relationship: formData.relationship || undefined,
        },
        ceremony: {
          type: formData.ceremonyType || undefined,
          order: formData.ceremonyOrder || undefined,
          serviceType: formData.serviceType || undefined,
          cemetery: formData.cemetery || undefined,
          date: ceremonyDateTime.date
            ? ceremonyDateTime.date.toLocaleDateString("ru-RU")
            : undefined,
          timeSlot: ceremonyDateTime.timeSlot,
        },
        notes: formData.specialRequests || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const orderData = await res.json().catch(() => ({} as any));

      if (!res.ok || orderData?.success !== true) {
        console.error("Ошибка при создании заказа", orderData);
        if (res.status === 400) {
          alert("Укажите корректный email.");
        } else {
          alert("Ошибка отправки письма или создания заказа. Попробуйте ещё раз.");
        }
        setIsSubmittingOrder(false);
        return;
      }

      trackEvent(
        "order_created",
        {
          order_id: orderData.orderId,
          value: orderData.totalRub ?? total,
          currency: "RUB",
          flow: trackingFlow,
        },
        orderData.orderId,
      );

      setOrderConfirmation({
        emailSent: Boolean(orderData?.emailSent),
        paymentLink: orderData?.paymentLink ?? null,
      });
    } catch (e) {
      console.error(e);
      alert("Сетевая ошибка. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleNext = () => {
    // consent check
    if (currentStep === 3 && !formData.dataConsent) {
      setShowConsentError(true);
      setTimeout(() => {
        document.getElementById("data-consent")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }

    if (currentStep >= steps.length - 1 || isTransitioning) return;

    const totalRub = Math.max(0, Math.round(calculateTotal() || 0));

    if (workflowMode === "wizard") {
      if (currentStep === 0) {
        if (!formatFilledRef.current) {
          formatFilledRef.current = true;
          reachMetrikaGoal(buildGoalName(trackingFlow, "format_filled"), {
            flow: trackingFlow,
          });
        }
      }

      if (currentStep === 1) {
        const hasLocation = Boolean(formData.cemetery);
        const hasPickup = Boolean(pickupDateTime.date && pickupDateTime.timeSlot);
        const hasBurial = Boolean(burialDateTime.date && burialDateTime.timeSlot);
        const hasFarewell = !formData.hasHall
          || Boolean(farewellDateTime.date && farewellDateTime.timeSlot);
        const hasTimes = hasPickup && hasBurial && hasFarewell;
        const routePoints = Object.values(formData.hearseRoute || {}).filter(Boolean).length;
        if (hasLocation && hasTimes) {
          if (!logisticsFilledRef.current) {
            logisticsFilledRef.current = true;
            reachMetrikaGoal(buildGoalName(trackingFlow, "logistics_filled"), {
              flow: trackingFlow,
            });
          }
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
            `${trackingSessionId}:${trackingFlow}:step4:filled`,
          );
        }
      }

      if (currentStep === 2) {
        if (!attributesFilledRef.current) {
          attributesFilledRef.current = true;
          reachMetrikaGoal(buildGoalName(trackingFlow, "attributes_filled"), {
            flow: trackingFlow,
          });
        }
        const ceremonyFormat =
          formData.ceremonyType === "civil"
            ? "secular"
            : formData.ceremonyType === "religious"
              ? "religious"
              : formData.ceremonyType === "combined"
                ? "combined"
                : undefined;
        const hallDuration = Number(formData.hallDuration || 0);
        trackEvent(
          "format_step_completed",
          {
            final_burial_type: formData.serviceType,
            final_has_hall: !!formData.hasHall,
            ceremony_format: ceremonyFormat,
            hall_duration: hallDuration,
            value: totalRub,
            currency: "RUB",
            flow: trackingFlow,
          },
          `${trackingSessionId}:${trackingFlow}:step3`,
        );
      }

      if (currentStep === 3) {
        if (!documentsFilledRef.current) {
          documentsFilledRef.current = true;
          reachMetrikaGoal(buildGoalName(trackingFlow, "documents_filled"), {
            flow: trackingFlow,
          });
        }
        trackEvent(
          "documents_completed",
          {
            consent_checked: !!formData.dataConsent,
            kinship: formData.relationship || undefined,
            value: totalRub,
            currency: "RUB",
            flow: trackingFlow,
          },
          `${trackingSessionId}:${trackingFlow}:step5:completed`,
        );
      }
    }

    setIsTransitioning(true);
    setShowConsentError(false);

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    setTimeout(() => {
      // ✅ только при "Далее" — скролл к верху мастера
      shouldScrollOnStepChangeRef.current = true;

      setCurrentStep((s) => s + 1);
      setIsTransitioning(false);
    }, 200);
  };

  const handlePrev = () => {
    if (currentStep <= 0) return;
    // Назад — без скролла (как шаг-клик)
    shouldScrollOnStepChangeRef.current = false;
    resetOrderConfirmation();
    setCurrentStep((s) => s - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    // ✅ круги — НЕ скроллят
    shouldScrollOnStepChangeRef.current = false;
    resetOrderConfirmation();
    setCurrentStep(stepIndex);
  };

  const handleEditStep = (stepIndex: number) => {
    // ✅ редактирование — тоже без скролла
    shouldScrollOnStepChangeRef.current = false;
    resetOrderConfirmation();
    setCurrentStep(stepIndex);
  };

  const filteredCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES].filter((cemetery) => {
    if (!cemeterySearchQuery.trim()) return false;
    const query = cemeterySearchQuery.toLowerCase();

    const matchesType =
      formData.serviceType === "burial"
        ? (cemetery.type === "cemetery" || cemetery.type === "both") && cemetery.working
        : cemetery.type === "crematorium" || cemetery.type === "both";

    const matchesSearch =
      cemetery.name.toLowerCase().includes(query) ||
      cemetery.address.toLowerCase().includes(query) ||
      cemetery.district.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  const handleCemeterySelect = (cemetery: CemeteryData) => {
    handleInputChange("cemetery", cemetery.name);
    setCemeterySearchQuery("");
    setShowCemeteryResults(false);
  };

  const openPackagesMode = () => {
    setWorkflowMode("packages");
    if (formData.packageType) {
      handleInputChange("packageType", "");
    }
    if (selectedPackageForSimplified) {
      setSelectedPackageForSimplified(null);
    }
  };

  const openWizardMode = () => {
    setWorkflowMode("wizard");
    setSelectedPackageForSimplified(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsTransitioning(false);
    setOrderConfirmation(null);
    setIsSubmittingOrder(false);
  };

type BreakdownLine = {
  title: string;
  qty: number;
  priceRub: number | null; // null = цена не рассчитана/включено
};

function buildBreakdownLines(params: {
  formData: any;
  PACKAGES: any[];
  additionalServices: any[];
}): BreakdownLine[] {
  const { formData, PACKAGES, additionalServices } = params;

  const lines: BreakdownLine[] = [];

  // 1) Пакет (если выбран не custom)
  if (formData.packageType && formData.packageType !== "custom") {
    const pkg = PACKAGES.find((p) => p.id === formData.packageType);
    if (pkg) {
      lines.push({
        title: `Пакет: ${pkg.name}`,
        qty: 1,
        priceRub: typeof pkg.price === "number" ? pkg.price : null,
      });
    }
  }

  // 2) Индивидуальный пакет (additional services)
  if (formData.packageType === "custom" && Array.isArray(formData.selectedAdditionalServices)) {
    for (const serviceId of formData.selectedAdditionalServices) {
      const s = additionalServices.find((x) => x.id === serviceId);
      if (!s) continue;

      lines.push({
        title: s.name,
        qty: 1,
        priceRub: typeof s.price === "number" ? s.price : null,
      });
    }
  }

  // 3) Зал прощания (если включён) — цену не выдумываю, если у тебя она не определена
  if (formData.hasHall) {
    const minutes = Number(formData.hallDuration || 0);
    lines.push({
      title: minutes > 0 ? `Зал прощания (${minutes} мин)` : "Зал прощания",
      qty: 1,
      priceRub: null, // если у тебя есть цена — скажи, я подключу без гаданий
    });
  }

  // 4) Катафалк / логистика (если включено) — цена неизвестна, не выдумываю
  if (formData.needsHearse) {
    lines.push({
      title: "Катафалк",
      qty: 1,
      priceRub: null,
    });
  }

  // 5) Если вообще ничего не собралось — возвращаем пусто
  return lines;
}

function formatRub(n: number) {
  return n.toLocaleString("ru-RU");
}

  const formatRubLocal = (v: number) => Math.round(v).toLocaleString("ru-RU");

  const totalRub = Math.max(0, Math.round(calculateTotal() || 0));
  const deposit10Rub = Math.max(0, Math.round(totalRub * 0.1));
  const emailValue = (formData.userEmail || "").trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const breakdown = calculateBreakdown();
  const packageLabel = (() => {
    if (!formData.packageType || formData.packageType === "custom") return undefined;
    const list = formData.serviceType === "cremation" ? PACKAGES_CREMATION : PACKAGES;
    const pkg = list.find((item) => item.id === formData.packageType);
    return pkg?.name || formData.packageType;
  })();
  const cemeteryCategoryLabel =
    selectedCemeteryCategory === "standard"
      ? "Стандарт"
      : selectedCemeteryCategory === "comfort"
        ? "Комфорт"
        : selectedCemeteryCategory === "premium"
          ? "Премиум"
          : undefined;
  const orderSummary = buildOrderSummary(formData, {
    totalRub,
    packageLabel,
    cemeteryCategoryLabel,
  });
  const summarySections = orderSummary.sections;
  const summaryEditStepMap: Record<string, number> = {
    "Формат церемонии": 0,
    "Логистика": 1,
    "Атрибутика": 2,
    "Документы": 3,
  };
  const paymentOptions: Array<{ id: PaymentMethod; title: string; subtitle?: string }> = [
    {
      id: "deposit_10",
      title: "Депозит 10%",
      subtitle:
        "Депозит гарантирует закрепление координатора за вашей заявкой. Сумма депозита входит в итоговую стоимость вашего заказа.",
    },
    {
      id: "call_rep",
      title: "Мне нужна консультация",
    },
  ];
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (paymentMethod === method) return;
    setPaymentMethod(method);
    if (method === "deposit_10") {
      reachMetrikaGoal(buildGoalName(trackingFlow, "payment_option_deposit_10"), { flow: trackingFlow });
    }
    if (method === "call_rep") {
      reachMetrikaGoal(buildGoalName(trackingFlow, "payment_option_call"), {
        flow: trackingFlow,
      });
    }
  };
  const canSubmit = totalRub > 0 && emailOk;

  const onPayClick = async () => {
    if (isSubmittingOrder || !canSubmit) return;

    try {
      lastPaymentSnapshotRef.current = getPaymentSnapshot(
        (formData.paymentPlan || "full") as "full" | "deposit" | "split",
        emailValue,
        paymentMethod,
      );
      setIsSubmittingOrder(true);

      // UX-эмуляция процессинга
      await new Promise((r) => setTimeout(r, 400));

      // ВАЖНО:
      // "пока письмо не улетит" в реальности невозможно гарантировать на фронте.
      // Но мы держим "Оформление..." ДО момента, пока /api/orders не вернёт success.
      // handleConfirmBooking делает fetch /api/orders и ждёт ответ — это и есть наш триггер.
      await handleConfirmBooking();

      // если внутри handleConfirmBooking у тебя происходит redirect — сюда код уже не вернётся (и это ок)
    } catch (e) {
      console.error(e);
      setIsSubmittingOrder(false);
      alert("Сетевая ошибка. Проверьте интернет и попробуйте ещё раз.");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: {
        return (
          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("serviceType", "burial")}
                  className={cn(
                    "px-5 py-2 border-2 rounded-full text-left transition-all backdrop-blur-sm",
                    formData.serviceType === "burial"
                      ? "border-gray-900 bg-white/60"
                      : "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40",
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
                    formData.serviceType === "cremation"
                      ? "border-gray-900 bg-white/60"
                      : "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40",
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
                <Switch checked={formData.hasHall} onCheckedChange={(checked) => handleInputChange("hasHall", checked)} />
              </div>

              {!formData.hasHall && (
                <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-400/30 rounded-full p-4">
                  <p className="text-sm text-amber-900">
                    Без зала — технологическая кремация без церемонии. Можно попрощаться в зале морга.
                  </p>
                </div>
              )}
            </div>

            {formData.hasHall && (
              <>
                <div>
                  <Label className="mb-3 block">Тип церемонии</Label>
                  <RadioGroup
                    value={formData.ceremonyType}
                    onValueChange={(value) => handleInputChange("ceremonyType", value)}
                    className="space-y-3"
                  >
                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "civil" && "border-black bg-gray-50",
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
                        "flex items-start justify-between gap-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "religious" && "border-black bg-gray-50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="religious" id="religious" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="religious" className="cursor-pointer">
                            Религиозная
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">С участием священнослужителя</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        +{formatRubLocal(PRICES.ceremonyType.religious)} ₽
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-start justify-between gap-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "combined" && "border-black bg-gray-50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="combined" id="combined" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="combined" className="cursor-pointer">
                            Комбинированная
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">Светская + религиозная часть</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        +{formatRubLocal(PRICES.ceremonyType.combined)} ₽
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {formData.ceremonyType === "combined" && (
                  <div>
                    <Label htmlFor="ceremonyOrder">Последовательность</Label>
                    <Select value={formData.ceremonyOrder} onValueChange={(value) => handleInputChange("ceremonyOrder", value)}>
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
                          formData.hallDuration === duration
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300",
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

      case 1: {
        return (
          <div className="space-y-6">
            <div className="relative">
              <Label htmlFor="cemetery" className="mb-3 block">
                {formData.serviceType === "burial" ? "Выбор кладбища" : "Выбор крематория"}
              </Label>

              <div className="relative">
                <Input
                  id="cemetery"
                  value={cemeterySearchQuery || formData.cemetery}
                  onChange={(e) => {
                    setCemeterySearchQuery(e.target.value);
                    setShowCemeteryResults(true);
                    if (!e.target.value) handleInputChange("cemetery", "");
                  }}
                  onFocus={() => {
                    if (cemeterySearchQuery) setShowCemeteryResults(true);
                  }}
                  placeholder="Начните вводить название или адрес..."
                  className="mt-2 rounded-full"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Единый поиск по Москве и области
                </p>

                {showCemeteryResults && filteredCemeteries.length > 0 && (
                  <div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {filteredCemeteries.map((cemetery) => (
                        <button
                          key={cemetery.id}
                          type="button"
                          onClick={() => handleCemeterySelect(cemetery)}
                          className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-900">{cemetery.name}</span>
                                {!cemetery.working && (
                                  <Badge variant="secondary" className="text-xs">Закрыто</Badge>
                                )}
                                {cemetery.hasColumbarium && formData.serviceType === "cremation" && (
                                  <Badge variant="outline" className="text-xs">Колумбарий</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{cemetery.address}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{cemetery.district}</Badge>
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

                {showCemeteryResults && cemeterySearchQuery && filteredCemeteries.length === 0 && (
                  <div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
                    <p className="text-sm text-gray-500 text-center">Ничего не найдено. Попробуйте изменить запрос.</p>
                  </div>
                )}
              </div>

              {formData.cemetery && (
                <div className="mt-4 space-y-3">
                  <Label className="text-gray-900">Категория места</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["standard", "comfort", "premium"] as const).map((category) => {
                      const all = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
                      const selected = all.find((c) => c.name === formData.cemetery);
                      const price = selected?.categories[category];
                      if (!price) return null;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCemeteryCategory(category)}
                          className={cn(
                            "p-4 border-2 rounded-full text-center transition-all",
                            selectedCemeteryCategory === category
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300",
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
                <Label className="text-gray-900">
                  Время забора тела
                </Label>
                <Dialog
                  open={showPickupDialog}
                  onOpenChange={setShowPickupDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                    >
                      <Clock className="h-4 w-4 mr-3 text-gray-500" />
                      <span
                        className={cn(
                          pickupDateTime.date &&
                            pickupDateTime.timeSlot
                            ? "text-gray-900"
                            : "text-gray-600",
                        )}
                      >
                        {pickupDateTime.date &&
                        pickupDateTime.timeSlot
                          ? formatDateTimeSlot(pickupDateTime)
                          : "Выбрать время забора"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden !flex !flex-col">
                    <DialogHeader className="shrink-0">
                      <DialogTitle>
                        Выбор даты и времени забора
                      </DialogTitle>
                      <DialogDescription>
                        Выберите дату и время, когда требуется
                        забрать тело
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-6 pt-2 pb-6">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <style>{`
                          .rdp-caption_label { 
                            text-transform: capitalize; 
                            font-size: 1.1rem; 
                            font-weight: 600; 
                            color: #111827;
                          }
                          .rdp-nav_button {
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            background-color: #f3f4f6;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          }
                          .rdp-nav_button:hover {
                            background-color: #e5e7eb;
                          }
                          .rdp-head_cell {
                            color: #9ca3af;
                            font-weight: 500;
                            font-size: 0.875rem;
                          }
                        `}</style>
                        <SimpleCalendar
                          selected={pickupDateTime.date}
                          onSelect={(date) =>
                            setPickupDateTime({
                              ...pickupDateTime,
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
                              <span className="text-sm font-medium text-gray-900">
                                Время
                              </span>
                              <span className="text-xs text-gray-500">
                                Выберите удобный слот
                              </span>
                            </div>
                            {pickupDateTime.timeSlot && (
                              <Badge
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900"
                              >
                                {TIME_SLOT_LABELS[pickupDateTime.timeSlot]}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                            {TIME_SLOT_OPTIONS.map((slot) => (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() =>
                                  setPickupDateTime({
                                    ...pickupDateTime,
                                    timeSlot: slot.id,
                                  })
                                }
                                className={cn(
                                  "px-3 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border",
                                  pickupDateTime.timeSlot === slot.id
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
                                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
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
                        disabled={
                          !pickupDateTime.date ||
                          !pickupDateTime.timeSlot
                        }
                      >
                        Подтвердить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* ✅ Зал прощания / Церковь — только если включён зал */}
              {formData.hasHall && (
                <div className="space-y-2">
                  <Label className="text-gray-900">Зал прощания / Церковь</Label>
                  <Dialog open={showFarewellDialog} onOpenChange={setShowFarewellDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm">
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
                            onSelect={(date) =>
                              setFarewellDateTime({
                                ...farewellDateTime,
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
                                <span className="text-sm font-medium text-gray-900">
                                  Время
                                </span>
                                <span className="text-xs text-gray-500">
                                  Выберите удобный слот
                                </span>
                              </div>
                              {farewellDateTime.timeSlot && (
                                <Badge
                                  variant="secondary"
                                  className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900"
                                >
                                  {TIME_SLOT_LABELS[farewellDateTime.timeSlot]}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                              {TIME_SLOT_OPTIONS.map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() =>
                                    setFarewellDateTime({
                                      ...farewellDateTime,
                                      timeSlot: slot.id,
                                    })
                                  }
                                  className={cn(
                                    "px-3 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border",
                                    farewellDateTime.timeSlot === slot.id
                                      ? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
                                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
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
                          type="button"
                          onClick={() => {
                            handleInputChange("farewellDateTime", farewellDateTime);
                            setShowFarewellDialog(false);
                          }}
                          className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800"
                          disabled={!farewellDateTime.date || !farewellDateTime.timeSlot}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Подтвердить выбор
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Время захоронения / кремации */}
              <div className="space-y-2">
                <Label className="text-gray-900">Время захоронения / кремации</Label>
                <Dialog open={showBurialDialog} onOpenChange={setShowBurialDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm">
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
                        Выбор даты и времени {formData.serviceType === "cremation" ? "кремации" : "захоронения"}
                      </DialogTitle>
                      <DialogDescription>Укажите удобные дату и время церемонии.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-6 pt-2 pb-6">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <SimpleCalendar
                          selected={burialDateTime.date}
                          onSelect={(date) =>
                            setBurialDateTime({
                              ...burialDateTime,
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
                                Время {formData.serviceType === "cremation" ? "кремации" : "захоронения"}
                              </span>
                              <span className="text-xs text-gray-500">
                                Выберите удобный слот
                              </span>
                            </div>
                            {burialDateTime.timeSlot && (
                              <Badge
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900"
                              >
                                {TIME_SLOT_LABELS[burialDateTime.timeSlot]}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                            {TIME_SLOT_OPTIONS.map((slot) => (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setBurialDateTime({ ...burialDateTime, timeSlot: slot.id })}
                                className={cn(
                                  "px-3 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 border",
                                  burialDateTime.timeSlot === slot.id
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
                                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
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
                        type="button"
                        onClick={() => {
                          handleInputChange("burialDateTime", burialDateTime);
                          setShowBurialDialog(false);
                        }}
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800"
                        disabled={!burialDateTime.date || !burialDateTime.timeSlot}
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

            {/* Нужен катафалк */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center">
                    <Label>Нужен катафалк?</Label>
                    <div
                      ref={hearseInfoRef}
                      className="relative inline-flex"
                      onMouseEnter={() => {
                        if (canHoverHearseInfo) setIsHearseInfoOpen(true);
                      }}
                      onMouseLeave={() => {
                        if (canHoverHearseInfo) setIsHearseInfoOpen(false);
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Информация о катафалке"
                        aria-expanded={isHearseInfoOpen}
                        onClick={() => setIsHearseInfoOpen((prev) => !prev)}
                        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      {isHearseInfoOpen && (
                        <div className="fixed left-1/2 top-1/2 z-50 w-[320px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:left-0 sm:top-full sm:mt-2 sm:translate-x-0 sm:translate-y-0">
                          <div className="h-40 w-full overflow-hidden">
                            <img
                              src="/images/hearse-lux.jpg"
                              alt="Катафалк класса Люкс"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="text-sm font-semibold text-slate-900">
                              Катафалк класса Люкс
                            </div>
                            <div className="text-xs text-slate-500">
                              Специализированный автомобиль
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              Mercedes-Benz для торжественной церемонии. Оборудован системой кондиционирования и подиумом.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Специализированный транспорт</p>
                </div>
                <Switch
                  checked={formData.needsHearse}
                  onCheckedChange={(checked) => {
                    if (!checked && formData.needsHearse) setShowHearseDialog(true);
                    else handleInputChange("needsHearse", checked);
                  }}
                />
              </div>

              <AlertDialog open={showHearseDialog} onOpenChange={setShowHearseDialog}>
                <AlertDialogContent className="bg-white rounded-[30px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены, что хотите отключить катафалк?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3 pt-2">
                        <p>
                          Катафалк — специализированный транспорт для перевозки усопшего. Без него транспортировку придётся организовывать самостоятельно.
                        </p>
                        <div className="bg-amber-50 p-4 border border-amber-200">
                          <p className="text-sm text-amber-900">
                            <span className="font-medium">Внимание:</span> при отключении катафалка потребуется альтернативный способ транспортировки.
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Оставить катафалк</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleInputChange("needsHearse", false);
                        setShowHearseDialog(false);
                      }}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      Да, отключить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {formData.needsHearse && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div
                    ref={hearseCategoryInfoRef}
                    className="space-y-3"
                    onMouseLeave={() => {
                      if (canHoverHearseInfo) setOpenHearseCategoryInfo(null);
                    }}
                  >
                    <Label className="text-sm mb-3 block">Категория катафалка:</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("hearseCategory", "standard");
                            setOpenHearseCategoryInfo(null);
                          }}
                          className={cn(
                            "w-full h-12 sm:h-16 px-2 sm:px-3 border-2 rounded-full text-center transition-all flex items-center justify-center overflow-hidden whitespace-nowrap",
                            formData.hearseCategory === "standard"
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          <div className="flex w-full min-w-0 items-center justify-center gap-1 sm:gap-2">
                            <span className="shrink-0 text-xs sm:text-sm font-medium text-gray-900">
                              Стандарт
                            </span>
                            <span className="hidden sm:inline-flex min-w-0 items-center text-xs text-gray-400">
                              <span className="min-w-0 truncate">Базовый катафалк</span>
                            </span>
                          </div>
                        </button>
                        <div
                          className="absolute -top-1 -right-1 z-10"
                          onMouseEnter={() => {
                            if (canHoverHearseInfo) setOpenHearseCategoryInfo("standard");
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full text-gray-400 hover:text-gray-600 p-0"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenHearseCategoryInfo((prev) =>
                                prev === "standard" ? null : "standard",
                              );
                            }}
                            aria-label="Информация о категории Стандарт"
                            aria-expanded={openHearseCategoryInfo === "standard"}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("hearseCategory", "comfort");
                            setOpenHearseCategoryInfo(null);
                          }}
                          className={cn(
                            "w-full h-12 sm:h-16 px-2 sm:px-3 border-2 rounded-full text-center transition-all flex items-center justify-center overflow-hidden whitespace-nowrap",
                            formData.hearseCategory === "comfort"
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          <div className="flex w-full min-w-0 items-center justify-center gap-1 sm:gap-2">
                            <span className="shrink-0 text-xs sm:text-sm font-medium text-gray-900">
                              Комфорт
                            </span>
                            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-gray-500 sm:text-xs">
                              <span className="min-w-0 truncate">
                                <span className="inline sm:hidden">·</span>
                                <span className="hidden sm:inline">· с кондиционером</span>
                              </span>
                              <span className="shrink-0">+15 000 ₽</span>
                            </span>
                          </div>
                        </button>
                        <div
                          className="absolute -top-1 -right-1 z-10"
                          onMouseEnter={() => {
                            if (canHoverHearseInfo) setOpenHearseCategoryInfo("comfort");
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full text-gray-400 hover:text-gray-600 p-0"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenHearseCategoryInfo((prev) =>
                                prev === "comfort" ? null : "comfort",
                              );
                            }}
                            aria-label="Информация о категории Комфорт"
                            aria-expanded={openHearseCategoryInfo === "comfort"}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("hearseCategory", "premium");
                            setOpenHearseCategoryInfo(null);
                          }}
                          className={cn(
                            "w-full h-12 sm:h-16 px-2 sm:px-3 border-2 rounded-full text-center transition-all flex items-center justify-center overflow-hidden whitespace-nowrap",
                            formData.hearseCategory === "premium"
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          <div className="flex w-full min-w-0 items-center justify-center gap-1 sm:gap-2">
                            <span className="shrink-0 text-xs sm:text-sm font-medium text-gray-900">
                              Премиум
                            </span>
                            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-gray-500 sm:text-xs">
                              <span className="min-w-0 truncate">
                                <span className="inline sm:hidden">·</span>
                                <span className="hidden sm:inline">· Mercedes-Benz</span>
                              </span>
                              <span className="shrink-0">+35 000 ₽</span>
                            </span>
                          </div>
                        </button>
                        <div
                          className="absolute -top-1 -right-1 z-10"
                          onMouseEnter={() => {
                            if (canHoverHearseInfo) setOpenHearseCategoryInfo("premium");
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full text-gray-400 hover:text-gray-600 p-0"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenHearseCategoryInfo((prev) =>
                                prev === "premium" ? null : "premium",
                              );
                            }}
                            aria-label="Информация о категории Премиум"
                            aria-expanded={openHearseCategoryInfo === "premium"}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {activeHearseInfo && (
                      <div className="mt-3 w-full max-h-[60vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg sm:max-w-[520px] sm:max-h-[420px] sm:mx-auto">
                        <div className="relative h-40 w-full bg-gray-100 sm:h-48">
                          <img
                            src={activeHearseInfo.imageSrc}
                            alt={activeHearseInfo.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4 bg-white">
                          <h4 className="font-medium mb-1 text-gray-900">
                            {activeHearseInfo.title}
                          </h4>
                          <p className="text-sm text-gray-500 leading-snug">
                            {activeHearseInfo.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Label className="text-sm">Маршрут:</Label>

                  <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2">
                    <Button
                      type="button"
                      variant={formData.hearseRoute.morgue ? "default" : "outline"}
                      className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
                      onClick={() =>
                        handleInputChange("hearseRoute", {
                          ...formData.hearseRoute,
                          morgue: !formData.hearseRoute.morgue,
                        })
                      }
                    >
                      Морг
                    </Button>

                    {formData.hearseRoute.morgue && (
                      <div className="flex justify-center md:block">
                        <ChevronDown className="h-5 w-5 text-gray-400 md:hidden" />
                        <ChevronRight className="h-5 w-5 text-gray-400 hidden md:block" />
                      </div>
                    )}

                    {/* ✅ зал/церковь — только если hasHall */}
                    {formData.hasHall && (
                      <>
                        <Button
                          type="button"
                          variant={formData.hearseRoute.hall ? "default" : "outline"}
                          className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
                          onClick={() =>
                            handleInputChange("hearseRoute", {
                              ...formData.hearseRoute,
                              hall: !formData.hearseRoute.hall,
                            })
                          }
                        >
                          Зал прощания
                        </Button>

                        {formData.hearseRoute.hall && (
                          <div className="flex justify-center md:block">
                            <ChevronDown className="h-5 w-5 text-gray-400 md:hidden" />
                            <ChevronRight className="h-5 w-5 text-gray-400 hidden md:block" />
                          </div>
                        )}

                        <Button
                          type="button"
                          variant={formData.hearseRoute.church ? "default" : "outline"}
                          className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
                          onClick={() =>
                            handleInputChange("hearseRoute", {
                              ...formData.hearseRoute,
                              church: !formData.hearseRoute.church,
                            })
                          }
                        >
                          Церковь
                        </Button>

                        {formData.hearseRoute.church && (
                          <div className="flex justify-center md:block">
                            <ChevronDown className="h-5 w-5 text-gray-400 md:hidden" />
                            <ChevronRight className="h-5 w-5 text-gray-400 hidden md:block" />
                          </div>
                        )}
                      </>
                    )}

                    <Button
                      type="button"
                      variant={formData.hearseRoute.cemetery ? "default" : "outline"}
                      className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
                      onClick={() =>
                        handleInputChange("hearseRoute", {
                          ...formData.hearseRoute,
                          cemetery: !formData.hearseRoute.cemetery,
                        })
                      }
                    >
                      {formData.serviceType === "burial" ? "Кладбище" : "Крематорий"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Транспорт для близких */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Транспорт для близких?</Label>
                  <p className="text-xs text-gray-500 mt-1">Автобус для родных и гостей</p>
                </div>
                <Switch
                  checked={formData.needsFamilyTransport}
                  onCheckedChange={(checked) => handleInputChange("needsFamilyTransport", checked)}
                />
              </div>

              {formData.needsFamilyTransport && (
                <div className="mt-3">
                  <Label className="mb-3 block text-sm">Количество мест:</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15].map((seats) => (
                      <button
                        key={seats}
                        type="button"
                        onClick={() => handleInputChange("familyTransportSeats", seats)}
                        className={cn(
                          "p-3 border-2 rounded-full text-center transition-all",
                          formData.familyTransportSeats === seats ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <div className="text-sm mb-1">{seats} мест</div>
                        <div className="text-xs text-gray-500">
                          {(PRICES.familyTransport as any)[seats].toLocaleString("ru-RU")} ₽
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Носильщики */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Нужны носильщики (4 чел.)</Label>
                <p className="text-xs text-gray-500 mt-1">{PRICES.pallbearers.toLocaleString("ru-RU")} ₽</p>
              </div>
              <Switch checked={formData.needsPallbearers} onCheckedChange={(checked) => handleInputChange("needsPallbearers", checked)} />
            </div>
          </div>
        );
      }

      case 2: {
        return (
          <div className="space-y-6">
            {attributesMode === "preset" ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ATTRIBUTES_PRESETS.map((preset) => {
                    const isSelected = selectedAttributesPreset === preset.id;

                    return (
                      <div
                        key={preset.id}
                        className={cn(
                          "overflow-hidden rounded-3xl border bg-white shadow-sm transition-all",
                          isSelected ? "border-gray-900 shadow-lg" : "border-gray-200 hover:shadow-md",
                        )}
                      >
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preset.imageSrc}
                            alt={preset.title}
                            className="h-40 w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700">
                            {preset.badge}
                          </span>
                          <div className="absolute bottom-3 left-4 text-xl font-semibold text-white">
                            {preset.priceText}
                          </div>
                        </div>

                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-base font-semibold text-gray-900">{preset.title}</div>
                            {isSelected && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>

                          <ul className="space-y-1 text-sm text-gray-600">
                            {preset.bullets.map((bullet) => (
                              <li key={bullet} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            type="button"
                            onClick={() => applyAttributesPreset(preset.id)}
                            className={cn(
                              "w-full rounded-full",
                              isSelected ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-900 hover:bg-gray-200",
                            )}
                          >
                            {isSelected ? "Выбрано" : "Выбрать"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setAttributesMode("custom")}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                    Выбрать атрибутику самостоятельно
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAttributesMode("preset")}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                    Вернуться к готовым наборам
                  </button>
                </div>

                <UnifiedCoffinConfigurator
                  initialSelection={attributesInitialSelection}
                  onConfirm={(data) => {
                    handleInputChange("coffinConfig", data);
                  }}
                  onChange={(data) => {
                    handleInputChange("coffinConfig", data);
                  }}
                />
              </div>
            )}

            <Separator />

            <div>
              <Label htmlFor="specialRequests">Особые пожелания</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => {
                  if (e.target.value.length <= 300) handleInputChange("specialRequests", e.target.value);
                }}
                placeholder="Музыка, фотография усопшего, лента с надписью..."
                className="mt-2"
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-2">{formData.specialRequests.length}/300 символов</p>
            </div>
          </div>
        );
      }

      case 3: {
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="fullName">ФИО усопшего *</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSkipField("fullName")}
                  className="whitespace-nowrap rounded-[30px] min-w-[96px]"
                >
                  Позже
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Дата рождения</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="birthDate"
                    type={formData.birthDate === "—" ? "text" : "date"}
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => handleSkipField("birthDate")} className="whitespace-nowrap rounded-[30px] min-w-[96px]">
                    Не знаю
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="deathDate">Дата смерти</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="deathDate"
                    type={formData.deathDate === "—" ? "text" : "date"}
                    value={formData.deathDate}
                    onChange={(e) => handleInputChange("deathDate", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => handleSkipField("deathDate")} className="whitespace-nowrap rounded-[30px] min-w-[96px]">
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
                  value={formData.deathCertificate}
                  onChange={(e) => handleInputChange("deathCertificate", e.target.value)}
                  placeholder="AA-000 № 000000"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => handleSkipField("deathCertificate")} className="whitespace-nowrap rounded-[30px] min-w-[96px]">
                  Позже
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Можно ввести позже — бронирование не задержит</p>
            </div>

            <div>
              <Label htmlFor="relationship">Степень родства *</Label>
              <Select value={formData.relationship} onValueChange={(value) => handleInputChange("relationship", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Выберите степень родства" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Супруг(а)</SelectItem>
                  <SelectItem value="parent">Родитель</SelectItem>
                  <SelectItem value="child">Сын/дочь</SelectItem>
                  <SelectItem value="relative">Дальний родственник</SelectItem>
                  <SelectItem value="representative">Доверенное лицо</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              id="data-consent"
              className={cn(
                "flex items-start gap-2 md:gap-3 p-2 md:p-4 rounded-2xl md:rounded-full transition-all",
                showConsentError ? "bg-gray-50 border-2 border-gray-300" : "bg-gray-50 border border-gray-200",
              )}
            >
              <Checkbox
                id="privacy"
                checked={formData.dataConsent}
                onCheckedChange={(checked) => {
                  handleInputChange("dataConsent", checked === true);
                  setShowConsentError(false);
                }}
                className="mt-0.5 md:mt-1 flex-shrink-0"
              />
              <Label htmlFor="privacy" className="text-xs md:text-sm cursor-pointer leading-snug">
                Я согласен на обработку персональных данных и подтверждаю, что ознакомлен с{" "}
                <a
                  href="/info"
                  className="underline text-blue-600"
                  target="_blank"
                  rel="noreferrer"
                >
                  политикой конфиденциальности
                </a>
              </Label>
            </div>

            {showConsentError && (
              <div className="bg-gray-50 border border-gray-300 rounded-full p-4">
                <p className="text-sm text-gray-600">Для продолжения необходимо дать согласие на обработку персональных данных</p>
              </div>
            )}
          </div>
        );
      }

            case 4: {
        return (
          <div className="space-y-6">
            {/* КАРТОЧКИ ПРОВЕРКИ */}
            <div className="space-y-4">
              {summarySections.map((section) => {
                const editStep = summaryEditStepMap[section.title];
                return (
                  <div key={section.title} className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm text-gray-500">{section.title}</h4>
                      {typeof editStep === "number" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStep(editStep)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      {section.items.map((item, idx) => (
                        <div key={`${section.title}-${idx}`} className="flex items-start justify-between gap-3">
                          <span className="text-gray-600">{item.label}:</span>
                          <span className="text-gray-900 text-right whitespace-pre-line">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* СОСТАВ ЗАКАЗА */}
            <div className="bg-white border border-gray-200 rounded-[30px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Состав заказа</div>
                  <div className="text-xs text-gray-500 mt-1">Полный перечень услуг, которые входят в итоговую стоимость</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatRubLocal(totalRub)} ₽</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                <div className="space-y-4">
                  {breakdown.map((block, idx) => (
                    <div key={`${block.category}-${idx}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-gray-900">{block.category}</div>
                        <div className="text-sm font-semibold text-gray-900">{formatRubLocal(block.price)} ₽</div>
                      </div>

                      {block.items?.length ? (
                        <div className="mt-3 space-y-2">
                          {block.items.map((it, i) => (
                            <div key={`${block.category}-it-${i}`} className="flex items-start justify-between gap-3 text-sm">
                              <div className="text-gray-700">
                                <span className="text-gray-900">•</span> {it.name}
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

                {/* ОПЛАТА ВНУТРИ ШАГА 5 */}
                <div className="pt-2 lg:pt-0">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Оплата</div>

                  {orderConfirmation?.emailSent ? (
                    <div className="bg-white border border-gray-200 rounded-[30px] p-6 shadow-sm">
                      <div className="text-sm font-semibold text-gray-900">Бронирование оформлено</div>
                      <p className="mt-2 text-sm text-gray-600">
                        {paymentMethod === "call_rep"
                          ? "Договор и детали заказа отправлены вам на почту. Наш представитель свяжется с вами для уточнения деталей."
                          : orderConfirmation.paymentLink
                          ? "Бронирование оформлено. Договор, детали заказа и ссылка на оплату отправлены вам на почту."
                          : "Договор и детали заказа отправлены вам на почту. Ссылку на оплату пришлём отдельным письмом."}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[30px] bg-gray-900 text-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.35)] space-y-5">
                      <div>
                        <div className="text-sm font-semibold text-white/90 mb-2">
                          Email для получения информации
                        </div>
                        <input
                          value={emailValue}
                          onChange={(e) => handleInputChange("userEmail", e.target.value)}
                          placeholder="name@email.com"
                          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/50"
                          inputMode="email"
                        />
                        {!emailOk && (
                          <div className="mt-2 text-xs text-red-200">
                            Проверьте корректность e-mail.
                          </div>
                        )}
                        <div className="mt-2 text-xs text-white/60">
                          На этот адрес придёт подтверждение заказа, детали церемонии и документы.
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-white/90 mb-3">Способ оплаты</div>
                        <div className="space-y-3">
                          {paymentOptions.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handlePaymentMethodSelect(option.id)}
                              className={cn(
                                "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                                paymentMethod === option.id
                                  ? "border-white bg-white text-gray-900 shadow-sm"
                                  : "border-white/20 bg-white/5 text-white hover:bg-white/10",
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full",
                                    paymentMethod === option.id
                                      ? "border border-gray-900"
                                      : "border border-white/40",
                                  )}
                                >
                                  {paymentMethod === option.id && (
                                    <div className="h-2 w-2 rounded-full bg-gray-900" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{option.title}</div>
                                  {option.subtitle && paymentMethod === option.id && (
                                    <div className="mt-1 text-xs text-gray-600">{option.subtitle}</div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div
                          className={cn(
                            "mt-4 overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 transition-all",
                            paymentMethod === "call_rep"
                              ? "max-h-40 opacity-100"
                              : "max-h-0 opacity-0 pointer-events-none py-0 border-transparent",
                          )}
                        >
                          <div className="text-sm font-semibold text-white/90">Телефон</div>
                          <a
                            href={`tel:${SUPPORT_PHONE_TEL}`}
                            className="mt-1 block text-base font-medium text-white hover:underline"
                          >
                            {SUPPORT_PHONE_DISPLAY}
                          </a>
                          <div className="mt-1 text-xs text-white/60">Нажмите, чтобы позвонить</div>
                        </div>

                        <div className="mt-4 border-t border-white/15 pt-3">
                          <div className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                            Документы
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/70">
                            <a href="/info" className="underline hover:text-white">
                              Политика конфиденциальности
                            </a>
                            <a href="/docs/oferta" className="underline hover:text-white">
                              Публичная оферта
                            </a>
                            <a href="/docs/payment-rules" className="underline hover:text-white">
                              Порядок оплаты по ссылке
                            </a>
                            <a href="/docs/refund" className="underline hover:text-white">
                              Политика возврата средств
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/10 px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[11px] text-white/70">Итого</span>
                              <span className="text-xl font-semibold whitespace-nowrap">
                                {formatRubLocal(totalRub)} ₽
                              </span>
                            </div>
                            {paymentMethod === "deposit_10" && (
                              <div className="text-[11px] text-white/70 leading-snug">
                                Депозит 10% — {formatRubLocal(deposit10Rub)} ₽. Депозит гарантирует закрепление
                                координатора за заявкой и включен в итоговую сумму.
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            onClick={onPayClick}
                            disabled={!canSubmit || isSubmittingOrder}
                            className="rounded-2xl !bg-white !text-gray-900 hover:!bg-gray-100 hover:!text-gray-900 px-5 py-3 text-sm font-semibold disabled:opacity-60 disabled:!text-gray-400"
                          >
                            {isSubmittingOrder ? "Оформление..." : "Оформить"}
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-white/60">
                        {paymentMethod === "call_rep"
                          ? "После оформления мы отправим договор и детали заказа на email. Наш представитель свяжется с вами для уточнения деталей."
                          : "После оформления мы отправим договор, детали заказа и ссылку на оплату на email."}
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
        );
      }

      default:
        return null;
    }
  };

  // simplified workflow
  if (selectedPackageForSimplified) {
    return (
      <div ref={wrapRef} className="relative max-w-5xl mx-auto -translate-y-12 pb-12">
        <div ref={containerRef}>
          <SimplifiedStepperWorkflow
            selectedPackage={selectedPackageForSimplified as any}
            onBack={() => {
              setSelectedPackageForSimplified(null);
              setWorkflowMode("packages");
            }}
            formData={formData}
            onUpdateFormData={onUpdateFormData}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative max-w-5xl mx-auto -translate-y-12 pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden rounded-3xl transition-[height] duration-300 ease-out"
        style={{ height: bgH ? `${bgH}px` : "0px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG_SRC})` }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
      </div>
      <div ref={containerRef}>
      <Card className="bg-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/30 relative">
        <CardHeader className="pb-4 pt-8 px-6 sm:px-8">
          <div className="absolute -top-5 right-8 z-50">
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 text-white hover:scale-105 active:scale-95"
              aria-label="Личный кабинет"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          <div id="start-options" className="mb-6">
            <div className="text-xs uppercase tracking-[0.2em] text-white/70">
              Как вам удобнее начать?
            </div>
            <div className="mt-3 flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                onClick={handleStartOnline}
                className="h-8 sm:h-9 flex-1 min-w-0 rounded-full !bg-white !text-gray-900 hover:!bg-white/90 px-2.5 sm:px-4 text-[11px] sm:text-sm font-semibold whitespace-nowrap shadow-sm"
              >
                Начать онлайн
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-8 sm:h-9 flex-1 min-w-0 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 px-2.5 sm:px-4 text-[10px] sm:text-sm whitespace-nowrap"
              >
                <a
                  href={`tel:${SUPPORT_PHONE_TEL}`}
                  onClick={() => handleEntryMethod("call")}
                >
                  Позвонить
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-8 sm:h-9 flex-1 min-w-0 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 px-2.5 sm:px-4 text-[10px] sm:text-sm whitespace-nowrap"
              >
                <a
                  href={SUPPORT_TELEGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleEntryMethod("telegram")}
                >
                  Написать в Telegram
                </a>
              </Button>
            </div>
            <div className="mt-2 text-xs text-white/70">
              Можно начать самостоятельно или просто задать вопрос — без обязательств.
            </div>
          </div>

          <div id="how-it-works" className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80 md:text-white/60">
                  Как это работает?
                </p>
                <p className="mt-1 text-sm text-white/80 md:text-white/70">
                  5 шагов — чтобы вы понимали, что будет дальше.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-white/70 sm:text-xs">
                {howItWorksSteps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleHowItWorksSelect(index)}
                    className={cn(
                      "relative px-1.5 py-1 transition-all",
                      activeHowItWorksIndex === index
                        ? "text-white"
                        : "text-white/45 hover:text-white/70",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
              <div className="relative mt-2 h-px w-full bg-white/10">
                <span
                  className="absolute top-0 h-px bg-white/70 transition-transform duration-300"
                  style={{
                    width: `calc(100% / ${howItWorksSteps.length})`,
                    transform: `translateX(${activeHowItWorksIndex * 100}%)`,
                  }}
                />
              </div>

              <div
                ref={howItWorksScrollRef}
                className="mt-5 flex w-full gap-4 overflow-x-auto overflow-y-visible px-4 pb-2 pt-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
              >
                {howItWorksSteps.map((item, index) => {
                  const Icon = item.icon;
                  const textLines = Array.isArray(item.text)
                    ? item.text
                    : item.text
                      ? [item.text]
                      : [];
                  return (
                    <div
                      key={item.title}
                      ref={(el) => {
                        howItWorksCardRefs.current[index] = el;
                      }}
                      data-index={index}
                      className="w-[calc(100vw-32px)] max-w-full flex-shrink-0 snap-center rounded-[26px] border border-white/15 bg-white/8 px-4 py-2.5 backdrop-blur-xl sm:w-[680px] sm:px-6 sm:py-4"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white/90 sm:h-12 sm:w-12">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[20px] font-semibold leading-tight text-white sm:text-2xl">
                            {item.title}
                          </div>
                          <div className="mt-0.5 text-[13px] text-white/80 sm:text-base">
                            {item.subtitle}
                          </div>
                          {textLines.length > 0 && (
                            <div className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-white/85 sm:text-sm">
                              {textLines.map((line, lineIndex) => (
                                <p key={`${item.title}-${lineIndex}`}>{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] font-semibold text-white/80">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="flex justify-center mb-6 mt-2">
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full border border-white/20 inline-flex w-full max-w-[360px] min-w-[320px] sm:min-w-[360px]">
              <button
                type="button"
                onClick={() => {
                  openPackagesMode();
                  onModeChange?.("package");
                }}
                className={cn(
                  "flex-1 h-9 px-6 rounded-full text-sm font-medium transition-all duration-200 text-center whitespace-nowrap",
                  workflowMode === "packages" ? "bg-white text-black shadow-lg" : "text-white hover:bg-white/10",
                )}
              >
                Готовые решения
              </button>
              <button
                type="button"
                onClick={() => {
                  openWizardMode();
                  onModeChange?.("wizard");
                }}
                className={cn(
                  "flex-1 h-9 px-6 rounded-full text-sm font-medium transition-all duration-200 text-center whitespace-nowrap",
                  workflowMode === "wizard" ? "bg-white text-black shadow-lg" : "text-white hover:bg-white/10",
                )}
              >
                Пошаговый мастер
              </button>
            </div>
          </div>
          {workflowMode === "wizard" && <div ref={bgEndWizardRef} className="h-0 w-0" />}

          {workflowMode === "wizard" && (
            <Stepper
              steps={steps as any}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          )}

          <div className="text-center mb-2 mt-4">
            <div className="w-full">
              {workflowMode === "wizard" ? (
                <div
                  id="scenario-end"
                  className="relative overflow-hidden rounded-xl border border-white/25 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.12)] md:border-zinc-200 md:bg-zinc-55/50 md:shadow-none p-5 transition-all md:hover:bg-zinc-55"
                >
                  <div className="flex gap-4 items-start">
                    <div className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-700">
                      {currentStep === 0 && <Church className="h-5 w-5" />}
                      {currentStep === 1 && <Car className="h-5 w-5" />}
                      {currentStep === 2 && <Package className="h-5 w-5" />}
                      {currentStep === 3 && <FileText className="h-5 w-5" />}
                      {currentStep === 4 && <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-900 md:text-zinc-500">
                        <span className="flex md:hidden h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] text-white">
                          {currentStep + 1}
                        </span>
                        {currentStep === 0 && "Этап 1: Церемония"}
                        {currentStep === 1 && "Этап 2: Логистика"}
                        {currentStep === 2 && "Этап 3: Атрибутика"}
                        {currentStep === 3 && "Этап 4: Документы"}
                        {currentStep === 4 && "Этап 5: Итог"}
                      </h4>
                      <p className="text-[15px] leading-relaxed text-gray-900 md:text-zinc-800 font-normal">
                        {currentStep === 0 && "Настройте формат прощания: выберите тип церемонии (светская или религиозная) и длительность аренды зала."}
                        {currentStep === 1 && "Спланируйте логистику: укажите дату и время прощания, выберите транспорт для усопшего и гостей."}
                        {currentStep === 2 &&
                          (attributesMode === "preset"
                            ? "Выберите готовый комплект атрибутики или соберите свой вариант. В наборах включено всё необходимое для достойной церемонии."
                            : "Подберите атрибутику: выберите гроб, внутреннее убранство и другие ритуальные принадлежности.")}
                        {currentStep === 3 && "Заполните документы: укажите паспортные данные заявителя и информацию об усопшем для оформления."}
                        {currentStep === 4 && "Проверьте и подтвердите: внимательно ознакомьтесь со всеми деталями заказа перед финальным оформлением."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                null
              )}
            </div>
          </div>
</CardHeader>

<CardContent className="px-6 sm:px-8 pb-8">
  {workflowMode === "wizard" ? (
    <>
      <div
        className={cn(
          "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isTransitioning
            ? "opacity-0 translate-y-8 scale-[0.96] blur-sm"
            : "opacity-100 translate-y-0 scale-100 blur-0",
        )}
      >
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2 rounded-[30px]"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </Button>

        <div className="text-sm text-gray-500">
          Шаг {currentStep + 1} из {steps.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="gap-2 bg-gray-900 hover:bg-gray-800 rounded-[30px]"
        >
          Далее
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  ) : (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl border border-white/25 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.12)] md:border-zinc-200 md:bg-zinc-55/50 md:shadow-none p-5 transition-all md:hover:bg-zinc-55">
        <div className="flex gap-4 items-start">
          <div className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 text-left">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-900 md:text-zinc-500">
              <span className="flex md:hidden h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] text-white">
                1
              </span>
              Выбор сценария
            </h4>
            <p className="text-[15px] leading-relaxed text-gray-900 md:text-zinc-800 font-normal">
              Выберите сценарий: сдержанный, традиционный или расширенный. Вы всегда можете изменить детали позже
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full border border-white/20 inline-flex w-full max-w-[360px] min-w-[320px] sm:min-w-[360px]">
          <button
            type="button"
            onClick={() => handleInputChange("serviceType", "burial")}
            className={cn(
              "flex-1 h-9 px-6 rounded-full text-sm font-medium transition-all duration-200 text-center",
              formData.serviceType === "burial"
                ? "bg-white text-black shadow-lg"
                : "text-white hover:bg-white/10",
            )}
          >
            <span className="flex items-center gap-2">
              <Church className={cn("w-4 h-4", formData.serviceType === "burial" ? "text-black" : "text-white")} />
              Захоронение
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleInputChange("serviceType", "cremation")}
            className={cn(
              "flex-1 h-9 px-6 rounded-full text-sm font-medium transition-all duration-200 text-center",
              formData.serviceType === "cremation"
                ? "bg-white text-black shadow-lg"
                : "text-white hover:bg-white/10",
            )}
          >
            <span className="flex items-center gap-2">
              <CircleDot className={cn("w-4 h-4", formData.serviceType === "cremation" ? "text-black" : "text-white")} />
              Кремация
            </span>
          </button>
        </div>
      </div>
      <div ref={bgEndPackagesRef} className="h-0 w-0" />
      <PackagesSelection
        selectedPackageId=""
        packages={formData.serviceType === "cremation" ? PACKAGES_CREMATION : PACKAGES_BURIAL}
        onSelectPackage={(pkg) => {
          setSelectedPackageForSimplified(pkg);
        }}
      />
    </div>
  )}
</CardContent>
</Card>

<PersonalAccountModal open={isAccountOpen} onOpenChange={setIsAccountOpen} />
      </div>
    </div>
);
}
