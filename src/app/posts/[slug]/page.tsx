import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MarkdownRenderer from "@/components/markdown-renderer";
import ViewCounter from "@/components/view-counter";
import { getAdjacentPublished, getPublishedBySlug } from "@/lib/posts";
import { formatDate, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedBySlug(slug);
  if (!article) return { title: `文章不存在 - ${SITE_NAME}` };
  return {
    title: article.title,
    description: article.summary || `${article.title} - ${SITE_NAME}`,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getPublishedBySlug(slug);
  if (!article) notFound();

  const { prev, next } = getAdjacentPublished(article.publishedAt, article.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <article>
          {/* 文章头 */}
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-600">
                {article.category || "未分类"}
              </span>
              {article.tags.map((t) => (
                <span key={t} className="text-gray-400">
                  #{t}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-bold leading-snug tracking-tight text-gray-900 sm:text-3xl">
              {article.title}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
              <span>{formatDate(article.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span>{article.viewCount} 次阅读</span>
            </div>
          </header>

          {/* 封面图 */}
          {article.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover}
              alt={article.title}
              className="mb-8 aspect-video w-full rounded-xl object-cover"
            />
          )}

          {/* 正文 */}
          <MarkdownRenderer content={article.content} />

          {/* 上一篇 / 下一篇 */}
          <nav
            aria-label="相邻文章"
            className="mt-12 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/posts/${prev.slug}`}
                className="group rounded-xl border border-gray-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <p className="text-xs text-gray-400">← 上一篇</p>
                <p className="mt-1 line-clamp-1 font-medium text-gray-900 group-hover:text-indigo-600">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4">
                <p className="text-xs text-gray-300">← 上一篇</p>
                <p className="mt-1 text-sm text-gray-300">已经是第一篇了</p>
              </div>
            )}
            {next ? (
              <Link
                href={`/posts/${next.slug}`}
                className="group rounded-xl border border-gray-200 p-4 text-right transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <p className="text-xs text-gray-400">下一篇 →</p>
                <p className="mt-1 line-clamp-1 font-medium text-gray-900 group-hover:text-indigo-600">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 text-right">
                <p className="text-xs text-gray-300">下一篇 →</p>
                <p className="mt-1 text-sm text-gray-300">已经是最后一篇了</p>
              </div>
            )}
          </nav>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              ← 返回首页
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
      <ViewCounter id={article.id} />
    </>
  );
}
