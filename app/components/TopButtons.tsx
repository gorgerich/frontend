"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles, Search, Phone } from "lucide-react";
import { AIChatModal } from "./AIChatModal";
import { AboutServiceModal } from "./AboutServiceModal";
import { DeathActionGuideModal } from "./DeathActionGuideModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { TELEGRAM_URL } from "@/lib/legalLinks";

export function TopButtons() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDeathGuideOpen, setIsDeathGuideOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTariff, setSelectedTariff] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const SEARCH_LINKS = [
    { label: "Тарифы", href: "#packages" },
    { label: "Политика конфиденциальности", href: "/info" },
    { label: "Публичная оферта", href: "/docs/oferta" },
    { label: "Порядок оплаты", href: "/docs/payment-rules" },
    { label: "Политика возврата средств", href: "/docs/refund" },
  ];

  const filteredLinks = SEARCH_LINKS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const handleOpenStepper = (tariffName: string) => {
    setSelectedTariff(tariffName);
    setIsAIChatOpen(false);
  };

  return (
    <>
      <>
        {/* Mobile: только 3 круглые кнопки по центру */}
        <div className="flex items-center justify-center gap-4 pointer-events-auto md:hidden">
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAboutOpen(true)}
            className="group relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center"
            aria-label="О сервисе"
          >
            <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Info className="relative w-7 h-7 text-white/90 group-hover:text-white transition-colors" />
          </motion.button>
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
            className="group relative w-20 h-20 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-300 hover:border-white/50"
            aria-label="Первые действия"
          >
            <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span
              className="relative text-white/90 group-hover:text-white transition-colors text-[34px] font-black leading-none"
              aria-hidden="true"
            >
              ?
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAIChatOpen(true)}
            className="group relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center"
            aria-label="Создать с ИИ"
          >
            <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="relative w-6 h-6 text-white/90 group-hover:text-white transition-colors" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white text-[9px] shadow-lg border border-gray-600/30">
              Ai
            </div>
          </motion.button>
        </div>

        {/* Desktop: как на скрине (поиск + написать) */}
        <div className="relative hidden md:block w-full pointer-events-auto">
          {/* Левая зона: О сервисе + Поиск */}
          <div className="absolute left-0 top-0 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAboutOpen(true)}
              className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center"
              aria-label="О сервисе"
            >
              <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Info className="relative w-7 h-7 md:w-8 md:h-8 text-white/90 group-hover:text-white transition-colors" />
            </motion.button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-md hover:text-white transition w-[200px] sm:w-[220px] md:w-[240px]"
            >
              <span>Поиск</span>
              <Search className="h-4 w-4" />
            </button>
          </div>

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
            className="group absolute left-1/2 top-0 w-20 h-20 md:w-28 md:h-28 -translate-x-1/2 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-300 hover:border-white/50"
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

          {/* Правая зона: Написать + AI */}
          <div className="absolute right-0 top-0 flex items-center gap-3">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-md hover:text-white transition"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Написать</span>
            </a>
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAIChatOpen(true)}
              className="group w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center"
              aria-label="Создать с ИИ"
            >
              <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="relative w-6 h-6 md:w-8 md:h-8 text-white/90 group-hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white text-[9px] md:text-[10px] shadow-lg border border-gray-600/30">
                Ai
              </div>
            </motion.button>
          </div>
        </div>
      </>

      {/* Модальные окна рендерим через портал прямо в body */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Поиск</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Введите запрос…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2"
                />
                <div className="mt-4 space-y-2">
                  {filteredLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setSearchOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                  {!filteredLinks.length && (
                    <div className="text-sm text-gray-500">Ничего не найдено</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
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
