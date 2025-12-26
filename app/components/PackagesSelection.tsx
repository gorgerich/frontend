import React from "react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { Check } from "./Icons";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 px-2 items-start">
      {packages.map((pkg) => {
        const isSelected = selectedPackageId === pkg.id;
        return (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg)}
            className={cn(
              "group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 cursor-pointer bg-white",
              isSelected
                ? "border-gray-900 shadow-2xl scale-[1.02] z-10"
                : "border-gray-100 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1"
            )}
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg ring-4 ring-white">
                Популярный выбор
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">
                {pkg.name}
              </h3>
              <div className="flex items-start justify-center gap-1 text-gray-900">
                <span className="text-5xl font-light tracking-tighter">
                  {pkg.price.toLocaleString("ru-RU")}
                </span>
                <span className="text-xl font-light mt-1">₽</span>
              </div>
              <p className="text-sm text-gray-400 mt-3 font-medium">{pkg.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-sm group/item">
                  <div
                    className={cn(
                      "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                      isSelected
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-400 group-hover/item:text-gray-600"
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-gray-600 font-medium leading-tight pt-0.5">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className={cn(
                "w-full rounded-2xl h-12 text-sm font-semibold tracking-wide transition-all duration-300",
                isSelected
                  ? "bg-gray-900 text-white shadow-lg hover:bg-gray-800"
                  : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100"
              )}
            >
              {isSelected ? "Выбран" : "Выбрать"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}