"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { PriceComparison } from "./PriceComparison";
import { PersonalAccountModal } from "./PersonalAccountModal";
import { SimplifiedStepperWorkflow } from "./SimplifiedStepperWorkflow";
import PaymentStep from "./PaymentStep";

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
import { Calendar } from "./ui/calendar";
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


type PaymentMethod = "card" | "sbp" | "installment";

const steps = [
  { id: "format", label: "Формат", description: "Выбор церемонии" },
  { id: "logistics", label: "Логистика", description: "Место и транспорт" },
  { id: "attributes", label: "Атрибутика", description: "Выбор материалов" },
  { id: "documents", label: "Документы", description: "Основная информация" },
  { id: "confirmation", label: "Подтверждение", description: "Проверка данных" },
] as const;

const PRICES = {
  hallDuration: { 30: 0, 60: 8000, 90: 12000 },
  ceremonyType: { civil: 0, religious: 15000, combined: 20000 },
  hearse: 8000,
  familyTransport: { 5: 5000, 10: 8000, 15: 12000 },
  pallbearers: 6000,
} as const;

const PACKAGES = [
  {
    id: "basic",
    name: "Базовый",
    price: 45000,
    description: "Необходимый минимум",
    features: ["Гроб сосна", "Венок искусственный", "Базовая отделка", "Катафалк", "Носильщики"],
  },
  {
    id: "standard",
    name: "Стандарт",
    price: 85000,
    description: "Оптимальный вариант",
    features: [
      "Гроб дуб",
      "Живые цветы",
      "Бархатная отделка",
      "Катафалк",
      "Носильщики",
      "Зал прощания 60 мин",
      "Транспорт для близких",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Премиум",
    price: 150000,
    description: "Максимальный комфорт",
    features: [
      "Гроб красное дерево",
      "Премиум композиция",
      "Шелковая отделка",
      "Катафалк премиум",
      "Носильщики",
      "Зал прощания 90 мин",
      "Транспорт для близких",
      "Координатор церемонии",
      "Музыкальное сопровождение",
    ],
  },
] as const;

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
}

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

interface StepperWorkflowProps {
  formData: {
    serviceType: string;
    hasHall: boolean;
    hallDuration: number;
    ceremonyType: string;
    confession: string;
    ceremonyOrder: string;

    cemetery: string;
    selectedSlot: string;

    needsHearse: boolean;
    hearseRoute: { morgue: boolean; hall: boolean; church: boolean; cemetery: boolean };

    needsFamilyTransport: boolean;
    familyTransportSeats: number;

    distance: string;

    clientName: string;
    clientEmail: string;

    userEmail: string;

    needsPallbearers: boolean;

    packageType: "basic" | "standard" | "premium" | "custom" | "";
    selectedAdditionalServices: string[];

    specialRequests: string;

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
}

export function StepperWorkflow({
  formData,
  onUpdateFormData,
  onStepChange,
  onCemeteryCategoryChange,
}: StepperWorkflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ флаг: скроллим только если переход был через "Далее"
  const shouldScrollOnStepChangeRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const previousStepRef = useRef(0);

  const [workflowMode, setWorkflowMode] = useState<"wizard" | "packages">("wizard");
  const [selectedPackageForSimplified, setSelectedPackageForSimplified] =
    useState<(typeof PACKAGES)[number] | null>(null);

  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [showConsentError, setShowConsentError] = useState(false);

  const [cemeterySearchQuery, setCemeterySearchQuery] = useState("");
  const [showCemeteryResults, setShowCemeteryResults] = useState(false);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<"standard" | "comfort" | "premium">("standard");

  const [showHearseDialog, setShowHearseDialog] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardData, setCardData] = useState({ number: "", holder: "", expiry: "", cvc: "" });

  const scrollToWizardTop = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ “первое монтирование”
  useEffect(() => {
    const t = setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
    return () => clearTimeout(t);
  }, []);

  // ✅ notify parent step change
  useEffect(() => {
    if (!isInitialMountRef.current && onStepChange) onStepChange(currentStep);
  }, [currentStep, onStepChange]);

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

  const handleSkipField = (field: string) => {
    const currentValue = (formData as any)[field];
    onUpdateFormData(field, currentValue === "—" ? "" : "—");
  };

  // ✅ КЛЮЧЕВОЕ: если выключили зал — чистим маршрут и время
  const [farewellDateTime, setFarewellDateTime] = useState<{ date?: Date; time?: string }>({});
  const [pickupDateTime, setPickupDateTime] = useState<{ date?: Date; time?: string }>({});
  const [burialDateTime, setBurialDateTime] = useState<{ date?: Date; time?: string }>({});

  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [showFarewellDialog, setShowFarewellDialog] = useState(false);
  const [showBurialDialog, setShowBurialDialog] = useState(false);

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

