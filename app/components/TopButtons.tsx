"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles } from "lucide-react";
import { AIChatModal } from "./AIChatModal";
import { AboutServiceModal } from "./AboutServiceModal";
import { DeathActionGuideModal } from "./DeathActionGuideModal";

export function TopButtons() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDeathGuideOpen, setIsDeathGuideOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleOpenStepper = (tariffName: string) => {
    setSelectedTariff(tariffName);
    setIsAIChatOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4 md:gap-6 pointer-events-auto px-4 md:px-0 max-w-full">
        {/* Левая кнопка: О сервисе */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAboutOpen(true)}
          className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center flex-shrink-0"
          aria-label="О сервисе"
        >
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Info className="relative w-7 h-7 md:w-8 md:h-8 text-white/90 group-hover:text-white transition-colors" />
        </motion.button>

        {/* Центральная кнопка: Как начать */}
        <motion.button
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.25, 1],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDeathGuideOpen(true)}
          className="group relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-300 hover:border-white/50 flex-shrink-0"
          aria-label="Первые действия"
        >
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span
            className="relative text-white/90 group-hover:text-white transition-colors text-[34px] md:text-[48px] font-black leading-none"
            aria-hidden="true"
          >
            ?
          </span>
        </motion.button>

        {/* Правая кнопка: Создать с ИИ */}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAIChatOpen(true)}
          className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center flex-shrink-0"
          aria-label="Создать с ИИ"
        >
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Sparkles className="relative w-6 h-6 md:w-8 md:h-8 text-white/90 group-hover:text-white transition-colors" />
          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white text-[9px] md:text-[10px] shadow-lg border border-gray-600/30">
            Ai
          </div>
        </motion.button>
      </div>

      {/* Модальные окна рендерим через портал прямо в body */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <AboutServiceModal
              isOpen={isAboutOpen}
              onClose={() => setIsAboutOpen(false)}
            />
            <AIChatModal
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
              onOpenStepper={handleOpenStepper}
            />
            <DeathActionGuideModal
              isOpen={isDeathGuideOpen}
              onClose={() => setIsDeathGuideOpen(false)}
            />
          </>,
          document.body
        )}
    </>
  );
}
