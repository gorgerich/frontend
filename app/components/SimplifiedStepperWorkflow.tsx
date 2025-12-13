import { useState, useEffect, useRef } from "react";
import { PaymentStep } from "./PaymentStep";

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
  CheckCircle2,
  Check,
  ArrowLeft,
  Clock,
  Church,
} from "lucide-react";
import { cn } from "./ui/utils";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ImageWithFallback from "./figma/ImageWithFallback";
import {
  RubleSign,
  Download,
  Share2,
  Search,
} from "./Icons";

// Упрощенные шаги для готовых решений
const simplifiedSteps = [
  {
    id: "attributes",
    label: "Атрибутика",
    description: "Персонализация",
  },
  {
    id: "format",
    label: "Формат",
    description: "Тип церемонии",
  },
  {
    id: "logistics",
    label: "Логистика",
    description: "Место и время",
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
    name: "Белый",
    description: "Классический белый цвет",
    price: 0,
  },
  {
    id: "silk-cream",
    name: "Кремовый",
    description: "Теплый кремовый оттенок",
    price: 0,
  },
  {
    id: "velvet-burgundy",
    name: "Бордовый",
    description: "Глубокий бордовый цвет",
    price: 0,
  },
];

interface SimplifiedStepperWorkflowProps {
  selectedPackage: {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  };
  onBack: () => void;
  formData: {
    serviceType: string;
    hasHall: boolean;
    ceremonyType: string;
    confession: string;
    ceremonyOrder: string;
    cemetery: string;
    hearseRoute: {
      morgue: boolean;
      hall: boolean;
      church: boolean;
      cemetery: boolean;
    };
    needsPallbearers: boolean;
    specialRequests: string;
    fullName: string;
    birthDate: string;
    deathDate: string;
    deathCertificate: string;
    relationship: string;
    dataConsent: boolean;
    userEmail: string;
    liningColor?: string;
  };
  onUpdateFormData: (field: string, value: any) => void;
}

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

  // Состояния для поиска кладбищ
  const [cemeterySearchQuery, setCemeterySearchQuery] = useState("");
  const [showCemeteryResults, setShowCemeteryResults] = useState(false);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] = useState<
    "standard" | "comfort" | "premium"
  >("standard");

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
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [showFarewellDialog, setShowFarewellDialog] = useState(false);
  const [showBurialDialog, setShowBurialDialog] = useState(false);

  // Состояния для оплаты
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    holder: "",
  });

  // Инициализация внутренней отделки по умолчанию
  useEffect(() => {
    if (!formData.liningColor) {
      onUpdateFormData("liningColor", "satin-white");
    }
    const timer = setTimeout(() => {
      isInitialMountRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Автоматический скролл вверх при смене шага
  useEffect(() => {
    if (
      !isInitialMountRef.current &&
      previousStepRef.current !== currentStep
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    previousStepRef.current = currentStep;
  }, [currentStep]);

  const handleInputChange = (field: string, value: any) => {
    onUpdateFormData(field, value);
  };

  const handleSkipField = (field: string) => {
    const currentValue = formData[field as keyof typeof formData];
    onUpdateFormData(field, currentValue === "—" ? "" : "—");
  };

  const handleNext = () => {
    // Проверка согласия на шаге документов
    if (currentStep === 3 && !formData.dataConsent) {
      setShowConsentError(true);
      setTimeout(() => {
        const consentElement = document.getElementById("data-consent");
        if (consentElement) {
          consentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
      return;
    }

    if (currentStep < simplifiedSteps.length - 1 && !isTransitioning) {
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

  // Расчёт стоимости для упрощенного мастера
  const calculateTotal = () => {
    return selectedPackage.price;
  };

  const handleStepClick = (stepIndex: number) => {
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
        ? cemetery.type === "cemetery" || cemetery.type === "both"
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Шаг 1: Атрибутика (упрощенная - только цвет отделки)
        return (
          <div className="space-y-6">
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-300/30 rounded-full p-4">
              <p className="text-sm text-blue-900">
                Пакет "{selectedPackage.name}" уже включает базовую комплектацию. Здесь вы можете выбрать цвет внутренней отделки.
              </p>
            </div>

            <div>
              <Label className="mb-3 block">
                Цвет внутренней отделки
              </Label>
              <RadioGroup
                value={formData.liningColor || "satin-white"}
                onValueChange={(value) =>
                  handleInputChange("liningColor", value)
                }
                className="space-y-3"
              >
                {liningOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-start space-x-3 p-4 border rounded-full transition-all",
                      formData.liningColor === option.id &&
                        "border-black bg-gray-50"
                    )}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.id}
                        className="cursor-pointer"
                      >
                        {option.name}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

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
                      e.target.value
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

      case 1:
        // Шаг 2: Формат (без поля длительности)
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
                      : "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40"
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
                    handleInputChange("serviceType", "cremation")
                  }
                  className={cn(
                    "px-5 py-2 border-2 rounded-full text-left transition-all backdrop-blur-sm",
                    formData.serviceType === "cremation"
                      ? "border-gray-900 bg-white/60"
                      : "border-gray-300/50 bg-white/30 hover:border-gray-400/60 hover:bg-white/40"
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
                    Без зала — технологическая кремация без церемонии. Можно попрощаться в зале морга.
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
                          "border-black bg-gray-50"
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
                          "border-black bg-gray-50"
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
                    </div>
                    <div
                      className={cn(
                        "flex items-start space-x-3 p-4 border rounded-full transition-all",
                        formData.ceremonyType === "combined" &&
                          "border-black bg-gray-50"
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
                        handleInputChange("ceremonyOrder", value)
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
              </>
            )}
          </div>
        );

      case 2:
        // Шаг 3: Логистика (с полным функционалом из основного мастера)
        return (
          <div className="space-y-6">
            {/* Информационный баннер */}
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-300/30 rounded-full p-4">
              <p className="text-sm text-blue-900">
                ✓ Катафалк и носильщики (4 чел.) уже включены в ваш пакет "{selectedPackage.name}"
              </p>
            </div>

            <div className="relative">
              <Label htmlFor="cemetery" className="mb-3 block">
                {formData.serviceType === "burial"
                  ? "Выбор кладбища"
                  : "Выбор крематория"}
              </Label>

              <div className="relative">
                <Input
                  id="cemetery"
                  value={cemeterySearchQuery || formData.cemetery}
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
                    [...MOSCOW_CEMETERIES, ...MO_CEMETERIES].filter((c) =>
                      formData.serviceType === "burial"
                        ? (c.type === "cemetery" || c.type === "both") && c.working
                        : c.type === "crematorium" || c.type === "both"
                    ).length
                  }{" "}
                  активных{" "}
                  {formData.serviceType === "burial" ? "кладбищ" : "крематориев"}
                </p>

                {/* Результаты поиска */}
                {showCemeteryResults && filteredCemeteries.length > 0 && (
                  <div className="cemetery-results absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {filteredCemeteries.map((cemetery) => (
                        <button
                          key={cemetery.id}
                          onClick={() => handleCemeterySelect(cemetery)}
                          className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-900">
                                  {cemetery.name}
                                </span>
                                {!cemetery.working && (
                                  <Badge variant="secondary" className="text-xs">
                                    Закрыто
                                  </Badge>
                                )}
                                {cemetery.hasColumbarium &&
                                  formData.serviceType === "cremation" && (
                                    <Badge variant="outline" className="text-xs">
                                      Колумбарий
                                    </Badge>
                                  )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {cemetery.address}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {cemetery.district}
                                </Badge>
                                {cemetery.working && cemetery.categories.standard && (
                                  <span className="text-xs text-gray-600">
                                    от{" "}
                                    {cemetery.categories.standard.toLocaleString("ru-RU")}{" "}
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
                        Ничего не найдено. Попробуйте изменить запрос.
                      </p>
                    </div>
                  )}
              </div>

              {/* Категория места (если кладбище выбрано) */}
              {formData.cemetery && (
                <div className="mt-4 space-y-3">
                  <Label className="text-gray-900">Категория места</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["standard", "comfort", "premium"] as const).map((category) => {
                      const allCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
                      const selectedCemetery = allCemeteries.find(
                        (c) => c.name === formData.cemetery
                      );
                      const price = selectedCemetery?.categories[category];

                      if (!price) return null;

                      return (
                        <button
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
                <Label className="text-gray-900">Время забора тела</Label>
                <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                    >
                      <Clock className="h-4 w-4 mr-3 text-gray-500" />
                      <span
                        className={cn(
                          pickupDateTime.date && pickupDateTime.time
                            ? "text-gray-900"
                            : "text-gray-600"
                        )}
                      >
                        {pickupDateTime.date && pickupDateTime.time
                          ? `${pickupDateTime.date.toLocaleDateString("ru-RU")} в ${pickupDateTime.time}`
                          : "Выбрать время забора"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Выбор даты и времени забора</DialogTitle>
                      <DialogDescription>
                        Выберите дату и время, когда требуется забрать тело
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-2 overflow-y-auto pr-2">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <Calendar
                          mode="single"
                          selected={pickupDateTime.date}
                          onSelect={(date) =>
                            setPickupDateTime({ ...pickupDateTime, date })
                          }
                          disabled={(date) => {
                            const today = new Date();
                            const compareDate = new Date(date);
                            today.setHours(0, 0, 0, 0);
                            compareDate.setHours(0, 0, 0, 0);
                            return compareDate < today;
                          }}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
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

                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
                              const times = [`${hour}:00`, `${hour}:30`];
                              return times.map((time) => (
                                <button
                                  key={time}
                                  onClick={() =>
                                    setPickupDateTime({ ...pickupDateTime, time })
                                  }
                                  className={cn(
                                    "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                    pickupDateTime.time === time
                                      ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                                  )}
                                >
                                  {time}
                                </button>
                              ));
                            }).flat()}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => setShowPickupDialog(false)}
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
                        disabled={!pickupDateTime.date || !pickupDateTime.time}
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
                    >
                      <Church className="h-4 w-4 mr-3 text-gray-500" />
                      <span
                        className={cn(
                          farewellDateTime.date && farewellDateTime.time
                            ? "text-gray-900"
                            : "text-gray-600"
                        )}
                      >
                        {farewellDateTime.date && farewellDateTime.time
                          ? `${farewellDateTime.date.toLocaleDateString("ru-RU")} в ${farewellDateTime.time}`
                          : "Выбрать время прощания"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Выбор даты и времени прощания</DialogTitle>
                      <DialogDescription>
                        Выберите дату и время прощания в зале или церкви
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-2">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <Calendar
                          mode="single"
                          selected={farewellDateTime.date}
                          onSelect={(date) =>
                            setFarewellDateTime({ ...farewellDateTime, date })
                          }
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
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

                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
                              const times = [`${hour}:00`, `${hour}:30`];
                              return times.map((time) => (
                                <button
                                  key={time}
                                  onClick={() =>
                                    setFarewellDateTime({ ...farewellDateTime, time })
                                  }
                                  className={cn(
                                    "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                    farewellDateTime.time === time
                                      ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                                  )}
                                >
                                  {time}
                                </button>
                              ));
                            }).flat()}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => setShowFarewellDialog(false)}
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
                        disabled={!farewellDateTime.date || !farewellDateTime.time}
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
                    >
                      <Clock className="h-4 w-4 mr-3 text-gray-500" />
                      <span
                        className={cn(
                          burialDateTime.date && burialDateTime.time
                            ? "text-gray-900"
                            : "text-gray-600"
                        )}
                      >
                        {burialDateTime.date && burialDateTime.time
                          ? `${burialDateTime.date.toLocaleDateString("ru-RU")} в ${burialDateTime.time}`
                          : "Выбрать время"}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Выбор даты и времени{" "}
                        {formData.serviceType === "cremation"
                          ? "кремации"
                          : "захоронения"}
                      </DialogTitle>
                      <DialogDescription>
                        Выберите дату и время{" "}
                        {formData.serviceType === "cremation"
                          ? "кремации"
                          : "захоронения"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-2">
                      <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                        <Calendar
                          mode="single"
                          selected={burialDateTime.date}
                          onSelect={(date) =>
                            setBurialDateTime({ ...burialDateTime, date })
                          }
                          disabled={(date) => date < new Date()}
                          className="rounded-xl border-none mx-auto bg-transparent shadow-none w-full p-0"
                        />
                      </div>
                      {burialDateTime.date && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                Время{" "}
                                {formData.serviceType === "cremation"
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

                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
                              const times = [`${hour}:00`, `${hour}:30`];
                              return times.map((time) => (
                                <button
                                  key={time}
                                  onClick={() =>
                                    setBurialDateTime({ ...burialDateTime, time })
                                  }
                                  className={cn(
                                    "px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                                    burialDateTime.time === time
                                      ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                                  )}
                                >
                                  {time}
                                </button>
                              ));
                            }).flat()}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => setShowBurialDialog(false)}
                        className="w-full h-12 rounded-full text-base bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98]"
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

            {/* Маршрут катафалка */}
            <div>
              <Label className="text-sm mb-3 block">Маршрут катафалка:</Label>
              <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2 pl-4 border-l-2 border-gray-200">
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
                      formData.birthDate === "—" ? "text" : "date"
                    }
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
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
                      formData.deathDate === "—" ? "text" : "date"
                    }
                    value={formData.deathDate}
                    onChange={(e) =>
                      handleInputChange("deathDate", e.target.value)
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
                      e.target.value
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
                  className="whitespace-nowrap rounded-[30px]"
                >
                  Не знаю
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="relationship">
                Ваше отношение к усопшему
              </Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) =>
                  handleInputChange("relationship", value)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Выберите из списка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Супру(а)</SelectItem>
                  <SelectItem value="child">Сын / Дочь</SelectItem>
                  <SelectItem value="parent">Родитель</SelectItem>
                  <SelectItem value="sibling">
                    Брат / Сестра
                  </SelectItem>
                  <SelectItem value="relative">
                    Другой родственник
                  </SelectItem>
                  <SelectItem value="friend">Друг</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
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
                checked={formData.dataConsent}
                onCheckedChange={(checked) =>
                  handleInputChange("dataConsent", checked)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="consent"
                  className="cursor-pointer text-sm"
                >
                  Я согласен(а) на обработку персональных данных и
                  подтверждаю, что ознакомлен(а) с политикой
                  конфиденциальности
                </Label>
                {showConsentError && (
                  <p className="text-xs text-red-600 mt-2">
                    Необходимо дать согласие для продолжения
                  </p>
                )}
              </div>
            </div>
          </div>
        );

                  case 4: {
        // Шаг 5: Подтверждение и оплата (копия по стилю из StepperWorkflow)
        const selectedLining = liningOptions.find(
          (option) => option.id === (formData.liningColor || "satin-white")
        );

        const formatDateTime = (dt: { date?: Date; time?: string }) =>
          dt.date && dt.time
            ? `${dt.date.toLocaleDateString("ru-RU")} в ${dt.time}`
            : "—";

        const routeParts: string[] = [];
        if (formData.hearseRoute?.morgue) routeParts.push("Морг");
        if (formData.hearseRoute?.hall) routeParts.push("Зал прощания");
        if (formData.hearseRoute?.church) routeParts.push("Церковь");
        if (formData.hearseRoute?.cemetery) {
          routeParts.push(
            formData.serviceType === "burial" ? "Кладбище" : "Крематорий"
          );
        }
        const routeText = routeParts.length ? routeParts.join(" → ") : "Не выбран";

        return (
          <div className="space-y-6">
            {/* Статус */}
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-green-900 mb-2">Все данные заполнены</h3>
                <p className="text-sm text-green-700">
                  Пожалуйста, проверьте информацию перед бронированием.
                </p>
              </div>
            </div>

            {/* Пакет */}
            <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
              <h4 className="text-sm text-gray-500 mb-3">Выбранный пакет</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{selectedPackage.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedPackage.description}
                    </p>
                  </div>
                  <span className="text-gray-900 ml-4 shrink-0">
                    {selectedPackage.price.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Формат */}
            <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
              <h4 className="text-sm text-gray-500 mb-3">Формат церемонии</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Формат:</span>
                  <span className="text-gray-900">
                    {formData.serviceType === "burial" ? "Захоронение" : "Кремация"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Зал прощания:</span>
                  <span className="text-gray-900">{formData.hasHall ? "Да" : "Нет"}</span>
                </div>
                {formData.hasHall && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Тип церемонии:</span>
                    <span className="text-gray-900">
                      {formData.ceremonyType === "civil" && "Светская"}
                      {formData.ceremonyType === "religious" && "Религиозная"}
                      {formData.ceremonyType === "combined" && "Комбинированная"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Логистика */}
            <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
              <h4 className="text-sm text-gray-500 mb-3">Логистика</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {formData.serviceType === "burial" ? "Кладбище:" : "Крематорий:"}
                  </span>
                  <span className="text-gray-900">{formData.cemetery || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Маршрут катафалка:</span>
                  <span className="text-gray-900 text-right">{routeText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Забор тела:</span>
                  <span className="text-gray-900">{formatDateTime(pickupDateTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Прощание:</span>
                  <span className="text-gray-900">{formatDateTime(farewellDateTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {formData.serviceType === "burial" ? "Захоронение:" : "Кремация:"}
                  </span>
                  <span className="text-gray-900">{formatDateTime(burialDateTime)}</span>
                </div>
              </div>
            </div>

            {/* Персонализация */}
            <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
              <h4 className="text-sm text-gray-500 mb-3">Персонализация</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Цвет отделки:</span>
                  <span className="text-gray-900">{selectedLining?.name || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Особые пожелания:</span>
                  <span className="text-gray-900 whitespace-pre-line">
                    {formData.specialRequests || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Усопший */}
            <div className="bg-white border border-gray-200 rounded-[30px] p-4 shadow-sm">
              <h4 className="text-sm text-gray-500 mb-3">Усопший</h4>
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

            {/* Итоговая смета + Способ оплаты */}
            <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-lg space-y-6">
              {/* Итоговая смета */}
              <div>
                <h4 className="mb-4">Итоговая смета</h4>

                <div className="space-y-3">
                  <div className="flex justify-between pt-2">
                    <span className="text-lg">Итого:</span>
                    <span className="text-2xl">
                      {calculateTotal().toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
                    type="button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Договор
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
                    type="button"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Поделиться
                  </Button>
                </div>
              </div>

              <div className="border-t border-white/20" />

              {/* Способ оплаты */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <RubleSign className="h-6 w-6 text-white" />
                  <h4 className="text-lg text-white">Способ оплаты</h4>
                </div>

                {paymentMethod !== "card" && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className="w-full p-4 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-left mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center" />
                      <span className="text-sm text-white">Банковская карта</span>
                    </div>
                    <p className="text-xs text-white/70 ml-7">Visa, Mastercard, МИР</p>
                  </button>
                )}

                {paymentMethod === "card" && (
                  <div className="mt-4">
                    {/* Две колонки: слева карта, справа CVC + Email */}
                    <div className="grid gap-6 md:grid-cols-2 items-start">
                      {/* Левая колонка — карта */}
                      <div className="relative mx-auto w-full max-w-md">
                        <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl bg-white border border-gray-200">
                          {/* Чип */}
                          <div className="absolute top-6 left-6 w-12 h-10 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 backdrop-blur" />

                          {/* Логотип платёжной системы */}
                          <div className="absolute top-6 right-6 flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur border border-white/60" />
                            <div className="w-8 h-8 rounded-full bg-white/60 backdrop-blur border border-white/60 -ml-4" />
                          </div>

                          {/* Номер карты */}
                          <div className="absolute top-16 left-6 right-6">
                            <input
                              type="text"
                              className="w-full bg-transparent border-none text-gray-900 text-xl tracking-[0.2em] placeholder:text-gray-500 focus:outline-none font-mono"
                              placeholder="0000 0000 0000 0000"
                              value={cardData.number}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\s/g, "")
                                  .replace(/(\d{4})/g, "$1 ")
                                  .trim();
                                setCardData((prev) => ({ ...prev, number: value }));
                              }}
                              maxLength={19}
                            />
                          </div>

                          {/* Имя держателя и срок действия */}
                          <div className="absolute bottom-10 left-6 right-6 flex justify-between items-end">
                            <div className="flex-1 min-w-0 mr-4">
                              <input
                                type="text"
                                className="w-full bg-transparent border-none text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none uppercase"
                                placeholder="IVAN IVANOV"
                                value={cardData.holder}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z\s]/g, "");
                                  setCardData((prev) => ({ ...prev, holder: value }));
                                }}
                              />
                              <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">
                                Держатель карты
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <input
                                type="text"
                                className="w-16 bg-transparent border-none text-gray-900 text-sm text-right placeholder:text-gray-500 focus:outline-none font-mono"
                                placeholder="MM/ГГ"
                                value={cardData.expiry}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, "");
                                  if (value.length >= 2) {
                                    value = value.slice(0, 2) + "/" + value.slice(2, 4);
                                  }
                                  setCardData((prev) => ({ ...prev, expiry: value }));
                                }}
                                maxLength={5}
                              />
                              <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide text-right">
                                Действительна
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Правая колонка — CVC + Email */}
                      <div className="space-y-4">
                        {/* CVC */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label htmlFor="cardCvc" className="text-gray-900 text-xs mb-2 block">
                                CVC/CVV код
                              </Label>
                              <Input
                                id="cardCvc"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-center text-lg tracking-widest font-mono"
                                placeholder="•••"
                                type="password"
                                value={cardData.cvc}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                                  setCardData((prev) => ({ ...prev, cvc: value }));
                                }}
                                maxLength={3}
                              />
                            </div>
                            <div className="text-xs text-gray-600 max-w-[120px]">
                              3 цифры на обратной стороне карты
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <Label htmlFor="userEmail" className="text-gray-900 text-sm mb-2 block">
                            Email для получения информации
                          </Label>
                          <Input
                            id="userEmail"
                            type="email"
                            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            placeholder="example@email.com"
                            value={formData.userEmail}
                            onChange={(e) => onUpdateFormData("userEmail", e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            На этот адрес придёт подтверждение заказа, детали церемонии и все необходимые документы.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Другие способы оплаты */}
                    <div className="pt-4 border-t border-white/20 mt-6">
                      <p className="text-xs text-white/60 mb-3">Или выберите другой способ:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("sbp")}
                          className="p-4 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center" />
                            <span className="text-sm text-white">СБП</span>
                          </div>
                          <p className="text-xs text-white/70 ml-7">Система быстрых платежей</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("installment")}
                          className="p-4 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center" />
                            <span className="text-sm text-white">Рассрочка</span>
                          </div>
                          <p className="text-xs text-white/70 ml-7">0% на 6 месяцев</p>
                        </button>
                      </div>
                    </div>

                    {/* Защищённый платёж */}
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm text-white">Защищённый платёж</p>
                          <p className="text-xs text-white/70">
                            Данные передаются по защищённому протоколу и не хранятся на наших серверах.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full h-14 text-lg bg-gray-900 hover:bg-gray-800 mt-6"
              type="button"
              onClick={async () => {
                try {
                  if (!formData.userEmail) {
                    alert("Укажите email для получения договора и деталей заказа.");
                    return;
                  }

                  const payload = {
                    customer: {
                      email: formData.userEmail,
                      name: formData.fullName || undefined,
                    },
                  };

                  const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    console.error("Order error:", data);
                    alert(
                      data?.error ||
                        "Не удалось оформить бронирование. Попробуйте ещё раз или свяжитесь с поддержкой."
                    );
                    return;
                  }

                  const data = await res.json();
                  console.log("Order created:", data);

                  alert("Бронирование оформлено! Детали и договор отправлены на указанную электронную почту.");
                } catch (e) {
                  console.error("Order request failed:", e);
                  alert("Не удалось оформить бронирование. Попробуйте ещё раз или свяжитесь с поддержкой.");
                }
              }}
            >
              Подтвердить и забронировать
            </Button>
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
          {/* Кнопка "Назад к пакетам" */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="self-start text-gray-900 hover:bg-gray-100 gap-2 rounded-full -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к пакетам
          </Button>

          <div className="text-center">
            <CardTitle className="text-2xl sm:text-3xl mb-2">
              Настройка пакета "{selectedPackage.name}"
            </CardTitle>
            <CardDescription className="text-base">
              Персонализируйте выбранное решение под ваши потребности
            </CardDescription>
          </div>

          <Stepper
            steps={simplifiedSteps}
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
            >
              Далее
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}