  const calculateTotal = () => {
    let total = 0;

    if (formData.packageType && formData.packageType !== "custom") {
      const pkg = PACKAGES.find((p) => p.id === formData.packageType);
      if (pkg) total = pkg.price;
    } else {
      total = 25000;

      if (formData.hasHall) {
        total += PRICES.hallDuration[formData.hallDuration as 30 | 60 | 90] || 0;
      }

      total += PRICES.ceremonyType[formData.ceremonyType as keyof typeof PRICES.ceremonyType] || 0;

      if (formData.needsHearse) total += PRICES.hearse;

      if (formData.needsFamilyTransport) {
        total += PRICES.familyTransport[formData.familyTransportSeats as 5 | 10 | 15] || 0;
      }

      if (formData.needsPallbearers) total += PRICES.pallbearers;

      if (Array.isArray(formData.selectedAdditionalServices)) {
        for (const serviceId of formData.selectedAdditionalServices) {
          const s = additionalServices.find((x) => x.id === serviceId);
          if (s) total += s.price;
        }
      }
    }

    if (formData.cemetery) {
      const all = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
      const selected = all.find((c) => c.name === formData.cemetery);
      const price = selected?.categories?.[selectedCemeteryCategory];
      if (price) total += price;
    }

    return total;
  };

  const calculateBreakdown = () => {
    const breakdown: { category: string; price: number; items?: { name: string; price?: number }[] }[] = [];

    if (formData.packageType && formData.packageType !== "custom") {
      const pkg = PACKAGES.find((p) => p.id === formData.packageType);
      if (pkg) {
        breakdown.push({
          category: `Пакет "${pkg.name}"`,
          price: pkg.price,
          items: pkg.features.map((f) => ({ name: f })),
        });
      }
      return breakdown;
    }

    breakdown.push({
      category: "Базовые услуги",
      price: 25000,
      items: [
        { name: "Оформление документов" },
        { name: "Подтверждение места захоронения" },
        { name: "Хранение и базовая подготовка тела" },
        { name: "Гроб из массива сосны + подушка/покрывало" },
        { name: "Транспортировка покойного и перенос" },
        { name: "Кладбищенские работы" },
      ],
    });

    const formatItems: { name: string; price?: number }[] = [];
    let formatTotal = 0;

    if (formData.hasHall && formData.hallDuration) {
      const hallPrice = PRICES.hallDuration[formData.hallDuration as 30 | 60 | 90] || 0;
      formatItems.push({ name: `Зал прощания (${formData.hallDuration} мин)`, price: hallPrice });
      formatTotal += hallPrice;
    }

    const ceremonyPrice = PRICES.ceremonyType[formData.ceremonyType as keyof typeof PRICES.ceremonyType] || 0;
    if (ceremonyPrice > 0) {
      formatItems.push({
        name: formData.ceremonyType === "religious" ? "Религиозная церемония" : "Комбинированная церемония",
        price: ceremonyPrice,
      });
      formatTotal += ceremonyPrice;
    }

    if (formatItems.length) breakdown.push({ category: "Формат", price: formatTotal, items: formatItems });

    const logisticsItems: { name: string; price?: number }[] = [];
    let logisticsTotal = 0;

    if (formData.needsHearse) {
      logisticsItems.push({ name: "Катафалк", price: PRICES.hearse });
      logisticsTotal += PRICES.hearse;
    }
    if (formData.needsFamilyTransport) {
      const tp = PRICES.familyTransport[formData.familyTransportSeats as 5 | 10 | 15] || 0;
      logisticsItems.push({ name: `Транспорт для близких (${formData.familyTransportSeats} мест)`, price: tp });
      logisticsTotal += tp;
    }
    if (formData.needsPallbearers) {
      logisticsItems.push({ name: "Носильщики", price: PRICES.pallbearers });
      logisticsTotal += PRICES.pallbearers;
    }

    if (logisticsItems.length) breakdown.push({ category: "Логистика", price: logisticsTotal, items: logisticsItems });

    if (formData.selectedAdditionalServices?.length) {
      const addItems: { name: string; price?: number }[] = [];
      let addTotal = 0;
      for (const id of formData.selectedAdditionalServices) {
        const s = additionalServices.find((x) => x.id === id);
        if (!s) continue;
        addItems.push({ name: s.name, price: s.price });
        addTotal += s.price;
      }
      if (addItems.length) breakdown.push({ category: "Дополнительные услуги", price: addTotal, items: addItems });
    }

    if (formData.cemetery) {
      const all = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
      const selected = all.find((c) => c.name === formData.cemetery);
      const price = selected?.categories?.[selectedCemeteryCategory] || 0;
      if (price) {
        const catName =
          selectedCemeteryCategory === "standard" ? "Стандарт" : selectedCemeteryCategory === "comfort" ? "Комфорт" : "Премиум";
        breakdown.push({ category: `Место на кладбище (${catName})`, price, items: [{ name: formData.cemetery }] });
      }
    }

    return breakdown;
  };

