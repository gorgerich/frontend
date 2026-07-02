import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyTextBlock from "@/app/components/CopyTextBlock";
import { articles, getArticleBySlug, type ArticleBlock } from "@/lib/articles";
import { TELEGRAM_URL } from "@/lib/legalLinks";
import { widontRu } from "@/lib/typography";

export const dynamicParams = true;

type ArticlePageProps = {
  params?: { slug?: string | string[] } | Promise<{ slug?: string | string[] }>;
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
        <p key={index} className="max-w-[66ch] text-lg font-medium leading-relaxed text-gray-800">
          {widontRu(block.content)}
        </p>
      );
    case "h2":
      return (
        <h2 key={index} className="max-w-[28ch] text-xl font-semibold leading-tight text-gray-900 text-pretty">
          {widontRu(block.content)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="max-w-[34ch] text-lg font-semibold leading-tight text-gray-900 text-pretty">
          {widontRu(block.content)}
        </h3>
      );
    case "p":
      return (
        <p key={index} className="max-w-[72ch] text-base leading-relaxed text-gray-700">
          {widontRu(block.content)}
        </p>
      );
    case "copyBlock":
      return <CopyTextBlock key={index} text={block.content} />;
    case "ul":
      return (
        <ul
          key={index}
          className="max-w-[72ch] list-disc space-y-1.5 pl-5 text-base leading-relaxed text-gray-700"
        >
          {block.content.map((item, itemIndex) => {
            if (typeof item === "string") {
              return <li key={itemIndex}>{widontRu(item)}</li>;
            }
            return (
              <li key={itemIndex}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center rounded-full border border-neutral-200 bg-white/70 px-2.5 py-1 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                >
                  {widontRu(item.label)}
                </a>
              </li>
            );
          })}
        </ul>
      );
    case "linkList":
      return (
        <ul key={index} className="max-w-[72ch] space-y-2 text-base leading-relaxed text-gray-700">
          {block.content.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-center gap-2">
              <span className="text-gray-400">•</span>
              <Link
                href={item.href}
                className="inline-flex min-h-12 items-center rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
              >
                {widontRu(item.label)}
              </Link>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={index}
          className="max-w-[72ch] list-decimal space-y-1.5 pl-5 text-base leading-relaxed text-gray-700"
        >
          {block.content.map((item, itemIndex) => (
            <li key={itemIndex}>{widontRu(item)}</li>
          ))}
        </ol>
      );
    default:
      return null;
  }
};

export default async function Page(props: ArticlePageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const slugRaw = resolvedParams?.slug;
  const slug = Array.isArray(slugRaw)
    ? slugRaw.join("/")
    : String(slugRaw ?? "");

  const article = getArticleBySlug(slug);
  if (!article) return notFound();

  return (
    <main className="min-h-screen bg-[#f6f5f3]">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Link
          href="/articles"
          className="inline-flex min-h-12 items-center text-sm font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
        >
          ← К справочнику
        </Link>
        <h1 className="mt-3 max-w-[24ch] text-3xl font-semibold leading-tight text-gray-900 text-pretty">
          {widontRu(article.title)}
        </h1>
        {article.description && (
          <p className="mt-3 max-w-[72ch] text-base leading-relaxed text-gray-600">
            {widontRu(article.description)}
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
          <p className="max-w-[68ch] text-sm leading-relaxed text-gray-700">
            {widontRu("Если нужна поддержка или уточнение — напишите нам в Telegram.")}
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25"
          >
            Написать в Telegram
          </a>
        </div>
      </div>
    </main>
  );
}
