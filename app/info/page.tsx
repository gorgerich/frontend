import type { Metadata } from "next";
import { PrivacyPolicyContent } from "./privacyPolicyContent";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Тихий дом",
  description:
    "Политика конфиденциальности сервиса Тихий дом: обработка персональных данных, цели и права пользователей.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-neutral-900 mb-4 uppercase">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Актуальная версия политики конфиденциальности для пользователей tihiydom.com
      </p>
      <PrivacyPolicyContent />
    </main>
  );
}