  const handleConfirmBooking = async () => {
    try {
      const orderEmail = (formData.userEmail || "").trim();
      if (!orderEmail) {
        alert("Укажите email для получения подтверждения.");
        return;
      }

      const total = calculateTotal();
      const breakdown = calculateBreakdown();

      const payload = {
        userEmail: orderEmail,
        userName: (formData.clientName || formData.fullName || "").trim() || undefined,
        formData,
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
        },
        notes: formData.specialRequests || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        console.error("Ошибка при создании заказа", data);
        alert("Не удалось оформить бронирование. Попробуйте ещё раз.");
        return;
      }

      alert("Бронирование оформлено! Детали отправлены на указанную почту. К сожалению оплата не прошла, агент свяжется с вами в скором времени");
    } catch (e) {
      console.error(e);
      alert("Сетевая ошибка. Проверьте интернет и попробуйте ещё раз.");
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
    setCurrentStep((s) => s - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    // ✅ круги — НЕ скроллят
    shouldScrollOnStepChangeRef.current = false;
    setCurrentStep(stepIndex);
  };

  const handleEditStep = (stepIndex: number) => {
    // ✅ редактирование — тоже без скролла
    shouldScrollOnStepChangeRef.current = false;
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
    if (!selectedPackageForSimplified) {
      const defaultPkg = PACKAGES.find((p: any) => (p as any).popular) ?? PACKAGES[0];
      setSelectedPackageForSimplified(defaultPkg as any);
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
                    <br />
                    <span className="text-green-800">Экономия: −8 000 ₽ • −60 мин</span>
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
                        <Label htmlFor="civil" className="cursor-pointer">Светская</Label>
                        <p className="text-xs text-gray-500 mt-1">Без религиозных обрядов</p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "religious" && "border-black bg-gray-50",
                      )}
                    >
                      <RadioGroupItem value="religious" id="religious" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="religious" className="cursor-pointer">Религиозная</Label>
                        <p className="text-xs text-gray-500 mt-1">С участием священнослужителя</p>
                      </div>
                      <span className="text-sm text-gray-500">+15 000 ₽</span>
                    </div>

                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "combined" && "border-black bg-gray-50",
                      )}
                    >
                      <RadioGroupItem value="combined" id="combined" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="combined" className="cursor-pointer">Комбинированная</Label>
                        <p className="text-xs text-gray-500 mt-1">Светская + религиозная часть</p>
                      </div>
                      <span className="text-sm text-gray-500">+20 000 ₽</span>
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
                          formData.hallDuration === duration ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300",
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
                <Label className="text-gray-900">Время забора тела</Label>
                <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm">
                      <Clock className="h-4 w-4 mr-3 text-gray-500" />
                      <span className={cn(pickupDateTime.date && pickupDateTime.time ? "text-gray-900" : "text-gray-600")}>
                        {pickupDateTime.date && pickupDateTime.time
                          ? `${pickupDateTime.date.toLocaleDateString("ru-RU")} в ${pickupDateTime.time}`
                          : "Выбрать время забора"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Выбор даты и времени забора</DialogTitle>
                      <DialogDescription>Выберите дату и время, когда требуется забрать тело</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 py-2">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <Calendar
                          mode="single"
                          selected={pickupDateTime.date}
                          onSelect={(date) => setPickupDateTime({ ...pickupDateTime, date })}
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                        />
                      </div>

                      {pickupDateTime.date && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {Array.from({ length: 24 }, (_, i) => i)
                              .flatMap((i) => {
                                const hour = i.toString().padStart(2, "0");
                                return [`${hour}:00`, `${hour}:30`];
                              })
                              .map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setPickupDateTime({ ...pickupDateTime, time })}
                                  className={cn(
                                    "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                    pickupDateTime.time === time
                                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
                                  )}
                                >
                                  {time}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={() => setShowPickupDialog(false)}
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800"
                        disabled={!pickupDateTime.date || !pickupDateTime.time}
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
                        <span className={cn(farewellDateTime.date && farewellDateTime.time ? "text-gray-900" : "text-gray-600")}>
                          {farewellDateTime.date && farewellDateTime.time
                            ? `${farewellDateTime.date.toLocaleDateString("ru-RU")} в ${farewellDateTime.time}`
                            : "Выбрать время прощания"}
                        </span>
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Выбор даты и времени прощания</DialogTitle>
                        <DialogDescription>Выберите дату и время прощания в зале или церкви</DialogDescription>
                      </DialogHeader>

                      <div className="flex flex-col gap-6 py-2">
                        <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                          <Calendar
                            mode="single"
                            selected={farewellDateTime.date}
                            onSelect={(date) => setFarewellDateTime({ ...farewellDateTime, date })}
                            disabled={(date) => date < new Date()}
                            className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                          />
                        </div>

                        {farewellDateTime.date && (
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {Array.from({ length: 24 }, (_, i) => i)
                              .flatMap((i) => {
                                const hour = i.toString().padStart(2, "0");
                                return [`${hour}:00`, `${hour}:30`];
                              })
                              .map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setFarewellDateTime({ ...farewellDateTime, time })}
                                  className={cn(
                                    "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                    farewellDateTime.time === time
                                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
                                  )}
                                >
                                  {time}
                                </button>
                              ))}
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={() => setShowFarewellDialog(false)}
                          className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800"
                          disabled={!farewellDateTime.date || !farewellDateTime.time}
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
                      <span className={cn(burialDateTime.date && burialDateTime.time ? "text-gray-900" : "text-gray-600")}>
                        {burialDateTime.date && burialDateTime.time
                          ? `${burialDateTime.date.toLocaleDateString("ru-RU")} в ${burialDateTime.time}`
                          : "Выбрать время"}
                      </span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Выбор даты и времени {formData.serviceType === "cremation" ? "кремации" : "захоронения"}
                      </DialogTitle>
                      <DialogDescription>Укажите удобные дату и время церемонии.</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 py-2">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <Calendar
                          mode="single"
                          selected={burialDateTime.date}
                          onSelect={(date) => setBurialDateTime({ ...burialDateTime, date })}
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                        />
                      </div>

                      {burialDateTime.date && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
                          {Array.from({ length: 24 }, (_, i) => i)
                            .flatMap((i) => {
                              const hour = i.toString().padStart(2, "0");
                              return [`${hour}:00`, `${hour}:30`];
                            })
                            .map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setBurialDateTime({ ...burialDateTime, time })}
                                className={cn(
                                  "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                  burialDateTime.time === time
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
                                )}
                              >
                                {time}
                              </button>
                            ))}
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={() => setShowBurialDialog(false)}
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800"
                        disabled={!burialDateTime.date || !burialDateTime.time}
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
                  <Label>Нужен катафалк?</Label>
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
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
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
            <UnifiedCoffinConfigurator
              onConfirm={(data) => {
                handleInputChange("coffinConfig", data);
              }}
            />

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
              <Input
                id="fullName"
                value={formData.fullName}
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
                    type={formData.birthDate === "—" ? "text" : "date"}
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => handleSkipField("birthDate")} className="whitespace-nowrap rounded-[30px]">
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
                  <Button type="button" variant="outline" size="sm" onClick={() => handleSkipField("deathDate")} className="whitespace-nowrap rounded-[30px]">
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
                <Button type="button" variant="outline" size="sm" onClick={() => handleSkipField("deathCertificate")} className="whitespace-nowrap">
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
                <a href="#" className="underline text-blue-600">
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
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-green-900 mb-2">Все данные заполнены</h3>
                <p className="text-sm text-green-700">Пожалуйста, проверьте информацию перед бронированием.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-gray-500">Формат церемонии</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEditStep(0)} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Формат:</span>
                    <span className="text-gray-900">{formData.serviceType === "burial" ? "Захоронение" : "Кремация"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Зал прощания:</span>
                    <span className="text-gray-900">{formData.hasHall ? "Да" : "Нет"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-gray-500">Логистика</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEditStep(1)} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{formData.serviceType === "burial" ? "Кладбище:" : "Крематорий:"}</span>
                    <span className="text-gray-900">{formData.cemetery || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Катафалк:</span>
                    <span className="text-gray-900">{formData.needsHearse ? "Да" : "Нет"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-gray-500">Атрибутика</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEditStep(2)} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  {formData.packageType && formData.packageType !== "custom" ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Пакет:</span>
                      <span className="text-gray-900">
                        {PACKAGES.find((p) => p.id === formData.packageType)?.name || "—"}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-600 block mb-2">Индивидуальный пакет</span>
                      {formData.selectedAdditionalServices?.length ? (
                        <div className="space-y-1">
                          {formData.selectedAdditionalServices.map((serviceId: string) => {
                            const s = additionalServices.find((x) => x.id === serviceId);
                            if (!s) return null;
                            return (
                              <div key={serviceId} className="text-xs text-gray-900">
                                • {s.name}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Услуги не выбраны</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-gray-500">Документы</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEditStep(3)} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ФИО:</span>
                    <span className="text-gray-900">{formData.fullName || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата рождения:</span>
                    <span className="text-gray-900">{formData.birthDate || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата смерти:</span>
                    <span className="text-gray-900">{formData.deathDate || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            <PaymentStep
              total={calculateTotal()}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cardData={cardData}
              setCardData={setCardData}
              email={formData.userEmail || ""}
              setEmail={(v) => handleInputChange("userEmail", v)}
              onConfirm={handleConfirmBooking}
            />
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
      <div ref={containerRef} className="max-w-5xl mx-auto -translate-y-12 pb-32">
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
    );
  }

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto -translate-y-12 pb-32">
      <Card className="bg-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/30 relative">
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

          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/20 inline-flex">
              <button
                type="button"
                onClick={() => {
                  setWorkflowMode("wizard");
                  setSelectedPackageForSimplified(null);
                }}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  workflowMode === "wizard" ? "bg-white text-black shadow-lg" : "text-white hover:bg-white/10",
                )}
              >
                Пошаговый мастер
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkflowMode("packages");
                  setSelectedPackageForSimplified(null);
                }}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  workflowMode === "packages" ? "bg-white text-black shadow-lg" : "text-white hover:bg-white/10",
                )}
              >
                Готовые решения
              </button>
            </div>
          </div>

          <div className="text-center mb-2">
  <CardDescription
  style={{ color: "rgba(255, 255, 255, 1)" }}                 // мобилка всегда тёмный
  className="text-[15px] font-sans max-w-xl mx-auto leading-relaxed text-left md:!text-white"  // десктоп белый
>

    {workflowMode === "wizard" ? (
      <>
        {currentStep === 0 &&
          "Настройте формат прощания: выберите тип церемонии (светская или религиозная) и длительность аренды зала."}
        {currentStep === 1 &&
          "Спланируйте логистику: укажите дату и время прощания, выберите транспорт для усопшего и гостей."}
        {currentStep === 2 &&
          "Подберите атрибутику: выберите гроб, внутреннее убранство и другие ритуальные принадлежности."}
        {currentStep === 3 &&
          "Заполните документы: укажите паспортные данные заявителя и информацию об усопшем для оформления."}
        {currentStep === 4 &&
          "Проверьте и подтвердите: внимательно ознакомьтесь со всеми деталями заказа перед финальным оформлением."}
      </>
    ) : (
      "Выберите оптимальный пакет услуг под ваши задачи"
    )}
  </CardDescription>
</div>

          

          {workflowMode === "wizard" && (
            <Stepper steps={steps as any} currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />
          )}
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8">
          {workflowMode === "wizard" ? (
            <>
              <div
                className={cn(
                  "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isTransitioning ? "opacity-0 translate-y-8 scale-[0.96] blur-sm" : "opacity-100 translate-y-0 scale-100 blur-0",
                )}
              >
                {renderStepContent()}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="gap-2 rounded-[30px]">
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </Button>

                <div className="text-sm text-gray-500">
                  Шаг {currentStep + 1} из {steps.length}
                </div>

                <Button onClick={handleNext} disabled={currentStep === steps.length - 1} className="gap-2 bg-gray-900 hover:bg-gray-800 rounded-[30px]">
                  Далее
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "cursor-pointer hover:border-gray-400 hover:shadow-lg transition-all duration-300 relative overflow-hidden group border-white/50 bg-white/80 backdrop-blur-sm",
                    formData.packageType === pkg.id ? "ring-2 ring-gray-900 border-gray-900" : "",
                  )}
                  onClick={() => {
                    handleInputChange("packageType", pkg.id);
                    setSelectedPackageForSimplified(pkg);
                  }}
                >
                  {(pkg as any).popular && (
                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Популярный
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-light mb-6">{pkg.price.toLocaleString("ru-RU")} ₽</div>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800">
                      Настроить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PersonalAccountModal open={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </div>
  );
}