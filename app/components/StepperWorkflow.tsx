import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { PersonalAccountModal } from "./PersonalAccountModal"; 
import CoffinConfigurator3D from "./CoffinConfigurator3D";
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Camera,
  Edit2,
  Download,
  Share2,
  Clock,
  RubleSign,
  Music,
  Church,
  Car,
  Flower2,
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
  Check,
  Search,
  MapPin,
} from "./Icons";
import { cn } from "./ui/utils";
import { ImageWithFallback } from "./ImageWithFallback";
import { UnifiedCoffinConfigurator } from "./UnifiedCoffinConfigurator";
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

const steps = [
  {
    id: "format",
    label: "Формат",
    description: "Выбор церемонии",
  },
  {
    id: "logistics",
    label: "Логистика",
    description: "Место и транспорт",
  },
  {
    id: "attributes",
    label: "Атрибутика",
    description: "Выбор материалов",
  },
  {
    id: "documents",
    label: "Документы",
    description: "Основная информация",
  },
  {
    id: "confirmation",
    label: "Подтверждение",
    description: "Проверка данных",
  },
];

// Справочник цен
const PRICES = {
  // Формат
  hallDuration: {
    30: 5000,
    60: 8000,
    90: 12000,
  },
  ceremonyType: {
    civil: 0,
    religious: 15000,
    combined: 20000,
  },
  // Логистика
  hearse: 8000,
  familyTransport: {
    5: 5000,
    10: 8000,
    15: 12000,
  },
  pallbearers: 6000,
};

// Готовые пакеты
const PACKAGES = [
  {
    id: "basic",
    name: "Базовый",
    price: 45000,
    description: "Необходимый минимум",
    features: [
      "Гроб сосна",
      "Венок искусственный",
      "Базовая отделка",
      "Катафалк",
      "Носильщики",
    ],
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
];

// Дополнительные услуги для конструктора
interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
}

const additionalServices: AdditionalService[] = [
  {
    id: "morgue-storage",
    name: "Хранение в морге",
    price: 2500,
    description: "Резерв времени до церемонии",
    icon: Snowflake,
  },
  {
    id: "sanitary-prep",
    name: "Санитарная подготовка и бальзамирование",
    price: 12000,
    description: "Аккуратный внешний вид",
    icon: Sparkles,
  },
  {
    id: "clothing",
    name: "Одежда и облачение",
    price: 8000,
    description: "Подбор, подготовка, укладка",
    icon: Shirt,
  },
  {
    id: "hall-rental",
    name: "Аренда зала прощания",
    price: 15000,
    description: "60–90 мин, подготовка площадки",
    icon: Building,
  },
  {
    id: "coordinator",
    name: "Координатор церемонии",
    price: 18000,
    description: "Сценарий, тайминг",
    icon: UserCheck,
  },
  {
    id: "pallbearers",
    name: "Носильщики (4–6 чел.)",
    price: 6000,
    description: "Церемониальная группа",
    icon: Users,
  },
  {
    id: "hearse-premium",
    name: "Катафалк премиум-класса",
    price: 14000,
    description: "Комфорт/бизнес-класс",
    icon: Car,
  },
  {
    id: "hearse-extra-trips",
    name: "Дополнительные рейсы",
    price: 5000,
    description: "Морг → зал → кладбище",
    icon: Route,
  },
  {
    id: "transport-family",
    name: "Транспорт для близких",
    price: 10000,
    description: "Микроавтобус/автобус",
    icon: Bus,
  },
  {
    id: "fresh-flowers",
    name: "Живая флористика",
    price: 12000,
    description: "Композиции, гирлянды",
    icon: Flower2,
  },
  {
    id: "textile-premium",
    name: "Текстиль премиум",
    price: 7000,
    description: "Покрывало, подушка улучшенные",
    icon: Package,
  },
  {
    id: "decor",
    name: "Декор зала и места",
    price: 15000,
    description: "Свечи, стойки, шатёр",
    icon: Palette,
  },
  {
    id: "music",
    name: "Музыкальное сопровождение",
    price: 8000,
    description: "Живые инструменты/фон",
    icon: Music,
  },
  {
    id: "photo-video",
    name: "Фото и видеосъёмка",
    price: 15000,
    description: "Памятный ролик",
    icon: Camera,
  },
  {
    id: "online-stream",
    name: "Онлайн-трансляция",
    price: 8000,
    description: "Для родственников на расстоянии",
    icon: Video,
  },
  {
    id: "priest",
    name: "Религиозный обряд",
    price: 9000,
    description: "По конфессии",
    icon: Church,
  },
  {
    id: "memorial-cross",
    name: "Памятный крест временный",
    price: 5000,
    description: "До установки памятника",
    icon: Cross,
  },
  {
    id: "printing",
    name: "Печать и полиграфия",
    price: 4000,
    description: "Ленты, программки, карточки",
    icon: FileText,
  },
  {
    id: "memorial-meal",
    name: "Поминальный обед",
    price: 35000,
    description: "Подбор зала, меню",
    icon: Utensils,
  },
  {
    id: "monument",
    name: "Памятник и благоустройство",
    price: 85000,
    description: "Проект, изготовление, установка",
    icon: Landmark,
  },
];

// Справочник кладбищ и крематориев Москвы
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
    address: "Лужнецкий проезд, д. 2",
    categories: {},
    working: false,
  },
  {
    id: "danilovskoye",
    name: "Даниловское кладбище",
    type: "cemetery",
    district: "ЮАО",
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
    hearseRoute: {
      morgue: boolean;
      hall: boolean;
      church: boolean;
      cemetery: boolean;
    };
    needsFamilyTransport: boolean;
    familyTransportSeats: number;
    distance: string;
    clientName: string;
    clientEmail: string;
    userEmail: string;
    needsPallbearers: boolean;
    packageType:
      | "basic"
      | "standard"
      | "premium"
      | "custom"
      | "";
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
  onCemeteryCategoryChange?: (
    category: "standard" | "comfort" | "premium",
  ) => void;
}

