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

export default function ArticlesPage() {
  const availableSlugs = new Set(articles.map((article) => article.slug));

  return (
    <main className="min-h-screen bg-[#f6f5f3]">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-10 rounded-3xl border border-white/40 bg-white/70 p-6 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-8">
          <h1 className="max-w-[20ch] text-3xl font-semibold leading-tight text-gray-900 text-pretty md:text-4xl">
            Справочник
          </h1>
          <p className="mt-3 max-w-[72ch] text-base leading-relaxed text-gray-700">
            Короткие и понятные инструкции: как защитить себя от обмана,
            оформить документы и организовать всё без лишнего стресса.
          </p>
        </div>

        <div className="space-y-8 md:space-y-10">
          {GUIDE_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <section
                key={section.id}
                className="rounded-3xl border border-white/35 bg-white/65 p-5 backdrop-blur-xl shadow-[0_10px_26px_rgba(15,23,42,0.07)] md:p-6"
              >
                <div className="mb-5 flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/70 text-slate-700">
                    <SectionIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="max-w-[24ch] text-xl font-semibold leading-tight text-gray-900 text-pretty md:text-2xl">
                      {widontRu(section.title)}
                    </h2>
                    <p className="mt-1 max-w-[68ch] text-base leading-relaxed text-gray-600">
                      {widontRu(section.subtitle)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.cards.map((card, index) => {
                    const isAvailable = card.slug
                      ? availableSlugs.has(card.slug)
                      : false;
                    const gradient =
                      index % 3 === 0
                        ? "from-slate-100 via-zinc-100 to-white"
                        : index % 3 === 1
                        ? "from-sky-100/70 via-slate-100 to-white"
                        : "from-zinc-100 via-neutral-100 to-white";

                    const cardInner = (
                      <article className="h-full overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-[0_8px_20px_rgba(15,23,42,0.07)] transition hover:shadow-[0_12px_26px_rgba(15,23,42,0.11)]">
                        <div
                          className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${gradient}`}
                        >
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/75 text-slate-700 shadow-sm">
                            <SectionIcon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-600">
                            <Clock3 className="h-3.5 w-3.5" />
                            Время чтения: {card.readTimeMin} мин.
                          </div>
                          <h3 className="mt-3 max-w-[34ch] text-base font-semibold leading-snug text-slate-900 text-pretty">
                            {widontRu(card.title)}
                          </h3>
                          <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-slate-600">
                            {widontRu(card.summary)}
                          </p>
                          <div className="mt-4 text-sm font-semibold text-slate-900">
                            {isAvailable ? "Читать" : "Скоро"}
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
