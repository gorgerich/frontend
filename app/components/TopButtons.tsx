"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Info, Play, Sparkles } from "lucide-react";
import { OnboardingStories } from "./OnboardingStories";
import { AIChatModal } from "./AIChatModal";
import { AboutServiceModal } from "./AboutServiceModal";

export function TopButtons() {
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<string | null>(null);

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
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsStoriesOpen(true)}
          className="group relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-300 hover:border-white/50 flex-shrink-0"
          aria-label="Как начать"
        >
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Play className="relative w-8 h-8 md:w-11 md:h-11 text-white fill-white/80 ml-0.5 group-hover:text-white group-hover:fill-white transition-colors" />
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
            <OnboardingStories
              isOpen={isStoriesOpen}
              onClose={() => setIsStoriesOpen(false)}
            />
            <AIChatModal
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
              onOpenStepper={handleOpenStepper}
            />
          </>,
          document.body
        )}
    </>
  );
}