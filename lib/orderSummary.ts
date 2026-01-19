type TimeSlot = "morning" | "afternoon" | "evening" | "night";

export type OrderSummaryItem = {
  label: string;
  value: string;
};

export type OrderSummarySection = {
  title: string;
  items: OrderSummaryItem[];
};

export type OrderSummaryResult = {
  sections: OrderSummarySection[];
  htmlFragment: string;
  plainText: string;
};

type SplitScheduleItem = { title: string; amountRub: number };

type BuildOrderSummaryOptions = {
  totalRub?: number;
  paymentPlan?: string;
  payNowRub?: number;
  splitSchedule?: SplitScheduleItem[];
  packageLabel?: string;
  cemeteryCategoryLabel?: string;
  additionalServicesMap?: Record<string, string>;
};

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Первая половина дня",
  afternoon: "Вторая половина дня",
  evening: "Вечер",
  night: "Ночь",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  burial: "Захоронение",
  cremation: "Кремация",
};

const CEREMONY_TYPE_LABELS: Record<string, string> = {
  civil: "Светская",
  religious: "Религиозная",
  combined: "Комбинированная",
};

const HEARSE_CATEGORY_LABELS: Record<string, string> = {
  standard: "Стандарт",
  comfort: "Комфорт",
  premium: "Премиум",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: "Супруг(а)",
  parent: "Родитель",
  child: "Сын/дочь",
  relative: "Дальний родственник",
  representative: "Доверенное лицо",
};

const PAYMENT_PLAN_LABELS: Record<string, string> = {
  full: "Оплата полностью",
  deposit: "Депозит (5%)",
  split: "Оплата частями",
};

const WREATH_TYPE_LABELS: Record<string, string> = {
  artificial: "Искусственные цветы",
  composition: "Живая композиция",
};

const WREATH_SIZE_LABELS: Record<string, string> = {
  S: "Малый",
  M: "Средний",
  L: "Большой",
};

const LINING_LABELS: Record<string, { title: string; subtitle?: string }> = {
  "satin-white": { title: "Атлас белый" },
  "silk-cream": { title: "Шелк кремовый" },
  "velvet-burgundy": { title: "Бархат бордовый" },
};

const DEFAULT_ADDITIONAL_SERVICES: Record<string, string> = {
  "morgue-storage": "Хранение в морге",
  "sanitary-prep": "Санитарная подготовка и бальзамирование",
  clothing: "Одежда и облачение",
  "hall-rental": "Аренда зала прощания",
  coordinator: "Координатор церемонии",
  pallbearers: "Носильщики (4–6 чел.)",
  "hearse-premium": "Катафалк премиум-класса",
  "hearse-extra-trips": "Дополнительные рейсы",
  "transport-family": "Транспорт для близких",
  "fresh-flowers": "Живая флористика",
  "textile-premium": "Текстиль премиум",
  decor: "Декор зала и места",
  music: "Музыкальное сопровождение",
  "photo-video": "Фото и видеосъемка",
  "online-stream": "Онлайн-трансляция",
  priest: "Религиозный обряд",
  "memorial-cross": "Памятный крест временный",
  printing: "Печать и полиграфия",
  "memorial-meal": "Поминальный обед",
  monument: "Памятник и благоустройство",
};

