import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import PostCard from "@/components/post-card";
import Pagination from "@/components/pagination";
import { listPublished } from "@/lib/posts";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const { items, page: curPage, totalPages } = listPublished(page);
  const settings = getSettings();

  return (
    <>
      <SiteHeader />

      {/* Hero 区 */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-indigo-50/70 to-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {settings.nickname || "博主"}的博客
          </h1>
          {settings.signature && (
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              {settings.signature}
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-20 text-center">
            <p className="text-gray-500">博主还没有发布文章</p>
            <Link
              href="/about"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              去看看「关于我」
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((a) => (
                <PostCard key={a.id} article={a} />
              ))}
            </div>
            <Pagination page={curPage} totalPages={totalPages} basePath="/" />
          </>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
