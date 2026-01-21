import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Публичная оферта — Тихий дом",
  description:
    "Публичная оферта сервиса Тихий дом. Условия оказания услуг и порядок взаимодействия.",
};

export default function OfferPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Публичная оферта</h1>
      <p className="text-sm text-neutral-500 mb-8">Текст оферты будет размещен на этой странице.</p>
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700 leading-relaxed">
        <p>
          Пожалуйста, вставьте актуальный текст публичной оферты. Здесь будет размещено полное описание условий
          оказания услуг, прав и обязанностей сторон.
        </p>
      </div>
    </main>
  );
}
