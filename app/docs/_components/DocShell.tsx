import React from "react";
import { widontRu } from "@/lib/typography";

type DocSection = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type DocShellProps = {
  title: string;
  updatedAt: string;
  sections: DocSection[];
};

export function DocShell({ title, updatedAt, sections }: DocShellProps) {
  return (
    <main className="min-h-screen bg-[#f6f5f3]">
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <header>
          <p className="text-sm uppercase tracking-wider text-gray-500">Документ</p>
          <h1 className="mt-2 max-w-[24ch] text-3xl font-semibold leading-tight text-gray-900 text-pretty">{widontRu(title)}</h1>
          <p className="mt-2 text-base text-gray-600">Дата обновления: {updatedAt}</p>
        </header>

        <nav className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-sm font-semibold uppercase tracking-wider text-neutral-600">Оглавление</div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex min-h-12 items-center whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
              >
                {widontRu(section.label)}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="max-w-[26ch] text-xl font-semibold leading-tight text-gray-900 text-pretty">{widontRu(section.label)}</h2>
              <div className="mt-3 max-w-[72ch] space-y-3 leading-7 text-gray-700">{section.content}</div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Контакты</h2>
          <p className="mt-2 text-sm text-gray-700">
            Email:{" "}
            <a
              href="mailto:info@tihiydom.com"
              className="underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              info@tihiydom.com
            </a>
          </p>
          <p className="mt-1 text-sm text-gray-700">Телефон: +7 (985) 248-94-25</p>
          
        </div>
      </div>
    </main>
  );
}
