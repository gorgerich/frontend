'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Minus, Check } from './Icons';

type WoodMaterial = {
  id: string;
  name: string;
  price: number;
  texture: string;
};

type LiningMaterial = {
  id: string;
  name: string;
  price: number;
  texture: string;
};

type HardwareMaterial = {
  id: string;
  name: string;
  price: number;
  metallic: string;
  color: string;
};

interface ConfiguratorOption {
  id: string;
  name: string;
  image: string;
  price?: number;
}

interface UnifiedCoffinConfiguratorProps {
  onConfirm?: (data: any) => void;
}

/** простая картинка вместо ImageWithFallback */
function SimpleImage(props: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt} />
  );
}

/** заглушка 3D-вьюера – аккуратный блок с подписями */
function RealisticCoffinViewer(props: {
  wood: WoodMaterial;
  lining: LiningMaterial;
  hardware: HardwareMaterial;
  showLid: boolean;
}) {
  const { wood, lining, hardware, showLid } = props;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0_0,rgba(96,165,250,0.3),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(129,140,248,0.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <div className="h-24 w-40 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-500 shadow-2xl border border-white/10 flex items-center justify-center">
          <div className="w-32 h-4 rounded-full bg-gradient-to-r from-slate-200/70 to-slate-50/90 shadow-md" />
          {showLid && (
            <div className="absolute -top-5 w-32 h-5 rounded-t-3xl bg-gradient-to-r from-slate-300 to-slate-100 shadow-lg border border-white/40" />
          )}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Визуализация конфигурации
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-200/80">
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            {wood.name}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            {lining.name}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            {hardware.name}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            Крышка: {showLid ? 'закрыта' : 'открыта'}
          </span>
        </div>
      </div>
    </div>
  );
}

/** заглушка CoffinMockup – статичный макет гроб + венок */
function CoffinMockup(props: {
  coffin: ConfiguratorOption;
  wreath: ConfiguratorOption;
  lining: ConfiguratorOption;
  plaque: ConfiguratorOption;
  monument: ConfiguratorOption;
}) {
  const { coffin, wreath } = props;
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-2xl text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0_0,rgba(74,222,128,0.3),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.35),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <div className="relative w-40 h-20 flex items-center justify-center">
          <div className="absolute inset-x-2 bottom-0 h-4 rounded-full bg-gradient-to-r from-slate-800 to-slate-600 shadow-2xl" />
          <div className="absolute inset-x-6 top-2 h-3 rounded-full border border-emerald-300/80 bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-lg" />
        </div>
        <div className="text-xs text-slate-200">
          {coffin.name} + {wreath.name}
        </div>
      </div>
    </div>
  );
}

// ---- данные для конфигуратора ----

const woodTypes: WoodMaterial[] = [
  {
    id: 'pine',
    name: 'Сосна',
    price: 0,
    texture:
      'https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?w=400&auto=format&fit=crop',
  },
  {
    id: 'oak',
    name: 'Дуб',
    price: 15000,
    texture:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&auto=format&fit=crop',
  },
  {
    id: 'elite',
    name: 'Элитное',
    price: 50000,
    texture:
      'https://images.unsplash.com/photo-1616628182507-6f6f0d6823c5?w=400&auto=format&fit=crop',
  },
];

const liningTypes: LiningMaterial[] = [
  {
    id: 'satin-white',
    name: 'Атлас белый',
    price: 0,
    texture:
      'https://images.unsplash.com/photo-1522932467653-e48f79727b6f?w=400&auto=format&fit=crop',
  },
  {
    id: 'silk-cream',
    name: 'Шёлк кремовый',
    price: 4000,
    texture:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?w=400&auto=format&fit=crop',
  },
];

const hardwareTypes: HardwareMaterial[] = [
  {
    id: 'classic',
    name: 'Классическая',
    price: 0,
    metallic:
      'radial-gradient(circle at 0 0, #facc6b, #b45309, #451a03)',
    color: '#facc6b',
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 8000,
    metallic:
      'radial-gradient(circle at 0 0, #e5e7eb, #9ca3af, #020617)',
    color: '#e5e7eb',
  },
];

const coffinOptions: ConfiguratorOption[] = [
  {
    id: 'pine',
    name: 'Сосна',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
    price: 15000,
  },
  {
    id: 'oak',
    name: 'Дуб',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
    price: 35000,
  },
  {
    id: 'elite',
    name: 'Элитное',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
    price: 65000,
  },
];

