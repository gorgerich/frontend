import { useMemo, useState, Fragment } from "react";
import { Checkbox } from "./ui/checkbox";
import { Check, X } from "./Icons";
import { cn } from "./ui/utils";

type Package = {
id: string;
name: string;
price: number;
description: string;
features: string[];
popular?: boolean;
};

interface Feature {
name: string;
standard: boolean | string;
comfort: boolean | string;
premium: boolean | string;
category?: string;
}

const comparisonFeatures: Feature[] = [
{ name: "Оформление документов", standard: true, comfort: true, premium: true, category: "Базовые услуги" },
{ name: "Транспортировка", standard: true, comfort: true, premium: true, category: "Базовые услуги" },
{ name: "Копка могилы", standard: true, comfort: true, premium: true, category: "Базовые услуги" },
{ name: "Ритуальные принадлежности", standard: "Базовые", comfort: "Расширенные", premium: "Премиум", category: "Базовые услуги" },

{ name: "Материал гроба", standard: "Сосна", comfort: "Дуб", premium: "Элитное дерево", category: "Атрибутика" },
{ name: "Венок", standard: "Искусственные цветы", comfort: "Живые цветы", premium: "Композиция премиум", category: "Атрибутика" },
{ name: "Внутренняя отделка", standard: "Базовая", comfort: "Бархат", premium: "Премиум шелк", category: "Атрибутика" },
{ name: "Табличка", standard: false, comfort: "С фотографией", premium: "С фотографией", category: "Атрибутика" },
{ name: "Памятник", standard: false, comfort: false, premium: "Гранит", category: "Атрибутика" },

{ name: "Ритуальный зал", standard: false, comfort: "2 часа", premium: "4 часа", category: "Дополнительно" },
{ name: "Поминальный обед", standard: false, comfort: "До 20 человек", premium: "До 40 человек", category: "Дополнительно" },
{ name: "Фото-видеосъемка", standard: false, comfort: false, premium: true, category: "Дополнительно" },
{ name: "Координатор", standard: false, comfort: false, premium: true, category: "Дополнительно" },
];

type PriceComparisonProps = {
packages: Package[];
selectedPackage: Package | null;
onSelectPackage: (pkg: Package) => void;
};

function formatRub(n: number) {
return n.toLocaleString("ru-RU") + " ₽";
}

function normalizePackageOrder(packages: Package[]) {
// Нужно строго 3 тарифа. Берём первые 3.
// Если у тебя id "standard/comfort/premium" — порядок фиксируем так.
const byId = new Map(packages.map((p) => [p.id, p]));
const hasStandard = byId.has("standard");
const hasComfort = byId.has("comfort");
const hasPremium = byId.has("premium");

if (hasStandard && hasComfort && hasPremium) {
return [byId.get("standard")!, byId.get("comfort")!, byId.get("premium")!];
}

// иначе просто первые 3 как есть
return packages.slice(0, 3);
}

