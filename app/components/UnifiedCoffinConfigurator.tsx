'use client';

import { useMemo, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { Plus, Minus, Check } from './Icons';

interface ConfiguratorOption {
id: string;
name: string;
image: string;
price?: number;
}

interface UnifiedCoffinConfiguratorProps {
onConfirm?: (data: any) => void;
}

/**
* Упрощенная замена ImageWithFallback, чтобы проект собирался без ./figma/ImageWithFallback
* и без next/image. Работает в любом окружении.
*/
function SafeImg(props: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
const { fallbackSrc, ...rest } = props;
return (
// eslint-disable-next-line @next/next/no-img-element
<img
{...rest}
onError={(e) => {
if (!fallbackSrc) return;
const target = e.currentTarget;
if (target.src !== fallbackSrc) target.src = fallbackSrc;
}}
/>
);
}

export function UnifiedCoffinConfigurator({ onConfirm }: UnifiedCoffinConfiguratorProps) {
const [activeTab, setActiveTab] = useState<'coffin' | 'wreath'>('coffin');

// Состояние для гроба
const [selectedWood, setSelectedWood] = useState('pine');
const [selectedLining, setSelectedLining] = useState('satin-white');
const [selectedHardware, setSelectedHardware] = useState('brass');
const [coffinQuantity, setCoffinQuantity] = useState(1);

// Состояние для венка
const [wreathType, setWreathType] = useState('artificial');
const [wreathSize, setWreathSize] = useState('M');
const [wreathText, setWreathText] = useState('');
const [wreathQuantity, setWreathQuantity] = useState(1);

// Опции материалов гроба
const woodOptions = [
{
id: 'pine',
name: 'Сосна',
texture: '/images/coffin/wood/pine.jpg',
price: 0,
description: 'Классический натуральный материал',
},
{
id: 'oak',
name: 'Дуб',
texture: '/images/coffin/wood/oak.jpg',
price: 20000,
description: 'Прочное долговечное дерево',
},
{
id: 'elite',
name: 'Элитное дерево',
texture: '/images/coffin/wood/elite.jpg',
price: 50000,
description: 'Премиальная порода',
},
];

const liningOptions = [
{
id: 'satin-white',
name: 'Атлас белый',
texture: '/images/coffin/fabric/atlas-white.jpg',
price: 0,
description: 'Классическая белая отделка',
},
{
id: 'silk-cream',
name: 'Шелк кремовый',
texture: '/images/coffin/fabric/silk-cream.jpg',
price: 5000,
description: 'Премиальная шелковая ткань',
},
{
id: 'velvet-burgundy',
name: 'Бархат бордовый',
texture: '/images/coffin/fabric/velvet-bordo.jpg',
price: 7500,
description: 'Роскошный бархат',
},
];

const hardwareOptions = [
{
id: 'brass',
name: 'Латунь',
color: '#B8860B',
metallic: 'linear-gradient(135deg, #d4af37 0%, #b8860b 50%, #c9a961 100%)',
price: 0,
description: 'Классическая фурнитура',
},
{
id: 'silver',
name: 'Серебро',
color: '#C0C0C0',
metallic: 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 50%, #d8d8d8 100%)',
price: 8000,
description: 'Элегантная отделка',
},
{
id: 'gold',
name: 'Золото',
color: '#FFD700',
metallic: 'linear-gradient(135deg, #ffd700 0%, #daa520 50%, #f1e05a 100%)',
price: 15000,
description: 'Премиальная фурнитура',
},
];

/**
* ВАЖНО:
* 1) ключи формата:
* - "wood-lining-hardware" (самый приоритетный)
* - "wood-lining" (фолбэк, если не хочешь размножать фото на 3 фурнитуры)
*
* 2) Здесь ставим ТВОИ картинки из /public (путь начинается с "/").
*/
const coffinPhotos: Record<string, string> = {
// ✅ ТВОЙ ЗАПРОС: "сосна + атлас" -> верхнее фото
// (независимо от фурнитуры, будет работать через фолбэк "wood-lining")
'pine-satin-white': '/images/coffin/previews/pine-atlas.jpg',
'oak-silk-cream': '/images/coffin/previews/oak-silk-cream.jpg',
'elite-velvet-burgundy': '/images/coffin/previews/elite-velvet-burgundy.jpg',
'oak-satin-white': '/images/coffin/previews/oak-atlas.jpg',
'elite-silk-cream': '/images/coffin/previews/elite-silk-cream.jpg',
'oak-velvet-burgundy': '/images/coffin/previews/oak-velvet-burgundy.jpg',
'pine-silk-cream': '/images/coffin/previews/pine-silk-cream.jpg',
'pine-velvet-burgundy': '/images/coffin/previews/pine-velvet-burgundy.jpg',
'elite-satin-white': '/images/coffin/previews/elite-atlas.jpg'

// Если захочешь точечно под разные фурнитуры — добавляй так:
// 'pine-satin-white-brass': '/images/coffin/previews/pine-atlas-brass.jpg',
// 'pine-satin-white-silver': '/images/coffin/previews/pine-atlas-silver.jpg',
// 'pine-satin-white-gold': '/images/coffin/previews/pine-atlas-gold.jpg',
};

/**
* Логика выбора фото:
* 1) ищем точное совпадение wood+lining+hardware
* 2) если нет — ищем wood+lining
* 3) если нет — дефолт
*/
const getCurrentCoffinPhoto = () => {
const fullKey = `${selectedWood}-${selectedLining}-${selectedHardware}`;
const shortKey = `${selectedWood}-${selectedLining}`;

return (
coffinPhotos[fullKey] ||
coffinPhotos[shortKey] ||
'/images/coffin/previews/default.jpg' // положи при желании дефолт в public
);
};

// Опции для (возможного) визуализатора, оставляю как у тебя
const coffinOptions: ConfiguratorOption[] = [
{ id: 'pine', name: 'Сосна', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400', price: 15000 },
{ id: 'oak', name: 'Дуб', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400', price: 35000 },
{ id: 'elite', name: 'Элитное', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400', price: 65000 },
];

const wreathOptions: ConfiguratorOption[] = [
{ id: 'artificial', name: 'Искусственные цветы', image: 'https://images.unsplash.com/photo-1741189127247-3f45b0ca6e53?w=400', price: 3500 },
{ id: 'composition', name: 'Живая композиция', image: 'https://images.unsplash.com/photo-1741189127247-3f45b0ca6e53?w=400', price: 7500 },
];

const liningOptionsConfig: ConfiguratorOption[] = [
{ id: 'satin-white', name: 'Атлас белый', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400' },
{ id: 'silk-cream', name: 'Шелк кремовый', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400' },
];

const plaqueOptions: ConfiguratorOption[] = [{ id: 'metal', name: 'Металлическая', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400' }];

const monumentOptions: ConfiguratorOption[] = [{ id: 'granite', name: 'Гранит', image: 'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400' }];

// Цветовые палитры — оставляю как у тебя (если дальше будешь использовать)
const coffinColors = [
{ id: 'natural', hex: '#8B7355', name: 'Натуральный' },
{ id: 'dark', hex: '#3E2723', name: 'Темный' },
{ id: 'mahogany', hex: '#6D4C3D', name: 'Красное дерево' },
{ id: 'walnut', hex: '#5D4037', name: 'Орех' },
{ id: 'cherry', hex: '#A0522D', name: 'Вишня' },
{ id: 'white', hex: '#E8D5C4', name: 'Белый' },
];

const wreathSizes = [
{ id: 'S', name: 'Малый', price: 0 },
{ id: 'M', name: 'Средний', price: 1000 },
{ id: 'L', name: 'Большой', price: 2500 },
];

// Расчет цены
const getCoffinPrice = () => {
const basePrice = 15000;
const wood = woodOptions.find((w) => w.id === selectedWood);
const lining = liningOptions.find((l) => l.id === selectedLining);
const hardware = hardwareOptions.find((h) => h.id === selectedHardware);
return (basePrice + (wood?.price || 0) + (lining?.price || 0) + (hardware?.price || 0)) * coffinQuantity;
};

const getWreathPrice = () => {
const type = wreathOptions.find((t) => t.id === wreathType);
const size = wreathSizes.find((s) => s.id === wreathSize);
return ((type?.price || 3500) + (size?.price || 0)) * wreathQuantity;
};

const getTotalPrice = () => getCoffinPrice() + getWreathPrice();

const getCurrentCoffin = () => coffinOptions.find((c) => c.id === selectedWood) || coffinOptions[0];
const getCurrentWreath = () => wreathOptions.find((w) => w.id === wreathType) || wreathOptions[0];

const handleConfirm = () => {
const wood = woodOptions.find((w) => w.id === selectedWood);
const lining = liningOptions.find((l) => l.id === selectedLining);
const hardware = hardwareOptions.find((h) => h.id === selectedHardware);

const data = {
coffin: {
wood,
lining,
hardware,
quantity: coffinQuantity,
price: getCoffinPrice(),
},
wreath: {
type: wreathType,
size: wreathSize,
text: wreathText,
quantity: wreathQuantity,
price: getWreathPrice(),
},
total: getTotalPrice(),
};

onConfirm?.(data);
};

// Чтобы не пересоздавать строку для img каждый ререндер
const currentPhoto = useMemo(() => getCurrentCoffinPhoto(), [selectedWood, selectedLining, selectedHardware]);

return (
<div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl overflow-hidden">
<Tabs
value={activeTab}
defaultValue="coffin"
onValueChange={(v) => setActiveTab(v as 'coffin' | 'wreath')}
className="w-full"
>
<div className="bg-white border-b border-gray-200">
<TabsList className="w-full h-auto p-1 bg-transparent rounded-none justify-start gap-1">
<TabsTrigger
value="coffin"
className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
>
<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
</svg>
Гроб
</TabsTrigger>

<TabsTrigger
value="wreath"
className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
>
<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="9" strokeWidth={2} />
<circle cx="12" cy="12" r="4" strokeWidth={2} />
</svg>
Венок
</TabsTrigger>
</TabsList>
</div>

{/* Coffin Tab */}
<TabsContent value="coffin" className="mt-0">
<div className="p-4 md:p-6 space-y-6 md:space-y-8">
{/* Визуализация */}
<div className="bg-[#1a1c23] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
<div className="aspect-[16/9] md:aspect-[2/1] relative">
{activeTab === 'coffin' && (
<SafeImg
src={currentPhoto}
fallbackSrc="/images/coffin/previews/default.jpg"
alt="Гроб"
className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
/>
)}
</div>
</div>

{/* Порода дерева */}
<div className="space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
<Label className="text-base font-medium text-gray-900">Порода дерева</Label>
<span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Материал корпуса</span>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
{woodOptions.map((wood) => (
<button
key={wood.id}
type="button"
onClick={() => setSelectedWood(wood.id)}
className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${
selectedWood === wood.id
? 'ring-2 ring-blue-600 ring-offset-2 shadow-xl scale-[1.02]'
: 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5'
}`}
>
<div className="aspect-[16/9] sm:aspect-[4/3] w-full relative">
<SafeImg
src={(wood as any).texture}
fallbackSrc="https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=800"
alt={wood.name}
className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

{selectedWood === wood.id && (
<div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
<Check className="w-3.5 h-3.5 text-white" />
</div>
)}

<div className="absolute bottom-3 left-3 right-3">
<div className="text-white font-medium text-sm truncate">{wood.name}</div>
<div className="text-white/80 text-xs font-light">
{(wood as any).price === 0 ? 'Включено' : `+${(wood as any).price.toLocaleString('ru-RU')} ₽`}
</div>
</div>
</div>
</button>
))}
</div>
</div>

{/* Внутренняя отделка */}
<div className="space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
<Label className="text-base font-medium text-gray-900">Внутренняя отделка</Label>
<span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Ткань и цвет</span>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
{liningOptions.map((lining) => (
<button
key={lining.id}
type="button"
onClick={() => setSelectedLining(lining.id)}
className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${
selectedLining === lining.id
? 'ring-2 ring-purple-600 ring-offset-2 shadow-xl scale-[1.02]'
: 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5'
}`}
>
<div className="aspect-[16/9] sm:aspect-[4/3] w-full relative">
<SafeImg
src={(lining as any).texture}
fallbackSrc="https://images.unsplash.com/photo-1619043519379-99df2736108d?w=800"
alt={lining.name}
className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
/>
<div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

{selectedLining === lining.id && (
<div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
<Check className="w-3.5 h-3.5 text-white" />
</div>
)}

<div className="absolute bottom-0 inset-x-0 p-3 bg-white/90 backdrop-blur-sm border-t border-white/50">
<div className="text-gray-900 font-medium text-sm truncate">{lining.name}</div>
<div className="text-gray-500 text-xs">
{(lining as any).price === 0 ? 'Включено' : `+${(lining as any).price.toLocaleString('ru-RU')} ₽`}
</div>
</div>
</div>
</button>
))}
</div>
</div>

{/* Фурнитура */}
<div className="space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
<Label className="text-base font-medium text-gray-900">Фурнитура</Label>
<span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Ручки и декор</span>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
{hardwareOptions.map((hardware) => (
<button
key={hardware.id}
type="button"
onClick={() => setSelectedHardware(hardware.id)}
className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left bg-white ${
selectedHardware === hardware.id
? 'ring-2 ring-amber-500 ring-offset-2 shadow-xl scale-[1.02]'
: 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5'
}`}
>
<div
className="aspect-[16/9] sm:aspect-[2/1] w-full relative flex items-center justify-center overflow-hidden"
style={{ background: (hardware as any).metallic }}
>
<div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />

<div className="relative w-16 h-3 rounded-full shadow-sm" style={{ backgroundColor: (hardware as any).color }}>
<div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-black/10" />
<div className="absolute -left-1 -top-1 w-2 h-5 rounded-sm shadow-md" style={{ backgroundColor: (hardware as any).color }} />
<div className="absolute -right-1 -top-1 w-2 h-5 rounded-sm shadow-md" style={{ backgroundColor: (hardware as any).color }} />
</div>

{selectedHardware === hardware.id && (
<div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in z-10">
<Check className="w-3.5 h-3.5 text-white" />
</div>
)}
</div>

<div className="p-3 border-t border-gray-100">
<div className="text-gray-900 font-medium text-sm truncate">{hardware.name}</div>
<div className="text-gray-500 text-xs">
{(hardware as any).price === 0 ? 'Включено' : `+${(hardware as any).price.toLocaleString('ru-RU')} ₽`}
</div>
</div>
</button>
))}
</div>
</div>

{/* Количество */}
<div className="space-y-3">
<Label className="text-gray-900">Количество</Label>
<div className="flex items-center gap-3">
<Button
type="button"
variant="outline"
size="icon"
onClick={() => setCoffinQuantity(Math.max(1, coffinQuantity - 1))}
className="h-10 w-10 rounded-xl"
>
<Minus className="w-4 h-4" />
</Button>
<div className="flex-1 text-center">
<div className="text-2xl text-gray-900">{coffinQuantity}</div>
<div className="text-xs text-gray-500">шт.</div>
</div>
<Button
type="button"
variant="outline"
size="icon"
onClick={() => setCoffinQuantity(coffinQuantity + 1)}
className="h-10 w-10 rounded-xl"
>
<Plus className="w-4 h-4" />
</Button>
</div>
</div>

{/* Итог + Confirm */}
<div className="mt-8 p-4 md:p-6 rounded-2xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
<div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

<div className="relative z-10 space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
<div>
<div className="text-blue-200 text-sm mb-1 font-medium">Итоговая стоимость комплектации</div>
<div className="text-3xl font-light tracking-tight">{getCoffinPrice().toLocaleString('ru-RU')} ₽</div>
<div className="text-slate-400 text-xs mt-2 flex flex-wrap gap-2">
<span>{woodOptions.find((w) => w.id === selectedWood)?.name || 'Не выбрано'}</span>
<span>•</span>
<span>{liningOptions.find((l) => l.id === selectedLining)?.name || 'Не выбрано'}</span>
<span>•</span>
<span>{hardwareOptions.find((h) => h.id === selectedHardware)?.name || 'Не выбрано'}</span>
</div>
</div>

<div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 self-end sm:self-center flex-shrink-0">
<svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path
strokeLinecap="round"
strokeLinejoin="round"
strokeWidth={1.5}
d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
/>
</svg>
</div>
</div>

<Button
type="button"
onClick={handleConfirm}
className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 h-auto rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
>
<span className="flex items-center justify-center gap-2">
<Check className="w-4 h-4" />
<span className="font-medium">Подтвердить конфигурацию</span>
</span>
</Button>
</div>
</div>
</div>
</TabsContent>

{/* Wreath Tab */}
<TabsContent value="wreath" className="mt-0">
<div className="p-6 space-y-6">
<div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 shadow-inner">
<div className="aspect-[4/3] flex items-center justify-center overflow-hidden rounded-xl bg-black/20">
<SafeImg
src={getCurrentWreath().image}
fallbackSrc="https://images.unsplash.com/photo-1741189127247-3f45b0ca6e53?w=800"
alt="Венок"
className="w-full h-full object-cover opacity-90"
/>
</div>
</div>

<div className="space-y-3">
<Label className="text-gray-900">Тип венка</Label>

<RadioGroup value={wreathType} onValueChange={setWreathType}>
<div className="grid grid-cols-2 gap-3">
{wreathOptions.map((type) => (
<div key={type.id} className="relative">
<RadioGroupItem value={type.id} id={`wreath-${type.id}`} className="peer sr-only" />
<Label
htmlFor={`wreath-${type.id}`}
className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-green-300 hover:shadow-md peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 peer-data-[state=checked]:shadow-lg"
>
<div className="relative w-full">
<SafeImg
src={type.image}
fallbackSrc="https://images.unsplash.com/photo-1741189127247-3f45b0ca6e53?w=400"
alt={type.name}
className="w-full h-24 object-cover rounded-lg"
/>
{wreathType === type.id && (
<div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
<Check className="w-4 h-4 text-white" />
</div>
)}
</div>

<div className="text-center">
<div className="text-sm text-gray-900">{type.name}</div>
<div className="text-xs text-gray-500">от {type.price?.toLocaleString('ru-RU')} ₽</div>
</div>
</Label>
</div>
))}
</div>
</RadioGroup>
</div>

<div className="space-y-3">
<Label className="text-gray-900">Размер</Label>

<div className="grid grid-cols-3 gap-3">
{wreathSizes.map((size) => (
<button
key={size.id}
type="button"
onClick={() => setWreathSize(size.id)}
className={`py-3 px-4 rounded-xl border-2 transition-all ${
wreathSize === size.id
? 'border-green-500 bg-green-50 shadow-md'
: 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
}`}
>
<div className="text-lg text-gray-900">{size.id}</div>
<div className="text-xs text-gray-500">{size.name}</div>
{size.price > 0 && <div className="text-xs text-green-600 mt-1">+{size.price} ₽</div>}
</button>
))}
</div>
</div>

<div className="space-y-3">
<Label htmlFor="wreath-text" className="text-gray-900">
Текст на ленте (опционально)
</Label>

<Input
id="wreath-text"
value={wreathText}
onChange={(e) => setWreathText(e.target.value)}
placeholder="Например: Вечная память"
className="rounded-xl"
maxLength={50}
/>
<p className="text-xs text-gray-500">{wreathText.length}/50 символов</p>
</div>

<div className="space-y-3">
<Label className="text-gray-900">Количество</Label>
<div className="flex items-center gap-3">
<Button
type="button"
variant="outline"
size="icon"
onClick={() => setWreathQuantity(Math.max(1, wreathQuantity - 1))}
className="h-10 w-10 rounded-xl"
>
<Minus className="w-4 h-4" />
</Button>

<div className="flex-1 text-center">
<div className="text-2xl text-gray-900">{wreathQuantity}</div>
<div className="text-xs text-gray-500">шт.</div>
</div>

<Button
type="button"
variant="outline"
size="icon"
onClick={() => setWreathQuantity(wreathQuantity + 1)}
className="h-10 w-10 rounded-xl"
>
<Plus className="w-4 h-4" />
</Button>
</div>
</div>

<div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
<div className="flex items-center justify-between">
<div>
<div className="text-xs text-green-600 mb-1">Стоимость венка</div>
<div className="text-2xl text-green-900">{getWreathPrice().toLocaleString('ru-RU')} ₽</div>
</div>

<svg className="w-12 h-12 text-green-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="9" strokeWidth={2} />
<circle cx="12" cy="12" r="4" strokeWidth={2} />
</svg>
</div>
</div>

<div className="bg-white rounded-2xl p-4 border border-gray-200">
<div className="flex items-center justify-between">
<div>
<div className="text-xs text-gray-500 mb-1">Итого (гроб + венок)</div>
<div className="text-2xl text-gray-900">{getTotalPrice().toLocaleString('ru-RU')} ₽</div>
</div>
<Button type="button" onClick={handleConfirm} className="rounded-xl">
Подтвердить
</Button>
</div>
</div>
</div>
</TabsContent>
</Tabs>
</div>
);
}