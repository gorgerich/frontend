"use client";

import React, { useEffect, useState } from "react";
import {
  MOSCOW_CEMETERIES,
  MO_CEMETERIES,
  ADDITIONAL_SERVICES,
  PACKAGES,
} from "./calculationUtils";

type CemeteryCategory = "standard" | "comfort" | "premium";

interface StepperWorkflowProps {
  formData: any;
  onUpdateFormData: (field: string, value: any) => void;
  onStepChange?: (step: number) => void;
  onCemeteryCategoryChange?: (category: CemeteryCategory) => void;
}

const steps = [
  { id: "format", label: "Формат", description: "Тип церемонии и зал" },
  { id: "logistics", label: "Логистика", description: "Место и транспорт" },
  { id: "attributes", label: "Атрибутика", description: "Пакеты и набор" },
  { id: "documents", label: "Данные", description: "Информация и согласие" },
  { id: "confirmation", label: "Итог", description: "Проверка и финал" },
];

export function StepperWorkflow({
  formData,
  onUpdateFormData,
  onStepChange,
  onCemeteryCategoryChange,
}: StepperWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<CemeteryCategory>("standard");
  const [consentError, setConsentError] = useState(false);

  // уведомляем родителя о смене шага
  useEffect(() => {
    if (onStepChange) onStepChange(currentStep);
  }, [currentStep, onStepChange]);

  // уведомляем родителя о смене категории кладбища
  useEffect(() => {
    if (onCemeteryCategoryChange) {
      onCemeteryCategoryChange(selectedCemeteryCategory);
    }
  }, [selectedCemeteryCategory, onCemeteryCategoryChange]);

  const handleNext = () => {
    // проверка согласия на шаге "Документы"
    if (currentStep === 3 && !formData.dataConsent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToStep = (index: number) => {
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // выбор/снятие доп. услуги
  const toggleAdditionalService = (id: string) => {
    const current = formData.selectedAdditionalServices || [];
    const exists = current.includes(id);
    const next = exists
      ? current.filter((s: string) => s !== id)
      : [...current, id];
    onUpdateFormData("selectedAdditionalServices", next);
  };

  const allCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];

  // === Содержимое шагов ===

  const renderFormatStep = () => (
    <div className="space-y-6">
      {/* Тип услуги: захоронение / кремация */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onUpdateFormData("serviceType", "burial")}
          className={
            "rounded-2xl border px-4 py-3 text-left text-sm transition " +
            (formData.serviceType === "burial"
              ? "border-neutral-900 bg-white shadow-sm"
              : "border-neutral-200 bg-white/50 hover:border-neutral-400")
          }
        >
          <div className="font-medium text-neutral-900">Захоронение</div>
          <div className="mt-1 text-xs text-neutral-600">
            Традиционное погребение в землю
          </div>
        </button>

        <button
          type="button"
          onClick={() => onUpdateFormData("serviceType", "cremation")}
          className={
            "rounded-2xl border px-4 py-3 text-left text-sm transition " +
            (formData.serviceType === "cremation"
              ? "border-neutral-900 bg-white shadow-sm"
              : "border-neutral-200 bg-white/50 hover:border-neutral-400")
          }
        >
          <div className="font-medium text-neutral-900">Кремация</div>
          <div className="mt-1 text-xs text-neutral-600">
            С последующей выдачей урны
          </div>
        </button>
      </div>

      {/* Зал прощания */}
      <div className="rounded-2xl border bg-white/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-neutral-900">
              Зал прощания
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              Церемония прощания с родными и друзьями
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-xs text-neutral-600">Нет</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900"
              checked={formData.hasHall}
              onChange={(e) => onUpdateFormData("hasHall", e.target.checked)}
            />
            <span className="text-xs text-neutral-900">Да</span>
          </label>
        </div>

        {!formData.hasHall && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Без зала — только технологическая кремация или захоронение без
            отдельной церемонии. Можно попрощаться в зале морга.
          </p>
        )}
      </div>

      {/* Тип церемонии и длительность — только если есть зал */}
      {formData.hasHall && (
        <>
          {/* Тип церемонии */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-neutral-900">
              Тип церемонии
            </div>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white/70 p-3 text-sm">
                <input
                  type="radio"
                  name="ceremonyType"
                  value="civil"
                  checked={formData.ceremonyType === "civil"}
                  onChange={() => onUpdateFormData("ceremonyType", "civil")}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <div className="text-neutral-900">Светская</div>
                  <div className="mt-1 text-xs text-neutral-600">
                    Без религиозных обрядов, с нейтральными текстами и музыкой
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white/70 p-3 text-sm">
                <input
                  type="radio"
                  name="ceremonyType"
                  value="religious"
                  checked={formData.ceremonyType === "religious"}
                  onChange={() => onUpdateFormData("ceremonyType", "religious")}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <div className="text-neutral-900">
                    Религиозная <span className="text-xs text-neutral-500">+15 000 ₽</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">
                    С участием священнослужителя в выбранной конфессии
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white/70 p-3 text-sm">
                <input
                  type="radio"
                  name="ceremonyType"
                  value="combined"
                  checked={formData.ceremonyType === "combined"}
                  onChange={() => onUpdateFormData("ceremonyType", "combined")}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <div className="text-neutral-900">
                    Комбинированная{" "}
                    <span className="text-xs text-neutral-500">+20 000 ₽</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">
                    Светская и религиозная части в одном сценарии
                  </div>
                </div>
              </label>
            </div>

            {formData.ceremonyType === "religious" && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-neutral-700">
                  Конфессия (по желанию)
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
                  placeholder="Православная, мусульманская, иудейская и др."
                  value={formData.confession || ""}
                  onChange={(e) =>
                    onUpdateFormData("confession", e.target.value)
                  }
                />
              </div>
            )}

            {formData.ceremonyType === "combined" && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-neutral-700">
                  Последовательность частей
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
                  value={formData.ceremonyOrder || "civil-first"}
                  onChange={(e) =>
                    onUpdateFormData("ceremonyOrder", e.target.value)
                  }
                >
                  <option value="civil-first">Сначала светская, затем религиозная</option>
                  <option value="religious-first">Сначала религиозная, затем светская</option>
                </select>
              </div>
            )}
          </div>

          {/* Длительность зала */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-neutral-900">
              Длительность зала прощания
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[30, 60, 90].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => onUpdateFormData("hallDuration", minutes)}
                  className={
                    "rounded-2xl border px-3 py-3 text-center text-xs transition " +
                    (formData.hallDuration === minutes
                      ? "border-neutral-900 bg-white shadow-sm"
                      : "border-neutral-200 bg-white/60 hover:border-neutral-400")
                  }
                >
                  <div className="text-sm text-neutral-900">{minutes} мин</div>
                  <div className="mt-1 text-[11px] text-neutral-600">
                    Рекомендуем 60–90 минут
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderLogisticsStep = () => (
    <div className="space-y-6">
      {/* Выбор кладбища / крематория */}
      <div>
        <div className="mb-2 text-sm font-medium text-neutral-900">
          {formData.serviceType === "cremation"
            ? "Крематорий или кладбище для урны"
            : "Кладбище"}
        </div>
        <input
          type="text"
          className="w-full rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
          placeholder="Начните вводить название (Москва или МО)"
          list="cemeteries-list"
          value={formData.cemetery || ""}
          onChange={(e) => onUpdateFormData("cemetery", e.target.value)}
        />
        <datalist id="cemeteries-list">
          {allCemeteries.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
        <p className="mt-1 text-[11px] text-neutral-600">
          Подходящие варианты: крупные муниципальные кладбища и крематории Москвы
          и Московской области.
        </p>
      </div>

      {formData.cemetery && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-800">
            Категория места
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["standard", "comfort", "premium"] as CemeteryCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCemeteryCategory(cat)}
                  className={
                    "rounded-2xl border px-3 py-2 text-center text-xs transition " +
                    (selectedCemeteryCategory === cat
                      ? "border-neutral-900 bg-white shadow-sm"
                      : "border-neutral-200 bg-white/60 hover:border-neutral-400")
                  }
                >
                  <div className="text-sm text-neutral-900">
                    {cat === "standard"
                      ? "Стандарт"
                      : cat === "comfort"
                      ? "Комфорт"
                      : "Премиум"}
                  </div>
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Транспорт и носильщики */}
      <div className="grid gap-4 rounded-2xl border bg-white/70 p-4">
        {/* Катафалк */}
        <label className="flex items-start justify-between gap-3 text-sm">
          <div>
            <div className="font-medium text-neutral-900">Катафалк</div>
            <div className="mt-1 text-xs text-neutral-600">
              Транспортировка от морга до зала и кладбища
            </div>
          </div>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={formData.needsHearse}
            onChange={(e) => onUpdateFormData("needsHearse", e.target.checked)}
          />
        </label>

        {/* Транспорт для близких */}
        <div className="grid gap-2 text-sm">
          <label className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-neutral-900">
                Транспорт для близких
              </div>
              <div className="mt-1 text-xs text-neutral-600">
                Микроавтобус или небольшой автобус
              </div>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={formData.needsFamilyTransport}
              onChange={(e) =>
                onUpdateFormData("needsFamilyTransport", e.target.checked)
              }
            />
          </label>

          {formData.needsFamilyTransport && (
            <div className="pl-1">
              <label className="block text-xs text-neutral-700">
                Количество мест
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
                value={formData.familyTransportSeats || 5}
                onChange={(e) =>
                  onUpdateFormData(
                    "familyTransportSeats",
                    Number(e.target.value),
                  )
                }
              >
                <option value={5}>до 5 мест</option>
                <option value={10}>до 10 мест</option>
                <option value={15}>до 15 мест</option>
              </select>
            </div>
          )}
        </div>

        {/* Носильщики */}
        <label className="flex items-start justify-between gap-3 text-sm">
          <div>
            <div className="font-medium text-neutral-900">Носильщики</div>
            <div className="mt-1 text-xs text-neutral-600">
              Церемониальная группа для переноса гроба
            </div>
          </div>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={formData.needsPallbearers}
            onChange={(e) =>
              onUpdateFormData("needsPallbearers", e.target.checked)
            }
          />
        </label>
      </div>
    </div>
  );

  const renderAttributesStep = () => (
    <div className="space-y-6">
      {/* Пакеты */}
      <div>
        <div className="mb-3 text-sm font-medium text-neutral-900">
          Готовые пакеты
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onUpdateFormData("packageType", pkg.id)}
              className={
                "flex flex-col rounded-2xl border bg-white/70 p-3 text-left text-sm transition " +
                (formData.packageType === pkg.id
                  ? "border-neutral-900 shadow-sm"
                  : "border-neutral-200 hover:border-neutral-400")
              }
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-medium text-neutral-900">{pkg.name}</div>
                <div className="text-xs text-neutral-600">
                  от {pkg.price.toLocaleString("ru-RU")} ₽
                </div>
              </div>
              <div className="mt-1 text-xs text-neutral-600">
                {pkg.description}
              </div>
              <ul className="mt-3 space-y-1 text-[11px] text-neutral-600">
                {pkg.features.slice(0, 4).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
                {pkg.features.length > 4 && (
                  <li>… и другие позиции</li>
                )}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Свой набор */}
      <div className="rounded-2xl border bg-white/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-neutral-900">
              Собрать набор самостоятельно
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              Базовый минимум уже включён. Выберите только то, что вам действительно важно.
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="radio"
              name="packageType"
              value="custom"
              checked={formData.packageType === "custom"}
              onChange={() => onUpdateFormData("packageType", "custom")}
              className="h-4 w-4"
            />
            <span>Активировать</span>
          </label>
        </div>

        {formData.packageType === "custom" && (
          <div className="mt-4 grid gap-2">
            {ADDITIONAL_SERVICES.map((service) => {
              const checked =
                formData.selectedAdditionalServices?.includes(service.id) ??
                false;
              return (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs hover:border-neutral-400"
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {service.name}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-600">
                      {service.description}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xs font-medium text-neutral-900">
                      {service.price.toLocaleString("ru-RU")} ₽
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => toggleAdditionalService(service.id)}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700">
          Особые пожелания (по желанию)
        </label>
        <textarea
          className="mt-1 w-full min-h-[80px] rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
          placeholder="Например: музыка, речь, символика, особенности прощания…"
          value={formData.specialRequests || ""}
          onChange={(e) =>
            onUpdateFormData("specialRequests", e.target.value)
          }
        />
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-neutral-700">
            ФИО усопшего
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
            value={formData.fullName || ""}
            onChange={(e) => onUpdateFormData("fullName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700">
            Степень родства
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
            placeholder="Например: сын, дочь, супруг(а)"
            value={formData.relationship || ""}
            onChange={(e) =>
              onUpdateFormData("relationship", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700">
            Дата рождения
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
            value={formData.birthDate || ""}
            onChange={(e) => onUpdateFormData("birthDate", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700">
            Дата смерти
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
            value={formData.deathDate || ""}
            onChange={(e) => onUpdateFormData("deathDate", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700">
            Номер свидетельства о смерти
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm"
            value={formData.deathCertificate || ""}
            onChange={(e) =>
              onUpdateFormData("deathCertificate", e.target.value)
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white/80 px-3 py-3 text-xs">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={formData.dataConsent || false}
            onChange={(e) =>
              onUpdateFormData("dataConsent", e.target.checked)
            }
          />
          <span className="text-neutral-700">
            Я подтверждаю, что являюсь уполномоченным лицом и даю согласие на
            обработку персональных данных для организации похорон.
          </span>
        </label>
        {consentError && (
          <p className="mt-2 text-[11px] text-red-600">
            Чтобы продолжить, необходимо подтвердить согласие.
          </p>
        )}
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-4 text-sm">
      <p className="text-neutral-800">
        На этом шаге формируется единый заказ: формат церемонии, логистика,
        атрибутика и услуги. После запуска платформы здесь появится резюме
        выбора и кнопка перехода к оплате.
      </p>
      <div className="rounded-2xl border bg-white/80 p-4 text-xs text-neutral-700">
        Сейчас мастер помогает собрать структуру и логику заказа. На боевой
        версии здесь будет:
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>сводка по услугам и атрибутике,</li>
          <li>единая итоговая стоимость,</li>
          <li>кнопка выбора сценария: сохранить, отправить координатору, перейти к оплате.</li>
        </ul>
      </div>
      <button
        type="button"
        className="mt-2 w-full cursor-not-allowed rounded-full bg-neutral-900/20 px-4 py-3 text-sm text-neutral-700"
        disabled
      >
        Финальный шаг (будет активен в платформе)
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderFormatStep();
      case 1:
        return renderLogisticsStep();
      case 2:
        return renderAttributesStep();
      case 3:
        return renderDocumentsStep();
      case 4:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <section className="relative z-10 mx-auto mt-[-4rem] w-full max-w-5xl px-4 pb-16">
      <div className="rounded-3xl bg-white/80 p-4 shadow-xl shadow-black/5 backdrop-blur-md md:p-6">
        {/* Шаги */}
        <div className="mb-6 flex flex-wrap items-center gap-2 md:gap-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = index < currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleGoToStep(index)}
                className={
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm transition " +
                  (isActive
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : isDone
                    ? "border-neutral-300 bg-neutral-50 text-neutral-900 hover:border-neutral-500"
                    : "border-neutral-200 bg-white/70 text-neutral-700 hover:border-neutral-400")
                }
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[11px]">
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Контент текущего шага */}
        <div className="space-y-6">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            {steps[currentStep].description}
          </div>
          {renderStepContent()}
        </div>

        {/* Навигация */}
        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-neutral-500">
            Шаг {currentStep + 1} из {steps.length}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 hover:border-neutral-400"
              >
                Назад
              </button>
            )}
            {currentStep < steps.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-800"
              >
                Далее
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}