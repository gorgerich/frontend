import { useState, Fragment } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import {
  Check,
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
  Music,
  Camera,
  Church,
  Cross,
  FileText,
  Utensils,
  Landmark,
  Car,
  X,
  ChevronDown
} from './Icons';
import { UnifiedCoffinConfigurator } from './UnifiedCoffinConfigurator';

// ---- типы -----

type PackageType =
  | ''
  | 'basic'
  | 'standard'
  | 'comfort'
  | 'premium'
  | 'custom';

// Дополнительные услуги для конструктора
interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
}

// Данные для сравнения тарифов
interface ComparisonFeature {
  name: string;
  standard: boolean | string;
  comfort: boolean | string;
  premium: boolean | string;
  category?: string;
}

interface PackagesSectionProps {
  formData: {
    packageType: PackageType;
    selectedAdditionalServices: string[];
  };
  onUpdateFormData: (field: string, value: any) => void;
}

// Готовые пакеты для захоронения
const PACKAGES_BURIAL = [
  {
    id: 'standard',
    name: 'Стандарт',
    price: 45000,
    description: 'Базовый комплект услуг для достойного прощания',
    features: [
      'Оформление документов',
      'Подтверждение места захоронения',
      'Хранение и базовая подготовка тела',
      'Гроб из массива сосны + подушка/покрывало',
      'Транспортировка покойного и перенос',
      'Кладбищенские работы',
    ]
  },
  {
    id: 'comfort',
    name: 'Комфорт',
    price: 85000,
    description: 'Расширенный набор услуг с улучшенными материалами',
    features: [
      'Оформление документов',
      'Подтверждение места захоронения',
      'Хранение и подготовка тела',
      'Гроб из массива дуба + подушка/покрывало',
      'Транспортировка покойного и перенос',
      'Кладбищенские работы',
      'Временная табличка с фотографией',
      'Зал прощания на 2 часа',
      'Поминальный обед (до 20 человек)',
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 150000,
    description: 'Полный спектр услуг премиум класса',
    features: [
      'Оформление документов',
      'Подтверждение места захоронения',
      'Хранение и подготовка тела',
      'Гроб элитный с отделкой + подушка и покрывало',
      'Транспортировка покойного и перенос (6 человек)',
      'Кладбищенские работы',
      'Композиция из живых цветов',
      'Ритуальные принадлежности премиум',
      'Ритуальный зал на 4 часа',
      'Поминальный обед (до 40 человек)',
      'Памятник из гранита',
      'Индивидуальный координатор',
    ]
  }
];

// Готовые пакеты для кремации
const PACKAGES_CREMATION = [
  {
    id: 'standard',
    name: 'Стандарт',
    price: 35000,
    description: 'Базовый комплект услуг для кремации',
    features: [
      'Оформление документов',
      'Бронирование места в колумбарии',
      'Хранение и базовая подготовка тела',
      'Гроб-контейнер для кремации',
      'Транспортировка до крематория',
      'Кремация + урна стандартная',
    ]
  },
  {
    id: 'comfort',
    name: 'Комфорт',
    price: 75000,
    description: 'Расширенный набор услуг для кремации',
    features: [
      'Оформление документов',
      'Бронирование места в колумбарии',
      'Хранение и подготовка тела',
      'Гроб для прощания + гроб-контейнер',
      'Транспортировка до крематория',
      'Кремация',
      'Урна керамическая',
      'Зал прощания на 2 часа',
      'Поминальный обед (до 20 человек)',
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 120000,
    description: 'Полный спектр услуг премиум класса',
    features: [
      'Оформление документов',
      'Бронирование места в колумбарии премиум',
      'Хранение и подготовка тела',
      'Гроб элитный для прощания + контейнер',
      'Транспортировка покойного',
      'Кремация',
      'Урна премиум (мрамор/гранит)',
      'Композиция из живых цветов',
      'Ритуальные принадлежности премиум',
      'Ритуальный зал на 4 часа',
      'Поминальный обед (до 40 человек)',
      'Индивидуальный координатор',
    ]
  }
];

const comparisonFeaturesBurial: ComparisonFeature[] = [
  { name: 'Оформление документов', standard: true, comfort: true, premium: true, category: 'Базовые услуги' },
  { name: 'Транспортировка', standard: true, comfort: true, premium: true, category: 'Базовые услуги' },
  { name: 'Копка могилы', standard: true, comfort: true, premium: true, category: 'Базовые услуги' },
  { name: 'Ритуальные принадлежности', standard: 'Базовые', comfort: 'Расширенные', premium: 'Премиум', category: 'Базовые услуги' },
  
  { name: 'Материал гроба', standard: 'Сосна', comfort: 'Дуб', premium: 'Элитное дерево', category: 'Атрибутика' },
  { name: 'Венок', standard: 'Искусственные цветы', comfort: 'Живые цветы', premium: 'Композиция премиум', category: 'Атрибутика' },
  { name: 'Внутренняя отделка', standard: 'Базовая', comfort: 'Бархат', premium: 'Премиум шелк', category: 'Атрибутика' },
  { name: 'Табличка', standard: false, comfort: 'С фотографией', premium: 'С фотографией', category: 'Атрибутика' },
  { name: 'Памятник', standard: false, comfort: false, premium: 'Гранит', category: 'Атрибутика' },
  
  { name: 'Ритуальный зал', standard: false, comfort: '2 часа', premium: '4 часа', category: 'Дополнительно' },
  { name: 'Поминальный обед', standard: false, comfort: 'До 20 человек', premium: 'До 40 человек', category: 'Дополнительно' },
  { name: 'Фото-видеосъемка', standard: false, comfort: false, premium: true, category: 'Дополнительно' },
  { name: 'Координатор', standard: false, comfort: false, premium: true, category: 'Дополнительно' },
];

const comparisonFeaturesCremation: ComparisonFeature[] = [
  { name: 'Оформление документов', standard: true, comfort: true, premium: true, category: 'Базовые услуги' },
  { name: 'Транспортировка до крематория', standard: true, comfort: true, premium: true, category: 'Базовые услуги' },
  { name: 'Кремация', standard: true, comfort: true, premium: true, category: 'Базовые услуги' },
  { name: 'Бронирование колумбария', standard: true, comfort: true, premium: 'Премиум', category: 'Базовые услуги' },
  { name: 'Ритуальные принадлежности', standard: 'Базовые', comfort: 'Расширенные', premium: 'Премиум', category: 'Базовые услуги' },
  
  { name: 'Гроб для прощания', standard: false, comfort: 'Стандарт', premium: 'Элитный', category: 'Атрибутика' },
  { name: 'Гроб-контейнер', standard: true, comfort: true, premium: true, category: 'Атрибутика' },
  { name: 'Урна', standard: 'Стандартная', comfort: 'Керамическая', premium: 'Мрамор/гранит', category: 'Атрибутика' },
  { name: 'Венок', standard: 'Искусственные цветы', comfort: 'Живые цветы', premium: 'Композиция премиум', category: 'Атрибутика' },
  
  { name: 'Ритуальный зал', standard: false, comfort: '2 часа', premium: '4 часа', category: 'Дополнительно' },
  { name: 'Поминальный обед', standard: false, comfort: 'До 20 человек', premium: 'До 40 человек', category: 'Дополнительно' },
  { name: 'Фото-видеосъемка', standard: false, comfort: false, premium: true, category: 'Дополнительно' },
  { name: 'Координатор', standard: false, comfort: false, premium: true, category: 'Дополнительно' },
];

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
    icon: Package,
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

export function PackagesSection({ formData, onUpdateFormData }: PackagesSectionProps) {
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [ceremonyType, setCeremonyType] = useState<'burial' | 'cremation'>('burial');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Выбираем нужный набор пакетов в зависимости от типа церемонии
  const PACKAGES = ceremonyType === 'burial' ? PACKAGES_BURIAL : PACKAGES_CREMATION;
  const comparisonFeatures = ceremonyType === 'burial' ? comparisonFeaturesBurial : comparisonFeaturesCremation;

  const filteredFeatures = showDifferencesOnly
    ? comparisonFeatures.filter(
        (feature) =>
          !(
            feature.standard === feature.comfort &&
            feature.comfort === feature.premium
          )
      )
    : comparisonFeatures;

  const renderComparisonValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-600 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    const category = feature.category || 'Прочее';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, ComparisonFeature[]>);

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="packages" className="w-full">
          {/* Переключатель: Готовые пакеты / Собрать пакет */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 p-1 bg-white rounded-full border border-gray-200">
              <TabsList className="bg-transparent p-0 h-auto gap-0">
                <TabsTrigger 
                  value="packages"
                  className="rounded-full px-8 py-3 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                >
                  Готовые пакеты
                </TabsTrigger>
                <TabsTrigger 
                  value="custom"
                  className="rounded-full px-8 py-3 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                >
                  Собрать пакет
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="packages" className="space-y-8">
            {/* Заголовок */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Выберите подходящий тариф
              </p>
            </div>

            {/* Переключатели типа церемонии и вида */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 p-1 bg-white rounded-full border border-gray-200">
                <button
                  onClick={() => setCeremonyType('burial')}
                  className={cn(
                    'rounded-full px-6 py-2 transition-all text-sm',
                    ceremonyType === 'burial'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  Захоронение
                </button>
                <button
                  onClick={() => setCeremonyType('cremation')}
                  className={cn(
                    'rounded-full px-6 py-2 transition-all text-sm',
                    ceremonyType === 'cremation'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  Кремация
                </button>
              </div>

              <div className="inline-flex items-center gap-2 p-1 bg-white rounded-full border border-gray-200">
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'rounded-full px-6 py-2 transition-all text-sm flex items-center gap-2',
                    viewMode === 'cards'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Package className="h-4 w-4" />
                  Карточки
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'rounded-full px-6 py-2 transition-all text-sm flex items-center gap-2',
                    viewMode === 'table'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Таблица
                </button>
              </div>
            </div>

            {/* Карточки тарифов или таблица */}
            {viewMode === 'cards' ? (
              <>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-2">
                  {PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={cn(
                        'relative flex flex-col bg-white rounded-[2rem] transition-all duration-500',
                        pkg.popular
                          ? 'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border-2 border-gray-900 scale-[1.02] z-10'
                          : 'shadow-[0_10px_30px_-12px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-gray-200 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1',
                        selectedPackage === pkg.id && showConfigurator && 'ring-2 ring-gray-900 ring-offset-2 col-span-3 md:col-span-3 scale-100 z-20'
                      )}
                    >
                      {/* Содержимое карточки */}
                      <div className={cn(
                        "transition-all duration-500",
                        selectedPackage === pkg.id && showConfigurator 
                          ? "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 p-4 md:p-8" 
                          : "p-8 flex-1 flex flex-col"
                      )}>
                        {pkg.popular && !showConfigurator && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                              Популярный выбор
                            </div>
                          </div>
                        )}

                        {/* Левая часть (информация о тарифе) - при раскрытии становится боковой панелью */}
                        <div className={cn(
                          "flex flex-col transition-all duration-500 min-w-0",
                          selectedPackage === pkg.id && showConfigurator 
                            ? "md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8" 
                            : "flex-1"
                        )}>
                          <div className="text-center mb-4 md:mb-8">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                            <div className="flex items-baseline justify-center gap-1 mb-2 md:mb-4">
                              <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                                {pkg.price.toLocaleString('ru-RU')}
                              </span>
                              <span className="text-lg md:text-xl text-gray-400 font-light">₽</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed px-2 md:px-4">{pkg.description}</p>
                          </div>

                          <div className={cn(
                            "space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1",
                            selectedPackage === pkg.id && showConfigurator ? "hidden md:block" : ""
                          )}>
                            {pkg.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-3 group">
                                <div className={cn(
                                  "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                  pkg.popular ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                )}>
                                  <Check className="h-3 w-3" />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-snug">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => {
                              if (selectedPackage === pkg.id && showConfigurator) {
                                setShowConfigurator(false);
                                setSelectedPackage(null);
                              } else {
                                setSelectedPackage(pkg.id);
                                onUpdateFormData('packageType', pkg.id);
                                setShowConfigurator(true);
                              }
                            }}
                            className={cn(
                              'w-full h-12 rounded-xl text-sm font-medium transition-all duration-300',
                              formData.packageType === pkg.id || (selectedPackage === pkg.id && showConfigurator)
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-gray-900/30'
                                : pkg.popular
                                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-gray-900/30'
                                  : 'bg-white border-2 border-gray-100 text-gray-900 hover:border-gray-900 hover:bg-gray-50'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {selectedPackage === pkg.id && showConfigurator 
                                ? 'Свернуть' 
                                : formData.packageType === pkg.id 
                                  ? 'Выбрано' 
                                  : 'Выбрать тариф'
                              }
                              <ChevronDown className={cn(
                                'h-4 w-4 transition-transform duration-300', 
                                selectedPackage === pkg.id && showConfigurator && 'rotate-180'
                              )} />
                            </span>
                          </Button>
                        </div>

                        {/* Правая часть (конфигуратор) - видна только при раскрытии */}
                        {selectedPackage === pkg.id && showConfigurator && (
                          <div className="md:col-span-8 lg:col-span-9 animate-in fade-in zoom-in-95 duration-500 min-w-0 overflow-x-hidden">
                            <UnifiedCoffinConfigurator
                              onConfirm={(data) => {
                                console.log('Конфигурация подтверждена:', data);
                                setShowConfigurator(false);
                                setSelectedPackage(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="mb-2">Сравнение тарифов</h3>
                      <p className="text-sm text-gray-600">Детальное сравнение всех включенных услуг</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="differences-table"
                        checked={showDifferencesOnly}
                        onCheckedChange={(checked) => setShowDifferencesOnly(checked as boolean)}
                      />
                      <label
                        htmlFor="differences-table"
                        className="text-sm cursor-pointer select-none"
                      >
                        Только отличия
                      </label>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <div className="min-w-[640px]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left p-3 sm:p-4 bg-gray-50 first:rounded-tl-2xl min-w-[140px]">Услуга</th>
                            <th className="text-center p-3 sm:p-4 bg-gray-50 min-w-[110px]">
                              <div className="space-y-1">
                                <div className="text-sm sm:text-base">Стандарт</div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {PACKAGES[0].price.toLocaleString('ru-RU')} ₽
                                </div>
                              </div>
                            </th>
                            <th className="text-center p-3 sm:p-4 bg-gray-100 min-w-[110px]">
                              <div className="space-y-1">
                                <div className="text-sm sm:text-base">Комфорт</div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {PACKAGES[1].price.toLocaleString('ru-RU')} ₽
                                </div>
                              </div>
                            </th>
                            <th className="text-center p-3 sm:p-4 bg-gray-50 last:rounded-tr-2xl min-w-[110px]">
                              <div className="space-y-1">
                                <div className="text-sm sm:text-base">Премиум</div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {PACKAGES[2].price.toLocaleString('ru-RU')} ₽
                                </div>
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
                                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                                      isLastInTable && "border-b-0"
                                    )}
                                  >
                                    <td className={cn("p-3 sm:p-4 text-xs sm:text-sm", isLastInTable && "rounded-bl-2xl")}>{feature.name}</td>
                                    <td className="p-3 sm:p-4 text-center">{renderComparisonValue(feature.standard)}</td>
                                    <td className="p-3 sm:p-4 text-center bg-gray-50/50">{renderComparisonValue(feature.comfort)}</td>
                                    <td className={cn("p-3 sm:p-4 text-center", isLastInTable && "rounded-br-2xl")}>{renderComparisonValue(feature.premium)}</td>
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

                {/* Кнопки выбора тарифа под таблицей */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-2">
                  {PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={cn(
                        'relative flex flex-col bg-white rounded-[2rem] transition-all duration-500',
                        pkg.popular
                          ? 'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border-2 border-gray-900 scale-[1.02] z-10'
                          : 'shadow-[0_10px_30px_-12px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-gray-200 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1',
                        selectedPackage === pkg.id && showConfigurator && 'ring-2 ring-gray-900 ring-offset-2 col-span-1 md:col-span-3 scale-100 z-20'
                      )}
                    >
                      <div className={cn(
                        "transition-all duration-500",
                        selectedPackage === pkg.id && showConfigurator 
                          ? "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 p-4 md:p-8" 
                          : "p-6 flex-1 flex flex-col"
                      )}>
                        {selectedPackage === pkg.id && showConfigurator ? (
                          <>
                            {/* Левая часть (информация) */}
                            <div className="flex flex-col transition-all duration-500 md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8 min-w-0">
                              <div className="text-center mb-4 md:mb-8">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                                <div className="flex items-baseline justify-center gap-1 mb-2 md:mb-4">
                                  <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                                    {pkg.price.toLocaleString('ru-RU')}
                                  </span>
                                  <span className="text-lg md:text-xl text-gray-400 font-light">₽</span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed px-2 md:px-4">{pkg.description}</p>
                              </div>
                              
                              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 hidden md:block">
                                {pkg.features.map((feature, index) => (
                                  <div key={index} className="flex items-start gap-3 group">
                                    <div className={cn(
                                      "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                      pkg.popular ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                    )}>
                                      <Check className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-snug">
                                      {feature}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <Button
                                onClick={() => {
                                  setShowConfigurator(false);
                                  setSelectedPackage(null);
                                }}
                                className="w-full h-12 rounded-xl text-sm font-medium bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-gray-900/30 transition-all duration-300"
                              >
                                <span className="flex items-center gap-2">
                                  Свернуть
                                  <ChevronDown className="h-4 w-4 rotate-180" />
                                </span>
                              </Button>
                            </div>

                            {/* Правая часть (конфигуратор) */}
                            <div className="md:col-span-8 lg:col-span-9 animate-in fade-in zoom-in-95 duration-500 min-w-0 overflow-x-hidden">
                              <UnifiedCoffinConfigurator
                                onConfirm={(data) => {
                                  console.log('Конфигурация подтверждена:', data);
                                  setShowConfigurator(false);
                                  setSelectedPackage(null);
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Свернутая часть (компактная) */}
                            <div className="text-center mb-4 flex-1">
                               <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                  {pkg.price.toLocaleString('ru-RU')}
                                </span>
                                <span className="text-lg text-gray-400 font-light">₽</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedPackage(pkg.id);
                                onUpdateFormData('packageType', pkg.id);
                                setShowConfigurator(true);
                              }}
                              className={cn(
                                'w-full h-12 rounded-xl text-sm font-medium transition-all duration-300',
                                formData.packageType === pkg.id
                                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800'
                                  : 'bg-white border-2 border-gray-100 text-gray-900 hover:border-gray-900 hover:bg-gray-50'
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {formData.packageType === pkg.id ? 'Выбрано' : 'Выбрать'}
                              </span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <p className="text-gray-700">
                Выберите дополнительные услуги для индивидуального пакета. 
                Базовая стоимость — <span className="font-medium">25 000 ₽</span>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {additionalServices.map((service) => {
                const Icon = service.icon;
                const currentServices = formData.selectedAdditionalServices || [];
                const isSelected = currentServices.includes(service.id);
                
                return (
                  <Card
                    key={service.id}
                    onClick={() => {
                      const newServices = isSelected
                        ? currentServices.filter(id => id !== service.id)
                        : [...currentServices, service.id];
                      onUpdateFormData('selectedAdditionalServices', newServices);
                      onUpdateFormData('packageType', 'custom');
                    }}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected
                        ? 'ring-2 ring-gray-900 bg-gray-50'
                        : 'hover:ring-1 hover:ring-gray-300'
                    )}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-gray-900' : 'bg-gray-100'
                      )}>
                        <Icon className={cn('h-6 w-6', isSelected ? 'text-white' : 'text-gray-600')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">{service.name}</div>
                        <div className="text-xs text-gray-500 mb-2">{service.description}</div>
                        <div className="text-gray-900">{service.price.toLocaleString('ru-RU')} ₽</div>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
