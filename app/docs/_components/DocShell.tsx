import React from "react";

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
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <header>
          <p className="text-xs uppercase tracking-wider text-gray-500">Документ</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Дата обновления: {updatedAt}</p>
        </header>

        <nav className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Оглавление</div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100"
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900">{section.label}</h2>
              <div className="mt-3 space-y-3 leading-7 text-gray-700">{section.content}</div>
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
