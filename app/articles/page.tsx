import Link from "next/link";
import { articles } from "@/lib/articles";
import { Clock3, FileText, Landmark, Shield, type LucideIcon } from "lucide-react";
import { widontRu } from "@/lib/typography";

export const metadata = {
  title: "Справочник — Тихий дом",
  description:
    "Короткие и понятные инструкции: как защитить себя от обмана, оформить документы и организовать всё без лишнего стресса.",
};

type GuideCard = {
  id: string;
  title: string;
  summary: string;
  readTimeMin: number;
  slug?: string;
};

type GuideSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  cards: GuideCard[];
};

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "emergency",
    title: "Экстренные инструкции",
    subtitle: "Первые часы после утраты: чёткий порядок действий без паники.",
    icon: Shield,
    cards: [
      {
        id: "first-24h",
        title: "Полный чек-лист: что делать в первые 24 часа после утраты",
        summary:
          "Слияние двух базовых инструкций в один практический алгоритм без лишней теории.",
        readTimeMin: 4,
        slug: "chto-delat-esli-umer-chelovek",
      },
      {
        id: "agents-without-call",
        title: "Как общаться с ритуальными агентами, которые приехали без вызова",
        summary:
          "Права семьи, фразы для отказа, защита личных данных и безопасный сценарий действий.",
        readTimeMin: 3,
        slug: "kak-obshatsya-s-ritualnymi-agentami-bez-vyzova",
      },
      {
        id: "morgue-clothes",
        title: "Одежда и вещи для морга: точный список для мужчин и женщин",
        summary:
          "Что передавать, в каком виде и в какие сроки, чтобы избежать лишней суеты.",
        readTimeMin: 2,
        slug: "odezhda-i-veshi-dlya-morga",
      },
      {
        id: "locked-door-inside",
        title:
          "Близкий не открывает дверь, а квартира заперта изнутри. Пошаговая инструкция, как действовать",
        summary:
          "Юридически безопасный алгоритм: как вызвать службы, подготовить основания для вскрытия и не допустить ошибок в первые минуты.",
        readTimeMin: 3,
        slug: "blizkiy-ne-otkryvaet-dver-zaperta-iznutri",
      },
    ],
  },
  {
    id: "bureaucracy-finance",
    title: "Бюрократия и финансы",
    subtitle: "Прозрачная математика, документы и защита от неофициальных доплат.",
    icon: FileText,
    cards: [
      {
        id: "benefit-2026",
        title: "Как получить пособие на погребение от государства в 2026 году",
        summary:
          "Пошаговый маршрут: куда обращаться, какие документы подготовить и как получить выплату.",
        readTimeMin: 5,
        slug: "kak-poluchit-posobie-na-pogrebenie-v-2026-godu",
      },
      {
        id: "morgue-payments",
        title: "Морг требует деньги за подготовку: за что вы обязаны платить, а за что — нет",
        summary:
          "Граница между бесплатными госуслугами и коммерческими услугами морга.",
        readTimeMin: 3,
        slug: "morg-trebuet-dengi",
      },
      {
        id: "inheritance-steps",
        title: "Наследство: первые шаги и сроки, которые нельзя пропустить",
        summary:
          "Правило 6 месяцев, нотариус и базовые действия для защиты имущества.",
        readTimeMin: 4,
        slug: "nasledstvo-pervye-shagi-i-sroki",
      },
      {
        id: "real-cost",
        title: "Сколько реально стоят похороны: из чего складывается честная смета",
        summary:
          "Почему «цена по телефону» отличается от итоговой и как заранее проверить смету.",
        readTimeMin: 4,
        slug: "skolko-realno-stoyat-pohorony",
      },
    ],
  },
  {
    id: "choice-process",
    title: "Выбор и процесс",
    subtitle: "Материалы для спокойного решения без спешки и давления.",
    icon: Clock3,
    cards: [
      {
        id: "cremation-vs-burial",
        title: "Кремация или традиционное захоронение: объективное сравнение",
        summary:
          "Разница в логистике, сроках, стоимости и уходе за местом без оценочных суждений.",
        readTimeMin: 3,
        slug: "kremaciya-ili-zahoronenie-kak-vybrat",
      },
      {
        id: "memorial-meal",
        title: "Организация поминок: как составить меню и выбрать зал без переплат",
        summary:
          "Практичная схема: формат, бюджет, меню и контроль расходов.",
        readTimeMin: 4,
        slug: "organizaciya-pominok-bez-pereplat",
      },
      {
        id: "cargo-200",
        title: "Транспортировка из другого города (Груз 200): как перевезти близкого домой",
        summary:
          "Справки, документы, выбор транспорта и ключевые организационные этапы.",
        readTimeMin: 4,
        slug: "transportirovka-gruz-200-iz-drugogo-goroda",
      },
    ],
  },
  {
    id: "psychology-family",
    title: "Психология и семья",
    subtitle: "Поддержка «сэндвич-поколения»: когда нужно держать себя и всю семью.",
    icon: Landmark,
    cards: [
      {
        id: "tell-children",
        title: "Как сообщить детям о смерти близкого: советы психолога",
        summary:
          "Какие формулировки помогают, а какие травмируют. Нужно ли брать детей на прощание.",
        readTimeMin: 4,
        slug: "kak-soobshit-rebenku-o-smerti-blizkogo",
      },
      {
        id: "traditions-conflicts",
        title: "Традиции старшего поколения и современные реалии: как избежать конфликтов в семье",
        summary:
          "Как мягко отстаивать границы и согласовать формат прощания без ссор.",
        readTimeMin: 4,
        slug: "tradicii-starshego-pokoleniya-i-sovremennye-realii",
      },
      {
        id: "support-phrases",
        title: "Слова поддержки: что говорить горюющему вместо дежурного «держись»",
        summary:
          "Короткая памятка по экологичному общению в период острого горя.",
        readTimeMin: 3,
        slug: "slova-podderzhki-vmesto-derzhis",
      },
      {
        id: "self-care",
        title: "Как позаботиться о себе: физиология горя в первые недели",
        summary:
          "Бессонница, потеря аппетита и «туннельное зрение»: что нормально и как помочь себе.",
        readTimeMin: 3,
        slug: "kak-pozabotitsya-o-sebe-v-pervye-nedeli-gorya",
      },
    ],
  },
];

