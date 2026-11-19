import type { Metadata } from "next";
import Link from "next/link";
import CategoryDonut, { type DonutItem } from "@/components/admin/category-donut";
import { getStats } from "@/lib/posts";
import { formatDateTime } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "仪表盘 - 管理后台",
};

/** 验证过的分类色板（固定顺序分配，颜色跟随实体而非排名） */
const SERIES_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#6250d6", // violet
  "#e34948", // red
];
const OTHER_COLOR = "#c3c2b7";

export default function DashboardPage() {
  const stats = getStats();

  // 分类数据：按首次出现顺序固定配色；超过 8 个分类折叠为「其他」
  const donutItems: DonutItem[] = [];
  for (let i = 0; i < stats.byCategory.length; i++) {
    const c = stats.byCategory[i];
    if (i < SERIES_COLORS.length) {
      donutItems.push({ label: c.category, value: c.count, color: SERIES_COLORS[i] });
    } else {
      const other = donutItems[donutItems.length - 1];
      if (other && other.label === "其他") {
        other.value += c.count;
      } else {
        donutItems.push({ label: "其他", value: c.count, color: OTHER_COLOR });
      }
    }
  }

  const statCards = [
    { label: "文章总数", value: stats.total },
    { label: "已发布", value: stats.published },
    { label: "草稿", value: stats.drafts },
    { label: "总浏览量", value: stats.totalViews },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">仪表盘</h1>

      {/* 统计卡片行 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* 分类分布 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">分类分布</h2>
          {donutItems.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              暂无数据
            </div>
          ) : (
            <CategoryDonut items={donutItems} total={stats.total} />
          )}
        </section>

        {/* 浏览量 Top 5 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">浏览量 Top 5</h2>
          {stats.topViews.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              暂无数据
            </div>
          ) : (
            <ol className="space-y-1">
              {stats.topViews.map((a, i) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/posts/${a.id}/edit`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                  >
                    <span
                      className={`w-6 shrink-0 text-center text-sm font-semibold tabular-nums ${
                        i < 3 ? "text-indigo-600" : "text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                      {a.title}
                    </span>
                    <span className="shrink-0 text-sm text-gray-400 tabular-nums">
                      {a.viewCount} 阅读
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* 最近发布的文章 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">最近更新的文章</h2>
        {stats.recent.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">
            暂无数据
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {stats.recent.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/posts/${a.id}/edit`}
                  className="flex flex-col gap-1 py-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 sm:px-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {a.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-gray-400">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        a.status === "published"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a.status === "published" ? "已发布" : "草稿"}
                    </span>
                    <span>{formatDateTime(a.updatedAt)}</span>
                    <span>{a.viewCount} 阅读</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
