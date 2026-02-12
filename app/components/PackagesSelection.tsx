import React from "react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { calcTariffTotal, formatCurrency, formatDelta, TariffDraftConfig, BASE_TARIFF_TOTAL, TARIFF_PRICING } from "./calculationUtils";

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
}

export function PackagesSelection({
  selectedPackageId,
  onSelectPackage,
  packages,
  paymentSlot,
  onAllInclusiveOpen,
}: PackagesSelectionProps) {
  const [activePanel, setActivePanel] = React.useState<"base" | "custom">("base");
  const [showInlinePayment, setShowInlinePayment] = React.useState(false);
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
    name: "Базовый минимум",
    price: BASE_TARIFF_TOTAL,
    description: "Это базовый план для проведения похорон. Все необходимое уже включено. Вы можете оформить или изменить его под себя нажав кнопку «Настроить» ниже",
    features: [],
    popular: false,
  };
  const baseLineItems: {
    key: string;
    label: string;
    price: number;
    subItems?: string[];
  }[] = [
    { key: "sanitary", label: "Санитарная обработка и бальзамирование", price: 18000 },
    {
      key: "attributes",
      label: "Атрибутика",
      price: 20000,
      subItems: [
        "Гроб обитый тканью (цвет на Ваш выбор)",
        "Постель в гроб",
        "Подушка шелковая",
        "Покрывало шелковое",
        "Тапочки похоронные",
        "Доставка в морг",
      ],
    },
    { key: "hearse", label: "Катафалк", price: 13500 },
    { key: "digging", label: "Копка могилы", price: 24700 },
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
  const allInclusivePackages = (packages ?? []).filter((pkg) => !pkg.id.startsWith("cremation"));
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
  const openConfigurator = () => {
    setActivePanel("custom");
    setShowInlinePayment(false);
  };

  return (
    <div className="pt-2 md:pt-3 w-full">
      <div className="mx-auto w-full max-w-6xl px-2">
        <div className="mb-5 text-left text-[13px] text-gray-500 font-medium leading-relaxed md:hidden">
          Ниже — базовый вариант организации похорон. Мы уже собрали всё необходимое для проведения прощания.
          {" "}Вы видите понятный состав услуг и итоговую стоимость.
          {" "}Можно оформить как есть или изменить нажав{" "}
          <button
            type="button"
            onClick={openConfigurator}
            className="font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900"
          >
            Настроить
          </button>
          .
        </div>
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-2 px-0 md:px-4 no-scrollbar">
          <div className="shrink-0 snap-start w-full md:w-[92%]">
            <div
              data-package-card
              className={cn(
                "group relative mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl border transition-all duration-300 bg-white p-8",
                isSelected
                  ? "border-gray-900 shadow-2xl scale-[1.01] z-10"
                  : "border-gray-100 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1"
              )}
            >
              <div className="text-center">
                <h3 className={cn(
                  "font-semibold text-gray-700 break-words",
                  isCustomizingPlan ? "text-[11px] sm:text-sm uppercase tracking-[0.18em] text-gray-500" : "text-[11px] sm:text-sm uppercase tracking-[0.18em] text-gray-500"
                )}>
                  {isCustomizingPlan ? "ПРОИСХОДИТ НАСТРОЙКА ПЛАНА" : BASE_MINIMUM.name}
                </h3>
                {!isCustomizingPlan && (
                  <p className="mt-3 text-left text-sm text-gray-500 font-medium leading-relaxed hidden md:block">
                    Ниже — базовый вариант организации похорон. Мы уже собрали всё необходимое для проведения прощания.
                    {" "}Вы видите понятный состав услуг и итоговую стоимость.
                    {" "}Можно оформить как есть или изменить состав нажав{" "}
                    <button
                      type="button"
                      onClick={openConfigurator}
                      className="font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900"
                    >
                      Настроить
                    </button>
                    .
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
                  <div className="space-y-4">
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
                          { value: "none", label: "Выключен" },
                          { value: "60", label: "Включен", delta: 10000 },
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
                <div className="space-y-1.5">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActivePanel("base");
                      setShowInlinePayment((v) => !v);
                    }}
                    className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide !bg-gray-100 !text-gray-900 hover:!bg-gray-50 !border-gray-200"
                  >
                    Отправить план на почту
                  </Button>
                  {!showInlinePayment && (
                    <div className="text-xs text-gray-500">
                      Сейчас оплата не требуется. Сначала вы получите договор, детали заказа и сможете спокойно всё проверить.
                    </div>
                  )}
                  {showInlinePayment && (
                    <div className="pt-4">
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
                <Button
                  onClick={() => {
                    setActivePanel((prev) => (prev === "custom" ? "base" : "custom"));
                    setShowInlinePayment(false);
                  }}
                  className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide bg-gray-900 text-white hover:bg-gray-800"
                >
                  Настроить
                </Button>
                <div className="text-xs text-gray-500">
                  Изменить формат, зал, транспорт и другие детали
                </div>
              </div>
            </div>
          </div>

          {allInclusivePackages.map((pkg) => {
            const isPopular = !!pkg.popular;
            const packageLabel =
              pkg.id === "basic"
                ? "С поддержкой координатора"
                : pkg.id === "standard"
                  ? "Расширенное сопровождение"
                  : "Передать всё координатору";
            const packagePrice = formatCurrency(pkg.price);
            return (
              <div
                key={pkg.id}
                className="shrink-0 snap-start w-full md:w-[92%]"
              >
                <div className="relative mx-auto w-full max-w-5xl rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm h-full flex flex-col">
                  {isPopular && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-4 rounded-full bg-gray-900 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white whitespace-nowrap">
                      Популярный выбор
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      {packageLabel}
                    </div>
                    <div className="mt-4 text-4xl font-semibold text-gray-900 whitespace-nowrap leading-none">
                      {packagePrice}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {pkg.description}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-gray-700">
                    {pkg.features.map((feature, idx) => (
                      <div key={`${pkg.id}-feature-${idx}`} className="grid grid-cols-[1fr_auto] items-start gap-4">
                        <span>{feature}</span>
                      </div>
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
                    Настроить
                  </Button>
                </div>
              </div>
            );
          })}
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
