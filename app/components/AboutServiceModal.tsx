import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Shield, Calculator, Clock } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Пошаговый процесс',
    description: 'Понятный алгоритм. Помогаем пройти процесс без паники, шаг за шагом: от оформления тяжелых документов до выбора формата прощания и логистики.'
  },
  {
    icon: Shield,
    title: 'Честные цены',
    description: 'Фиксированная смета. Никаких скрытых комиссий и навязанных услуг в морге. Вы видите итоговую стоимость каждого решения до подписания договора.'
  },
  {
    icon: Calculator,
    title: 'Живой расчет стоимости',
    description: 'Мгновенный перерасчет. Стоимость обновляется на экране в реальном времени. Вы всегда понимаете, за что именно платите, добавляя или убирая услуги.'
  },
  {
    icon: Clock,
    title: 'В вашем ритме',
    description: 'Бережный формат. Без назойливых звонков, спешки и давления агентов. Принимайте решения, советуйтесь с семьей и делайте паузы тогда, когда вам это нужно.'
  }
];

export function AboutServiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1300] flex items-center justify-center overflow-hidden"
        >
          {/* Фоновое размытие */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity" 
            onClick={onClose}
          />

          {/* Контейнер модального окна */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            data-td-topbuttons-overlay-content="true"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-service-title"
            className="relative w-full h-full md:h-auto md:max-w-5xl md:max-h-[90vh] md:rounded-[40px] overflow-hidden md:overflow-y-auto bg-slate-900/40 shadow-2xl ring-1 ring-white/10"
          >
            {/* Кнопка закрытия (крестик) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть модальное окно"
              className="absolute top-6 right-6 z-50 inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/80 hover:text-white transition-all duration-200 border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Скролл-контейнер для мобильных, обычный контейнер для десктопа */}
            <div className="relative z-10 h-full overflow-y-auto md:h-auto md:overflow-visible">
              <div className="min-h-full flex flex-col justify-center p-6 md:p-12 lg:p-16 pt-[calc(6rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] max-w-6xl mx-auto">
                {/* Декоративный фоновый элемент */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

                {/* Заголовок */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative mb-10 md:mb-12 text-center"
                >
                  <h2 id="about-service-title" className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 tracking-tight">
                  Как это <span className="font-serif italic text-blue-200/90">работает?</span>
                  </h2>
                  <p className="text-lg md:text-2xl text-blue-100/90 font-normal max-w-3xl mx-auto leading-relaxed tracking-wide">
                    «Тихий дом» — это цифровой сервис для дистанционной организации прощания. Вы полностью контролируете процесс, а мы защищаем вас от давления посредников и скрытых наценок.
                  </p>
                </motion.div>

                {/* Сетка преимуществ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="group p-6 md:p-8 rounded-3xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-200 group-hover:text-white group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl text-white font-medium mb-2 tracking-wide">
                            {feature.title}
                          </h3>
                          <p className="text-base text-blue-100/90 font-normal leading-relaxed group-hover:text-blue-100/90 transition-colors">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Кнопка закрытия (внизу) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      const element = document.querySelector('.stepper-overlay-position');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="group relative px-10 py-4 rounded-full bg-white text-slate-900 text-lg font-medium tracking-wide overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">Начать</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-white to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
