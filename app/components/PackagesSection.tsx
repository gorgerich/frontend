'use client';

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
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
  Package as PackageIcon,
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
} from "./Icons";

// Готовые пакеты для захоронения
const PACKAGES_BURIAL = [
  {
    id: "standard",
    name: "Стандарт",
    price: 45000,
    description: "Базовый комплект услуг для достойного прощания",
  },
  {
    id: "comfort",
    name: "Комфорт",
    price: 85000,
    description: "Расширенный набор услуг с улучшенными материалами",
    popular: true,
  },
  {
    id: "premium",
    name: "Премиум",
    price: 150000,
    description: "Полный спектр услуг премиум-класса",
  },
];

// Готовые пакеты для кремации
const PACKAGES_CREMATION = [
  {
    id: "standard",
    name: "Стандарт",
    price: 35000,
    description: "Базовый комплект услуг для кремации",
  },
  {
    id: "comfort",
    name: "Комфорт",
    price: 75000,
    description: "Расширенный набор услуг для кремации",
    popular: true,
  },
  {
    id: "premium",
    name: "Премиум",
    price: 120000,
    description: "Полный спектр услуг премиум-класса",
  },
];

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
}

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
    icon: PackageIcon,
  },
  {
    id: "textile-premium",
    name: "Текстиль премиум",
    price: 7000,
    description: "Покрывало, подушка улучшенные",
    icon: PackageIcon,
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

interface PackagesSectionProps {
  formData: {
   packageType: "" | "basic" | "standard" | "premium" | "custom" | "comfort";
    selectedAdditionalServices: string[];
    serviceType: string;
  };
  onUpdateFormData: (field: string, value: any) => void;
}

export function PackagesSection({
  formData,
  onUpdateFormData,
}: PackagesSectionProps) {
  // Вычисляем корректное значение на основе formData.serviceType
const initialServiceType: "burial" | "cremation" =
  formData.serviceType === "burial" || formData.serviceType === "cremation"
    ? formData.serviceType
    : "burial";

const [ceremonyType, setCeremonyType] = useState<"burial" | "cremation">(
  initialServiceType
);

  const PACKAGES =
    ceremonyType === "burial" ? PACKAGES_BURIAL : PACKAGES_CREMATION;

  const handleSelectPackage = (id: string) => {
    onUpdateFormData("packageType", id);
  };

  const handleToggleService = (id: string) => {
    const current = formData.selectedAdditionalServices || [];
    const isSelected = current.includes(id);
    const next = isSelected
      ? current.filter((s) => s !== id)
      : [...current, id];

    onUpdateFormData("selectedAdditionalServices", next);
    onUpdateFormData("packageType", "custom");
  };

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="packages" className="w-full">
          {/* Переключатель: пакеты / конструктор */}
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

          {/* TAB: Готовые пакеты */}
          <TabsContent value="packages" className="space-y-8">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Выберите подходящий тариф. Позже можно будет
                добавить услуги.
              </p>
            </div>

            {/* Переключатель типа церемонии */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 p-1 bg-white rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setCeremonyType("burial")}
                  className={cn(
                    "rounded-full px-6 py-2 text-sm transition-all",
                    ceremonyType === "burial"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  Захоронение
                </button>
                <button
                  type="button"
                  onClick={() => setCeremonyType("cremation")}
                  className={cn(
                    "rounded-full px-6 py-2 text-sm transition-all",
                    ceremonyType === "cremation"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  Кремация
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-2">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "relative flex flex-col rounded-[2rem] border bg-white shadow-sm transition-all",
                    pkg.popular &&
                      "border-gray-900 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]",
                    formData.packageType === pkg.id &&
                      "ring-2 ring-gray-900 ring-offset-2",
                  )}
                >
                  <CardContent className="p-8 flex flex-col gap-6">
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white shadow-lg">
                          Популярный выбор
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        {pkg.name}
                      </h3>
                      <div className="mb-2 flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                          {pkg.price.toLocaleString("ru-RU")}
                        </span>
                        <span className="text-lg font-light text-gray-400">
                          ₽
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-500">
                        {pkg.description}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={cn(
                        "h-11 w-full rounded-xl text-sm font-medium transition-all",
                        formData.packageType === pkg.id
                          ? "bg-gray-900 text-white shadow-gray-900/30 shadow-lg hover:bg-gray-800"
                          : "bg-white text-gray-900 border border-gray-200 hover:border-gray-900 hover:bg-gray-50",
                      )}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {formData.packageType === pkg.id
                          ? "Выбрано"
                          : "Выбрать тариф"}
                        {formData.packageType === pkg.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: Собрать пакет */}
          <TabsContent value="custom" className="space-y-6">
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-gray-700">
                Выберите дополнительные услуги для индивидуального пакета.{" "}
                Базовая стоимость —{" "}
                <span className="font-medium">25 000 ₽</span>.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {additionalServices.map((service) => {
                const Icon = service.icon;
                const current = formData.selectedAdditionalServices || [];
                const isSelected = current.includes(service.id);

                return (
                  <Card
                    key={service.id}
                    onClick={() => handleToggleService(service.id)}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected
                        ? "ring-2 ring-gray-900 bg-gray-50"
                        : "hover:ring-1 hover:ring-gray-300",
                    )}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
                          isSelected ? "bg-gray-900" : "bg-gray-100",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            isSelected ? "text-white" : "text-gray-600",
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        <div className="mb-2 text-xs text-gray-500">
                          {service.description}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {service.price.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                      <div className="flex-shrink-0 pt-1">
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
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