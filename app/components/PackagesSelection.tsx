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

export function PackagesSelection({
  selectedPackageId,
  onSelectPackage,
  packages,
  paymentSlot,
  onAllInclusiveOpen,
  viewMode = "solutions",
  embedded = false,
}: PackagesSelectionProps) {
  const [activePanel, setActivePanel] = React.useState<"base" | "custom">("base");
  const [showInlinePayment, setShowInlinePayment] = React.useState(false);
  const [deliveryChannel, setDeliveryChannel] = React.useState<"telegram" | "email" | null>(null);
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
  const READY_BASE_PACKAGE: Package = {
    ...BASE_MINIMUM,
    features: baseLineItems.flatMap((item) =>
      item.subItems && item.subItems.length > 0 ? [item.label, ...item.subItems] : [item.label],
    ),
  };

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
        "Мы выстраиваем маршрут, заказываем транспорт и готовим документы, чтобы вам не пришлось искать подрядчиков самостоятельно.",
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
        "Мы физически находимся рядом на каждом этапе. Координатор защитит вас от навязанных услуг, очередей и организационного хаоса в день прощания.",
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
        "Максимальное снятие нагрузки. Вы передаете нам все задачи по доверенности и только присутствуете на церемонии прощания с близким.",
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
  ].filter(Boolean) as { key: string; label: string; detail?: string; delta: number }[];
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
  const configuratorRef = React.useRef<HTMLDivElement | null>(null);
  const openConfigurator = () => {
    setActivePanel("custom");
    setShowInlinePayment(false);
    requestAnimationFrame(() => {
      configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const traditionalTelegramPrefill = [
    `Тариф: ${BASE_MINIMUM.name}`,
    `Стоимость: ${formatCurrency(BASE_TARIFF_TOTAL)}`,
    "",
    "Что входит:",
    ...baseLineItems.map((item) => `- ${item.label}: ${formatCurrency(item.price)}`),
  ].join("\n");
  const traditionalTelegramUrl = (() => {
    const username = SUPPORT_TELEGRAM_URL.split("t.me/")[1]?.split(/[/?#]/)[0];
    if (!username) return SUPPORT_TELEGRAM_URL;
    return `https://t.me/${username}?text=${encodeURIComponent(traditionalTelegramPrefill)}`;
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
                    : "gap-8 rounded-3xl border bg-white p-8 transition-all duration-300",
                  !embedded &&
                    (isSelected
                      ? "border-gray-900 shadow-2xl scale-[1.01] z-10"
                      : "border-gray-100 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1")
                )}
              >
                <div className="text-center">
                  <h3
                    className={cn(
                      "font-micro font-[700] text-gray-700 break-words",
                      "text-[11px] sm:text-sm uppercase tracking-[0.18em] text-gray-500"
                    )}
                  >
                    {isCustomizingPlan ? "ПРОИСХОДИТ НАСТРОЙКА ПЛАНА" : BASE_MINIMUM.name}
                  </h3>
                  {!isCustomizingPlan && (
                    <p className="mt-3 text-left text-[13px] font-medium leading-relaxed text-gray-500 md:hidden">
                      {BASE_MINIMUM.description}
                    </p>
                  )}
                  {isCustomizingPlan && (
                    <p className="mt-3 font-medium text-sm text-gray-400">
                      Вы можете добавлять и убирать услуги. Ничего не фиксируется без вашего подтверждения.
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-4 text-sm text-gray-700">
                    {baseLineItems.map((item) => (
                      <div key={item.key} className={item.subItems ? "space-y-2" : undefined}>
                        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                          <span>{item.label}</span>
                          <span className="font-semibold text-gray-900 whitespace-nowrap">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        {item.subItems ? (
                          <div className="ml-3 space-y-1 text-xs text-gray-500">
                            {item.subItems.map((subItem) => (
                              <div key={subItem}>• {subItem}</div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {addedItems.length > 0 && (
                      <div className="flex justify-end pt-3">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                          Итого: {formatCurrency(BASE_TARIFF_TOTAL)}
                        </span>
                      </div>
                    )}

                    {addedItems.length > 0 && (
                      <div className="pt-3 mt-4 border-t border-gray-200/70">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
                          Добавлено в план
                        </div>
                        <div className="space-y-2">
                          {addedItems.map((item) => (
                            <div key={item.key} className="flex items-start justify-between gap-4 text-gray-700">
                              <div className="space-y-1">
                                <div>{item.label}</div>
                                {item.detail && (
                                  <div className="ml-3 text-xs text-gray-500">• {item.detail}</div>
                                )}
                              </div>
                              <span className="font-semibold text-gray-900 whitespace-nowrap">
                                {formatDelta(item.delta)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Итого</div>
                    <div className="mt-2 text-4xl font-semibold text-gray-900">
                      {activePanel === "custom" ? formatCurrency(pricing.total) : "86 600 ₽"}
                    </div>
                  </div>
                  {activePanel === "custom" && (
                    <div ref={configuratorRef} className="space-y-4">
                      <div>
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
                      </div>
                      <div>
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
                      </div>

                      <div>
                        <OptionRow
                          label="Тип церемонии"
                          value={draftConfig.ceremonyType}
                          options={[
                            { value: "secular", label: "Светская", subtitle: "Без религиозных обрядов", delta: 0, showZero: true },
                            {
                              value: "religious",
                              label: "Религиозная",
                              subtitle: "С участием священнослужителя",
                              delta: 15000,
                            },
                            {
                              value: "mixed",
                              label: "Комбинированная",
                              subtitle: "Светская + религиозная часть",
                              delta: 20000,
                            },
                          ]}
                          onChange={(value) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              ceremonyType: value as TariffDraftConfig["ceremonyType"],
                            }))
                          }
                        />
                      </div>

                      <div>
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
                      </div>

                      <div>
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
                      </div>

                      <div>
                        <OptionRow
                          label="Носильщики"
                          description="Бригада (обычно 4 человека) для погрузки, выноса и заноса гроба"
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
                      </div>

                      <div>
                        <OptionRow
                          label="Координатор"
                          description="Помощь в подборе принадлежностей, расчет сметы, координация похорон"
                          value={draftConfig.coordinationTier}
                          options={[
                            { value: "base", label: "Оформление заказа и сопровождение (включено)", delta: 0, showZero: true },
                            { value: "comfort", label: "Сопровождение церемонии", delta: 30100 },
                            { value: "premium", label: "Персональный координатор церемонии", delta: 90000 },
                          ]}
                          onChange={(value) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              coordinationTier: value as TariffDraftConfig["coordinationTier"],
                            }))
                          }
                        />
                      </div>

                      <div>
                        <OptionRow
                          label="Отпевание"
                          description="Религиозный обряд"
                          value={draftConfig.churchService}
                          options={[
                            { value: "none", label: "Не нужно" },
                            { value: "morgue", label: "Минимальный обряд в морге", delta: 4000 },
                            { value: "parish", label: "Отпевание в обычном храме", delta: 6000 },
                            { value: "cathedral", label: "Кафедральный собор/монастырь", delta: 47000 },
                          ]}
                          onChange={(value) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              churchService: value as TariffDraftConfig["churchService"],
                            }))
                          }
                        />
                      </div>

                      <div>
                        <OptionRow
                          label="Панихида"
                          description="Служба на кладбище или в храме, закрытие гроба, панихида"
                          value={draftConfig.panikhida}
                          options={[
                            { value: "none", label: "Не нужно" },
                            { value: "standard", label: "Стандарт", delta: 5000 },
                            { value: "comfort", label: "Комфорт", delta: 10000 },
                            { value: "premium", label: "Премиум", delta: 20000 },
                          ]}
                          onChange={(value) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              panikhida: value as TariffDraftConfig["panikhida"],
                            }))
                          }
                        />
                      </div>

                      <div>
                        <OptionRow
                          label="Ведущий"
                          description="Организация траурной церемонии, сценарий, координация служб"
                          value={draftConfig.host}
                          options={[
                            { value: "no", label: "Не нужно" },
                            { value: "yes", label: "Нужно", delta: 37000 },
                          ]}
                          onChange={(value) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              host: value as TariffDraftConfig["host"],
                            }))
                          }
                        />
                      </div>

                      <div>
                        <OptionRow
                          label="Поминальный обед"
                          description="Поминки после похорон"
                          value={draftConfig.memorialMeal}
                          options={[
                            { value: "none", label: "Не нужно" },
                            { value: "standard", label: "Нужно" },
                          ]}
                          onChange={(value) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              memorialMeal: value as TariffDraftConfig["memorialMeal"],
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      setActivePanel((prev) => (prev === "custom" ? "base" : "custom"));
                      setShowInlinePayment(false);
                    }}
                    className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Изменить детали
                  </Button>
                  <div className="text-xs text-gray-500">
                    Изменить формат, зал, транспорт и другие детали
                  </div>
                  <div className="space-y-1.5">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActivePanel("base");
                        setShowInlinePayment((v) => {
                          const next = !v;
                          if (!next) setDeliveryChannel(null);
                          return next;
                        });
                      }}
                      className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide !bg-gray-100 !text-gray-900 hover:!bg-gray-50 !border-gray-200"
                    >
                      Сохранить и отправить план себе
                    </Button>
                    {!showInlinePayment && (
                      <div className="text-xs text-gray-500">
                        Сейчас оплата не требуется. Сначала вы получите договор, детали заказа и сможете спокойно всё проверить.
                      </div>
                    )}
                    {showInlinePayment && (
                      <div className="pt-4 space-y-3">
                        <div className="text-sm font-medium text-gray-700">
                          Куда вам удобнее сохранить план?
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-2xl text-sm font-semibold !bg-gray-100 !text-gray-900 hover:!bg-gray-50 !border-gray-200"
                          >
                            <a href={traditionalTelegramUrl} target="_blank" rel="noreferrer">
                              В Telegram
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setDeliveryChannel("email")}
                            className="h-11 rounded-2xl text-sm font-semibold !bg-gray-100 !text-gray-900 hover:!bg-gray-50 !border-gray-200"
                          >
                            На почту
                          </Button>
                        </div>
                        {deliveryChannel === "email" && (
                          <div className="pt-1">
                            {paymentSlot?.({
                              totalRub: paymentTotal,
                              services: paymentServices,
                              formData: paymentFormData,
                              orderFlow: activePanel === "custom" ? "custom" : "base_minimum",
                              package: {
                                id: BASE_MINIMUM.id,
                                name: BASE_MINIMUM.name,
                                price: paymentTotal,
                              },
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {readyPackages.length > 0 && (
            <section
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
                <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
                  <h3 className="text-xl font-medium text-gray-900 md:text-2xl">
                    Или делегируйте всю организацию нам
                  </h3>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
                    Пакеты с личным сопровождением. Мы берем на себя логистику, работу с документами и
                    защиту от навязанных услуг.
                  </p>
                </div>

                <div className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2 md:!mx-0 md:!grid md:!grid-cols-3 md:!gap-3 md:!overflow-visible md:!px-0 md:!pb-2 md:!snap-none">
                  {readyPackages.map((pkg) => {
                    const card = solutionCardContent[pkg.id] ?? {
                      title: pkg.name,
                      priceLabel: formatCurrency(pkg.price),
                      description: pkg.description,
                      coordinatorHelp: [],
                      included: pkg.features.map((feature) => `${feature}`),
                    };
                    const packageTelegramUrl = buildTelegramPlanUrl({
                      title: card.title,
                      priceLabel: card.priceLabel,
                      description: card.description,
                      included: card.included,
                    });
                    return (
                      <div
                        key={pkg.id}
                        className="w-[88%] max-w-[360px] min-w-[280px] shrink-0 snap-start md:!w-full md:!min-w-0 md:!max-w-none md:!shrink"
                      >
                        <div className="relative mx-auto flex h-full min-w-0 w-full flex-col rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm 2xl:p-6">
                          <div className="min-w-0 text-center">
                            <div className="break-words text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 xl:text-[9px] 2xl:text-xs">
                              {card.title}
                            </div>
                            <div className="mt-4 text-[clamp(1.9rem,2vw,2.25rem)] font-semibold text-gray-900 whitespace-nowrap leading-none">
                              {card.priceLabel}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Смета окончательная и фиксируется в договоре
                            </div>
                            <div className="mt-3 min-w-0 text-sm text-gray-600 leading-relaxed text-left">
                              {card.description}
                            </div>
                          </div>

                          <div className="mt-6 min-w-0 space-y-2 text-sm text-gray-700">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                              Как помогает координатор
                            </div>
                            {card.coordinatorHelp.map((line, idx) => (
                              <p key={`${pkg.id}-help-${idx}`}>{line}</p>
                            ))}
                          </div>

                          <div className="mt-5 min-w-0 space-y-2 text-sm text-gray-700">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                              Что входит в стоимость
                            </div>
                            {card.included.map((line, idx) => (
                              <p key={`${pkg.id}-included-${idx}`}>{line}</p>
                            ))}
                          </div>

                          <Button
                            className="mt-6 w-full rounded-2xl h-12 text-sm font-semibold tracking-wide"
                            onClick={() => {
                              const isCremation = false;
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
                            className="mt-3 w-full rounded-2xl h-11 text-sm font-semibold tracking-wide"
                          >
                            <a href={packageTelegramUrl} target="_blank" rel="noopener noreferrer">
                              Сохранить в Telegram
                            </a>
                          </Button>
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
  options: { value: string; label: string; subtitle?: string; delta?: number; showZero?: boolean }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-1">
        <div className="text-[12px] font-semibold text-gray-800 leading-snug">{label}</div>
        {description ? (
          <div className="text-[12px] text-gray-500 leading-snug">{description}</div>
        ) : null}
      </div>
      <div
        className={cn(
          "grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        )}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full min-w-0 rounded-full border-2 px-4 py-2 text-left transition flex items-center justify-between bg-white",
                isActive ? "border-gray-900 shadow-sm" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                    isActive ? "border-gray-900" : "border-gray-300"
                  )}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[12px] sm:text-[13px] font-medium text-gray-900 leading-tight break-words">
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="text-[11px] text-gray-500 leading-tight break-words">
                      {option.subtitle}
                    </span>
                  )}
                </span>
              </div>
              {typeof option.delta === "number" && (option.delta !== 0 || option.showZero) && (
                <span className="text-[11px] sm:text-[12px] font-semibold text-gray-600 whitespace-nowrap">
                  {formatDelta(option.delta)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


