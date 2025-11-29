import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-8 md:px-8 md:py-12">
        {/* Шапка / логотип */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-white/10" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                Цифровой сервис
              </span>
              <span className="text-sm font-medium">Тихий Дом</span>
            </div>
          </div>

          <nav className="hidden gap-4 text-sm text-white/70 md:flex">
            <a href="#about" className="hover:text-white">
              О сервисе
            </a>
            <a href="#how" className="hover:text-white">
              Как начать?
            </a>
            <a href="#ai" className="hover:text-white">
              Создать с ИИ
            </a>
          </nav>
        </header>

        {/* HERO с тремя кнопками */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-center">
          <div>
            <div className="mb-4 flex gap-2 md:hidden">
              <a
                href="#about"
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-xs font-medium backdrop-blur hover:bg-white/16"
              >
                О сервисе
              </a>
              <a
                href="#how"
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-xs font-medium backdrop-blur hover:bg-white/16"
              >
                Как начать?
              </a>
              <a
                href="#ai"
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-xs font-medium backdrop-blur hover:bg-white/16"
              >
                Создать с ИИ
              </a>
            </div>

            <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">
              Самостоятельная организация прощания без агентств и давления
            </h1>

            <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
              Платформа, где вы формируете полный заказ: формат церемонии,
              логистику, атрибутику и услуги сопровождения. Мы собираем всё в
              одну понятную смету с финальной ценой и передаём исполнение
              проверенным партнёрам.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#wizard"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-lg shadow-white/10 hover:bg-neutral-100"
              >
                Начать организацию
              </a>
              <a
                href="#ai"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
              >
                Создать с ИИ в один клик
              </a>
            </div>

            <p className="mt-3 text-xs text-white/50">
              Без звонков агентам, без навязанных услуг. Всё — в одном интерфейсе.
            </p>
          </div>

          {/* Правый визуальный блок (пока заглушка вместо фото) */}
          <div className="relative h-52 overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-[2px] md:h-64">
            <div className="flex h-full w-full flex-col justify-between rounded-[22px] bg-gradient-to-b from-white/6 to-black/80 p-5">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                Черновик заказа
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <div className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2">
                  <span>Церемония</span>
                  <span className="text-white/60">Гражданская, 2 часа</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2">
                  <span>Локация</span>
                  <span className="text-white/60">Зал + кладбище</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2">
                  <span>Атрибутика</span>
                  <span className="text-white/60">Гроб, венок, цветы</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2">
                  <span>Сопровождение</span>
                  <span className="text-white/60">Координатор, транспорт</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-xs font-medium text-black">
                <span>Итого по смете</span>
                <span>от 00 000 ₽</span>
              </div>
            </div>
          </div>
        </section>

        {/* Блок "О сервисе" */}
        <section id="about" className="space-y-3 text-sm text-white/75">
          <h2 className="text-base font-medium text-white">О сервисе</h2>
          <p>
            «Тихий Дом» — цифровой помощник, который позволяет самостоятельно
            собрать церемонию прощания: от документации и логистики до выбора
            гроба, венка и зала. Вместо звонков в агентства вы спокойно
            заполняете шаги онлайн, видите стоимость и состав услуг на каждом
            этапе.
          </p>
        </section>

        {/* Пошаговый мастер (упрощённый) */}
        <section
          id="wizard"
          className="rounded-3xl bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        >
          <h2 className="text-lg font-medium">Пошаговый мастер</h2>
          <p className="mt-1 text-sm text-white/70">
            Организуйте церемонию прощания в 5 шагов. Вы заполняете только
            необходимое — платформа собирает заказ и показывает финальную цену.
          </p>

          <div className="mt-5 grid gap-4 text-sm md:grid-cols-5">
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="text-xs text-white/50">Шаг 1</div>
              <div className="mt-1 font-medium">Формат</div>
              <p className="mt-1 text-xs text-white/60">
                Тип церемонии, гражданская / религиозная / комбинированная.
              </p>
            </div>
            <div className="rounded-2xl bg-white/4 p-3">
              <div className="text-xs text-white/50">Шаг 2</div>
              <div className="mt-1 font-medium">Логистика</div>
              <p className="mt-1 text-xs text-white/60">
                Место прощания, кладбище, транспорт, время.
              </p>
            </div>
            <div className="rounded-2xl bg-white/4 p-3">
              <div className="text-xs text-white/50">Шаг 3</div>
              <div className="mt-1 font-medium">Атрибутика</div>
              <p className="mt-1 text-xs text-white/60">
                Гроб, венки, композиции, текстиль, дополнительные детали.
              </p>
            </div>
            <div className="rounded-2xl bg-white/4 p-3">
              <div className="text-xs text-white/50">Шаг 4</div>
              <div className="mt-1 font-medium">Сопровождение</div>
              <p className="mt-1 text-xs text-white/60">
                Координатор, ведущий, носильщики, музыка, фото/видео.
              </p>
            </div>
            <div className="rounded-2xl bg-white/4 p-3">
              <div className="text-xs text-white/50">Шаг 5</div>
              <div className="mt-1 font-medium">Итоговая смета</div>
              <p className="mt-1 text-xs text-white/60">
                Проверка данных, финальная цена, передача заказа исполнителям.
              </p>
            </div>
          </div>
        </section>

        {/* Блок про ИИ */}
        <section id="ai" className="space-y-3 rounded-3xl bg-white/3 p-5 text-sm">
          <h2 className="text-base font-medium text-white">Создать с ИИ</h2>
          <p className="text-white/75">
            Вы выбираете, какой образ прощания вам ближе, отвечаете на несколько
            вопросов — и цифровой помощник предлагает готовый сценарий с
            подобранными услугами и атрибутикой. Наша команда проверяет заказ,
            берёт ответственность за исполнение и остаётся с вами на связи.
          </p>
        </section>
      </main>
    </div>
  );
}