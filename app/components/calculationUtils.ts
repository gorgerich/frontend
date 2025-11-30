// Справочник цен
export const PRICES = {
  // Формат
  hallDuration: {
    30: 5000,
    60: 8000,
    90: 12000,
  },
  ceremonyType: {
    civil: 0,
    religious: 15000,
    combined: 20000,
  },
  // Логистика
  hearse: 8000,
  familyTransport: {
    5: 5000,
    10: 8000,
    15: 12000,
  },
  pallbearers: 6000,
};

// Готовые пакеты
export const PACKAGES = [
  {
    id: "basic",
    name: "Базовый",
    price: 45000,
    description: "Необходимый минимум",
    features: [
      "Гроб сосна",
      "Венок искусственный",
      "Базовая отделка",
      "Катафалк",
      "Носильщики",
    ],
  },
  {
    id: "standard",
    name: "Стандарт",
    price: 85000,
    description: "Оптимальный вариант",
    features: [
      "Гроб дуб",
      "Живые цветы",
      "Бархатная отделка",
      "Катафалк",
      "Носильщики",
      "Зал прощания 60 мин",
      "Транспорт для близких",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Премиум",
    price: 150000,
    description: "Максимальный комфорт",
    features: [
      "Гроб красное дерево",
      "Премиум композиция",
      "Шелковая отделка",
      "Катафалк премиум",
      "Носильщики",
      "Зал прощания 90 мин",
      "Транспорт для близких",
      "Координатор церемонии",
      "Музыкальное сопровождение",
    ],
  },
];

// Дополнительные услуги
export const ADDITIONAL_SERVICES = [
  {
    id: "morgue-storage",
    name: "Хранение в морге",
    price: 2500,
    description: "Резерв времени до церемонии",
  },
  {
    id: "sanitary-prep",
    name: "Санитарная подготовка и бальзамирование",
    price: 12000,
    description: "Аккуратный внешний вид",
  },
  {
    id: "makeup",
    name: "Косметическая подготовка",
    price: 8000,
    description: "Профессиональный макияж",
  },
  {
    id: "clothing",
    name: "Ритуальная одежда",
    price: 5000,
    description: "Подготовка одежды",
  },
  {
    id: "photography",
    name: "Фотосъемка церемонии",
    price: 15000,
    description: "Профессиональная съемка",
  },
  {
    id: "videography",
    name: "Видеосъемка церемонии",
    price: 25000,
    description: "Профессиональная видеосъемка",
  },
  {
    id: "music",
    name: "Музыкальное сопровождение",
    price: 10000,
    description: "Живая музыка или фон",
  },
  {
    id: "flowers-premium",
    name: "Премиум цветочная композиция",
    price: 20000,
    description: "Эксклюзивная композиция",
  },
  {
    id: "catering",
    name: "Поминальный обед",
    price: 30000,
    description: "Организация поминального обеда",
  },
  {
    id: "memorial-plaque",
    name: "Памятная табличка",
    price: 8000,
    description: "Временная табличка",
  },
];

// Кладбища Москвы
export const MOSCOW_CEMETERIES = [
  {
    name: "Троекуровское кладбище",
    type: "burial",
    district: "ЗАО",
    categories: {
      standard: 120000,
      comfort: 220000,
      premium: 350000,
    },
  },
  {
    name: "Хованское кладбище (Южное)",
    type: "burial",
    district: "ЮЗАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Хованское кладбище (Северное)",
    type: "burial",
    district: "ЮЗАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Хованское кладбище (Западное)",
    type: "burial",
    district: "ЮЗАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Хованское кладбище (Центральное)",
    type: "burial",
    district: "ЮЗАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Митинское кладбище",
    type: "burial",
    district: "СЗАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Николо-Архангельское кладбище",
    type: "burial",
    district: "ВАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Востряковское кладбище",
    type: "burial",
    district: "ЮЗАО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Долгопрудненское кладбище",
    type: "burial",
    district: "САО",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Перепечинское кладбище",
    type: "burial",
    district: "ВАО",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
  },
  {
    name: "Роговское кладбище",
    type: "burial",
    district: "ЮВАО",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
  },
  {
    name: "Алмазовское кладбище",
    type: "burial",
    district: "ЗАО",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
  },
  {
    name: "Хохловское кладбище",
    type: "burial",
    district: "СВАО",
    categories: {
      standard: 90000,
      comfort: 180000,
      premium: 280000,
    },
  },
  {
    name: "Бабушкинское кладбище",
    type: "burial",
    district: "СВАО",
    categories: {
      standard: 110000,
      comfort: 210000,
      premium: 310000,
    },
  },
  {
    name: "Головинское кладбище",
    type: "burial",
    district: "САО",
    categories: {
      standard: 120000,
      comfort: 220000,
      premium: 320000,
    },
  },
  {
    name: "Перовское кладбище",
    type: "burial",
    district: "ВАО",
    categories: {
      standard: 95000,
      comfort: 190000,
      premium: 290000,
    },
  },
  // Крематории Москвы
  {
    name: "Николо-Архангельский крематорий",
    type: "cremation",
    district: "ВАО",
    categories: {
      standard: 15000,
      comfort: 25000,
      premium: 40000,
    },
  },
  {
    name: "Митинский крематорий",
    type: "cremation",
    district: "СЗАО",
    categories: {
      standard: 15000,
      comfort: 25000,
      premium: 40000,
    },
  },
  {
    name: "Хованский крематорий",
    type: "cremation",
    district: "ЮЗАО",
    categories: {
      standard: 15000,
      comfort: 25000,
      premium: 40000,
    },
  },
];

// Кладбища Московской области
export const MO_CEMETERIES = [
  {
    name: "Мытищинское кладбище (Волковское)",
    type: "burial",
    district: "Мытищинский район",
    categories: {
      standard: 80000,
      comfort: 150000,
      premium: 250000,
    },
  },
  {
    name: "Красногорское кладбище",
    type: "burial",
    district: "Красногорский район",
    categories: {
      standard: 85000,
      comfort: 160000,
      premium: 260000,
    },
  },
  {
    name: "Новолюберецкое кладбище",
    type: "burial",
    district: "Люберецкий район",
    categories: {
      standard: 75000,
      comfort: 140000,
      premium: 240000,
    },
  },
  {
    name: "Шереметьевское кладбище",
    type: "burial",
    district: "Долгопрудный",
    categories: {
      standard: 70000,
      comfort: 130000,
      premium: 220000,
    },
  },
  {
    name: "Невзоровское кладбище",
    type: "burial",
    district: "Пушкинский район",
    categories: {
      standard: 65000,
      comfort: 120000,
      premium: 200000,
    },
  },
  {
    name: "Островецкое кладбище",
    type: "burial",
    district: "Раменский район",
    categories: {
      standard: 60000,
      comfort: 110000,
      premium: 190000,
    },
  },
  {
    name: "Домодедовское городское кладбище",
    type: "burial",
    district: "Домодедово",
    categories: {
      standard: 70000,
      comfort: 130000,
      premium: 220000,
    },
  },
  {
    name: "Балашихинское (Новое) кладбище",
    type: "burial",
    district: "Балашиха",
    categories: {
      standard: 75000,
      comfort: 140000,
      premium: 230000,
    },
  },
  {
    name: "Химкинское кладбище",
    type: "burial",
    district: "Химки",
    categories: {
      standard: 90000,
      comfort: 170000,
      premium: 270000,
    },
  },
  {
    name: "Лайковское кладбище",
    type: "burial",
    district: "Одинцовский район",
    categories: {
      standard: 100000,
      comfort: 200000,
      premium: 300000,
    },
  },
  {
    name: "Нахабинское кладбище",
    type: "burial",
    district: "Красногорский район",
    categories: {
      standard: 70000,
      comfort: 130000,
      premium: 220000,
    },
  },
  {
    name: "Каширское кладбище",
    type: "burial",
    district: "Кашира",
    categories: {
      standard: 50000,
      comfort: 90000,
      premium: 150000,
    },
  },
];

export interface CalculatorItem {
  name: string;
  price?: number;
}

export interface CalculatorSection {
  category: string;
  price: number;
  items?: CalculatorItem[];
}

export interface FormData {
  serviceType: string;
  hasHall: boolean;
  hallDuration: number;
  ceremonyType: string;
  packageType: string;
  needsHearse: boolean;
  needsFamilyTransport: boolean;
  familyTransportSeats: number;
  needsPallbearers: boolean;
  selectedAdditionalServices: string[];
  cemetery: string;
  [key: string]: any;
}

// Функция расчета общей стоимости
export function calculateTotal(
  formData: FormData,
  selectedCemeteryCategory: string = "standard",
): number {
  // Базовая цена ВСЕГДА включается
  let total = 25000;

  // Если выбран готовый пакет
  if (
    formData.packageType &&
    formData.packageType !== "custom" &&
    formData.packageType !== ""
  ) {
    const pkg = PACKAGES.find((p) => p.id === formData.packageType);
    if (pkg) {
      // Добавляем только разницу (пакет уже включает базовые услуги)
      total += pkg.price - 25000;
    }
  } else {
    // Зал прощания
    if (formData.hasHall) {
      total +=
        PRICES.hallDuration[
          formData.hallDuration as keyof typeof PRICES.hallDuration
        ] || 0;
    }

    // Тип церемонии
    total +=
      PRICES.ceremonyType[
        formData.ceremonyType as keyof typeof PRICES.ceremonyType
      ] || 0;

    // Дополнительные услуги
    if (
      formData.selectedAdditionalServices &&
      Array.isArray(formData.selectedAdditionalServices)
    ) {
      formData.selectedAdditionalServices.forEach((serviceId) => {
        const service = ADDITIONAL_SERVICES.find((s) => s.id === serviceId);
        if (service) {
          total += service.price;
        }
      });
    }
  }

  // Логистика - добавляется ВСЕГДА (независимо от пакета)
  if (formData.needsHearse) {
    total += PRICES.hearse;
  }
  if (formData.needsFamilyTransport) {
    total +=
      PRICES.familyTransport[
        formData.familyTransportSeats as keyof typeof PRICES.familyTransport
      ] || 0;
  }
  if (formData.needsPallbearers) {
    total += PRICES.pallbearers;
  }

  // Место на кладбище/в крематории (Москва + МО)
  if (formData.cemetery) {
    const allCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
    const selectedCemetery = allCemeteries.find(
      (c) => c.name === formData.cemetery,
    );
    if (selectedCemetery) {
      const price =
        selectedCemetery.categories[
          selectedCemeteryCategory as keyof typeof selectedCemetery.categories
        ] || 0;
      total += price;
    }
  }

  return total;
}

// Функция расчета детализации стоимости
export function calculateBreakdown(
  formData: FormData,
  selectedCemeteryCategory: string = "standard",
): CalculatorSection[] {
  const breakdown: CalculatorSection[] = [];

  // Базовые услуги
  breakdown.push({
    category: "Базовые услуги",
    price: 25000,
    items: [
      { name: "Оформление документов" },
      { name: "Подтверждение места захоронения" },
      { name: "Хранение и базовая подготовка тела" },
      { name: "Гроб из массива сосны + подушка/покрывало" },
      { name: "Транспортировка покойного и перенос" },
      { name: "Кладбищенские работы" },
    ],
  });

  // Пакет или конструктор
  if (
    formData.packageType &&
    formData.packageType !== "custom" &&
    formData.packageType !== ""
  ) {
    const pkg = PACKAGES.find((p) => p.id === formData.packageType);
    if (pkg && pkg.price > 25000) {
  breakdown.push({
    category: `Пакет "${pkg.name}"`,
    price: pkg.price,
    items: pkg.features.map((f) => ({ name: f })),
  });
}
  } else {
    // Формат
    const formatItems: CalculatorItem[] = [];
    let formatTotal = 0;

    if (formData.hasHall) {
      const hallPrice =
        PRICES.hallDuration[
          formData.hallDuration as keyof typeof PRICES.hallDuration
        ] || 0;
      formatItems.push({
        name: `Зал прощания (${formData.hallDuration} мин)`,
        price: hallPrice,
      });
      formatTotal += hallPrice;
    }

    const ceremonyPrice =
      PRICES.ceremonyType[
        formData.ceremonyType as keyof typeof PRICES.ceremonyType
      ] || 0;
    if (ceremonyPrice > 0) {
      const ceremonyName =
        formData.ceremonyType === "religious"
          ? "Религиозная церемония"
          : "Комбинированная церемония";
      formatItems.push({ name: ceremonyName, price: ceremonyPrice });
      formatTotal += ceremonyPrice;
    }

    if (formatItems.length > 0) {
      breakdown.push({
        category: "Формат",
        price: formatTotal,
        items: formatItems,
      });
    }

    // Дополнительные услуги
    if (
      formData.selectedAdditionalServices &&
      formData.selectedAdditionalServices.length > 0
    ) {
      const additionalItems: CalculatorItem[] = [];
      let additionalTotal = 0;

      formData.selectedAdditionalServices.forEach((serviceId) => {
        const service = ADDITIONAL_SERVICES.find((s) => s.id === serviceId);
        if (service) {
          additionalItems.push({ name: service.name, price: service.price });
          additionalTotal += service.price;
        }
      });

      if (additionalItems.length > 0) {
        breakdown.push({
          category: "Дополнительные услуги",
          price: additionalTotal,
          items: additionalItems,
        });
      }
    }
  }

  // Логистика
  const logisticsItems: CalculatorItem[] = [];
  let logisticsTotal = 0;

  if (formData.needsHearse) {
    logisticsItems.push({ name: "Катафалк", price: PRICES.hearse });
    logisticsTotal += PRICES.hearse;
  }

  if (formData.needsFamilyTransport) {
    const transportPrice =
      PRICES.familyTransport[
        formData.familyTransportSeats as keyof typeof PRICES.familyTransport
      ] || 0;
    logisticsItems.push({
      name: `Транспорт для близких (${formData.familyTransportSeats} мест)`,
      price: transportPrice,
    });
    logisticsTotal += transportPrice;
  }

  if (formData.needsPallbearers) {
    logisticsItems.push({
      name: "Носильщики",
      price: PRICES.pallbearers,
    });
    logisticsTotal += PRICES.pallbearers;
  }

  if (logisticsItems.length > 0) {
    breakdown.push({
      category: "Логистика",
      price: logisticsTotal,
      items: logisticsItems,
    });
  }

  // Место на кладбище/в крематории (Москва + МО)
  if (formData.cemetery) {
    const allCemeteries = [...MOSCOW_CEMETERIES, ...MO_CEMETERIES];
    const selectedCemetery = allCemeteries.find(
      (c) => c.name === formData.cemetery,
    );
    if (selectedCemetery) {
      const price =
        selectedCemetery.categories[
          selectedCemeteryCategory as keyof typeof selectedCemetery.categories
        ] || 0;
      const categoryName =
        selectedCemeteryCategory === "standard"
          ? "Стандарт"
          : selectedCemeteryCategory === "comfort"
            ? "Комфорт"
            : "Премиум";

      breakdown.push({
        category: "Место на кладбище / в крематории",
        price,
        items: [
          { name: selectedCemetery.name },
          { name: `Категория: ${categoryName}` },
        ],
      });
    }
  }

  return breakdown;
}