import React from "react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { calcTariffTotal, formatCurrency, formatDelta, TariffDraftConfig, BASE_TARIFF_TOTAL, TARIFF_PRICING } from "./calculationUtils";

const SUPPORT_TELEGRAM_URL = "https://t.me/tihiydominfo";

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: readonly string[]; // ✅ важно: readonly
  popular?: boolean;
}

interface PackagesSelectionProps {
  selectedPackageId: string;
  onSelectPackage: (pkg: Package) => void;
  packages?: readonly Package[]; // ✅ тоже readonly (можно и Package[])
  paymentSlot?: (override?: {
    totalRub?: number;
    services?: { name: string; price: number; description?: string; quantity?: number }[];
    breakdown?: Array<{ category?: string; name?: string; title?: string; description?: string; price?: number | string; quantity?: number; qty?: number }>;
    formData?: Record<string, unknown>;
    orderFlow?: string;
    package?: { id?: string; name?: string; price?: number | string; features?: string[] };
  }) => React.ReactNode;
  onAllInclusiveOpen?: (open: boolean) => void;
  viewMode?: "self" | "solutions";
  embedded?: boolean;
}

type AddedItemKey =
  | "hearseTier"
  | "pallbearers"
  | "transport"
  | "hall"
  | "ceremonyType"
  | "churchService"
  | "panikhida"
  | "memorialMeal"
  | "host"
  | "coordinationTier";

type OptionRowOption = {
  value: string;
  label: string;
  subtitle?: string;
  delta?: number;
  showZero?: boolean;
};

const CONFIG_STEPS = [
  { id: "format", label: "Формат", hint: "Формат, зал и тип церемонии" },
  { id: "transport", label: "Транспорт", hint: "Катафалк и транспорт для близких" },
  { id: "support", label: "Помощь на месте", hint: "Носильщики и уровень сопровождения" },
  { id: "rites", label: "Обряды", hint: "Отпевание и панихида" },
  { id: "extras", label: "Дополнительно", hint: "Поминальный обед и ведущий" },
] as const;

