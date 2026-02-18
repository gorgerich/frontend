import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug, type ArticleBlock } from "@/lib/articles";

type ArticlePageProps = {
  params: { slug: string };
};

export function generateMetadata({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Статья не найдена — Тихий дом",
      description:
        "Инструкции и ответы на вопросы об организации похорон и документах",
    };
  }

  if (article.slug === "chto-delat-esli-umer-chelovek") {
    return {
      title: "Что делать, если умер человек — порядок действий",
      description:
        "Пошаговая инструкция, если смерть произошла дома, в больнице или в другом месте. Какие документы нужны и что делать в первые часы.",
    };
  }

  return {
    title: `${article.title} — Тихий дом`,
    description: article.description,
  };
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

const renderBlock = (block: ArticleBlock, index: number) => {
  switch (block.type) {
    case "lead":
      return (
        <p key={index} className="text-lg font-medium text-gray-800">
          {block.content}
        </p>
      );
    case "h2":
      return (
        <h2 key={index} className="text-xl font-semibold text-gray-900">
          {block.content}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="text-lg font-semibold text-gray-900">
          {block.content}
        </h3>
      );
    case "p":
      return (
        <p key={index} className="text-base text-gray-700">
          {block.content}
        </p>
      );
    case "ul":
      return (
        <ul
          key={index}
          className="list-disc space-y-1 pl-5 text-base text-gray-700"
        >
          {block.content.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={index}
          className="list-decimal space-y-1 pl-5 text-base text-gray-700"
        >
          {block.content.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ol>
      );
    default:
      return null;
  }
};

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) return notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Link
          href="/articles"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← К статьям
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          {article.title}
        </h1>
        {article.description && (
          <p className="mt-3 text-base text-gray-600">
            {article.description}
          </p>
        )}
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        <article className="mt-8 space-y-6 text-gray-700 leading-7">
          {article.content.map((block, index) => renderBlock(block, index))}
        </article>
      </div>
    </main>
  );
}
