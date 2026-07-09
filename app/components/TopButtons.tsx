"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles, Search, MessageCircle } from "lucide-react";
import { AIChatModal } from "./AIChatModal";
import { AboutServiceModal } from "./AboutServiceModal";
import { DeathActionGuideModal } from "./DeathActionGuideModal";
import { Input } from "./ui/input";
import { TELEGRAM_URL } from "@/lib/legalLinks";
import type { Ref } from "react";

const SEARCH_LINKS = [
  { label: "Тарифы", href: "/#packages", keywords: "цены пакеты стоимость рассчитать план" },
  { label: "Справочник", href: "/articles", keywords: "статьи инструкции документы морг помощь" },
  {
    label: "Что делать в первые 24 часа",
    href: "/articles/chto-delat-esli-umer-chelovek",
    keywords: "умер смерть первые часы чеклист 112 скорая полиция",
  },
  {
    label: "Одежда и вещи для морга",
    href: "/articles/odezhda-i-veshi-dlya-morga",
    keywords: "морг одежда вещи список что взять",
  },
  {
    label: "Морг требует деньги",
    href: "/articles/morg-trebuet-dengi",
    keywords: "доплаты морг деньги платно бесплатно навязали",
  },
  {
    label: "Пособие на погребение",
    href: "/articles/kak-poluchit-posobie-na-pogrebenie-v-2026-godu",
    keywords: "выплаты деньги пособие документы",
  },
  { label: "Политика конфиденциальности", href: "/info", keywords: "данные privacy" },
  { label: "Публичная оферта", href: "/docs/oferta", keywords: "договор условия" },
  { label: "Порядок оплаты", href: "/docs/payment-rules", keywords: "карта платеж ссылка" },
  { label: "Политика возврата средств", href: "/docs/refund", keywords: "возврат деньги отмена" },
] as const;

export function TopSearch() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLinks = SEARCH_LINKS.filter((item) =>
    `${item.label} ${item.keywords}`.toLowerCase().includes(normalizedQuery),
  );

  useEffect(() => {
    const handleDocClick = (event: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div
        className="flex min-h-11 items-center gap-2.5 rounded-full bg-white/40 px-3 py-2 text-sm font-medium text-gray-800 backdrop-blur-md shadow-lg shadow-white/5 transition"
        onClick={() => searchInputRef.current?.focus()}
      >
        <Search className="pointer-events-none h-4 w-4 text-gray-700 drop-shadow-sm" />
        <Input
          ref={searchInputRef}
          id="td-search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSearchOpen(false);
          }}
          placeholder="Поиск по сайту"
          className="h-6 w-full !border-0 !bg-transparent p-0 text-sm font-medium text-gray-900 placeholder:text-gray-600 caret-gray-900 !outline-none !ring-0 focus:!ring-0 focus:!outline-none !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
        />
      </div>
      {searchOpen && normalizedQuery.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-white/40 bg-white/95 p-2 text-sm text-gray-800 shadow-lg">
          {filteredLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block min-h-10 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1794FD]/35"
              onClick={() => setSearchOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {!filteredLinks.length && (
            <div className="px-3 py-2 text-sm text-gray-500">Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}

export function TopTelegramButton({ className }: { className?: string }) {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        "flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-md hover:text-white transition"
      }
    >
      <MessageCircle className="h-4 w-4" />
      <span>Написать</span>
    </a>
  );
}

export function TopButtons({ questionButtonRef }: { questionButtonRef?: Ref<HTMLButtonElement> }) {
  const [activeOverlay, setActiveOverlay] = useState<"ai" | "about" | "death" | null>(null);
  const interactiveRootRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleOpenStepper = () => {
    setActiveOverlay(null);
    requestAnimationFrame(() => {
      document.getElementById("packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (!activeOverlay) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const root = interactiveRootRef.current;
      if (root?.contains(target)) return;

      if (target instanceof Element && target.closest('[data-td-topbuttons-overlay-content="true"]')) {
        return;
      }

      setActiveOverlay(null);
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => document.removeEventListener("pointerdown", handlePointerDownOutside);
  }, [activeOverlay]);

  return (
    <>
      <div ref={interactiveRootRef}>
        {/* Mobile: только 3 круглые кнопки по центру */}
        <div className="flex items-center justify-center gap-4 pointer-events-auto md:hidden">
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveOverlay((prev) => (prev === "about" ? null : "about"))}
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
            onClick={() => setActiveOverlay((prev) => (prev === "death" ? null : "death"))}
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
            onClick={() => setActiveOverlay((prev) => (prev === "ai" ? null : "ai"))}
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

        {/* Desktop: кнопки в одну линию, центрированы как группа */}
        <div className="hidden w-full pointer-events-auto md:block">
          <div className="flex w-full items-center justify-center gap-4">
            <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveOverlay((prev) => (prev === "about" ? null : "about"))}
            className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center"
            aria-label="О сервисе"
          >
            <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Info className="relative w-7 h-7 md:w-8 md:h-8 text-white/90 group-hover:text-white transition-colors" />
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
            onClick={() => setActiveOverlay((prev) => (prev === "death" ? null : "death"))}
            ref={questionButtonRef}
            className="group relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-300 hover:border-white/50"
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

            <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveOverlay((prev) => (prev === "ai" ? null : "ai"))}
            className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30 flex items-center justify-center"
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
      </div>

      {/* Модальные окна рендерим через портал прямо в body */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <AboutServiceModal
              isOpen={activeOverlay === "about"}
              onClose={() => setActiveOverlay(null)}
            />
            <AIChatModal
              isOpen={activeOverlay === "ai"}
              onClose={() => setActiveOverlay(null)}
              onOpenStepper={handleOpenStepper}
            />
            <DeathActionGuideModal
              isOpen={activeOverlay === "death"}
              onClose={() => setActiveOverlay(null)}
            />
          </>,
          document.body
        )}
    </>
  );
}
