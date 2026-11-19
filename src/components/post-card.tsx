import Link from "next/link";
import type { Article } from "@/lib/posts";
import { formatDate } from "@/lib/site";

export default function PostCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/posts/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md sm:flex-row"
    >
      {/* 封面图 */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-gradient-to-br from-indigo-100 via-sky-50 to-white sm:h-auto sm:w-56">
        {article.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-40 w-full items-center justify-center">
            <span className="text-4xl font-bold text-indigo-200">
              {article.title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>

      {/* 文字区 */}
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-600">
            {article.category || "未分类"}
          </span>
          {article.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-gray-400">
              #{t}
            </span>
          ))}
        </div>

        <h2 className="text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-indigo-600 sm:text-xl">
          {article.title}
        </h2>

        {article.summary && (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
            {article.summary}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-gray-400">
          <span>{formatDate(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{article.viewCount} 次阅读</span>
        </div>
      </div>
    </Link>
  );
}
