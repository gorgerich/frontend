import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Карта сайта — Тихий дом",
  description: "Навигация по основным разделам сайта tihiydom.com.",
};

const links = [
  { href: "/", label: "Главная" },
  { href: "/info", label: "Политика конфиденциальности" },
  { href: "/info/offer", label: "Публичная оферта" },
  { href: "/sitemap", label: "Карта сайта" },
];

export default function SiteMapPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-neutral-900 mb-6">Карта сайта</h1>
      <ul className="space-y-3 text-sm text-neutral-700">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-neutral-900 transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
