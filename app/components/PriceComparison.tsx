import { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Check, X } from './Icons';
import { cn } from './ui/utils';

interface Feature {
  name: string;
  standard: boolean | string;
  comfort: boolean | string;
  premium: boolean | string;
  category?: string;
}

const comparisonFeatures: Feature[] = [
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

export function PriceComparison() {
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [isTableView, setIsTableView] = useState(false);

  const filteredFeatures = showDifferencesOnly
    ? comparisonFeatures.filter(
        (feature) =>
          !(
            feature.standard === feature.comfort &&
            feature.comfort === feature.premium
          )
      )
    : comparisonFeatures;

  const renderValue = (value: boolean | string) => {
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
  }, {} as Record<string, Feature[]>);

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4">Сравнение тарифов</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Детальное сравнение всех включенных услуг и возможностей
          </p>
          
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="differences"
                checked={showDifferencesOnly}
                onCheckedChange={(checked) => setShowDifferencesOnly(checked as boolean)}
              />
              <label
                htmlFor="differences"
                className="text-sm cursor-pointer select-none"
              >
                Показать только отличия
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-lg">
          <div className="min-w-[640px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 sm:p-4 bg-gray-50 first:rounded-tl-3xl min-w-[140px]">Услуга</th>
                  <th className="text-center p-3 sm:p-4 bg-gray-50 min-w-[110px]">
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base">Стандарт</div>
                      <div className="text-xs sm:text-sm text-gray-600">45 000 ₽</div>
                    </div>
                  </th>
                  <th className="text-center p-3 sm:p-4 bg-gray-100 min-w-[110px]">
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base">Комфорт</div>
                      <div className="text-xs sm:text-sm text-gray-600">85 000 ₽</div>
                    </div>
                  </th>
                  <th className="text-center p-3 sm:p-4 bg-gray-50 last:rounded-tr-3xl min-w-[110px]">
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base">Премиум</div>
                      <div className="text-xs sm:text-sm text-gray-600">150 000 ₽</div>
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
                          <td className={cn("p-3 sm:p-4 text-xs sm:text-sm", isLastInTable && "rounded-bl-3xl")}>{feature.name}</td>
                          <td className="p-3 sm:p-4 text-center">{renderValue(feature.standard)}</td>
                          <td className="p-3 sm:p-4 text-center bg-gray-50/50">{renderValue(feature.comfort)}</td>
                          <td className={cn("p-3 sm:p-4 text-center", isLastInTable && "rounded-br-3xl")}>{renderValue(feature.premium)}</td>
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