export function StepperWorkflow({
  formData,
  onUpdateFormData,
  onStepChange,
  onCemeteryCategoryChange,
}: StepperWorkflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<
    number[]
  >([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHearseDialog, setShowHearseDialog] =
    useState(false);
  const isInitialMountRef = useRef(true);
  const previousStepRef = useRef(0);
  const [showConsentError, setShowConsentError] =
    useState(false);
  const [cemeterySearchQuery, setCemeterySearchQuery] =
    useState("");
  const [showCemeteryResults, setShowCemeteryResults] =
    useState(false);
  const [
    selectedCemeteryCategory,
    setSelectedCemeteryCategory,
  ] = useState<"standard" | "comfort" | "premium">("standard");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "sbp" | "installment"
  >("card");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    holder: "",
  });

  // Состояния для выбора даты и времени
  const [pickupDateTime, setPickupDateTime] = useState<{
    date?: Date;
    time?: string;
  }>({});
  const [farewellDateTime, setFarewellDateTime] = useState<{
    date?: Date;
    time?: string;
  }>({});
  const [burialDateTime, setBurialDateTime] = useState<{
    date?: Date;
    time?: string;
  }>({});
  const [showPickupDialog, setShowPickupDialog] =
    useState(false);
  const [showFarewellDialog, setShowFarewellDialog] =
    useState(false);
  const [showBurialDialog, setShowBurialDialog] =
    useState(false);

  // Инициализация (всегда начинаем с шага 0)
  useEffect(() => {
    // Не загружаем currentStep из localStorage - всегда начинаем с первого шага
    // Помечаем, что первое монтирование завершено
    const timer = setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Уведомление родителя об изменении шага (без сохранения в localStorage)
  useEffect(() => {
    // Уведомляем родительский компонент об изменении шага
    // Только если это не первая загрузка
    if (!isInitialMountRef.current && onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Автоматический скролл вверх при смене шага
  useEffect(() => {
    // Скроллим только если шаг реально изменился (не при первой загрузке)
    if (
      !isInitialMountRef.current &&
      previousStepRef.current !== currentStep
    ) {
      // Используем только window.scrollTo для согласованного скроллинга
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    previousStepRef.current = currentStep;
  }, [currentStep]);

  // Уведомляем родительский компонент об изменении категории кладбища
  useEffect(() => {
    if (onCemeteryCategoryChange) {
      onCemeteryCategoryChange(selectedCemeteryCategory);
    }
  }, [selectedCemeteryCategory, onCemeteryCategoryChange]);

  // Закрытие результатов поиска при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("#cemetery") &&
        !target.closest(".cemetery-results")
      ) {
        setShowCemeteryResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // Расчёт стоимости
  const calculateTotal = () => {
    let total = 0;

    // Если выбран готовый пакет
    if (
      formData.packageType &&
      formData.packageType !== "custom"
    ) {
      const pkg = PACKAGES.find(
        (p) => p.id === formData.packageType,
      );
      if (pkg) {
        total = pkg.price;
      }
    } else {
      // Базовая цена
      total = 25000;

      // Зал прощания
      if (formData.hasHall) {
        total +=
          PRICES.hallDuration[
            formData.hallDuration as keyof typeof PRICES.hallDuration
          ] || 0;
      }

      // Тип церемонии
      total +=
        PRICES.ceremonyType[
          formData.ceremonyType as keyof typeof PRICES.ceremonyType
        ] || 0;

      // Транспорт
      if (formData.needsHearse) {
        total += PRICES.hearse;
      }
      if (formData.needsFamilyTransport) {
        total +=
          PRICES.familyTransport[
            formData.familyTransportSeats as keyof typeof PRICES.familyTransport
          ] || 0;
      }

      // Носильщики
      if (formData.needsPallbearers) {
        total += PRICES.pallbearers;
      }

      // Дополнительные услуги
      if (
        formData.selectedAdditionalServices &&
        Array.isArray(formData.selectedAdditionalServices)
      ) {
        formData.selectedAdditionalServices.forEach(
          (serviceId) => {
            const service = additionalServices.find(
              (s) => s.id === serviceId,
            );
            if (service) {
              total += service.price;
            }
          },
        );
      }
    }

    // Место на кладбище/в крематории
    if (formData.cemetery) {
      const allCemeteries = [
        ...MOSCOW_CEMETERIES,
        ...MO_CEMETERIES,
      ];
      const selectedCemetery = allCemeteries.find(
        (c) => c.name === formData.cemetery,
      );
      if (
        selectedCemetery &&
        selectedCemetery.categories[selectedCemeteryCategory]
      ) {
        total +=
          selectedCemetery.categories[
            selectedCemeteryCategory
          ] || 0;
      }
    }

    return total;
  };

  // Функция для расчета детализации стоимости
  const calculateBreakdown = () => {
    const breakdown: {
      category: string;
      price: number;
      items?: { name: string; price?: number }[];
    }[] = [];

    // Если выбран готовый пакет
    if (
      formData.packageType &&
      formData.packageType !== "custom"
    ) {
      const pkg = PACKAGES.find(
        (p) => p.id === formData.packageType,
      );
      if (pkg) {
        breakdown.push({
          category: `Пакет "${pkg.name}"`,
          price: pkg.price,
          items: pkg.features.map((f) => ({ name: f })),
        });
      }
    } else {
      // Базовые услуги
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

      // Формат
      const formatItems: { name: string; price?: number }[] =
        [];
      let formatTotal = 0;

      if (formData.hasHall) {
        const hallPrice =
          PRICES.hallDuration[
            formData.hallDuration as keyof typeof PRICES.hallDuration
          ] || 0;
        formatItems.push({
          name: `Зал прощания (${formData.hallDuration} мин)`,
          price: hallPrice,
        });
        formatTotal += hallPrice;
      }

      const ceremonyPrice =
        PRICES.ceremonyType[
          formData.ceremonyType as keyof typeof PRICES.ceremonyType
        ] || 0;
      if (ceremonyPrice > 0) {
        const ceremonyName =
          formData.ceremonyType === "religious"
            ? "Религиозная церемония"
            : "Комбинированная церемония";
        formatItems.push({
          name: ceremonyName,
          price: ceremonyPrice,
        });
        formatTotal += ceremonyPrice;
      }

      if (formatItems.length > 0) {
        breakdown.push({
          category: "Формат",
          price: formatTotal,
          items: formatItems,
        });
      }

      // Логистика
      const logisticsItems: { name: string; price?: number }[] =
        [];
      let logisticsTotal = 0;

      if (formData.needsHearse) {
        logisticsItems.push({
          name: "Катафалк",
          price: PRICES.hearse,
        });
        logisticsTotal += PRICES.hearse;
      }

      if (formData.needsFamilyTransport) {
        const transportPrice =
          PRICES.familyTransport[
            formData.familyTransportSeats as keyof typeof PRICES.familyTransport
          ] || 0;
        logisticsItems.push({
          name: `Транспорт для близких (${formData.familyTransportSeats} мест)`,
          price: transportPrice,
        });
        logisticsTotal += transportPrice;
      }

      if (formData.needsPallbearers) {
        logisticsItems.push({
          name: "Носильщики",
          price: PRICES.pallbearers,
        });
        logisticsTotal += PRICES.pallbearers;
      }

      if (logisticsItems.length > 0) {
        breakdown.push({
          category: "Логистика",
          price: logisticsTotal,
          items: logisticsItems,
        });
      }

      // Дополнительные услуги
      if (
        formData.selectedAdditionalServices &&
        formData.selectedAdditionalServices.length > 0
      ) {
        const additionalItems: {
          name: string;
          price?: number;
        }[] = [];
        let additionalTotal = 0;

        formData.selectedAdditionalServices.forEach(
          (serviceId) => {
            const service = additionalServices.find(
              (s) => s.id === serviceId,
            );
            if (service) {
              additionalItems.push({
                name: service.name,
                price: service.price,
              });
              additionalTotal += service.price;
            }
          },
        );

        if (additionalItems.length > 0) {
          breakdown.push({
            category: "Дополнительные услуги",
            price: additionalTotal,
            items: additionalItems,
          });
        }
      }
    }

    // Место на кладбище/в крематории
    if (formData.cemetery) {
      const allCemeteries = [
        ...MOSCOW_CEMETERIES,
        ...MO_CEMETERIES,
      ];
      const selectedCemetery = allCemeteries.find(
        (c) => c.name === formData.cemetery,
      );
      if (
        selectedCemetery &&
        selectedCemetery.categories[selectedCemeteryCategory]
      ) {
        const cemeteryPrice =
          selectedCemetery.categories[
            selectedCemeteryCategory
          ] || 0;
        const categoryName =
          selectedCemeteryCategory === "standard"
            ? "Стандарт"
            : selectedCemeteryCategory === "comfort"
              ? "Комфорт"
              : "Премиум";
        breakdown.push({
          category: `Место на кладбище (${categoryName})`,
          price: cemeteryPrice,
          items: [{ name: formData.cemetery }],
        });
      }
    }

    return breakdown;
  };

  const handleInputChange = (field: string, value: any) => {
    onUpdateFormData(field, value);
  };

  const handleSkipField = (field: string) => {
    // Переключаем значение: если уже прочерк, то очищаем, если нет - ставим прочерк
    const currentValue =
      formData[field as keyof typeof formData];
    onUpdateFormData(field, currentValue === "—" ? "" : "—");
  };

  const handleNext = () => {
    // Проверка согласия на шаге документов
    if (currentStep === 3 && !formData.dataConsent) {
      setShowConsentError(true);
      setTimeout(() => {
        const consentElement =
          document.getElementById("data-consent");
        if (consentElement) {
          consentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
      return;
    }

    if (currentStep < steps.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setShowConsentError(false);

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Фильтрация кладбищ по поисковому запросу
  const filteredCemeteries = [
    ...MOSCOW_CEMETERIES,
    ...MO_CEMETERIES,
  ].filter((cemetery) => {
    if (!cemeterySearchQuery.trim()) return false;

    const query = cemeterySearchQuery.toLowerCase();
    const matchesType =
      formData.serviceType === "burial"
        ? cemetery.type === "cemetery" ||
          cemetery.type === "both"
        : cemetery.type === "crematorium" ||
          cemetery.type === "both";

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

  // app/components/StepperWorkflow.tsx

// Отправка заказа на /api/orders
const handleConfirmAndBook = async () => {
  try {
    // Собираем все нужные данные из formData
    const payload = {
      customer: {
        // почта, куда уйдёт письмо
        email: formData.userEmail,
        // отдельного поля для имени заказчика у тебя нет — оставляем пусто
        // name и phone можно добавить позже, если появятся в форме
      },
      deceased: {
        // ФИО усопшего
        name: formData.fullName || undefined,
        // Доп. поля
        birthDate: formData.birthDate || undefined,
        deathDate: formData.deathDate || undefined,
        relationship: formData.relationship || undefined,
        // deathCertificate сейчас нигде не используем, можно будет
        // добавить в письмо отдельной строкой по желанию
      },
      ceremony: {
        // Тип церемонии (religious / secular и т.п.)
        type: formData.ceremonyType || undefined,
        // Формат / пакет (basic / premium и т.п.)
        order: formData.ceremonyOrder || undefined,
        // Даты/время/место у тебя пока нет в formData — поэтому в письме "не указана"
        // как только заведёшь, сюда же добавишь:
        // date: formData.ceremonyDate || undefined,
        // time: formData.ceremonyTime || undefined,
        // place: formData.ceremonyPlace || undefined,
      },
      // Особые пожелания
      notes: formData.specialRequests || undefined,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Order API error", data);
      alert("Ошибка при оформлении бронирования. Попробуйте ещё раз.");
      return;
    }

    alert(
      "Бронирование оформлено. Договор и детали заказа отправлены на указанную почту."
    );
  } catch (error) {
    console.error("Network error", error);
    alert("Произошла сетевая ошибка. Попробуйте ещё раз.");
  }
};

  const renderStepContent = () => {
    switch (currentStep) {
    case 0:
        // Шаг 1: Формат
        return (
          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    handleInputChange("serviceType", "burial")
                  }
                  className={cn(
                    "px-5 py-2 border-2 rounded-full text-left transition-all backdrop-blur-sm",
                    formData.serviceType === "burial"
                      ? "border-gray-900 bg-white/60"
                      : "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40",
                  )}
                >
                  <div className="text-sm text-gray-900">
                    Захоронение
                  </div>
                  <div className="text-xs text-gray-600">
                    Традиционное погребение
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleInputChange(
                      "serviceType",
                      "cremation",
                    )
                  }
                  className={cn(
                    "px-5 py-2 border-2 rounded-full text-left transition-all backdrop-blur-sm",
                    formData.serviceType === "cremation"
                      ? "border-gray-900 bg-white/60"
                      : "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40",
                  )}
                >
                  <div className="text-sm text-gray-900">
                    Кремация
                  </div>
                  <div className="text-xs text-gray-600">
                    С выдачей урны
                  </div>
                </button>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-gray-900">
                    Зал прощания
                  </Label>
                  <p className="text-xs text-gray-700 mt-1">
                    Церемония прощания с родными
                  </p>
                </div>
                <Switch
                  checked={formData.hasHall}
                  onCheckedChange={(checked) =>
                    handleInputChange("hasHall", checked)
                  }
                />
              </div>

              {!formData.hasHall && (
                <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-400/30 rounded-full p-4">
                  <p className="text-sm text-amber-900">
                    Без зала — технологическая кремация без
                    церемонии. Можно попрощаться в зале морга.{" "}
                    <br />
                    <span className="text-green-800">
                      Экономия: −8 000 ₽ • −60 мин
                    </span>
                  </p>
                </div>
              )}
            </div>

            {formData.hasHall && (
              <>
                <div>
                  <Label className="mb-3 block">
                    Тип церемонии
                  </Label>
                  <RadioGroup
                    value={formData.ceremonyType}
                    onValueChange={(value) =>
                      handleInputChange("ceremonyType", value)
                    }
                    className="space-y-3"
                  >
                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "civil" &&
                          "border-black bg-gray-50",
                      )}
                    >
                      <RadioGroupItem
                        value="civil"
                        id="civil"
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="civil"
                          className="cursor-pointer"
                        >
                          Светская
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Без религиозных обрядов
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "religious" &&
                          "border-black bg-gray-50",
                      )}
                    >
                      <RadioGroupItem
                        value="religious"
                        id="religious"
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="religious"
                          className="cursor-pointer"
                        >
                          Религиозная
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          С участием священнослужителя
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        +15 000 ₽
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "combined" &&
                          "border-black bg-gray-50",
                      )}
                    >
                      <RadioGroupItem
                        value="combined"
                        id="combined"
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="combined"
                          className="cursor-pointer"
                        >
                          Комбинированная
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Светская + религиозная часть
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        +20 000 ₽
                      </span>
                    </div>
                  </RadioGroup>
                </div>

                {formData.ceremonyType === "combined" && (
                  <div>
                    <Label htmlFor="ceremonyOrder">
                      Последовательность
                    </Label>
                    <Select
                      value={formData.ceremonyOrder}
                      onValueChange={(value) =>
                        handleInputChange(
                          "ceremonyOrder",
                          value,
                        )
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Выберите порядок" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil-first">
                          Светская → Религиозная
                        </SelectItem>
                        <SelectItem value="religious-first">
                          Религиозная → Светская
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div>
                  <Label className="mb-3 block">
                    Длительность
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Рекомендуем 60–90 мин
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[30, 60, 90].map((duration) => (
                      <button
                        key={duration}
                        onClick={() =>
                          handleInputChange(
                            "hallDuration",
                            duration,
                          )
                        }
                        className={cn(
                          "p-4 border-2 rounded-full text-center transition-all",
                          formData.hallDuration === duration
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <div className="text-sm mb-1">
                          {duration} мин
                        </div>
                        <div className="text-xs text-gray-500">
                          {PRICES.hallDuration[
                            duration as keyof typeof PRICES.hallDuration
                          ].toLocaleString("ru-RU")}{" "}
                          ₽
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 1:
        // Шаг 2: Логистика
        return (
          <div className="space-y-6">
            <div className="relative">
              <Label htmlFor="cemetery" className="mb-3 block">
                {formData.serviceType === "burial"
                  ? "Выбор кладбища"
                  : "Выбор крематория"}
              </Label>

              <div className="relative">
                <Input
                  id="cemetery"
                  value={
                    cemeterySearchQuery || formData.cemetery
                  }
                  onChange={(e) => {
                    setCemeterySearchQuery(e.target.value);
                    setShowCemeteryResults(true);
                    if (!e.target.value) {
                      handleInputChange("cemetery", "");
                    }
                  }}
                  onFocus={() => {
                    if (cemeterySearchQuery) {
                      setShowCemeteryResults(true);
                    }
                  }}
                  placeholder="Начните вводить название или адрес..."
                  className="mt-2 rounded-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Единый поиск по Москве и области •{" "}
                  {
                    [
                      ...MOSCOW_CEMETERIES,
                      ...MO_CEMETERIES,
                    ].filter((c) =>
                      formData.serviceType === "burial"
                        ? (c.type === "cemetery" ||
                            c.type === "both") &&
                          c.working
                        : c.type === "crematorium" ||
                          c.type === "both",
                    ).length
                  }{" "}
                  активных{" "}
                  {formData.serviceType === "burial"
                    ? "кладбищ"
                    : "крематориев"}
                </p>

                {/* Результаты поиска */}
                {showCemeteryResults &&
                  filteredCemeteries.length > 0 && (
                    <div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {filteredCemeteries.map((cemetery) => (
                          <button
                            key={cemetery.id}
                            onClick={() =>
                              handleCemeterySelect(cemetery)
                            }
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-gray-900">
                                    {cemetery.name}
                                  </span>
                                  {!cemetery.working && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Закрыто
                                    </Badge>
                                  )}
                                  {cemetery.hasColumbarium &&
                                    formData.serviceType ===
                                      "cremation" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Колумбарий
                                      </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {cemetery.address}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {cemetery.district}
                                  </Badge>
                                  {cemetery.working &&
                                    cemetery.categories
                                      .standard && (
                                      <span className="text-xs text-gray-600">
                                        от{" "}
                                        {cemetery.categories.standard.toLocaleString(
                                          "ru-RU",
                                        )}{" "}
                                        ₽
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
                {showCemeteryResults &&
                  cemeterySearchQuery &&
                  filteredCemeteries.length === 0 && (
                    <div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
                      <p className="text-sm text-gray-500 text-center">
                        Ничего не найдено. Попробуйте изменить
                        запрос.
                      </p>
                    </div>
                  )}
              </div>

              {/* Категория места (если кладбище выбрано) */}
              {formData.cemetery && (
                <div className="mt-4 space-y-3">
                  <Label className="text-gray-900">
                    Категория места
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        "standard",
                        "comfort",
                        "premium",
                      ] as const
                    ).map((category) => {
                      const allCemeteries = [
                        ...MOSCOW_CEMETERIES,
                        ...MO_CEMETERIES,
                      ];
                      const selectedCemetery =
                        allCemeteries.find(
                          (c) => c.name === formData.cemetery,
                        );
                      const price =
                        selectedCemetery?.categories[category];

                      if (!price) return null;

                      return (
                        <button
                          key={category}
                          onClick={() =>
                            setSelectedCemeteryCategory(
                              category,
                            )
                          }
                          className={cn(
                            "p-4 border-2 rounded-full text-center transition-all",
                            selectedCemeteryCategory ===
                              category
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          <div className="text-sm mb-1">
                            {category === "standard"
                              ? "Стандарт"
                              : category === "comfort"
                                ? "Комфорт"
                                : "Премиум"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {price.toLocaleString("ru-RU")} ₽
                          </div>
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
                            pickupDateTime.time
                            ? "text-gray-900"
                            : "text-gray-600",
                        )}
                      >
                        {pickupDateTime.date &&
                        pickupDateTime.time
                          ? `${pickupDateTime.date.toLocaleDateString("ru-RU")} в ${pickupDateTime.time}`
                          : "Выбрать время забора"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Выбор даты и времени забора
                      </DialogTitle>
                      <DialogDescription>
                        Выберите дату и время, когда требуется
                        забрать тело
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-2">
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
                        <Calendar
                          mode="single"
                          selected={pickupDateTime.date}
                          onSelect={(date) =>
                            setPickupDateTime({
                              ...pickupDateTime,
                              date,
                            })
                          }
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                          classNames={{
                            months:
                              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4 w-full",
                            caption:
                              "flex justify-between pt-1 relative items-center px-2",
                            caption_label:
                              "text-lg font-semibold text-gray-900 block", // Force show
                            nav: "space-x-1 flex items-center",
                            nav_button:
                              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                            nav_button_previous: "",
                            nav_button_next: "",
                            table:
                              "w-full border-collapse space-y-1",
                            head_row:
                              "flex justify-between mb-2",
                            head_cell:
                              "text-gray-400 rounded-md w-10 font-normal text-[0.9rem]",
                            row: "flex w-full mt-2 justify-between",
                            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-900/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-gray-100 transition-colors text-gray-900",
                            day_selected:
                              "!bg-gray-900 !text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white shadow-md",
                            day_today:
                              "bg-gray-50 text-gray-900 font-semibold border border-gray-200",
                            day_outside:
                              "text-gray-300 opacity-50",
                            day_disabled:
                              "text-gray-300 opacity-50",
                            day_hidden: "invisible",
                          }}
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
                            {pickupDateTime.time && (
                              <Badge
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900"
                              >
                                {pickupDateTime.time}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {Array.from(
                              { length: 24 },
                              (_, i) => {
                                const hour = i
                                  .toString()
                                  .padStart(2, "0");
                                const times = [
                                  `${hour}:00`,
                                  `${hour}:30`,
                                ];
                                return times.map((time) => (
                                  <button
                                    key={time}
                                    onClick={() =>
                                      setPickupDateTime({
                                        ...pickupDateTime,
                                        time,
                                      })
                                    }
                                    className={cn(
                                      "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                      pickupDateTime.time ===
                                        time
                                        ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:scale-105",
                                    )}
                                  >
                                    {time}
                                  </button>
                                ));
                              },
                            ).flat()}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() =>
                          setShowPickupDialog(false)
                        }
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
                        disabled={
                          !pickupDateTime.date ||
                          !pickupDateTime.time
                        }
                      >
                        Подтвердить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Зал прощания / Церковь */}
              <div className="space-y-2">
                <Label className="text-gray-900">
                  Зал прощания / Церковь
                </Label>
                <Dialog
                  open={showFarewellDialog}
                  onOpenChange={setShowFarewellDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                    >
                      <Church className="h-4 w-4 mr-3 text-gray-500" />
                      <span
                        className={cn(
                          farewellDateTime.date &&
                            farewellDateTime.time
                            ? "text-gray-900"
                            : "text-gray-600",
                        )}
                      >
                        {farewellDateTime.date &&
                        farewellDateTime.time
                          ? `${farewellDateTime.date.toLocaleDateString("ru-RU")} в ${farewellDateTime.time}`
                          : "Выбрать время прощания"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Выбор даты и времени прощания
                      </DialogTitle>
                      <DialogDescription>
                        Выберите дату и время прощания в зале
                        или церкви
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-2">
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
                        <Calendar
                          mode="single"
                          selected={farewellDateTime.date}
                          onSelect={(date) =>
                            setFarewellDateTime({
                              ...farewellDateTime,
                              date,
                            })
                          }
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                         
                          classNames={{
                            months:
                              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4 w-full",
                            caption:
                              "flex justify-between pt-1 relative items-center px-2",
                            caption_label:
                              "text-lg font-semibold text-gray-900 block",
                            nav: "space-x-1 flex items-center",
                            nav_button:
                              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                            nav_button_previous: "",
                            nav_button_next: "",
                            table:
                              "w-full border-collapse space-y-1",
                            head_row:
                              "flex justify-between mb-2",
                            head_cell:
                              "text-gray-400 rounded-md w-10 font-normal text-[0.9rem]",
                            row: "flex w-full mt-2 justify-between",
                            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-900/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-gray-100 transition-colors text-gray-900",
                            day_selected:
                              "!bg-gray-900 !text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white shadow-md",
                            day_today:
                              "bg-gray-50 text-gray-900 font-semibold border border-gray-200",
                            day_outside:
                              "text-gray-300 opacity-50",
                            day_disabled:
                              "text-gray-300 opacity-50",
                            day_hidden: "invisible",
                          }}
                        />
                      </div>
                      {farewellDateTime.date && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                Время прощания
                              </span>
                              <span className="text-xs text-gray-500">
                                Выберите удобный слот
                              </span>
                            </div>
                            {farewellDateTime.time && (
                              <Badge
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900"
                              >
                                {farewellDateTime.time}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {Array.from(
                              { length: 24 },
                              (_, i) => {
                                const hour = i
                                  .toString()
                                  .padStart(2, "0");
                                const times = [
                                  `${hour}:00`,
                                  `${hour}:30`,
                                ];
                                return times.map((time) => (
                                  <button
                                    key={time}
                                    onClick={() =>
                                      setFarewellDateTime({
                                        ...farewellDateTime,
                                        time,
                                      })
                                    }
                                    className={cn(
                                      "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                      farewellDateTime.time ===
                                        time
                                        ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:scale-105",
                                    )}
                                  >
                                    {time}
                                  </button>
                                ));
                              },
                            ).flat()}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() =>
                          setShowFarewellDialog(false)
                        }
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
                        disabled={
                          !farewellDateTime.date ||
                          !farewellDateTime.time
                        }
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
                <Label className="text-gray-900">
                  Время захоронения / кремации
                </Label>
                <Dialog
                  open={showBurialDialog}
                  onOpenChange={setShowBurialDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                    >
                      <Clock className="h-4 w-4 mr-3 text-gray-500" />
                      <span
                        className={cn(
                          burialDateTime.date &&
                            burialDateTime.time
                            ? "text-gray-900"
                            : "text-gray-600",
                        )}
                      >
                        {burialDateTime.date &&
                        burialDateTime.time
                          ? `${burialDateTime.date.toLocaleDateString("ru-RU")} в ${burialDateTime.time}`
                          : "Выбрать время"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                   <DialogHeader>
           <DialogTitle>
             Выбор даты и времени{" "}
                  {formData.serviceType === "cremation" ? "кремации" : "захоронения"}
                </DialogTitle>

                    <DialogDescription>
                Укажите удобные дату и время церемонии.
                       </DialogDescription>
                     </DialogHeader>
                    <div className="flex flex-col gap-6 py-2">
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
                        <Calendar
                          mode="single"
                          selected={burialDateTime.date}
                          onSelect={(date) =>
                            setBurialDateTime({
                              ...burialDateTime,
                              date,
                            })
                          }
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                        
                          classNames={{
                            months:
                              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4 w-full",
                            caption:
                              "flex justify-between pt-1 relative items-center px-2",
                            caption_label:
                              "text-lg font-semibold text-gray-900 block",
                            nav: "space-x-1 flex items-center",
                            nav_button:
                              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                            nav_button_previous: "",
                            nav_button_next: "",
                            table:
                              "w-full border-collapse space-y-1",
                            head_row:
                              "flex justify-between mb-2",
                            head_cell:
                              "text-gray-400 rounded-md w-10 font-normal text-[0.9rem]",
                            row: "flex w-full mt-2 justify-between",
                            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-900/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-gray-100 transition-colors text-gray-900",
                            day_selected:
                              "!bg-gray-900 !text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white shadow-md",
                            day_today:
                              "bg-gray-50 text-gray-900 font-semibold border border-gray-200",
                            day_outside:
                              "text-gray-300 opacity-50",
                            day_disabled:
                              "text-gray-300 opacity-50",
                            day_hidden: "invisible",
                          }}
                        />
                      </div>
                      {burialDateTime.date && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                Время{" "}
                                {formData.serviceType ===
                                "cremation"
                                  ? "кремации"
                                  : "захоронения"}
                              </span>
                              <span className="text-xs text-gray-500">
                                Выберите удобный слот
                              </span>
                            </div>
                            {burialDateTime.time && (
                              <Badge
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900"
                              >
                                {burialDateTime.time}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {Array.from(
                              { length: 24 },
                              (_, i) => {
                                const hour = i
                                  .toString()
                                  .padStart(2, "0");
                                const times = [
                                  `${hour}:00`,
                                  `${hour}:30`,
                                ];
                                return times.map((time) => (
                                  <button
                                    key={time}
                                    onClick={() =>
                                      setBurialDateTime({
                                        ...burialDateTime,
                                        time,
                                      })
                                    }
                                    className={cn(
                                      "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                      burialDateTime.time ===
                                        time
                                        ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:scale-105",
                                    )}
                                  >
                                    {time}
                                  </button>
                                ));
                              },
                            ).flat()}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() =>
                          setShowBurialDialog(false)
                        }
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
                        disabled={
                          !burialDateTime.date ||
                          !burialDateTime.time
                        }
                      >
                        Подтвердить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <p className="text-xs text-gray-500 pt-2">
                Время и слоты бронируются онлайн. Подтверждение
                придёт в интерфейс и на почту.
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Нужен катафалк?</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Специализированный транспорт
                  </p>
                </div>
                <Switch
                  checked={formData.needsHearse}
                  onCheckedChange={(checked) => {
                    if (!checked && formData.needsHearse) {
                      setShowHearseDialog(true);
                    } else {
                      handleInputChange("needsHearse", checked);
                    }
                  }}
                />
              </div>

              <AlertDialog
                open={showHearseDialog}
                onOpenChange={setShowHearseDialog}
              >
                <AlertDialogContent className="bg-white rounded-[30px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Вы уверены, что хотите отключить катафалк?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3 pt-2">
                        <p>
                          Катафалк — это специализированный
                          транспорт для перевозки усопшего. Без
                          него вам придётся организовывать
                          транспортировку самостоятельно.
                        </p>
                        <div className="bg-amber-50 p-4 rounded-none border border-amber-200">
                          <p className="text-sm text-amber-900">
                            <span className="font-medium">
                              ⚠️ Внимание:
                            </span>{" "}
                            При отключении катафалка вам
                            потребуется найти альтернативный
                            способ транспортировки.
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Оставить катафалк
                    </AlertDialogCancel>
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
                      variant={
                        formData.hearseRoute.morgue
                          ? "default"
                          : "outline"
                      }
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

                    <Button
                      type="button"
                      variant={
                        formData.hearseRoute.hall
                          ? "default"
                          : "outline"
                      }
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
                      variant={
                        formData.hearseRoute.church
                          ? "default"
                          : "outline"
                      }
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

                    <Button
                      type="button"
                      variant={
                        formData.hearseRoute.cemetery
                          ? "default"
                          : "outline"
                      }
                      className="rounded-full px-6 h-10 transition-all duration-200 w-full md:w-auto"
                      onClick={() =>
                        handleInputChange("hearseRoute", {
                          ...formData.hearseRoute,
                          cemetery:
                            !formData.hearseRoute.cemetery,
                        })
                      }
                    >
                      {formData.serviceType === "burial"
                        ? "Кладбище"
                        : "Крематорий"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Транспорт для близких?</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Автобус для родных и гостей
                  </p>
                </div>
                <Switch
                  checked={formData.needsFamilyTransport}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      "needsFamilyTransport",
                      checked,
                    )
                  }
                />
              </div>

              {formData.needsFamilyTransport && (
                <div className="mt-3">
                  <Label className="mb-3 block text-sm">
                    Количество мест:
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15].map((seats) => (
                      <button
                        key={seats}
                        onClick={() =>
                          handleInputChange(
                            "familyTransportSeats",
                            seats,
                          )
                        }
                        className={cn(
                          "p-3 border-2 rounded-full text-center transition-all",
                          formData.familyTransportSeats ===
                            seats
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <div className="text-sm mb-1">
                          {seats} мест
                        </div>
                        <div className="text-xs text-gray-500">
                          {PRICES.familyTransport[
                            seats as keyof typeof PRICES.familyTransport
                          ].toLocaleString("ru-RU")}{" "}
                          ₽
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Нужны носильщики (4 чел.)</Label>
                <p className="text-xs text-gray-500 mt-1">
                  {PRICES.pallbearers.toLocaleString("ru-RU")} ₽
                </p>
              </div>
              <Switch
                checked={formData.needsPallbearers}
                onCheckedChange={(checked) =>
                  handleInputChange("needsPallbearers", checked)
                }
              />
            </div>
          </div>
        );

      case 2:
        // Шаг 3: Атрибутика
        return (
          <div className="space-y-6">
             {/* 3D-сцена зала и гроба */}
      <CoffinConfigurator3D />
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-300/30 rounded-full p-4">
              <p className="text-sm text-blue-900">
                Настройте комплектацию с помощью
                3D-визуализатора
              </p>
            </div>

            {/* 3D Конфигуратор гроба и венка */}
            <UnifiedCoffinConfigurator
              onConfirm={(data) => {
                console.log("Coffin configuration:", data);
                // Сохраняем конфигурацию в formData
                handleInputChange("coffinConfig", data);
              }}
            />

            <Separator />

            <div>
              <Label htmlFor="specialRequests">
                Особые пожелания
              </Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    handleInputChange(
                      "specialRequests",
                      e.target.value,
                    );
                  }
                }}
                placeholder="Музыка, фотография усопшего, лента с надписью..."
                className="mt-2"
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.specialRequests.length}/300 символов
              </p>
            </div>
          </div>
        );

      case 3:
        // Шаг 4: Документы
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="fullName">ФИО усопшего *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  handleInputChange("fullName", e.target.value)
                }
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
                    type={
                      formData.birthDate === "—"
                        ? "text"
                        : "date"
                    }
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange(
                        "birthDate",
                        e.target.value,
                      )
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
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
                    type={
                      formData.deathDate === "—"
                        ? "text"
                        : "date"
                    }
                    value={formData.deathDate}
                    onChange={(e) =>
                      handleInputChange(
                        "deathDate",
                        e.target.value,
                      )
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkipField("deathDate")}
                    className="whitespace-nowrap rounded-[30px]"
                  >
                    Не знаю
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="deathCertificate">
                № свидетельства о смерти
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="deathCertificate"
                  value={formData.deathCertificate}
                  onChange={(e) =>
                    handleInputChange(
                      "deathCertificate",
                      e.target.value,
                    )
                  }
                  placeholder="AA-000 № 000000"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSkipField("deathCertificate")
                  }
                  className="whitespace-nowrap"
                >
                  Позже
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Можно ввести позже — бронирование не задержит
              </p>
            </div>

            <div>
              <Label htmlFor="relationship">
                Степень родства *
              </Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) =>
                  handleInputChange("relationship", value)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Выберите степень родства" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">
                    Супруг(а)
                  </SelectItem>
                  <SelectItem value="parent">
                    Родитель
                  </SelectItem>
                  <SelectItem value="child">
                    Сын/дочь
                  </SelectItem>
                  <SelectItem value="relative">
                    Дальний родственник
                  </SelectItem>
                  <SelectItem value="representative">
                    Доверенное лицо
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              id="data-consent"
              className={cn(
                "flex items-start gap-2 md:gap-3 p-2 md:p-4 rounded-2xl md:rounded-full transition-all",
                showConsentError
                  ? "bg-gray-50 border-2 border-gray-300"
                  : "bg-gray-50 border border-gray-200",
              )}
            >
              <Checkbox
                id="privacy"
                checked={formData.dataConsent}
                onCheckedChange={(checked) => {
                  handleInputChange(
                    "dataConsent",
                    checked === true,
                  );
                  setShowConsentError(false);
                }}
                className="mt-0.5 md:mt-1 flex-shrink-0"
              />
              <Label
                htmlFor="privacy"
                className="text-xs md:text-sm cursor-pointer leading-snug"
              >
                Я согласен на обработку персональных данных и
                подтверждаю, что ознакомлен с{" "}
                <a href="#" className="underline text-blue-600">
                  политикой конфиденциальности
                </a>
              </Label>
            </div>

            {showConsentError && (
              <div className="bg-gray-50 border border-gray-300 rounded-full p-4">
                <p className="text-sm text-gray-600">
                  ⚠️ Для продолжения необходимо дать согласие на
                  обработку персональных данных
                </p>
              </div>
            )}
          </div>
        );

    case 4:
      return (
        <div className="space-y-6">
          {/* Статус: все данные заполнены */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
            <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm">
              ✓
            </div>
            <div>
              <p className="text-emerald-900 font-medium">
                Все данные заполнены
              </p>
              <p className="text-sm text-emerald-800">
                Пожалуйста, проверьте информацию перед бронированием.
              </p>
            </div>
          </div>

          {/* Блоки с краткой сводкой по шагам */}
          <div className="space-y-4">
            {/* Формат церемонии */}
            <section className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5">
              <h3 className="text-base font-semibold text-white mb-3">
                Формат церемонии
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/80">
                <div>
                  <dt className="text-white/50">Тип церемонии</dt>
                  <dd>{formData.ceremonyType || "Не указано"}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Формат / пакет</dt>
                  <dd>{formData.ceremonyOrder || "Не указан"}</dd>
                </div>
              </dl>
            </section>

            {/* Данные усопшего */}
            <section className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5">
              <h3 className="text-base font-semibold text-white mb-3">
                Данные усопшего
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/80">
                <div>
                  <dt className="text-white/50">Имя</dt>
                  <dd>{formData.fullName || "Не указано"}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Дата рождения</dt>
                  <dd>{formData.birthDate || "Не указана"}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Дата смерти</dt>
                  <dd>{formData.deathDate || "Не указана"}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Степень родства</dt>
                  <dd>{formData.relationship || "Не указана"}</dd>
                </div>
              </dl>
            </section>

            {/* Документы / особые пожелания */}
            <section className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5">
              <h3 className="text-base font-semibold text-white mb-3">
                Документы и пожелания
              </h3>
              <dl className="space-y-2 text-sm text-white/80">
                <div>
                  <dt className="text-white/50">Документ</dt>
                  <dd>{formData.deathCertificate || "Не указан"}</dd>
                </div>
                <div>
                  <dt className="text-white/50">Дополнительные пожелания</dt>
                  <dd>{formData.specialRequests || "Не указаны"}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Итоговая смета + «платёжный» блок */}
          <section className="bg-slate-950 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-200">Итоговая смета</p>
                <p className="text-xs text-slate-400">
                  Сумма может скорректироваться после уточнения деталей.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Итого
                </p>
                <p className="text-2xl font-semibold text-white">
                  {typeof totalPrice === "number"
                    ? `${totalPrice.toLocaleString("ru-RU")} ₽`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Кнопки договор / поделиться */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
              >
                Договор
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
              >
                Поделиться
              </button>
            </div>

            {/* Условный платежный блок */}
            <div className="mt-2 space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
                <p className="text-sm font-medium text-white mb-1">
                  Email для получения информации
                </p>
                <input
                  id="userEmail"
                  type="email"
                  className="w-full rounded-xl bg-white text-gray-900 placeholder:text-gray-500 px-4 py-3 text-sm outline-none"
                  placeholder="example@email.com"
                  value={formData.userEmail ?? ""}
                  onChange={(e) =>
                    onUpdateFormData("userEmail", e.target.value)
                  }
                />
                <p className="text-xs text-slate-300">
                  На этот адрес придёт подтверждение заказа, детали церемонии и
                  все необходимые документы.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="font-medium mb-1">СБП</p>
                  <p className="text-slate-400">
                    Система быстрых платежей (оплата по счёту после подтверждения).
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="font-medium mb-1">Рассрочка</p>
                  <p className="text-slate-400">
                    Возможна рассрочка после согласования с оператором.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Данные карты и оплаты в демо-версии не обрабатываются. Это
                предварительное бронирование.
              </p>
            </div>

            <div className="pt-2">
              <Button
                className="w-full h-14 text-lg bg-white text-gray-900 hover:bg-gray-100"
                onClick={handleConfirmAndBook}
              >
                Подтвердить и забронировать
              </Button>
            </div>
          </section>
        </div>
      );

// ===== основной return компонента =====
  return (
    <div
      ref={containerRef}
      className="max-w-5xl mx-auto -translate-y-12 pb-32"
    >
      <Card className="bg-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/30 relative">
        <CardHeader className="pb-4 pt-8 px-6 sm:px-8">
          {/* Кнопка личного кабинета */}
          <div className="absolute -top-5 right-8 z-50">
            <button
              onClick={() => setIsAccountOpen(true)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 text-white hover:scale-105 active:scale-95"
              aria-label="Личный кабинет"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-2" style={{ fontWeight: 40 }}>
            <CardTitle
              className="text-2xl sm:text-3xl mb-2 text-white text-[30px] not-italic no-underline font-sans"
              style={{ fontWeight: 40 }}
            >
              Пошаговый мастер
            </CardTitle>
            <CardDescription className="text-base text-white/90 text-[14px] font-sans">
              Организуйте церемонию прощания за 5 простых шагов
            </CardDescription>
          </div>

          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8">
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
        </CardContent>
      </Card>

      {/* Модалка личного кабинета */}
      <PersonalAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </div>
  );
}