import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const stories = [
  {
    step: 1,
    title: "Спокойствие и контроль",
    description: "Мы создали пространство, где вы можете организовать прощание без спешки, давления и лишних звонков."
  },
  {
    step: 2,
    title: "Понятные решения",
    description: "Простой пошаговый процесс поможет вам выбрать только то, что действительно нужно, избегая навязанных услуг."
  },
  {
    step: 3,
    title: "Прозрачные цены",
    description: "Стоимость рассчитывается мгновенно по мере вашего выбора. Никаких скрытых платежей и неожиданных доплат."
  },
  {
    step: 4,
    title: "Официальные документы",
    description: "Мы берем на себя оформление всех необходимых документов, чтобы вы могли сосредоточиться на главном."
  },
  {
    step: 5,
    title: "Поддержка 24/7",
    description: "Наш цифровой помощник и команда заботы всегда рядом, чтобы ответить на любые вопросы."
  }
];

export function OnboardingStories({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStory, setCurrentStory] = useState(0);

  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStory > 0) {
      setCurrentStory((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStory, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Фоновое размытие */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity"
            onClick={onClose}
          />

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/80 hover:text-white transition-all duration-200 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
              className="relative w-full h-full md:max-w-lg md:aspect-square md:max-h-[600px] md:rounded-[40px] bg-slate-900/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden"
            >
              {/* Декоративный фон */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

              {/* Контент Stories */}
              <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-12 pt-[calc(6rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStory}
                    initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    {/* Номер шага */}
                    <div className="relative mb-8 md:mb-12 shrink-0">
                      <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner ring-1 ring-white/10">
                        <span className="text-3xl md:text-4xl text-white font-serif italic opacity-90">
                          {stories[currentStory].step}
                        </span>
                      </div>
                    </div>

                    {/* Текстовый контент */}
                    <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                      <h2 className="text-2xl md:text-4xl text-white font-light mb-4 tracking-tight leading-tight">
                        {stories[currentStory].title}
                      </h2>

                      <p className="text-base md:text-lg text-blue-100/70 font-light leading-relaxed mb-8 md:mb-10">
                        {stories[currentStory].description}
                      </p>

                      {/* Кнопка на последнем слайде */}
                      {currentStory === stories.length - 1 && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          onClick={onClose}
                          className="group relative px-10 py-3 md:py-4 rounded-full bg-white text-slate-900 font-medium text-base hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300"
                        >
                          <span className="relative z-10">Начать работу</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-white to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Навигационные кнопки */}
              {currentStory > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all duration-300 z-30 group"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {currentStory < stories.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all duration-300 z-30 group"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Индикаторы прогресса */}
              <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2 z-30">
                {stories.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStory
                        ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                        : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}