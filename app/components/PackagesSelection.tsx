import React from "react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { Check, X } from "./Icons";

type CatalogItem = { id: string; label: string };

const normalizeFeatureLabel = (label: string) =>
  label.replace(/\s+/g, " ").replace(/,\s*$/, "").trim();

const SERVICE_CATALOG_BURIAL: CatalogItem[] = [
  { id: "docs_paperwork", label: "Оформление документов" },
  { id: "docs_burial_help", label: "Помощь в оформлении захоронения" },
  { id: "body_basic", label: "Базовая подготовка тела" },
  { id: "transport_to_place", label: "Перевозка к месту прощания/захоронения" },
  { id: "bearers", label: "Носильщики" },
  { id: "hearse_standard", label: "Катафалк (стандарт)" },
  { id: "hearse_comfort", label: "Катафалк (комфорт)" },
  { id: "hearse_premium", label: "Катафалк (премиальный)" },
  { id: "coffin_pine", label: "Гроб для захоронения (сосна)" },
  { id: "coffin_oak", label: "Гроб для захоронения (дуб)" },
  { id: "coffin_valuable", label: "Гроб для захоронения (ценное дерево)" },
  { id: "wreath_artificial", label: "Венок (искусственный)" },
  { id: "wreath_mixed", label: "Венок (искусственный/живая композиция)" },
  { id: "wreath_premium", label: "Венок (премиальная флористика)" },
  { id: "lining_basic", label: "Базовая отделка (обивка)" },
  { id: "lining_upgrade", label: "Улучшенная отделка (обивка)" },
  { id: "lining_premium", label: "Премиальная отделка (обивка)" },
  { id: "hall_30", label: "Зал прощания до 30 минут" },
  { id: "hall_60", label: "Зал прощания до 60 минут" },
  { id: "hall_90", label: "Зал прощания до 90 минут" },
  { id: "bus_5", label: "Транспорт для близких (до 5 человек)" },
  { id: "bus_10", label: "Транспорт для близких (до 10 человек)" },
  { id: "bus_15", label: "Транспорт для близких повышенного комфорта (до 15 человек)" },
  { id: "coord_day", label: "Координатор в день церемонии" },
  { id: "coord_senior", label: "Старший координатор церемонии" },
];

const BURIAL_STANDARD_UPGRADES = new Set<string>([
  "hearse_premium",
  "coffin_valuable",
  "wreath_premium",
  "lining_premium",
  "hall_90",
  "bus_15",
  "coord_senior",
]);

const SERVICE_CATALOG_CREMATION: CatalogItem[] = [
  { id: "docs_paperwork", label: "Оформление документов" },
  { id: "columbarium_booking", label: "Бронирование места в колумбарии" },
  { id: "columbarium_booking_premium", label: "Бронирование места в колумбарии премиум" },
  { id: "body_storage_basic", label: "Хранение и базовая подготовка тела" },
  { id: "body_storage", label: "Хранение и подготовка тела" },
  { id: "coffin_container", label: "Гроб-контейнер для кремации" },
  { id: "coffin_farewell", label: "Гроб для прощания + гроб-контейнер" },
  { id: "coffin_elite", label: "Гроб элитный для прощания + контейнер" },
  { id: "transport_to_crematorium", label: "Транспортировка до крематория" },
  { id: "transport_deceased", label: "Транспортировка покойного" },
  { id: "cremation_with_urn", label: "Кремация + урна стандартная" },
  { id: "cremation", label: "Кремация" },
  { id: "urn_ceramic", label: "Урна керамическая" },
  { id: "urn_premium", label: "Урна премиум (мрамор/гранит)" },
  { id: "farewell_hall_2h", label: "Зал прощания на 2 часа" },
  { id: "farewell_hall_4h", label: "Ритуальный зал на 4 часа" },
  { id: "memorial_dinner_20", label: "Поминальный обед (до 20 человек)" },
  { id: "memorial_dinner_40", label: "Поминальный обед (до 40 человек)" },
  { id: "live_flowers", label: "Композиция из живых цветов" },
  { id: "ritual_premium", label: "Ритуальные принадлежности премиум" },
  { id: "coord_individual", label: "Индивидуальный координатор" },
];

const warnDuplicateCatalogIds = (name: string, catalog: CatalogItem[]) => {
  const ids = catalog.map((item) => item.id);
  const dup = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  if (dup.length) {
    // eslint-disable-next-line no-console
    console.warn(`Duplicate ${name} catalog ids:`, dup);
  }
};

if (process.env.NODE_ENV !== "production") {
  warnDuplicateCatalogIds("BURIAL", SERVICE_CATALOG_BURIAL);
  warnDuplicateCatalogIds("CREMATION", SERVICE_CATALOG_CREMATION);
}

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
  packages: readonly Package[]; // ✅ тоже readonly (можно и Package[])
}

