import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Карта сайта — Тихий дом",
  description: "Навигация по основным разделам сайта tihiydom.com.",
};

const links = [
  { href: "/", label: "Главная" },
  { href: "/articles", label: "Справочник" },
  { href: "/faq", label: "Частые вопросы" },
  { href: "/info", label: "Политика конфиденциальности" },
  { href: "/info/offer", label: "Публичная оферта" },
  { href: "/docs/oferta", label: "Договор-оферта" },
  { href: "/docs/payment-rules", label: "Порядок оплаты" },
  { href: "/docs/refund", label: "Политика возврата" },
  { href: "/site-map", label: "Карта сайта" },
];

export default function SiteMapPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold text-neutral-900">Карта сайта</h1>
      <ul className="space-y-3 text-sm text-neutral-700">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-neutral-900">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