export function PackagesSelection({
  selectedPackageId,
  onSelectPackage,
  packages,
  paymentSlot,
  embedded = false,
}: PackagesSelectionProps) {
  const [activePanel, setActivePanel] = React.useState<"base" | "custom">("base");
  const [showInlinePayment, setShowInlinePayment] = React.useState(false);
  const [deliveryChannel, setDeliveryChannel] = React.useState<"telegram" | "email" | null>(null);
  const [configStep, setConfigStep] = React.useState(0);
  const [configDirection, setConfigDirection] = React.useState<"forward" | "back">("forward");
  const [draftConfig, setDraftConfig] = React.useState<TariffDraftConfig>({
    format: "burial",
    transport: "none",
    pallbearers: "none",
    hall: "none",
    hearseTier: "standard",
    coordinationTier: "base",
    ceremonyType: "secular",
    churchService: "none",
    panikhida: "none",
    memorialMeal: "none",
    host: "no",
  });

  const BASE_MINIMUM: Package = {
    id: "base-minimum",
    name: "Тариф «Традиционный»",
    price: BASE_TARIFF_TOTAL,
    description:
      "Ниже — только самые необходимые услуги для проведения достойного прощания. Вы сможете добавить нужный транспорт, расширенную атрибутику и услуги по кнопке ниже.",
    features: [],
    popular: false,
  };
  const baseLineItems: {
    key: string;
    label: string;
    price: number;
    subItems?: string[];
  }[] = [
    { key: "sanitary", label: "Санитарно-косметическая подготовка в морге", price: 18000 },
    {
      key: "attributes",
      label: "Атрибутика",
      price: 20000,
      subItems: [
        "Драпированный гроб (цвет на выбор)",
        "Постель в гроб",
        "Подушка шелковая",
        "Покрывало шелковое",
        "Тапочки похоронные",
        "Доставка в морг",
      ],
    },
    { key: "hearse", label: "Катафалк", price: 13500 },
    { key: "digging", label: "Подготовка места захоронения", price: 24700 },
    {
      key: "coord",
      label: "Координатор базовый",
      price: 10400,
      subItems: ["Оформление и сопровождение заказа"],
    },
  ];
  const isSelected = selectedPackageId === BASE_MINIMUM.id;
  const pricing = calcTariffTotal(draftConfig);
  const paymentTotal =
    activePanel === "custom" ? pricing.total : BASE_TARIFF_TOTAL;
  const hasCremationPackages = (packages ?? []).some((pkg) => pkg.id.startsWith("cremation"));
  const allInclusivePackages = hasCremationPackages
    ? [...(packages ?? [])]
    : (packages ?? []).filter((pkg) => !pkg.id.startsWith("cremation"));
  const readyPackages = allInclusivePackages;
  const showTraditionalLegacyCard = !hasCremationPackages;
  const solutionCardContent: Record<
    string,
    {
      title: string;
      priceLabel: string;
      description: string;
      quick: {
        mode: string;
        family: string;
        bestFor: string;
        difference: string;
      };
      coordinatorHelp: string[];
      included: string[];
      popular?: boolean;
    }
  > = {
    "base-minimum": {
      title: "Традиционный формат",
      priceLabel: "86 600 ₽",
      description:
        "Базовый набор для достойного прощания без лишних услуг. Подходит, когда нужно спокойное и понятное решение с фиксированной стоимостью.",
      quick: {
        mode: "Базовый состав",
        family: "Семья участвует сама",
        bestFor: "Когда нужен минимальный понятный набор без расширенного сопровождения.",
        difference: "Фиксируем основу: подготовка, атрибутика, катафалк, место захоронения и базовый координатор.",
      },
      coordinatorHelp: [
        "Помогаем оформить заказ и зафиксировать базовую смету без скрытых доплат.",
        "Подсказываем следующий шаг и сопровождаем подтверждение заказа.",
      ],
      included: [
        "Санитарно-косметическая подготовка в морге.",
        "Комплект базовой атрибутики и доставка в морг.",
        "Катафалк и подготовка места захоронения.",
        "Базовое сопровождение координатора.",
      ],
    },
    basic: {
      title: "Традиционный формат с дистанционной поддержкой",
      priceLabel: "204 900 ₽",
      description:
        "Маршрут, транспорт и документы под контролем координатора. Вам не нужно самостоятельно искать подрядчиков.",
      quick: {
        mode: "Дистанционный контроль",
        family: "Семья на ключевых точках",
        bestFor: "Когда вы готовы быть на месте, но хотите убрать хаос с маршрутом, временем и подрядчиками.",
        difference: "Координатор держит процесс по телефону: маршрут, документы, подрядчики, контроль времени.",
      },
      coordinatorHelp: [
        "Дистанционный контроль логистики и времени.",
        "Взаимодействие со всеми инстанциями по телефону (морги, кладбища/крематории).",
        "Подробная маршрутизация: где, во сколько и какие документы вам нужно получить.",
      ],
      included: [
        "Базовая санитарно-косметическая подготовка.",
        "Драпированный гроб (цвет и текстура ткани на ваш выбор).",
        "Классический транспорт (катафалк) до места прощания.",
        "Традиционное цветочное оформление (искусственная флористика).",
      ],
    },
    standard: {
      title: "Расширенный формат с личным присутствием",
      priceLabel: "401 100 ₽",
      description:
        "Координатор физически с вами на каждом этапе. Защита от навязанных услуг и организационного хаоса.",
      quick: {
        mode: "Личное присутствие",
        family: "Меньше решений на месте",
        bestFor: "Когда нужен человек рядом в день церемонии, чтобы семья не управляла процессом сама.",
        difference: "Координатор приезжает и ведет день прощания: морг, транспорт, носильщики, тайминг.",
      },
      coordinatorHelp: [
        "Личный выезд в морг: ограждение от давления сотрудников, контроль подготовки.",
        "Сопровождение семьи в день прощания от начала до конца.",
        "Управление транспортом, грузчиками и таймингом церемонии на месте.",
      ],
      included: [
        "Расширенная санитарно-косметическая подготовка.",
        "Гроб из массива дерева (сосна, дуб — классическая полировка).",
        "Транспорт комфорт-класса для близких (до 10 человек).",
        "Улучшенное оформление (премиальная искусственная или базовая живая флористика).",
      ],
      popular: true,
    },
    premium: {
      title: "Премиальный формат и полное делегирование",
      priceLabel: "609 400 ₽",
      description:
        "Максимальное снятие нагрузки и полное делегирование. Вы передаете задачи по доверенности и фокусируетесь на семье.",
      quick: {
        mode: "Полное делегирование",
        family: "Минимум участия",
        bestFor: "Когда нет сил или возможности заниматься организацией и нужно передать процесс старшему координатору.",
        difference: "Старший координатор берет нестандартные задачи, документы, гостей, обед и связь 24/7.",
      },
      coordinatorHelp: [
        "Оформление без вашего участия: сбор всех справок (ЗАГС, морг) по доверенности.",
        "Организация поминального обеда и навигация гостей.",
        "Выделенный старший координатор, который доступен 24/7 для решения любых нестандартных запросов.",
      ],
      included: [
        "Сложная косметическая подготовка.",
        "Элитный гроб (двухкрышечный, из ценных пород дерева).",
        "Премиальный VIP-катафалк и микроавтобусы высшего класса для семьи.",
        "Авторские композиции из свежих живых цветов.",
        "Расширенное время аренды зала для приватного прощания.",
      ],
    },
    "cremation-standard": {
      title: "Кремация с дистанционной поддержкой",
      priceLabel: "200 000 ₽",
      description:
        "Координатор помогает с документами, крематорием и временем. Семья участвует в ключевых подтверждениях.",
      quick: {
        mode: "Кремация, контроль",
        family: "Семья подтверждает этапы",
        bestFor: "Когда нужен понятный маршрут кремации без лишнего сопровождения на месте.",
        difference: "Фокус на документах, бронировании, транспортировке, кремации и выдаче урны.",
      },
      coordinatorHelp: [
        "Подсказываем порядок документов и времени.",
        "Помогаем с бронированием крематория и колумбария.",
        "Контролируем базовую логистику и связь с подрядчиками.",
      ],
      included: [
        "Оформление документов.",
        "Бронирование места в колумбарии.",
        "Хранение и базовая подготовка тела.",
        "Гроб-контейнер для кремации.",
        "Транспортировка до крематория.",
        "Кремация и стандартная урна.",
      ],
    },
    "cremation-comfort": {
      title: "Кремация с расширенным сопровождением",
      priceLabel: "400 000 ₽",
      description:
        "Координатор ведет процесс, зал прощания и поминальный обед. Подходит, если нужно больше присутствия и меньше самостоятельных задач.",
      quick: {
        mode: "Кремация, сопровождение",
        family: "Меньше организационных задач",
        bestFor: "Когда важно провести прощание в зале и не собирать все элементы отдельно.",
        difference: "Добавлены зал прощания, расширенная подготовка, урна керамическая и поминальный обед.",
      },
      coordinatorHelp: [
        "Собираем кремацию, зал и обед в один согласованный план.",
        "Контролируем время и переходы между этапами.",
        "Помогаем семье не держать в голове подрядчиков и детали.",
      ],
      included: [
        "Оформление документов.",
        "Бронирование места в колумбарии.",
        "Хранение и подготовка тела.",
        "Гроб для прощания и гроб-контейнер.",
        "Транспортировка до крематория.",
        "Кремация, керамическая урна, зал прощания на 2 часа.",
        "Поминальный обед до 20 человек.",
      ],
      popular: true,
    },
    "cremation-premium": {
      title: "Кремация под полное делегирование",
      priceLabel: "600 000 ₽",
      description:
        "Индивидуальный координатор берет на себя документы, крематорий, прощание, гостей и расширенные элементы церемонии.",
      quick: {
        mode: "Кремация, под ключ",
        family: "Минимум участия",
        bestFor: "Когда нужно максимально снять организационную нагрузку с семьи.",
        difference: "Добавлены премиальные материалы, длинный зал, обед до 40 человек и индивидуальный координатор.",
      },
      coordinatorHelp: [
        "Ведем процесс от документов до дня прощания.",
        "Согласуем зал, гостей, обед и премиальные элементы.",
        "Держим связь и закрываем нестандартные вопросы без передачи их семье.",
      ],
      included: [
        "Оформление документов.",
        "Бронирование места в колумбарии премиум.",
        "Хранение и подготовка тела.",
        "Элитный гроб для прощания и контейнер.",
        "Транспортировка покойного.",
        "Кремация и премиальная урна.",
        "Композиция из живых цветов, зал на 4 часа, обед до 40 человек.",
      ],
    },
  };
  const resetByAddedItemKey: Record<AddedItemKey, Partial<TariffDraftConfig>> = {
    hearseTier: { hearseTier: "standard" },
    pallbearers: { pallbearers: "none" },
    transport: { transport: "none" },
    hall: { hall: "none" },
    ceremonyType: { ceremonyType: "secular" },
    churchService: { churchService: "none" },
    panikhida: { panikhida: "none" },
    memorialMeal: { memorialMeal: "none" },
    host: { host: "no" },
    coordinationTier: { coordinationTier: "base" },
  };
  const removeAddedItem = (key: AddedItemKey) => {
    setDraftConfig((prev) => ({
      ...prev,
      ...resetByAddedItemKey[key],
    }));
  };
  const addedItems = [
    draftConfig.hearseTier !== "standard" && {
      key: "hearseTier",
      label: "Катафалк",
      detail: draftConfig.hearseTier === "comfort" ? "Комфорт" : "Премиум",
      delta: TARIFF_PRICING.hearseTier[draftConfig.hearseTier],
    },
    draftConfig.pallbearers !== "none" && {
      key: "pallbearers",
      label: "Носильщики",
      detail:
        draftConfig.pallbearers === "standard"
          ? "Стандарт, 4 человека"
          : draftConfig.pallbearers === "comfort"
            ? "Комфорт, 4 человека"
            : "Премиум",
      delta: TARIFF_PRICING.pallbearers[draftConfig.pallbearers],
    },
    draftConfig.transport !== "none" && {
      key: "transport",
      label: "Транспорт для близких",
      detail:
        draftConfig.transport === "standard"
          ? "Стандарт (12–19 человек)"
          : draftConfig.transport === "comfort"
            ? "Комфорт (12–19 человек)"
            : "Премиум (до 40 человек)",
      delta: TARIFF_PRICING.transport[draftConfig.transport],
    },
    draftConfig.hall !== "none" && {
      key: "hall",
      label: "Зал прощания",
      detail: "1 час",
      delta: TARIFF_PRICING.hall[draftConfig.hall],
    },
    draftConfig.ceremonyType !== "secular" && {
      key: "ceremonyType",
      label: "Тип церемонии",
      detail: draftConfig.ceremonyType === "religious" ? "Религиозная" : "Комбинированная",
      delta: TARIFF_PRICING.ceremony[draftConfig.ceremonyType],
    },
    draftConfig.churchService !== "none" && {
      key: "churchService",
      label: "Отпевание",
      detail:
        draftConfig.churchService === "morgue"
          ? "Минимальный обряд в морге"
          : draftConfig.churchService === "parish"
            ? "Отпевание в обычном храме"
            : "Кафедральный собор/монастырь",
      delta: TARIFF_PRICING.churchService[draftConfig.churchService],
    },
    draftConfig.panikhida !== "none" && {
      key: "panikhida",
      label: "Панихида",
      detail:
        draftConfig.panikhida === "standard"
          ? "Стандарт"
          : draftConfig.panikhida === "comfort"
            ? "Комфорт"
            : "Премиум",
      delta: TARIFF_PRICING.panikhida[draftConfig.panikhida],
    },
    draftConfig.memorialMeal !== "none" && {
      key: "memorialMeal",
      label: "Поминальный обед",
      detail:
        draftConfig.memorialMeal === "standard"
          ? "Стандарт (за человека)"
          : draftConfig.memorialMeal === "comfort"
            ? "Комфорт (за человека)"
            : "Премиум (за человека)",
      delta: TARIFF_PRICING.memorialMeal[draftConfig.memorialMeal],
    },
    draftConfig.host === "yes" && {
      key: "host",
      label: "Ведущий",
      detail: "Организация траурной церемонии",
      delta: TARIFF_PRICING.host.yes,
    },
    draftConfig.coordinationTier !== "base" && {
      key: "coordinationTier",
      label: "Координатор",
      detail:
        draftConfig.coordinationTier === "comfort"
          ? "Сопровождение церемонии"
          : "Персональный координатор церемонии",
      delta: TARIFF_PRICING.coordinationTier[draftConfig.coordinationTier],
    },
  ].filter(Boolean) as { key: AddedItemKey; label: string; detail?: string; delta: number }[];
  const isCustomizingPlan = activePanel === "custom" && addedItems.length > 0;
  const baseServices = baseLineItems.map((line) => ({
    name: line.label,
    price: line.price,
  }));
  const addedServices = addedItems.map((item) => ({
    name: item.detail ? `${item.label} (${item.detail})` : item.label,
    price: item.delta,
  }));
  const paymentServices =
    activePanel === "custom" ? [...baseServices, ...addedServices] : baseServices;
  const paymentFormData = {
    serviceType: draftConfig.format,
  };
  const addedTotal = Math.max(0, pricing.total - BASE_TARIFF_TOTAL);
  const planTitle =
    activePanel === "custom" ? `${BASE_MINIMUM.name}, изменённый состав` : BASE_MINIMUM.name;
  const configuratorRef = React.useRef<HTMLDivElement | null>(null);
  const configTabsRef = React.useRef<HTMLDivElement | null>(null);
  const savePopoverRef = React.useRef<HTMLDivElement | null>(null);
  const pluralizeServices = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "услуга";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "услуги";
    return "услуг";
  };
  const addedItemsSummary =
    addedItems.length === 0
      ? "Базовый состав без доплат"
      : `Добавлено: ${addedItems.length} ${pluralizeServices(addedItems.length)}`;
  React.useEffect(() => {
    const tabs = configTabsRef.current;
    const activeTab = tabs?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!tabs || !activeTab) return;
    tabs.scrollTo({
      left: activeTab.offsetLeft - (tabs.clientWidth - activeTab.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [configStep]);
  React.useEffect(() => {
    if (!showInlinePayment) return;

    const closeSavePopover = () => {
      setShowInlinePayment(false);
      setDeliveryChannel(null);
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (savePopoverRef.current?.contains(target)) return;
      closeSavePopover();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeSavePopover();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showInlinePayment]);
  const goToConfigStep = (nextStep: number) => {
    const boundedStep = Math.max(0, Math.min(CONFIG_STEPS.length - 1, nextStep));
    if (boundedStep === configStep) return;
    setConfigDirection(boundedStep > configStep ? "forward" : "back");
    setConfigStep(boundedStep);
    requestAnimationFrame(() => {
      configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const openConfigurator = () => {
    setConfigStep(0);
    setConfigDirection("forward");
    setActivePanel("custom");
    setShowInlinePayment(false);
    setDeliveryChannel(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };
  const currentPlanTelegramPrefill = [
    "Здравствуйте! Хочу сохранить план прощания.",
    `Тариф: ${planTitle}`,
    `Стоимость: ${formatCurrency(paymentTotal)}`,
    "",
    "Что входит:",
    ...paymentServices.map((item) => `- ${item.name}: ${formatCurrency(item.price)}`),
  ].join("\n");
  const currentPlanTelegramUrl = (() => {
    const username = SUPPORT_TELEGRAM_URL.split("t.me/")[1]?.split(/[/?#]/)[0];
    if (!username) return SUPPORT_TELEGRAM_URL;
    return `https://t.me/${username}?text=${encodeURIComponent(currentPlanTelegramPrefill)}`;
  })();
  const buildTelegramPlanUrl = (plan: {
    title: string;
    priceLabel: string;
    description: string;
    included: string[];
  }) => {
    const username = SUPPORT_TELEGRAM_URL.split("t.me/")[1]?.split(/[/?#]/)[0];
    const message = [
      "Здравствуйте! Хочу сохранить план прощания.",
      `Тариф: ${plan.title}`,
      `Стоимость: ${plan.priceLabel}`,
      "",
      `Описание: ${plan.description}`,
      "",
      "Что входит в стоимость:",
      ...plan.included.map((item) => `- ${item}`),
    ].join("\n");
    if (!username) return SUPPORT_TELEGRAM_URL;
    return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
  };
  const highlightsByPackageId: Record<string, string[]> = {
    basic: ["Дистанционный контроль"],
    standard: ["Личный выезд", "Сопровождение семьи", "на месте"],
    premium: ["без вашего участия", "Выделенный старший координатор"],
    "cremation-standard": ["документов", "крематорием"],
    "cremation-comfort": ["зал и обед", "один согласованный план"],
    "cremation-premium": ["от документов до дня прощания", "нестандартные вопросы"],
  };
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const renderHighlightedLine = (line: string, phrases: string[]) => {
    if (phrases.length === 0) return line;
    const splitRegex = new RegExp(`(${phrases.map(escapeRegExp).join("|")})`, "gi");
    const strongPhrases = new Set(phrases.map((phrase) => phrase.toLowerCase()));
    return line.split(splitRegex).map((part, index) => {
      const shouldHighlight = strongPhrases.has(part.toLowerCase());
      if (!shouldHighlight) return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      return (
        <span key={`${part}-${index}`} className="font-semibold text-gray-900">
          {part}
        </span>
      );
    });
  };
  const getSolutionCardContent = (pkg: Package) =>
    solutionCardContent[pkg.id] ?? {
      title: pkg.name,
      priceLabel: formatCurrency(pkg.price),
      description: pkg.description,
      quick: {
        mode: "Готовый план",
        family: "Сравните состав",
        bestFor: pkg.description,
        difference: pkg.features[0] ?? "Состав и стоимость зафиксированы в карточке.",
      },
      coordinatorHelp: [],
      included: pkg.features.map((feature) => `${feature}`),
    };
  const readyComparisonCards = readyPackages.map((pkg) => ({
    pkg,
    card: getSolutionCardContent(pkg),
  }));

  return (
    <div className={cn("w-full", embedded ? "pt-0" : "pt-2 md:pt-3")}>
      <div className={cn("mx-auto w-full max-w-6xl", embedded ? "px-0" : "px-2")}>
        <div className="space-y-4">
          {showTraditionalLegacyCard && (
            <div className="w-full">
              <div
                data-package-card
                className={cn(
                  "group relative mx-auto flex w-full max-w-5xl flex-col",
                  embedded
                    ? "gap-6 rounded-none border-0 bg-transparent p-0 shadow-none"
                    : "gap-8 rounded-[28px] bg-white p-8 transition-[box-shadow,transform] duration-300 ease-out",
                  !embedded &&
                    (isSelected
                      ? "z-10 scale-[1.01] shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_20px_50px_rgba(15,23,42,0.13)]"
                      : "shadow-[0_0_0_1px_rgba(0,0,0,0.055),0_10px_28px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_38px_rgba(15,23,42,0.10)]")
                )}
              >
                <div className="space-y-6">
                  <div className="divide-y divide-zinc-200/75 overflow-visible rounded-[18px] bg-[#fafaf9] px-4 text-[15px] leading-relaxed text-gray-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.045)] sm:px-5">
                    <div className="py-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3
                          className={cn(
                            "font-micro break-words font-[700] text-gray-700",
                            "text-[14px] uppercase tracking-[0.1em] text-gray-600",
                          )}
                        >
                          {BASE_MINIMUM.name}
                        </h3>
                        {activePanel === "custom" ? (
                          <span className="inline-flex min-h-7 items-center rounded-full bg-white px-2.5 text-[12px] font-semibold text-gray-600 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.07)]">
                            Настройка
                          </span>
                        ) : null}
                        <span className="group relative inline-flex shrink-0 items-center">
                          <span
                            tabIndex={0}
                            aria-label="Описание тарифа"
                            aria-describedby="base-tariff-info"
                            className="inline-flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-white text-[12px] font-semibold leading-none text-gray-500 shadow-[0_0_0_1px_rgba(0,0,0,0.16)] transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-[#f4f4f2] hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
                          >
                            i
                          </span>
                          <span
                            id="base-tariff-info"
                            role="tooltip"
                            className="pointer-events-none invisible absolute right-0 top-[calc(100%+8px)] z-30 w-[min(74vw,360px)] translate-y-1 rounded-[14px] bg-white px-3.5 py-3 text-left text-[14px] font-normal leading-relaxed tracking-normal text-gray-600 opacity-0 shadow-[0_10px_30px_rgba(15,23,42,0.14),0_0_0_1px_rgba(0,0,0,0.07)] transition-[opacity,transform,visibility] duration-150 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:left-0 sm:right-auto sm:w-[360px]"
                          >
                            {BASE_MINIMUM.description}
                          </span>
                        </span>
                      </div>
                      {isCustomizingPlan ? (
                        <p className="mt-3 max-w-[65ch] text-[15px] font-normal leading-relaxed text-gray-600">
                          Вы можете добавлять и убирать услуги. Ничего не фиксируется без вашего подтверждения.
                        </p>
                      ) : null}
                    </div>

                    {baseLineItems.map((item) => (
                      <div key={item.key} className={cn("py-3.5", item.subItems && "space-y-2")}>
                        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                          <span className="text-pretty">{item.label}</span>
                          <span className="whitespace-nowrap font-semibold tabular-nums text-gray-900">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        {item.subItems ? (
                          <div className="space-y-1 text-pretty text-[14px] leading-relaxed text-gray-600">
                            {item.subItems.map((subItem) => (
                              <div key={subItem} className="flex items-start gap-2">
                                <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-gray-400" aria-hidden="true" />
                                <span>{subItem}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {addedItems.length > 0 && (
                      <div className="flex justify-end py-3.5">
                        <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold tabular-nums text-gray-700 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                          Базовый состав: {formatCurrency(BASE_TARIFF_TOTAL)}
                        </span>
                      </div>
                    )}

                    {addedItems.length > 0 && (
                      <div className="py-4">
                        <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                          Добавлено в план
                        </div>
                        <div className="space-y-2">
                          {addedItems.map((item) => (
                            <div key={item.key} className="flex items-start justify-between gap-4 text-gray-700">
                              <div className="space-y-1">
                                <div>{item.label}</div>
                                {item.detail && (
                                  <div className="ml-3 text-[14px] text-gray-600">• {item.detail}</div>
                                )}
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="whitespace-nowrap font-semibold tabular-nums text-gray-900">
                                  {formatDelta(item.delta)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeAddedItem(item.key)}
                                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg leading-none text-gray-500 shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)] transition-[color,box-shadow,transform] duration-150 ease-out hover:text-gray-900 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_2px_5px_rgba(0,0,0,0.06)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/30"
                                  aria-label={`Удалить услугу ${item.label}`}
                                  title="Удалить услугу"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="py-5 text-center">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Итого
                    </div>
                    <div
                      aria-live="polite"
                      className="mt-2 whitespace-nowrap text-4xl font-semibold leading-none tabular-nums tracking-[-0.03em] text-gray-900"
                    >
                      {activePanel === "custom" ? formatCurrency(pricing.total) : "86 600 ₽"}
                    </div>
                  </div>
                  {activePanel === "custom" && (
                    <div
                      ref={configuratorRef}
                      className="packageConfigEnter py-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[16px] font-semibold text-gray-900">Настройка тарифа</div>
                          <div className="mt-1 text-[14px] leading-relaxed text-gray-600">
                            {CONFIG_STEPS[configStep].hint}
                          </div>
                        </div>
                        <div className="shrink-0 text-[13px] font-semibold tabular-nums text-gray-500">
                          {configStep + 1} / {CONFIG_STEPS.length}
                        </div>
                      </div>

                      <div
                        ref={configTabsRef}
                        className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1"
                        role="tablist"
                        aria-label="Шаги настройки тарифа"
                      >
                        {CONFIG_STEPS.map((step, index) => {
                          const isActiveStep = index === configStep;
                          return (
                            <button
                              key={step.id}
                              type="button"
                              role="tab"
                              aria-selected={isActiveStep}
                              aria-controls={`config-panel-${step.id}`}
                              onClick={() => goToConfigStep(index)}
                              className={cn(
                                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[12px] px-3.5 text-[14px] font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35",
                                isActiveStep
                                  ? "bg-gray-950 text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                                  : "bg-white text-gray-600 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.07)] hover:text-gray-900",
                              )}
                            >
                              <span className="tabular-nums text-[12px] opacity-70">0{index + 1}</span>
                              {step.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="sticky top-2 z-20 mt-4 rounded-[16px] bg-[#fbfbfa]/95 p-3 shadow-[0_10px_26px_rgba(15,23,42,0.10),0_0_0_1px_rgba(0,0,0,0.07)] backdrop-blur">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-snug text-gray-700">
                              Сейчас в плане
                            </div>
                            <div className="mt-0.5 text-pretty text-[14px] leading-snug text-gray-600">
                              {addedItemsSummary}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div
                              aria-live="polite"
                              className="whitespace-nowrap text-[18px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-gray-900"
                            >
                              {formatCurrency(pricing.total)}
                            </div>
                            <div className="mt-1 whitespace-nowrap text-[12px] font-semibold tabular-nums text-gray-500">
                              {addedTotal > 0 ? formatDelta(addedTotal) : "без доплат"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="-mx-1 mt-5 overflow-hidden px-1 py-1">
                        <div
                          key={CONFIG_STEPS[configStep].id}
                          id={`config-panel-${CONFIG_STEPS[configStep].id}`}
                          role="tabpanel"
                          className={cn(
                            "space-y-5",
                            configDirection === "forward" ? "configStepForward" : "configStepBack",
                          )}
                        >
                          {configStep === 0 && (
                            <>
                              <OptionRow
                                label="Формат"
                                description="Как будет проходить прощание"
                                value={draftConfig.format}
                                options={[
                                  { value: "burial", label: "Захоронение", subtitle: "Традиционное погребение" },
                                  { value: "cremation", label: "Кремация", subtitle: "С выдачей урны" },
                                  { value: "unknown", label: "Пока не знаю", subtitle: "Поможем определиться" },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, format: value as TariffDraftConfig["format"] }))
                                }
                              />
                              <OptionRow
                                label="Зал прощания"
                                description="Церемония прощания с родными"
                                value={draftConfig.hall}
                                options={[
                                  { value: "none", label: "Без зала" },
                                  { value: "60", label: "С залом", delta: 10000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, hall: value as TariffDraftConfig["hall"] }))
                                }
                              />
                              <OptionRow
                                label="Тип церемонии"
                                value={draftConfig.ceremonyType}
                                options={[
                                  { value: "secular", label: "Светская", subtitle: "Без религиозных обрядов", delta: 0, showZero: true },
                                  { value: "religious", label: "Религиозная", subtitle: "С участием священнослужителя", delta: 15000 },
                                  { value: "mixed", label: "Комбинированная", subtitle: "Светская + религиозная часть", delta: 20000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, ceremonyType: value as TariffDraftConfig["ceremonyType"] }))
                                }
                              />
                            </>
                          )}

                          {configStep === 1 && (
                            <>
                              <OptionRow
                                label="Катафалк"
                                description="Специализированный автомобиль для перевозки гроба"
                                value={draftConfig.hearseTier}
                                options={[
                                  { value: "standard", label: "Стандарт (включено)", delta: 0, showZero: true },
                                  { value: "comfort", label: "Комфорт", delta: 12000 },
                                  { value: "premium", label: "Премиум", delta: 35000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, hearseTier: value as TariffDraftConfig["hearseTier"] }))
                                }
                              />
                              <OptionRow
                                label="Транспорт для близких"
                                description="Автобус или микроавтобус для 12–19 пассажиров"
                                value={draftConfig.transport}
                                options={[
                                  { value: "none", label: "Не нужен" },
                                  { value: "standard", label: "Стандарт (12-19 человек)", delta: 11400 },
                                  { value: "comfort", label: "Комфорт (12-19 человек)", delta: 15300 },
                                  { value: "premium", label: "Премиум (до 40 человек)", delta: 39000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, transport: value as TariffDraftConfig["transport"] }))
                                }
                              />
                            </>
                          )}

                          {configStep === 2 && (
                            <>
                              <OptionRow
                                label="Носильщики"
                                description="Бригада для погрузки, выноса и заноса гроба"
                                value={draftConfig.pallbearers}
                                options={[
                                  { value: "none", label: "Не нужны" },
                                  { value: "standard", label: "Стандарт (4 человека)", delta: 8000 },
                                  { value: "comfort", label: "Комфорт (4 человека)", delta: 16100 },
                                  { value: "premium", label: "Премиум", delta: 24000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, pallbearers: value as TariffDraftConfig["pallbearers"] }))
                                }
                              />
                              <OptionRow
                                label="Координатор"
                                description="Расчёт сметы и координация прощания"
                                value={draftConfig.coordinationTier}
                                options={[
                                  { value: "base", label: "Оформление и сопровождение (включено)", delta: 0, showZero: true },
                                  { value: "comfort", label: "Сопровождение церемонии", delta: 14100 },
                                  { value: "premium", label: "Персональный координатор", delta: 90000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, coordinationTier: value as TariffDraftConfig["coordinationTier"] }))
                                }
                              />
                            </>
                          )}

                          {configStep === 3 && (
                            <>
                              <OptionRow
                                label="Отпевание"
                                description="Религиозный обряд"
                                value={draftConfig.churchService}
                                options={[
                                  { value: "none", label: "Не нужно" },
                                  { value: "morgue", label: "Минимальный обряд в морге", delta: 4000 },
                                  { value: "parish", label: "Отпевание в обычном храме", delta: 6000 },
                                  { value: "cathedral", label: "Собор или монастырь", delta: 47000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, churchService: value as TariffDraftConfig["churchService"] }))
                                }
                              />
                              <OptionRow
                                label="Панихида"
                                description="Служба на кладбище или в храме"
                                value={draftConfig.panikhida}
                                options={[
                                  { value: "none", label: "Не нужно" },
                                  { value: "standard", label: "Стандарт", delta: 5000 },
                                  { value: "comfort", label: "Комфорт", delta: 10000 },
                                  { value: "premium", label: "Премиум", delta: 20000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, panikhida: value as TariffDraftConfig["panikhida"] }))
                                }
                              />
                            </>
                          )}

                          {configStep === 4 && (
                            <>
                              <OptionRow
                                label="Поминальный обед"
                                description="Поминки после похорон"
                                value={draftConfig.memorialMeal}
                                options={[
                                  { value: "none", label: "Не нужно" },
                                  { value: "standard", label: "Нужно" },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, memorialMeal: value as TariffDraftConfig["memorialMeal"] }))
                                }
                              />
                              <OptionRow
                                label="Ведущий"
                                description="Сценарий и координация церемонии"
                                value={draftConfig.host}
                                options={[
                                  { value: "no", label: "Не нужно" },
                                  { value: "yes", label: "Нужно", delta: 37000 },
                                ]}
                                onChange={(value) =>
                                  setDraftConfig((prev) => ({ ...prev, host: value as TariffDraftConfig["host"] }))
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                        <button
                          type="button"
                          disabled={configStep === 0}
                          onClick={() => goToConfigStep(configStep - 1)}
                          className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-gray-800 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-gray-100 active:scale-[0.97] disabled:pointer-events-none disabled:text-gray-300 disabled:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
                        >
                          Назад
                        </button>
                        <div className="flex gap-1.5" aria-hidden="true">
                          {CONFIG_STEPS.map((step, index) => (
                            <span
                              key={`${step.id}-dot`}
                              className={cn(
                                "h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out",
                                index === configStep ? "w-5 bg-gray-900" : "w-1.5 bg-gray-300",
                              )}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (configStep === CONFIG_STEPS.length - 1) {
                              setActivePanel("base");
                              return;
                            }
                            goToConfigStep(configStep + 1);
                          }}
                          className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-gray-950 px-5 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-[background-color,transform] duration-150 ease-out hover:bg-gray-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                        >
                          {configStep === CONFIG_STEPS.length - 1 ? "Готово" : "Далее"}
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => {
                        if (activePanel === "custom") {
                          setActivePanel("base");
                          setShowInlinePayment(false);
                          setDeliveryChannel(null);
                          return;
                        }
                        openConfigurator();
                      }}
                      className="!h-11 !min-h-11 w-auto !rounded-[13px] bg-gray-950 px-5 text-sm font-semibold tracking-wide text-white shadow-[0_1px_2px_rgba(0,0,0,0.16),0_6px_16px_rgba(0,0,0,0.12)] transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-gray-800 hover:shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.15)] active:scale-[0.97]"
                    >
                      {activePanel === "custom" ? "Свернуть настройки" : "Изменить состав"}
                    </Button>
                    <div ref={savePopoverRef} className="relative">
                      <Button
                        variant="outline"
                        aria-expanded={showInlinePayment}
                        aria-controls="save-plan-channels"
                        onClick={() => {
                          setShowInlinePayment((v) => {
                            const next = !v;
                            if (!next) setDeliveryChannel(null);
                            return next;
                          });
                        }}
                        className={cn(
                          "!h-11 !min-h-11 w-auto !rounded-[13px] !border-0 !bg-white px-5 text-sm font-semibold tracking-wide !text-gray-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-[background-color,box-shadow,transform] duration-150 ease-out hover:!bg-[#fafafa] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_2px_5px_rgba(15,23,42,0.07)] active:scale-[0.97]",
                          showInlinePayment && "!bg-[#f4f4f2] shadow-[0_0_0_1.5px_rgba(0,0,0,0.12),0_8px_18px_rgba(15,23,42,0.08)]",
                        )}
                      >
                        Сохранить
                      </Button>

                      {showInlinePayment && (
                        <div
                          id="save-plan-channels"
                          className="saveChannelsEnter absolute right-0 top-[calc(100%+8px)] z-40 w-[300px] max-w-[calc(100vw-32px)] rounded-[16px] bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.18),0_0_0_1px_rgba(0,0,0,0.07)]"
                        >
                          <div className="text-[14px] font-semibold leading-snug text-gray-900">
                            Куда сохранить план?
                          </div>
                          <div className="mt-1 text-[13px] leading-snug text-gray-600">
                            Отправим состав и итоговую сумму. Оплата сейчас не требуется.
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button
                              asChild
                              variant="outline"
                              className="!h-11 !min-h-11 !rounded-[12px] !border-0 !bg-[#f4f4f2] px-4 text-sm font-semibold !text-gray-900 transition-[background-color,transform] duration-150 ease-out hover:!bg-[#ececea] active:scale-[0.97]"
                            >
                              <a href={currentPlanTelegramUrl} target="_blank" rel="noreferrer">
                                В Telegram
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setDeliveryChannel("email")}
                              className="!h-11 !min-h-11 !rounded-[12px] !border-0 !bg-[#f4f4f2] px-4 text-sm font-semibold !text-gray-900 transition-[background-color,transform] duration-150 ease-out hover:!bg-[#ececea] active:scale-[0.97]"
                            >
                              На почту
                            </Button>
                          </div>
                          {deliveryChannel === "email" && (
                            <div className="pt-3">
                              {paymentSlot?.({
                                totalRub: paymentTotal,
                                services: paymentServices,
                                formData: paymentFormData,
                                orderFlow: "save_plan",
                                package: {
                                  id: BASE_MINIMUM.id,
                                  name: planTitle,
                                  price: paymentTotal,
                                },
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {!showInlinePayment && (
                    <div className="max-w-[65ch] text-pretty text-[14px] leading-relaxed text-gray-600">
                      Измените состав или сохраните план. Оплата сейчас не требуется: сначала вы получите договор и смету.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {readyPackages.length > 0 && (
            <section
              data-ready-packages
              className={cn(
                showTraditionalLegacyCard ? "pt-14 md:pt-20" : "pt-6 md:pt-10",
                embedded && "pt-6 md:pt-8",
              )}
            >
              {showTraditionalLegacyCard && (
                <div className="px-2 md:px-0">
                  <div className="mx-auto h-px max-w-5xl bg-gray-200/80" />
                </div>
              )}
              <div
                className={cn(
                  "mt-8 rounded-[28px] bg-[#f9f9f9] px-3 py-8 md:mt-10 md:px-6 md:py-10",
                  embedded && "mt-6 rounded-none bg-transparent px-0 py-0",
                )}
              >
                <div className="mb-8 max-w-3xl text-left md:mb-10">
                  <h3 className="text-balance text-xl font-semibold tracking-[-0.015em] text-gray-900 md:text-2xl">
                    Или делегируйте всю организацию нам
                  </h3>
                  <p className="mt-3 max-w-[65ch] text-pretty text-[15px] leading-relaxed text-gray-600 md:text-base">
                    Пакеты с личным сопровождением. Мы берем на себя логистику, работу с документами и
                    защиту от навязанных услуг.
                  </p>
                </div>

                {readyComparisonCards.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Быстрое сравнение
                    </div>
                    <div className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                      {readyComparisonCards.map(({ pkg, card }) => (
                        <div
                          key={`${pkg.id}-compare`}
                          className="min-w-[232px] snap-start rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.055),0_5px_18px_rgba(15,23,42,0.055)] md:min-w-0"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold leading-snug text-gray-900">
                                {card.quick.mode}
                              </div>
                              <div className="mt-1 text-[13px] leading-snug text-gray-600">
                                {card.quick.family}
                              </div>
                            </div>
                            <div className="shrink-0 whitespace-nowrap text-[13px] font-semibold tabular-nums text-gray-700">
                              {card.priceLabel}
                            </div>
                          </div>
                          <div className="mt-3 text-pretty text-[13px] leading-relaxed text-gray-600">
                            {card.quick.bestFor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 pt-2 md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pt-1">
                  {readyComparisonCards.map(({ pkg, card }) => {
                    const isRecommended = Boolean(card.popular || pkg.popular || pkg.id === "standard");
                    const highlightPhrases = highlightsByPackageId[pkg.id] ?? [];
                    const packageTelegramUrl = buildTelegramPlanUrl({
                      title: card.title,
                      priceLabel: card.priceLabel,
                      description: card.description,
                      included: card.included,
                    });
                    return (
                      <div
                        key={pkg.id}
                        className="w-[88%] max-w-[360px] min-w-[280px] shrink-0 snap-start md:w-full md:max-w-none md:min-w-0 md:shrink"
                      >
                        <div
                          className={cn(
                            "relative mx-auto flex h-full min-w-0 w-full flex-col rounded-[22px] bg-white p-5 transition-[box-shadow,transform] duration-200 ease-out 2xl:p-6",
                            isRecommended
                              ? "bg-[#fbfdff] shadow-[0_0_0_1.5px_rgba(23,148,253,0.55),0_14px_36px_rgba(23,148,253,0.11)]"
                              : "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_5px_rgba(15,23,42,0.04),0_10px_26px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.09),0_4px_9px_rgba(15,23,42,0.05),0_16px_34px_rgba(15,23,42,0.09)]",
                          )}
                        >
                          {isRecommended ? (
                            <div className="mb-3 text-[14px] font-semibold leading-snug text-[#147bd1]">
                              Рекомендуем
                            </div>
                          ) : null}
                          <div className="min-w-0 text-center">
                            <h4 className="text-balance break-words text-[14px] font-semibold leading-snug text-gray-800">
                              {card.title}
                            </h4>
                            <div className="mt-4 whitespace-nowrap text-[26px] font-semibold leading-none tabular-nums tracking-[-0.03em] text-gray-900 md:text-[28px]">
                              {card.priceLabel}
                            </div>
                            <div className="mt-3 min-w-0 text-left text-[15px] leading-[1.55] text-pretty text-gray-700">
                              {card.description}
                            </div>
                            <div className="mt-4 rounded-[16px] bg-[#f7f7f4] p-3 text-left shadow-[inset_0_0_0_1px_rgba(0,0,0,0.055)]">
                              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                                Главное отличие
                              </div>
                              <div className="mt-1 text-pretty text-[14px] leading-relaxed text-gray-700">
                                {card.quick.difference}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 min-w-0 text-[14px] leading-relaxed text-gray-700 2xl:text-[15px]">
                            <div className="text-[14px] font-semibold leading-snug text-gray-600">
                              Как помогает координатор
                            </div>
                            <ul className="mt-3 space-y-2.5">
                              {card.coordinatorHelp.map((line, idx) => (
                                <li key={`${pkg.id}-help-${idx}`} className="flex items-start gap-2.5">
                                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                                      <path d="M3 8.25 6.2 11.2 13 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                  <span>{renderHighlightedLine(line, highlightPhrases)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-6 min-w-0 text-[14px] leading-relaxed text-gray-700 2xl:text-[15px]">
                            <div className="text-[14px] font-semibold leading-snug text-gray-600">
                              Что входит в стоимость
                            </div>
                            <ul className="mt-3 space-y-2.5">
                              {card.included.map((line, idx) => (
                                <li key={`${pkg.id}-included-${idx}`} className="flex items-start gap-2.5">
                                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                                      <path d="M3 8.25 6.2 11.2 13 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-auto pt-6">
                            <Button
                              variant={isRecommended ? "default" : "outline"}
                              className={cn(
                                "!h-11 !min-h-11 w-full !rounded-[13px] px-4 text-sm font-semibold tracking-wide transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
                                isRecommended
                                  ? "!bg-gray-950 !text-white shadow-[0_1px_2px_rgba(0,0,0,0.16),0_8px_18px_rgba(0,0,0,0.12)] hover:!bg-gray-800"
                                  : "!border-0 !bg-gray-950 !text-white shadow-[0_1px_2px_rgba(0,0,0,0.14),0_6px_16px_rgba(0,0,0,0.10)] hover:!bg-gray-800",
                              )}
                              onClick={() => {
                                const isCremation = pkg.id.startsWith("cremation");
                                const draft = {
                                  format: isCremation ? "cremation" : "burial",
                                  transport: "standard",
                                  pallbearers: "standard",
                                  hall: "60",
                                  hearseTier: "standard",
                                  coordinationTier: "base",
                                  ceremonyType: "secular",
                                  churchService: "none",
                                  panikhida: "none",
                                  memorialMeal: "none",
                                  host: "no",
                                } satisfies TariffDraftConfig;
                                try {
                                  localStorage.setItem("tihiydom_plan_draft_v1", JSON.stringify(draft));
                                } catch {
                                  // ignore write errors
                                }
                                onSelectPackage(pkg);
                              }}
                            >
                              Выбрать этот план
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="mt-2 !h-11 !min-h-11 w-full !rounded-[13px] !border-0 !bg-[#f4f4f2] px-4 text-sm font-semibold tracking-wide !text-gray-900 transition-[background-color,transform] duration-150 ease-out hover:!bg-[#ececea] active:scale-[0.97]"
                            >
                              <a href={packageTelegramUrl} target="_blank" rel="noopener noreferrer">
                                Сохранить в Telegram
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  options: OptionRowOption[];
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);
  const columnsClass =
    options.length <= 2
      ? "sm:grid-cols-2"
      : options.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <div className="text-balance text-[15px] font-semibold leading-snug text-gray-900">{label}</div>
        {description ? (
          <div className="text-pretty text-[14px] leading-relaxed text-gray-600">{description}</div>
        ) : null}
      </div>
      <div className={cn("grid grid-cols-1 gap-2", columnsClass)} role="group" aria-label={label}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex min-h-[52px] w-full min-w-0 items-center justify-between rounded-[14px] px-3.5 py-2.5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35",
                isActive
                  ? "bg-[#eef7ff] shadow-[0_0_0_1.5px_#1794FD,0_4px_12px_rgba(23,148,253,0.10)]"
                  : "bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.065),0_1px_2px_rgba(0,0,0,0.035)] hover:bg-[#fcfcfb] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.11),0_3px_9px_rgba(15,23,42,0.055)]"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)] transition-[background-color,box-shadow] duration-150",
                    isActive ? "bg-[#1794FD] shadow-none" : "bg-white"
                  )}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-pretty break-words text-[14px] font-medium leading-snug text-gray-900">
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="mt-0.5 text-pretty break-words text-[13px] leading-snug text-gray-600">
                      {option.subtitle}
                    </span>
                  )}
                </span>
              </div>
              {typeof option.delta === "number" && (option.delta !== 0 || option.showZero) && (
                <span className="ml-2 whitespace-nowrap text-[13px] font-semibold tabular-nums text-gray-700">
                  {formatDelta(option.delta)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedOption ? (
        <div
          aria-live="polite"
          className="text-pretty text-[13px] leading-snug text-gray-500"
        >
          Выбрано:{" "}
          <span className="font-semibold text-gray-700">{selectedOption.label}</span>
          {typeof selectedOption.delta === "number" && (selectedOption.delta !== 0 || selectedOption.showZero) ? (
            <span className="tabular-nums"> · {formatDelta(selectedOption.delta)}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
