'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { TELEGRAM_URL } from '../../lib/legalLinks';

type NavItem =
  | { id: string; label: string; href: string }
  | { id: string; label: string; onClick: () => void };

export function StickyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [topMenuVisible, setTopMenuVisible] = useState(false);
  const [topMenuActive, setTopMenuActive] = useState(false);
  const [isDesktopNav, setIsDesktopNav] = useState(false);

  useEffect(() => {
    if (!topMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTopMenuOpen(false);
    };
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [topMenuOpen]);

  useEffect(() => {
    if (topMenuOpen) {
      setTopMenuVisible(true);
      setTopMenuActive(false);
      const activate = window.setTimeout(() => {
        setTopMenuActive(true);
      }, 20);
      return () => window.clearTimeout(activate);
    }
    setTopMenuActive(false);
    const timeout = window.setTimeout(() => {
      setTopMenuVisible(false);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [topMenuOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 768px)');
    const applyMediaState = (matches: boolean) => {
      setIsDesktopNav(matches);
      if (matches) setTopMenuOpen(false);
    };
    const handleMediaChange = (event: MediaQueryListEvent) => {
      applyMediaState(event.matches);
    };
    applyMediaState(media.matches);
    media.addEventListener('change', handleMediaChange);
    return () => media.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const shouldHideFloating = topMenuOpen && !isDesktopNav;
    document.body.dataset.mobileMenuOpen = shouldHideFloating ? 'true' : 'false';
    return () => {
      document.body.dataset.mobileMenuOpen = 'false';
    };
  }, [topMenuOpen, isDesktopNav]);

  const handleTopContacts = () => {
    setTopMenuOpen(false);
    if (pathname !== '/') {
      router.push('/#contacts');
      return;
    }
    const contactsEl = document.getElementById('contacts');
    if (!contactsEl) {
      router.push('/#contacts');
      return;
    }
    contactsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    contactsEl.setAttribute('data-highlight', 'true');
    window.setTimeout(() => {
      contactsEl.setAttribute('data-highlight', 'false');
    }, 1500);
  };

  const handleTopOpenPackages = () => {
    setTopMenuOpen(false);
    if (pathname !== '/') {
      router.push('/?flow=packages');
      return;
    }
    window.dispatchEvent(new Event('td:open-packages'));
    window.setTimeout(() => {
      const packagesEl = document.getElementById('packages');
      packagesEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const topNavItems: NavItem[] = [
    { id: 'faq', label: 'Частые вопросы', href: '/faq' },
    { id: 'articles', label: 'Справочник', href: '/articles' },
    { id: 'contacts', label: 'Контакты', onClick: handleTopContacts },
  ];

  return (
    <>
      <div className="sticky top-0 z-20 w-full bg-[#f6f5f3]">
        <div
          className={
            isDesktopNav
              ? "w-full px-6 sm:px-7"
              : "w-full px-4 pt-2 sm:px-7"
          }
        >
          <div
            className={
              isDesktopNav
                ? "flex h-16 w-full items-center gap-4"
                : "flex h-16 w-full items-center gap-4 bg-[#f6f5f3] px-4"
            }
          >
            <Link
              href="/"
              onClick={() => setTopMenuOpen(false)}
              className="mr-0 inline-flex shrink-0 items-center gap-3 text-gray-900 transition hover:text-gray-700"
            >
              <Image
                src="/logo.PNG"
                alt="Тихий дом"
                width={33}
                height={33}
                className="h-[33px] w-[33px] rounded-[7px]"
              />
              <span className="inline-flex h-[33px] items-center text-2xl leading-none font-semibold">
                Тихий дом
              </span>
            </Link>
            {isDesktopNav ? (
              <nav className="ml-auto flex items-center justify-end gap-6" style={{ marginRight: 0 }}>
                {topNavItems.map((item) =>
                  'href' in item ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="text-sm font-medium text-gray-700 transition hover:text-black whitespace-nowrap"
                      style={{ marginRight: 0 }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className="text-sm font-medium text-gray-700 transition hover:text-black whitespace-nowrap"
                      style={{ marginRight: 0 }}
                    >
                      {item.label}
                    </button>
                  ),
                )}
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#d9d5ce] bg-white/40 px-5 text-sm font-medium text-gray-700 transition hover:bg-white/70 hover:text-gray-900 whitespace-nowrap"
                >
                  ⚡ Нужна помощь
                </a>
              </nav>
            ) : (
              <button
                type="button"
                onClick={() => setTopMenuOpen((prev) => !prev)}
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/60 text-gray-700 shadow-sm transition hover:bg-white/85"
                aria-expanded={topMenuOpen}
                aria-label="Открыть меню"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {topMenuVisible && !isDesktopNav && (
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-200 ${
            topMenuActive ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setTopMenuOpen(false)}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
          />
          <div
            className={`relative mx-auto w-full max-w-7xl px-4 transition-all duration-200 ease-out ${
              topMenuActive ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
            }`}
          >
            <div
              className={`overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out ${
                topMenuActive
                  ? 'max-h-[80vh] translate-y-0 opacity-100'
                  : 'max-h-0 -translate-y-10 opacity-0'
              }`}
            >
              <div className="min-h-[230px] rounded-b-3xl border border-white/45 bg-white/95 px-5 pb-6 pt-5 shadow-[0_24px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setTopMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-base font-semibold text-gray-900 transition hover:text-gray-700"
                >
                  <Image
                    src="/logo.PNG"
                    alt="Тихий дом"
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] rounded-[5px]"
                  />
                  <span>Тихий дом</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setTopMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 shadow-sm transition hover:bg-white"
                  aria-label="Закрыть меню"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-5 flex flex-col gap-1">
                {topNavItems.map((item) =>
                  'href' in item ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setTopMenuOpen(false)}
                      className="rounded-full px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-100/80"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className="rounded-full px-3 py-3 text-left text-base font-medium text-gray-800 transition hover:bg-gray-100/80"
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </nav>
              <div className="mt-4 grid gap-2">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTopMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#63ADEC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ED]"
                >
                  Написать координатору
                </a>
                <button
                  type="button"
                  onClick={handleTopOpenPackages}
                  className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Рассчитать стоимость
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