const wreathOptions: ConfiguratorOption[] = [
  {
    id: 'artificial',
    name: 'Искусственные цветы',
    image:
      'https://images.unsplash.com/photo-1741189127247-3f45b0ca6e53?w=400',
    price: 3500,
  },
  {
    id: 'composition',
    name: 'Живая композиция',
    image:
      'https://images.unsplash.com/photo-1741189127247-3f45b0ca6e53?w=400',
    price: 7500,
  },
];

const liningOptions: ConfiguratorOption[] = [
  {
    id: 'satin-white',
    name: 'Атлас белый',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
  },
  {
    id: 'silk-cream',
    name: 'Шёлк кремовый',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
  },
];

const plaqueOptions: ConfiguratorOption[] = [
  {
    id: 'metal',
    name: 'Металлическая',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
  },
];

const monumentOptions: ConfiguratorOption[] = [
  {
    id: 'granite',
    name: 'Гранит',
    image:
      'https://images.unsplash.com/photo-1718801623795-0762bc858a16?w=400',
  },
];

const wreathSizes = [
  { id: 'S', name: 'Малый', price: 0 },
  { id: 'M', name: 'Средний', price: 1000 },
  { id: 'L', name: 'Большой', price: 2500 },
];

export function UnifiedCoffinConfigurator({
  onConfirm,
}: UnifiedCoffinConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<'coffin' | 'wreath'>('coffin');

  // состояние для реалистичного визуализатора
  const [selectedWood, setSelectedWood] = useState<WoodMaterial>(woodTypes[0]);
  const [selectedLining, setSelectedLining] =
    useState<LiningMaterial>(liningTypes[0]);
  const [selectedHardware, setSelectedHardware] = useState<HardwareMaterial>(
    hardwareTypes[0],
  );
  const [showLid, setShowLid] = useState(true);

  // состояние для гроба (совместимость)
  const [coffinMaterial, setCoffinMaterial] = useState('pine');
  const [coffinQuantity, setCoffinQuantity] = useState(1);

  // состояние для венка
  const [wreathType, setWreathType] = useState('artificial');
  const [wreathSize, setWreathSize] = useState<'S' | 'M' | 'L'>('M');
  const [wreathText, setWreathText] = useState('');
  const [wreathQuantity, setWreathQuantity] = useState(1);

  // ---- helpers ----

  const getCoffinPrice = () => {
    const basePrice = 15000;
    return (
      (basePrice +
        selectedWood.price +
        selectedLining.price +
        selectedHardware.price) *
      coffinQuantity
    );
  };

  const getWreathPrice = () => {
    const type = wreathOptions.find((t) => t.id === wreathType);
    const size = wreathSizes.find((s) => s.id === wreathSize);
    return ((type?.price || 3500) + (size?.price || 0)) * wreathQuantity;
  };

  const getTotalPrice = () => getCoffinPrice() + getWreathPrice();

  const getCurrentCoffin = () =>
    coffinOptions.find((c) => c.id === coffinMaterial) || coffinOptions[0];

  const getCurrentWreath = () =>
    wreathOptions.find((w) => w.id === wreathType) || wreathOptions[0];

  const handleConfirm = () => {
    const data = {
      coffin: {
        wood: selectedWood,
        lining: selectedLining,
        hardware: selectedHardware,
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

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl overflow-hidden">
      {/* header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 mb-4 rounded-xl">
        <h4 className="text-white text-base mb-1">Конфигуратор комплектации</h4>
        <p className="text-gray-300 text-xs">
          Настройте внешний вид и характеристики
        </p>
      </div>

      <Tabs
  defaultValue={activeTab ?? "coffin"}
  value={activeTab}
  onValueChange={(v) => setActiveTab(v as "coffin" | "wreath")}
  className="w-full"
      >
        <div className="bg-white border-b border-gray-200">
          <TabsList className="w-full h-auto p-1 bg-transparent rounded-none justify-start gap-1">
            <TabsTrigger
              value="coffin"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Гроб
            </TabsTrigger>
            <TabsTrigger
              value="wreath"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <circle cx="12" cy="12" r="4" strokeWidth={2} />
              </svg>
              Венок
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB ГРОБ */}

        <TabsContent value="coffin" className="mt-0">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* viewer */}
            <div className="bg-[#1a1c23] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
              <div className="aspect-[16/9] md:aspect-[2/1] relative">
                {activeTab === 'coffin' && (
                  <RealisticCoffinViewer
                    wood={selectedWood}
                    lining={selectedLining}
                    hardware={selectedHardware}
                    showLid={showLid}
                  />
                )}

                {/* toggle lid */}

                <div className="absolute top-4 left-4 flex gap-1 bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg z-10">
                  <button
                    onClick={() => setShowLid(true)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-medium transition-all duration-300 ${
                      showLid
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Закрытый
                  </button>
                  <button
                    onClick={() => setShowLid(false)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-medium transition-all duration-300 ${
                      !showLid
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Открытый
                  </button>
                </div>
              </div>
            </div>

           {/* порода дерева */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                <Label className="text-base font-medium text-gray-900">
                  Порода дерева
                </Label>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Материал корпуса
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {woodTypes.map((wood) => (
                  <button
                    key={wood.id}
                    onClick={() => {
                      setSelectedWood(wood);
                      setCoffinMaterial(wood.id);
                    }}
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${
                      selectedWood.id === wood.id
                        ? 'ring-2 ring-blue-600 ring-offset-2 shadow-xl scale-[1.02]'
                        : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="aspect-[16/9] sm:aspect-[4/3] w-full relative">
                      <SimpleImage
                        src={wood.texture}
                        alt={wood.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                      {selectedWood.id === wood.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-white font-medium text-sm truncate">
                          {wood.name}
                        </div>
                        <div className="text-white/80 text-xs font-light">
                          {wood.price === 0
                            ? 'Включено'
                            : `${wood.price.toLocaleString('ru-RU')} ₽`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* внутренняя отделка */}

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                <Label className="text-base font-medium text-gray-900">
                  Внутренняя отделка
                </Label>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Ткань и цвет
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {liningTypes.map((lining) => (
                  <button
                    key={lining.id}
                    onClick={() => setSelectedLining(lining)}
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${
                      selectedLining.id === lining.id
                        ? 'ring-2 ring-purple-600 ring-offset-2 shadow-xl scale-[1.02]'
                        : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="aspect-[16/9] sm:aspect-[4/3] w-full relative">
                      <SimpleImage
                        src={lining.texture}
                        alt={lining.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                      {selectedLining.id === lining.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}

                      <div className="absolute bottom-0 inset-x-0 p-3 bg-white/90 backdrop-blur-sm border-t border-white/50">
                        <div className="text-gray-900 font-medium text-sm truncate">
                          {lining.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {lining.price === 0
                            ? 'Включено'
                            : `${lining.price.toLocaleString('ru-RU')} ₽`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* фурнитура */}

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                <Label className="text-base font-medium text-gray-900">
                  Фурнитура
                </Label>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Ручки и декор
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {hardwareTypes.map((hardware) => (
                  <button
                    key={hardware.id}
                    onClick={() => setSelectedHardware(hardware)}
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left bg-white ${
                      selectedHardware.id === hardware.id
                        ? 'ring-2 ring-amber-500 ring-offset-2 shadow-xl scale-[1.02]'
                        : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    <div
                      className="aspect-[16/9] sm:aspect-[2/1] w-full relative flex items-center justify-center overflow-hidden"
                      style={{ background: hardware.metallic }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />

                      <div
                        className="relative w-16 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: hardware.color }}
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-black/10" />
                        <div
                          className="absolute -left-1 -top-1 w-2 h-5 rounded-sm shadow-md"
                          style={{ backgroundColor: hardware.color }}
                        />
                        <div
                          className="absolute -right-1 -top-1 w-2 h-5 rounded-sm shadow-md"
                          style={{ backgroundColor: hardware.color }}
                        />
                      </div>

                      {selectedHardware.id === hardware.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg z-10">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <div className="text-gray-900 font-medium text-sm truncate">
                        {hardware.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {hardware.price === 0
                          ? 'Включено'
                          : `+${hardware.price.toLocaleString('ru-RU')} ₽`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* количество гробов */}

            <div className="space-y-3">
              <Label className="text-gray-900">Количество</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCoffinQuantity(Math.max(1, coffinQuantity - 1))
                  }
                  className="h-10 w-10 rounded-xl"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-2xl text-gray-900">{coffinQuantity}</div>
                  <div className="text-xs text-gray-500">шт.</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCoffinQuantity(coffinQuantity + 1)}
                  className="h-10 w-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* блок цены внутри таба */}

            <div className="mt-8 p-4 md:p-6 rounded-2xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                  <div className="text-blue-200 text-sm mb-1 font-medium">
                    Итоговая стоимость комплектации
                  </div>
                  <div className="text-3xl font-light tracking-tight">
                    {getCoffinPrice().toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-slate-400 text-xs mt-2 flex flex-wrap gap-2">
                    <span>{selectedWood.name}</span>
                    <span>•</span>
                    <span>{selectedLining.name}</span>
                    <span>•</span>
                    <span>{selectedHardware.name}</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 self-end sm:self-center">
                  <svg
                    className="w-6 h-6 text-blue-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB ВЕНОК */}

        <TabsContent value="wreath" className="mt-0">
          <div className="p-6 space-y-6">
            {/* визуализация */}

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 shadow-inner">
              <div className="aspect-[4/3]">
                <CoffinMockup
                  coffin={getCurrentCoffin()}
                  wreath={getCurrentWreath()}
                  lining={liningOptions[0]}
                  plaque={plaqueOptions[0]}
                  monument={monumentOptions[0]}
                />
              </div>
            </div>

           {/* ВЕНКИ / КОМПОЗИЦИИ */}
{/* венок */}
<div className="space-y-3">
  <Label className="text-gray-900">Венок</Label>

  <RadioGroup
  value={wreathType}
  onValueChange={(value) => setWreathType(value)}
  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
  >
    {wreathOptions.map((type) => (
      <Label
        key={type.id}
        htmlFor={`wreath-${type.id}`}
        className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-gray-900 transition-all"
      >
        <RadioGroupItem
          value={String(type.id)}
          id={`wreath-${type.id}`}
          className="peer sr-only"
        />

        <div className="relative w-full">
          <SimpleImage
            src={type.image}
            alt={type.name}
            className="w-full h-24 object-cover rounded-lg"
          />
          {wreathType === type.id && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">{type.name}</div>
<div className="text-xs text-gray-500">
  от {(type.price ?? 0).toLocaleString("ru-RU")} ₽
</div>
      </Label>
    ))}
  </RadioGroup>
</div>

            {/* размер */}

            <div className="space-y-3">
              <Label className="text-gray-900">Размер</Label>
              <div className="grid grid-cols-3 gap-3">
                {wreathSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() =>
                      setWreathSize(size.id as 'S' | 'M' | 'L')
                    }
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      wreathSize === size.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-lg text-gray-900">
                      {size.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {size.name}
                    </div>
                    {size.price > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        +{size.price} ₽
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* текст на ленте */}

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
              <p className="text-xs text-gray-500">
                {wreathText.length}/50 символов
              </p>
            </div>

            {/* количество венков */}

            <div className="space-y-3">
              <Label className="text-gray-900">Количество</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setWreathQuantity(Math.max(1, wreathQuantity - 1))
                  }
                  className="h-10 w-10 rounded-xl"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-2xl text-gray-900">
                    {wreathQuantity}
                  </div>
                  <div className="text-xs text-gray-500">шт.</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setWreathQuantity(wreathQuantity + 1)
                  }
                  className="h-10 w-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* цена венка */}

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-green-600 mb-1">
                    Стоимость венка
                  </div>
                  <div className="text-2xl text-green-900">
                    {getWreathPrice().toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <svg
                  className="w-12 h-12 text-green-400 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  <circle cx="12" cy="12" r="4" strokeWidth={2} />
                </svg>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* общий футер */}

      <div className="bg-[#111318] px-5 py-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-6">
          <div className="text-center sm:text-left">
            <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Итого к оплате
            </div>
            <div className="text-3xl sm:text-4xl text-white font-light tracking-tight tabular-nums">
              {getTotalPrice().toLocaleString('ru-RU')}{" "}
              <span className="text-xl text-gray-500 font-normal">₽</span>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              Комплектация
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span>Гроб: {coffinQuantity}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Венок: {wreathQuantity}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 sm:py-6 h-auto rounded-xl shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group"
        >
          <span className="flex flex-col items-center gap-1">
            <span className="text-base sm:text-lg font-medium flex items-center gap-2">
              <Check className="w-5 h-5" />
              Подтвердить конфигурацию
            </span>
            <span className="text-[10px] sm:text-xs text-blue-200/80 font-normal">
              Переход к оформлению заказа
            </span>
          </span>
        </Button>

        <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-4 font-medium">
          Вы сможете уточнить детали заказа с менеджером после отправки заявки
        </p>
      </div>
    </div>
  );
}