const TIME_SLOT_IDS = new Set<TimeSlot>([
  "morning",
  "afternoon",
  "evening",
  "night",
]);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatRub = (value?: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value).toLocaleString("ru-RU")} ₽`
    : "";

const formatDateValue = (value?: string | Date) => {
  if (!value) return "";
  if (value instanceof Date) return value.toLocaleDateString("ru-RU");
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString("ru-RU");
  return String(value);
};

const inferTimeSlotFromTime = (time?: string): TimeSlot | undefined => {
  if (!time) return undefined;
  const [h] = time.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour)) return undefined;
  if (hour >= 21 || hour < 9) return "night";
  if (hour >= 17) return "evening";
  if (hour >= 13) return "afternoon";
  if (hour >= 9) return "morning";
  return "night";
};

const formatDateTimeSlot = (value?: {
  date?: string | Date;
  timeSlot?: TimeSlot | string;
  time?: string;
}) => {
  if (!value) return "";
  const dateLabel = formatDateValue(value.date);
  const rawSlot =
    value.timeSlot && TIME_SLOT_IDS.has(value.timeSlot as TimeSlot)
      ? (value.timeSlot as TimeSlot)
      : inferTimeSlotFromTime(value.time);
  const slotLabel =
    rawSlot && TIME_SLOT_LABELS[rawSlot]
      ? TIME_SLOT_LABELS[rawSlot]
      : rawSlot
        ? String(rawSlot)
        : "";

  if (dateLabel && slotLabel) return `${dateLabel} — ${slotLabel}`;
  if (dateLabel) return dateLabel;
  if (slotLabel) return slotLabel;
  return "";
};

const isValidEmail = (value?: string) =>
  !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const pushItem = (items: OrderSummaryItem[], label: string, value?: string) => {
  if (!value) return;
  const trimmed = String(value).trim();
  if (!trimmed) return;
  items.push({ label, value: trimmed });
};

export function buildOrderSummary(
  formData: Record<string, any> | undefined,
  options: BuildOrderSummaryOptions = {},
): OrderSummaryResult {
  const data = formData || {};
  const sections: OrderSummarySection[] = [];
  const addSection = (title: string, items: OrderSummaryItem[]) => {
    if (items.length) {
      sections.push({ title, items });
    }
  };

  const formatItems: OrderSummaryItem[] = [];
  const serviceTypeLabel = SERVICE_TYPE_LABELS[data.serviceType] || data.serviceType;
  pushItem(formatItems, "Формат", serviceTypeLabel);
  pushItem(formatItems, "Пакет", options.packageLabel);
  if (typeof data.hasHall === "boolean") {
    pushItem(formatItems, "Зал прощания", data.hasHall ? "Да" : "Нет");
  }
  if (data.hasHall && data.hallDuration) {
    pushItem(formatItems, "Длительность зала", `${data.hallDuration} мин`);
  }
  const ceremonyTypeLabel = CEREMONY_TYPE_LABELS[data.ceremonyType] || data.ceremonyType;
  pushItem(formatItems, "Тип церемонии", ceremonyTypeLabel);
  pushItem(formatItems, "Конфессия", data.confession);
  pushItem(formatItems, "Порядок церемонии", data.ceremonyOrder);
  pushItem(formatItems, "Слот церемонии", data.selectedSlot);
  addSection("Формат церемонии", formatItems);

  const logisticsItems: OrderSummaryItem[] = [];
  if (data.cemetery) {
    const cemeteryLabel =
      serviceTypeLabel === "Кремация" ? "Крематорий" : "Кладбище";
    pushItem(logisticsItems, cemeteryLabel, data.cemetery);
  }
  pushItem(logisticsItems, "Категория места", options.cemeteryCategoryLabel);
  pushItem(logisticsItems, "Забор тела", formatDateTimeSlot(data.pickupDateTime));
  pushItem(logisticsItems, "Прощание", formatDateTimeSlot(data.farewellDateTime));
  const burialLabel = serviceTypeLabel === "Кремация" ? "Кремация" : "Захоронение";
  pushItem(logisticsItems, burialLabel, formatDateTimeSlot(data.burialDateTime));

  if (data.needsHearse) {
    const catLabel =
      HEARSE_CATEGORY_LABELS[data.hearseCategory] || data.hearseCategory;
    pushItem(
      logisticsItems,
      "Катафалк",
      catLabel ? `Да (${catLabel})` : "Да",
    );
  }
  if (data.hearseRoute && typeof data.hearseRoute === "object") {
    const routeParts = [];
    if (data.hearseRoute.morgue) routeParts.push("Морг");
    if (data.hearseRoute.hall) routeParts.push("Зал прощания");
    if (data.hearseRoute.church) routeParts.push("Церковь");
    if (data.hearseRoute.cemetery) {
      routeParts.push(serviceTypeLabel === "Кремация" ? "Крематорий" : "Кладбище");
    }
    if (routeParts.length) {
      pushItem(logisticsItems, "Маршрут катафалка", routeParts.join(" → "));
    }
  }
  if (data.needsFamilyTransport) {
    const seats = Number(data.familyTransportSeats || 0);
    const value = seats ? `${seats} мест` : "Да";
    pushItem(logisticsItems, "Транспорт для близких", value);
  }
  if (data.needsPallbearers) {
    pushItem(logisticsItems, "Носильщики", "Да");
  }
  pushItem(logisticsItems, "Дистанция", data.distance);
  addSection("Логистика", logisticsItems);

  const attributeItems: OrderSummaryItem[] = [];
  const coffin = data.coffinConfig?.coffin;
  if (coffin?.wood?.name) {
    const qty = Math.max(1, Number(coffin.quantity || 1));
    const qtySuffix = qty > 1 ? ` ×${qty}` : "";
    pushItem(attributeItems, "Гроб", `${coffin.wood.name}${qtySuffix}`);
  }
  if (coffin?.lining?.name) {
    pushItem(attributeItems, "Обивка", coffin.lining.name);
  }
  if (coffin?.hardware?.name) {
    pushItem(attributeItems, "Фурнитура", coffin.hardware.name);
  }
  if (data.liningColor) {
    const liningLabel = LINING_LABELS[data.liningColor]?.title || data.liningColor;
    pushItem(attributeItems, "Цвет отделки", liningLabel);
  }
  const wreath = data.coffinConfig?.wreath;
  if (wreath) {
    const typeLabel = WREATH_TYPE_LABELS[wreath.type] || wreath.type;
    const sizeLabel = WREATH_SIZE_LABELS[wreath.size] || wreath.size;
    const details = [typeLabel, sizeLabel].filter(Boolean).join(", ");
    const text = (wreath.text || "").trim();
    const qty = Math.max(1, Number(wreath.quantity || 1));
    let wreathLabel = details || "Венок";
    if (text) wreathLabel += `, "${text}"`;
    if (qty > 1) wreathLabel += ` ×${qty}`;
    pushItem(attributeItems, "Венок", wreathLabel);
  }
  const additionalServicesMap = {
    ...DEFAULT_ADDITIONAL_SERVICES,
    ...(options.additionalServicesMap || {}),
  };
  if (Array.isArray(data.selectedAdditionalServices)) {
    data.selectedAdditionalServices.forEach((id: string) => {
      const name = additionalServicesMap[id] || id;
      pushItem(attributeItems, name, "включено");
    });
  }
  pushItem(attributeItems, "Особые пожелания", data.specialRequests);
  addSection("Атрибутика", attributeItems);

  const documentItems: OrderSummaryItem[] = [];
  pushItem(documentItems, "ФИО усопшего", data.fullName);
  pushItem(documentItems, "Дата рождения", data.birthDate);
  pushItem(documentItems, "Дата смерти", data.deathDate);
  pushItem(documentItems, "№ свидетельства о смерти", data.deathCertificate);
  if (data.relationship) {
    const relationLabel = RELATIONSHIP_LABELS[data.relationship] || data.relationship;
    pushItem(documentItems, "Степень родства", relationLabel);
  }
  if (data.dataConsent) {
    pushItem(documentItems, "Согласие на обработку данных", "Да");
  }
  pushItem(documentItems, "Контактное лицо", data.clientName);
  if (isValidEmail(data.clientEmail)) {
    pushItem(documentItems, "Email клиента", data.clientEmail);
  }
  if (isValidEmail(data.userEmail)) {
    pushItem(documentItems, "Email для уведомлений", data.userEmail);
  }
  addSection("Документы", documentItems);

  const htmlFragment = sections
    .map((section) => {
      const rows = section.items
        .map(
          (item) => `
            <tr>
              <td style="padding:6px 10px; border:1px solid #e6e6e6; color:#555; width:40%;">${escapeHtml(item.label)}</td>
              <td style="padding:6px 10px; border:1px solid #e6e6e6; color:#111;">${escapeHtml(item.value).replace(/\n/g, "<br/>")}</td>
            </tr>
          `,
        )
        .join("");

      return `
        <h3 style="font-size:15px; margin:14px 0 6px;">${escapeHtml(section.title)}</h3>
        <table style="border-collapse:collapse; width:100%; font-size:13px; margin:0 0 10px;">
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    })
    .join("");

  const plainText = sections
    .map((section) => {
      const lines = section.items.map((item) => `- ${item.label}: ${item.value}`);
      return [section.title, ...lines, ""].join("\n");
    })
    .join("\n")
    .trim();

  return { sections, htmlFragment, plainText };
}