export function PackagesSelection({
  selectedPackageId,
  onSelectPackage,
  packages,
}: PackagesSelectionProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRafRef = React.useRef<number | null>(null);

  const isCremation = React.useMemo(
    () => packages.every((pkg) => pkg.id.startsWith("cremation-")),
    [packages]
  );

  const catalog = React.useMemo(
    () => (isCremation ? SERVICE_CATALOG_CREMATION : SERVICE_CATALOG_BURIAL),
    [isCremation]
  );

  const labelToId = React.useMemo(() => {
    const entries = catalog.map((item) => [item.label, item.id] as const);
    return Object.fromEntries(entries) as Record<string, string>;
  }, [catalog]);

  const mapFeatureToId = React.useCallback(
    (label: string, pkgId: string) => {
      if (label === "Зал прощания") {
        if (pkgId === "basic") return "hall_30";
        if (pkgId === "standard") return "hall_60";
        if (pkgId === "premium") return "hall_90";
      }
      return labelToId[label];
    },
    [labelToId]
  );

  const includedByPackage = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    packages.forEach((pkg) => {
      const set = new Set<string>();
      pkg.features.forEach((feature) => {
        const label = normalizeFeatureLabel(String(feature || ""));
        if (!label) return;
        const id = mapFeatureToId(label, pkg.id);
        if (!id) {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn("Unknown catalog label:", label);
          }
          return;
        }
        set.add(id);
      });
      map.set(pkg.id, set);
    });
    return map;
  }, [packages, mapFeatureToId]);

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    if (scrollRafRef.current) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = scrollRef.current;
      if (!container) return;
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>("[data-package-card]")
      );
      if (!cards.length) return;
      const containerLeft = container.getBoundingClientRect().left;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left - containerLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    });
  }, []);

  return (
    <div className="pt-6">
      <div className="mb-3 flex items-center justify-center gap-2 md:hidden">
        {packages.map((pkg, index) => {
          const isActive = index === activeIndex;
          return (
            <span
              key={pkg.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                isActive ? "w-6 bg-gray-900/80" : "w-2.5 bg-gray-300/70"
              )}
            />
          );
        })}
      </div>
      <div className="overflow-visible">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 px-4 pt-5 md:pt-0 md:px-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:scroll-auto items-start [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
      {packages.map((pkg) => {
        const isSelected = selectedPackageId === pkg.id;
        const included = includedByPackage.get(pkg.id) ?? new Set<string>();
        const visibleCatalog =
          !isCremation && pkg.id === "standard"
            ? catalog.filter(
                (item) => included.has(item.id) || BURIAL_STANDARD_UPGRADES.has(item.id)
              )
            : catalog;
        const useLegacyIncludedList = !isCremation && pkg.id === "premium";
        return (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg)}
            data-package-card
            className={cn(
              "group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 cursor-pointer bg-white flex-none w-[88vw] max-w-[360px] snap-start md:w-auto md:max-w-none md:flex-none",
              isSelected
                ? "border-gray-900 shadow-2xl scale-[1.02] z-10"
                : "border-gray-100 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1"
            )}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg ring-4 ring-white whitespace-nowrap">
                Популярный выбор
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                {pkg.name}
              </h3>
              <div className="flex items-start justify-center gap-1 text-gray-900 whitespace-nowrap">
                <span className="text-5xl font-light tracking-tighter whitespace-nowrap">
                  <span className="text-2xl font-medium align-baseline">от</span>{" "}
                  {pkg.price.toLocaleString("ru-RU")}
                </span>
                <span className="text-xl font-light mt-1">₽</span>
              </div>
              <p className="text-sm text-gray-400 mt-3 font-medium">{pkg.description}</p>
            </div>

            <div className="space-y-3 mb-8">
              {useLegacyIncludedList
                ? pkg.features.map((feature) => (
                    <div
                      key={`${pkg.id}-${feature}`}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-600">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="leading-tight pt-0.5 text-gray-600 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))
                : visibleCatalog.map((item) => {
                    const hasFeature = included.has(item.id);
                    return (
                      <div key={`${pkg.id}-${item.id}`} className="flex items-start gap-3 text-sm">
                        <div
                          className={cn(
                            "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                            hasFeature
                              ? isSelected
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600"
                              : "bg-gray-50 text-gray-300"
                          )}
                        >
                          {hasFeature ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </div>
                        <span
                          className={cn(
                            "leading-tight pt-0.5",
                            hasFeature ? "text-gray-600 font-medium" : "text-gray-400"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
            </div>

            <Button
              className={cn(
                "w-full rounded-2xl h-12 text-sm font-semibold tracking-wide transition-all duration-300",
                isSelected
                  ? "bg-gray-900 text-white shadow-lg hover:bg-gray-800"
                  : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100"
              )}
            >
              {isSelected ? "Выбран" : "Настроить"}
            </Button>
          </div>
        );
      })}
      </div>
    </div>
    </div>
  );
}
