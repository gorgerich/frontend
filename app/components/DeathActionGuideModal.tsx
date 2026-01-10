import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, FileText, AlertTriangle, HeartHandshake } from 'lucide-react';

const steps = [
  {
    icon: Phone,
    title: 'Вызовите службы',
    description: 'Если смерть наступила дома, позвоните в скорую (103) и полицию (102). Если в больнице — вам сообщат сотрудники отделения.'
  },
  {
    icon: FileText,
    title: 'Подготовьте документы',
    description: 'Понадобятся паспорт умершего и ваш паспорт. Медицинские сотрудники выдадут справку о констатации смерти.'
  },
  {
    icon: AlertTriangle,
    title: 'Остерегайтесь мошенников',
    description: 'Не передавайте документы и деньги людям, которых вы не вызывали. Все услуги должны оформляться только по вашему решению.'
  },
  {
    icon: HeartHandshake,
    title: 'Организация прощания',
    description: '«Тихий Дом» поможет вам спокойно и самостоятельно организовать прощание — в одном месте, без давления и навязанных услуг.'
  }
];

export function DeathActionGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const handleStart = () => {
    onClose();
    if (typeof document === 'undefined') return;
    const element = document.querySelector('.stepper-overlay-position');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

          {/* Контейнер модального окна */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[min(960px,calc(100vw-24px))] max-h-[90vh] overflow-hidden rounded-[32px] md:rounded-[40px] bg-slate-900/40 shadow-2xl ring-1 ring-white/10"
          >
            {/* Кнопка закрытия */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/80 hover:text-white transition-all duration-200 border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Контент */}
            <div className="relative z-10 flex h-full flex-col">
              {/* Декоративный фон */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-red-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

              {/* Заголовок */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="shrink-0 px-6 pt-[calc(5rem+env(safe-area-inset-top))] md:px-10 md:pt-10 text-center"
              >
                <h2 className="text-3xl md:text-5xl font-light text-white mb-4 tracking-tight">
                  Первые действия
                </h2>
                <p className="text-base md:text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
                  Действия в случае смерти близкого человека.
                </p>
              </motion.div>

              {/* Сетка шагов */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-8 md:px-10 md:pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="group p-5 md:p-6 rounded-3xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 p-3 rounded-2xl bg-white/10 border border-white/20 text-white group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg text-white font-medium mb-2 tracking-wide">
                            {step.title}
                          </h3>
                          <p className="text-sm text-white/70 font-light leading-relaxed group-hover:text-white/90 transition-colors">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Кнопка действия */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="shrink-0 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 md:px-10 border-t border-white/10 flex justify-center"
              >
                <button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
                >
                  Начать организацию
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
