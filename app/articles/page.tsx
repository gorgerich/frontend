import Link from "next/link";
import Image from "next/image";
import { articles } from "@/lib/articles";

export const metadata = {
  title: "Статьи — Тихий дом",
  description:
    "Инструкции и ответы на вопросы об организации похорон и документах",
};

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Статьи</h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            Понятные инструкции и ответы на частые вопросы
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block"
            >
              <article className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    priority
                  />
                </div>
                <div className="p-5">
                  {article.date && (
                    <div className="text-xs uppercase tracking-wider text-gray-500">
                      {article.date}
                    </div>
                  )}
                  <h2 className="mt-2 text-lg font-semibold text-gray-900">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {article.description}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-gray-900">
                    Читать
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
