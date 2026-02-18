import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug, type ArticleBlock } from "@/lib/articles";
import { TELEGRAM_URL } from "@/lib/legalLinks";

export const dynamicParams = true;

type ArticlePageProps = {
  params?: unknown;
  searchParams?: unknown;
};

export function generateMetadata({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug ?? "";
  const article = getArticleBySlug(slug);
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
          {block.content.map((item, itemIndex) => {
            if (typeof item === "string") {
              return <li key={itemIndex}>{item}</li>;
            }
            return (
              <li key={itemIndex}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-2.5 py-1 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-white"
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      );
    case "linkList":
      return (
        <ul key={index} className="space-y-2 text-base text-gray-700">
          {block.content.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-center gap-2">
              <span className="text-gray-400">•</span>
              <Link
                href={item.href}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-white"
              >
                {item.label}
              </Link>
            </li>
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

export default async function Page(props: ArticlePageProps) {
  const resolvedParams = await Promise.resolve(props?.params as any);
  const slugRaw = resolvedParams?.slug;
  const slug = Array.isArray(slugRaw)
    ? slugRaw.join("/")
    : String(slugRaw ?? "");

  const article = getArticleBySlug(slug);
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

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-sm text-gray-700">
            Если нужна поддержка или уточнение — напишите нам в Telegram.
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            Написать в Telegram
          </a>
        </div>
      </div>
    </main>
  );
}