export function PriceComparison({ packages, selectedPackage, onSelectPackage }: PriceComparisonProps) {
const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

const ordered = useMemo(() => normalizePackageOrder(packages), [packages]);

// подписи для таблицы: стандарт/комфорт/премиум
const standard = ordered[0];
const comfort = ordered[1];
const premium = ordered[2];

const filteredFeatures = showDifferencesOnly
? comparisonFeatures.filter(
(feature) => !(feature.standard === feature.comfort && feature.comfort === feature.premium)
)
: comparisonFeatures;

const groupedFeatures = useMemo(() => {
return filteredFeatures.reduce((acc, feature) => {
const category = feature.category || "Прочее";
if (!acc[category]) acc[category] = [];
acc[category].push(feature);
return acc;
}, {} as Record<string, Feature[]>);
}, [filteredFeatures]);

const renderValue = (value: boolean | string) => {
if (typeof value === "boolean") {
return value ? (
<Check className="h-5 w-5 text-green-600 mx-auto" />
) : (
<X className="h-5 w-5 text-gray-300 mx-auto" />
);
}
return <span className="text-sm text-gray-700">{value}</span>;
};

// защита: если тарифов меньше 3 — показываем понятный текст (чтобы не падало)
if (!standard || !comfort || !premium) {
return (
<section className="py-10 px-4">
<div className="max-w-5xl mx-auto">
<div className="rounded-3xl border border-gray-200 p-6">
<div className="text-sm text-gray-900 font-medium mb-2">Не удалось отрисовать тарифы</div>
<div className="text-sm text-gray-600">
Компонент ожидает 3 тарифа в `packages`, а пришло: {packages.length}.
</div>
</div>
</div>
</section>
);
}

return (
<section className="py-10 px-4 bg-white">
<div className="max-w-7xl mx-auto">
{/* Заголовок */}
<div className="text-center mb-8">
<h2 className="mb-3">Выберите тариф</h2>
<p className="text-gray-600 max-w-2xl mx-auto">
Сначала выберите пакет, затем продолжите оформление.
</p>
</div>

{/* 3 карточки тарифов */}
<div className="grid gap-4 md:grid-cols-3 mb-10">
{ordered.map((p) => {
const active = selectedPackage?.id === p.id;

return (
<button
key={p.id}
type="button"
onClick={() => onSelectPackage(p)}
className={cn(
"text-left rounded-3xl border p-6 transition-all",
active ? "border-gray-900 shadow-lg" : "border-gray-200 hover:border-gray-300"
)}
>
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<div className="text-sm font-medium text-gray-900">{p.name}</div>
<div className="text-xs text-gray-600 mt-1">{p.description}</div>
</div>

<div className="shrink-0 text-sm font-semibold text-gray-900">
{formatRub(p.price)}
</div>
</div>

{!!p.features?.length && (
<ul className="mt-4 space-y-2 text-sm text-gray-700">
{p.features.slice(0, 5).map((f) => (
<li key={f} className="flex gap-2">
<span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
<span className="min-w-0">{f}</span>
</li>
))}
{p.features.length > 5 && (
<li className="text-xs text-gray-500">+ ещё {p.features.length - 5}</li>
)}
</ul>
)}

{active && (
<div className="mt-5 text-sm font-medium text-gray-900">
Выбрано
</div>
)}
</button>
);
})}
</div>

{/* Переключатель "только отличия" */}
<div className="flex justify-center items-center mb-4">
<div className="flex items-center space-x-2">
<Checkbox
id="differences"
checked={showDifferencesOnly}
onCheckedChange={(checked) => setShowDifferencesOnly(checked as boolean)}
/>
<label htmlFor="differences" className="text-sm cursor-pointer select-none">
Показать только отличия
</label>
</div>
</div>

{/* Таблица сравнения */}
<div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-lg">
<div className="min-w-[640px]">
<table className="w-full border-collapse">
<thead>
<tr className="border-b-2 border-gray-200">
<th className="text-left p-3 sm:p-4 bg-gray-50 first:rounded-tl-3xl min-w-[140px]">
Услуга
</th>

<th className="text-center p-3 sm:p-4 bg-gray-50 min-w-[110px]">
<div className="space-y-1">
<div className="text-sm sm:text-base">{standard.name}</div>
<div className="text-xs sm:text-sm text-gray-600">{formatRub(standard.price)}</div>
</div>
</th>

<th className="text-center p-3 sm:p-4 bg-gray-100 min-w-[110px]">
<div className="space-y-1">
<div className="text-sm sm:text-base">{comfort.name}</div>
<div className="text-xs sm:text-sm text-gray-600">{formatRub(comfort.price)}</div>
</div>
</th>

<th className="text-center p-3 sm:p-4 bg-gray-50 last:rounded-tr-3xl min-w-[110px]">
<div className="space-y-1">
<div className="text-sm sm:text-base">{premium.name}</div>
<div className="text-xs sm:text-sm text-gray-600">{formatRub(premium.price)}</div>
</div>
</th>
</tr>
</thead>

<tbody>
{Object.entries(groupedFeatures).map(([category, features], catIndex) => (
<Fragment key={category}>
<tr className="bg-gray-100">
<td colSpan={4} className="p-2 sm:p-3 text-xs sm:text-sm text-gray-900">
{category}
</td>
</tr>

{features.map((feature, index) => {
const isLastCategory = catIndex === Object.keys(groupedFeatures).length - 1;
const isLastRow = index === features.length - 1;
const isLastInTable = isLastCategory && isLastRow;

return (
<tr
key={`${category}-${index}`}
className={cn(
"border-b border-gray-100 hover:bg-gray-50 transition-colors",
index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
isLastInTable && "border-b-0"
)}
>
<td className={cn("p-3 sm:p-4 text-xs sm:text-sm", isLastInTable && "rounded-bl-3xl")}>
{feature.name}
</td>

<td className="p-3 sm:p-4 text-center">{renderValue(feature.standard)}</td>
<td className="p-3 sm:p-4 text-center bg-gray-50/50">{renderValue(feature.comfort)}</td>
<td className={cn("p-3 sm:p-4 text-center", isLastInTable && "rounded-br-3xl")}>
{renderValue(feature.premium)}
</td>
</tr>
);
})}
</Fragment>
))}
</tbody>
</table>
</div>
</div>
</div>
</section>
);
}
