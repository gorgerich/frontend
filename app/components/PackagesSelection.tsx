import React from "react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { Check } from "./Icons";
import { calcTariffTotal, formatCurrency, formatDelta, TariffDraftConfig, BASE_TARIFF_TOTAL } from "./calculationUtils";

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
  paymentSlot?: (override?: { totalRub?: number }) => React.ReactNode;
  onAllInclusiveOpen?: (open: boolean) => void;
}

export function PackagesSelection({
  selectedPackageId,
  onSelectPackage,
  packages,
  paymentSlot,
  onAllInclusiveOpen,
}: PackagesSelectionProps) {
  const [activePanel, setActivePanel] = React.useState<"base" | "custom" | "all">("base");
  const [showInlinePayment, setShowInlinePayment] = React.useState(false);
  const [draftConfig, setDraftConfig] = React.useState<TariffDraftConfig>({
    format: "burial",
    transport: "none",
    pallbearers: "none",
    hall: "none",
    hearseTier: "standard",
    coordinationTier: "base",
    secularCeremony: "no",
    churchService: "no",
  });

  const [allInclusiveTiers, setAllInclusiveTiers] = React.useState<
    Record<string, "standard" | "comfort" | "premium">
  >({});

  const BASE_MINIMUM: Package = {
    id: "base-minimum",
    name: "Базовый минимум",
    price: BASE_TARIFF_TOTAL,
    description: "Это готовый базовый план похорон собранный нашей командой. Вы можете оформить его как есть или спокойно изменить нажав кнопку «Настроить» ниже. Ничего не начнётся без вашего подтверждения.",
    features: [],
    popular: false,
  };

  const isSelected = selectedPackageId === BASE_MINIMUM.id;
  const pricing = calcTariffTotal(draftConfig);
  const paymentTotal =
    activePanel === "custom" ? pricing.total : BASE_TARIFF_TOTAL;
  const addedItems = [
    draftConfig.hearseTier !== "standard" && {
      key: "hearseTier",
      label: "Катафалк",
      detail: draftConfig.hearseTier === "comfort" ? "Комфорт" : "Премиум",
      delta: draftConfig.hearseTier === "comfort" ? 12000 : 35000,
    },
    draftConfig.pallbearers !== "none" && {
      key: "pallbearers",
      label: "Носильщики",
      detail: `${draftConfig.pallbearers} человек`,
      delta: draftConfig.pallbearers === "4" ? 12000 : draftConfig.pallbearers === "6" ? 18000 : 24000,
    },
    draftConfig.transport !== "none" && {
      key: "transport",
      label: "Транспорт для близких",
      detail: draftConfig.transport === "10" ? "До 10 мест" : "До 15 мест",
      delta: draftConfig.transport === "10" ? 12000 : 20000,
    },
    draftConfig.hall !== "none" && {
      key: "hall",
      label: "Зал прощания",
      detail: `${draftConfig.hall} минут`,
      delta: draftConfig.hall === "60" ? 12000 : 20000,
    },
    draftConfig.secularCeremony === "yes" && {
      key: "secularCeremony",
      label: "Светская церемония",
      detail: "Ведущий",
      delta: 12000,
    },
    draftConfig.churchService === "yes" && {
      key: "churchService",
      label: "Отпевание в церкви",
      detail: "Церковная служба",
      delta: 18000,
    },
    draftConfig.coordinationTier !== "base" && {
      key: "coordinationTier",
      label: "Координатор",
      detail: draftConfig.coordinationTier === "comfort" ? "Комфорт" : "Премиум",
      delta: draftConfig.coordinationTier === "comfort" ? 12000 : 24000,
    },
  ].filter(Boolean) as { key: string; label: string; detail?: string; delta: number }[];
  const isCustomizingPlan = activePanel === "custom" && addedItems.length > 0;

  return (
    <div className="pt-6 w-full">
      <div className="mx-auto w-full max-w-4xl px-2">
        <div className="mb-5 text-center text-sm text-gray-500 font-medium">
          Это готовый базовый план похорон собранный нашей командой. Вы можете оформить его как есть или спокойно изменить
          нажав кнопку «Настроить» ниже. Ничего не начнётся без вашего подтверждения.
        </div>
        <div
          data-package-card
          className={cn(
            "group relative flex flex-col gap-8 rounded-3xl border transition-all duration-300 bg-white p-8",
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
            {isCustomizingPlan && (
              <p className="mt-3 font-medium text-sm text-gray-400">
                Вы можете добавлять и убирать услуги. Ничего не фиксируется без вашего подтверждения.
              </p>
            )}
          </div>

          {activePanel !== "all" && (
            <div className="space-y-6">
              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <span>Санитарная обработка и бальзамирование</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">18 000 ₽</span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <span>Атрибутика</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">20 000 ₽</span>
                  </div>
                  <div className="ml-3 space-y-1 text-xs text-gray-500">
                    <div>• Гроб обитый тканью (цвет на Ваш выбор)</div>
                    <div>• Постель в гроб</div>
                    <div>• Подушка шелковая</div>
                    <div>• Покрывало шелковое</div>
                    <div>• Тапочки похоронные</div>
                    <div>• Доставка в морг</div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <span>Катафалк</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">13 500 ₽</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <span>Копка могилы</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">24 700 ₽</span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <span>Координатор базовый</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">10 400 ₽</span>
                  </div>
                  <div className="ml-3 text-xs text-gray-500">• Оформление и сопровождение заказа</div>
                </div>

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
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">
                      Формат
                    </div>
                    <OptionRow
                      label="Как будет проходить прощание"
                      value={draftConfig.format}
                      options={[
                        { value: "burial", label: "Захоронение" },
                        { value: "cremation", label: "Кремация" },
                        { value: "unknown", label: "Пока не знаю" },
                      ]}
                      onChange={(value) =>
                        setDraftConfig((prev) => ({ ...prev, format: value as TariffDraftConfig["format"] }))
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">
                      Транспорт и организация
                    </div>
                    <div className="space-y-3">
                      <OptionRow
                        label="Катафалк"
                        value={draftConfig.hearseTier}
                        options={[
                          { value: "standard", label: "Стандарт (включено)" },
                          { value: "comfort", label: "Комфорт", delta: 12000 },
                          { value: "premium", label: "Премиум", delta: 35000 },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({ ...prev, hearseTier: value as TariffDraftConfig["hearseTier"] }))
                        }
                      />
                      <OptionRow
                        label="Носильщики"
                        value={draftConfig.pallbearers}
                        options={[
                          { value: "none", label: "Не нужны" },
                          { value: "4", label: "4 человека", delta: 12000 },
                          { value: "6", label: "6 человек", delta: 18000 },
                          { value: "8", label: "8 человек", delta: 24000 },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({ ...prev, pallbearers: value as TariffDraftConfig["pallbearers"] }))
                        }
                      />
                      <OptionRow
                        label="Транспорт для близких"
                        value={draftConfig.transport}
                        options={[
                          { value: "none", label: "Не нужен" },
                          { value: "10", label: "До 10 мест", delta: 12000 },
                          { value: "15", label: "До 15 мест", delta: 20000 },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({ ...prev, transport: value as TariffDraftConfig["transport"] }))
                        }
                      />
                      <OptionRow
                        label="Координатор"
                        value={draftConfig.coordinationTier}
                        options={[
                          {
                            value: "base",
                            label: "Оформление и сопровождение заказа",
                          },
                          {
                            value: "comfort",
                            label: "Сопровождение по документам и согласованиям",
                            delta: 12000,
                          },
                          {
                            value: "premium",
                            label: "Персональный координатор в день церемонии + контроль договорённостей",
                            delta: 24000,
                          },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            coordinationTier: value as TariffDraftConfig["coordinationTier"],
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">
                      Прощание
                    </div>
                    <div className="space-y-3">
                      <OptionRow
                        label="Зал прощания"
                        value={draftConfig.hall}
                        options={[
                          { value: "none", label: "Не нужен" },
                          { value: "60", label: "60 минут", delta: 12000 },
                          { value: "90", label: "90 минут", delta: 20000 },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({ ...prev, hall: value as TariffDraftConfig["hall"] }))
                        }
                      />
                      <OptionRow
                        label="Светская церемония (ведущий)"
                        value={draftConfig.secularCeremony}
                        options={[
                          { value: "no", label: "Не нужно" },
                          { value: "yes", label: "Нужно", delta: 12000 },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            secularCeremony: value as TariffDraftConfig["secularCeremony"],
                          }))
                        }
                      />
                      <OptionRow
                        label="Отпевание в церкви"
                        value={draftConfig.churchService}
                        options={[
                          { value: "no", label: "Не нужно" },
                          { value: "yes", label: "Нужно", delta: 18000 },
                        ]}
                        onChange={(value) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            churchService: value as TariffDraftConfig["churchService"],
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePanel === "all" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {(packages ?? [])
                  .filter((pkg) => !pkg.id.startsWith("cremation"))
                  .map((pkg) => {
                  const isPopular = !!pkg.popular;
                  const isBaseMinimum = pkg.id === "basic";
                  const packageLabel =
                    pkg.id === "basic"
                      ? "Базовый минимум"
                      : pkg.id === "standard"
                        ? "Ничего не упустить"
                        : "Передать все заботы";
                  const tier = allInclusiveTiers[pkg.id] ?? "standard";
                  const tierPriceMap: Record<"standard" | "comfort" | "premium", number> = {
                    standard: pkg.price,
                    comfort: Math.round(pkg.price * 1.35),
                    premium: Math.round(pkg.price * 1.75),
                  };
                  return (
                    <div
                      key={pkg.id}
                      className="relative rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      {isPopular && (
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 rounded-full bg-gray-900 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                          Популярный выбор
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                          {packageLabel}
                        </div>
                        <div className="mt-4 text-4xl font-semibold text-gray-900">
                          {isBaseMinimum ? "86 600 ₽" : `от ${formatCurrency(tierPriceMap[tier])}`}
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {isBaseMinimum ? "Необходимый минимум" : pkg.description}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-center gap-2">
                        {(["standard", "comfort", "premium"] as const).map((value) => {
                          const isActive = tier === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setAllInclusiveTiers((prev) => ({ ...prev, [pkg.id]: value }))
                              }
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition",
                                isActive
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                              )}
                            >
                              {value === "standard" ? "Стандарт" : value === "comfort" ? "Комфорт" : "Премиум"}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 space-y-3">
                        {isBaseMinimum ? (
                          <>
                            <div className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>Санитарная обработка и бальзамирование — 18 000₽</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <Check className="h-3 w-3" />
                              </span>
                              <div className="space-y-2">
                                <div>Атрибутика и доставка — 20 000₽</div>
                                <div className="space-y-1 text-[12px] text-gray-500">
                                  <div>• Гроб обитый тканью (цвет на Ваш выбор)</div>
                                  <div>• Постель в гроб</div>
                                  <div>• Подушка шелковая</div>
                                  <div>• Покрывало шелковое</div>
                                  <div>• Тапочки похоронные</div>
                                  <div>• Доставка в морг</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>Катафалк — 13 500₽</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>Копка могилы — 24 700₽</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <Check className="h-3 w-3" />
                              </span>
                              <div className="space-y-2">
                                <div>Координатор базовый — 10 400₽</div>
                                <div className="text-[12px] text-gray-500">• Оформление и сопровождение заказа</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          pkg.features.map((feature, idx) => (
                            <div key={`${pkg.id}-feature-${idx}`} className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{feature}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <Button
                        className="mt-6 w-full rounded-2xl h-12 text-sm font-semibold tracking-wide"
                        onClick={() => {
                          if (isBaseMinimum) {
                            const draft = {
                              format: "burial",
                              transport: "none",
                              pallbearers: "none",
                              hall: "none",
                              hearseTier: "standard",
                              coordinationTier: "base",
                              secularCeremony: "no",
                              churchService: "no",
                            } satisfies TariffDraftConfig;
                            try {
                              localStorage.setItem("tihiydom_plan_draft_v1", JSON.stringify(draft));
                            } catch {
                              // ignore write errors
                            }
                            onSelectPackage(pkg);
                            return;
                          }
                          const isCremation = false;
                          const mappedTier = allInclusiveTiers[pkg.id] ?? "standard";
                          const draft = {
                            format: isCremation ? "cremation" : "burial",
                            transport: mappedTier === "premium" ? "15" : "10",
                            pallbearers: mappedTier === "premium" ? "8" : mappedTier === "comfort" ? "6" : "4",
                            hall: mappedTier === "premium" ? "90" : "60",
                            hearseTier: mappedTier === "premium" ? "premium" : mappedTier === "comfort" ? "comfort" : "standard",
                            coordinationTier: mappedTier === "premium" ? "premium" : mappedTier === "comfort" ? "comfort" : "base",
                            secularCeremony: "no",
                            churchService: "no",
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
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <Button
                onClick={() => {
                  setActivePanel("base");
                  setShowInlinePayment((v) => !v);
                  onAllInclusiveOpen?.(false);
                }}
                className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide bg-gray-900 text-white hover:bg-gray-800"
              >
                Заключить договор
              </Button>
              {!showInlinePayment && (
                <div className="text-xs text-gray-500">
                  Сейчас оплата не требуется. Сначала вы получите договор и сможете спокойно всё проверить.
                </div>
              )}
              {showInlinePayment && (
                <div className="pt-4">
                  {paymentSlot?.({ totalRub: paymentTotal })}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setActivePanel((prev) => (prev === "custom" ? "base" : "custom"));
                setShowInlinePayment(false);
                onAllInclusiveOpen?.(false);
              }}
              className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide"
            >
              Настроить
            </Button>
            <div className="text-xs text-gray-500">
              Изменить формат, зал, транспорт и другие детали
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setActivePanel("all");
                setShowInlinePayment(false);
                onAllInclusiveOpen?.(true);
              }}
              className="w-full rounded-2xl h-12 text-sm font-semibold tracking-wide"
            >
              Тарифы «всё включено»
            </Button>
            <div className="text-xs text-gray-500">
              Если хотите сразу выбрать готовое решение — посмотрите тарифы «всё включено»
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; delta?: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              )}
            >
              <span>{option.label}</span>
              {typeof option.delta === "number" && option.delta !== 0 && (
                <span className="ml-2 text-[11px] opacity-70">{formatDelta(option.delta)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