const START_HERE = [
  {
    id: "first-hours",
    eyebrow: "Сейчас первые часы",
    title: "Что делать в первые 24 часа",
    summary: "Вызовы служб, документы и защита от посторонних агентов.",
    slug: "chto-delat-esli-umer-chelovek",
  },
  {
    id: "morgue",
    eyebrow: "Нужно ехать в морг",
    title: "Одежда и вещи для морга",
    summary: "Точный список вещей, сроки передачи и что не забыть.",
    slug: "odezhda-i-veshi-dlya-morga",
  },
  {
    id: "payments",
    eyebrow: "Просят деньги",
    title: "За что вы обязаны платить, а за что нет",
    summary: "Граница между бесплатной подготовкой и коммерческими услугами.",
    slug: "morg-trebuet-dengi",
  },
] as const;

export default function ArticlesPage() {
  const availableSlugs = new Set(articles.map((article) => article.slug));

  return (
    <main className="min-h-screen bg-[#f6f5f3]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[30px] bg-[#fbfbf9] p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_14px_36px_rgba(15,23,42,0.07)] md:p-8">
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Справочник
            </div>
            <h1 className="mt-3 max-w-[17ch] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-gray-900 text-pretty md:text-5xl">
              Инструкции, когда нужно действовать спокойно
            </h1>
            <p className="mt-5 max-w-[68ch] text-[16px] leading-relaxed text-gray-700 md:text-[17px]">
              {widontRu(
                "Короткие материалы для первых часов, документов, денег, выбора формата и разговоров внутри семьи.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {GUIDE_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex min-h-11 items-center rounded-[13px] bg-[#f0efec] px-3.5 text-[14px] font-semibold text-gray-700 transition hover:bg-[#e8e7e3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          <aside className="rounded-[30px] bg-gray-950 p-5 text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)] md:p-6">
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Если нет времени выбирать
            </div>
            <div className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em]">
              Начните с ситуации
            </div>
            <div className="mt-5 space-y-2">
              {START_HERE.map((item) => {
                const isAvailable = availableSlugs.has(item.slug);
                const body = (
                  <div className="group rounded-[18px] bg-white/[0.07] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/[0.10]">
                    <div className="text-[13px] font-semibold leading-snug text-gray-300">
                      {item.eyebrow}
                    </div>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[16px] font-semibold leading-snug text-white">
                          {widontRu(item.title)}
                        </div>
                        <p className="mt-1 text-[14px] leading-relaxed text-gray-300">
                          {widontRu(item.summary)}
                        </p>
                      </div>
                      <span className="mt-0.5 shrink-0 text-[15px] font-semibold text-gray-400 transition group-hover:text-white">
                        →
                      </span>
                    </div>
                  </div>
                );

                return isAvailable ? (
                  <Link
                    key={item.id}
                    href={`/articles/${item.slug}`}
                    className="block rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/45"
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={item.id}>{body}</div>
                );
              })}
            </div>
          </aside>
        </section>

        <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
          {GUIDE_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <div className="mb-5 flex items-start gap-3 md:mb-6">
                  <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#e9e8e3] text-gray-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                    <SectionIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="max-w-[24ch] text-2xl font-semibold leading-tight tracking-[-0.02em] text-gray-900 text-pretty md:text-3xl">
                      {widontRu(section.title)}
                    </h2>
                    <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-gray-600">
                      {widontRu(section.subtitle)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {section.cards.map((card, index) => {
                    const isAvailable = card.slug
                      ? availableSlugs.has(card.slug)
                      : false;

                    const cardInner = (
                      <article className="h-full rounded-[22px] bg-[#fbfbf9] p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_22px_rgba(15,23,42,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_12px_28px_rgba(15,23,42,0.08)] md:p-5">
                        <div className="flex h-full gap-4">
                          <div className="shrink-0 pt-0.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0efec] text-[14px] font-semibold tabular-nums text-gray-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.055)]">
                              {String(index + 1).padStart(2, "0")}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="inline-flex min-h-8 items-center gap-1.5 rounded-[10px] bg-[#f0efec] px-2.5 text-[13px] font-semibold text-gray-600">
                            <Clock3 className="h-3.5 w-3.5" />
                              {card.readTimeMin} мин.
                            </div>
                            <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-gray-900 text-pretty">
                              {widontRu(card.title)}
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                              {widontRu(card.summary)}
                            </p>
                            <div className="mt-4 text-[14px] font-semibold text-gray-900">
                              {isAvailable ? "Читать статью" : "Скоро"}
                            </div>
                          </div>
                        </div>
                      </article>
                    );

                    if (isAvailable && card.slug) {
                      return (
                        <Link
                          key={card.id}
                          href={`/articles/${card.slug}`}
                          className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                        >
                          {cardInner}
                        </Link>
                      );
                    }

                    return (
                      <div key={card.id} className="block h-full opacity-95">
                        {cardInner}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
