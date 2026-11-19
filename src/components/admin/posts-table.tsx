"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Article, ArticleStatus } from "@/lib/posts";
import { formatDateTime } from "@/lib/site";
import Toast, { type ToastState } from "./toast";

interface ListData {
  items: Article[];
  total: number;
  page: number;
  totalPages: number;
}

interface Props {
  initialData: ListData;
  initialSearch: string;
  initialStatus: ArticleStatus | "";
  initialMsg?: string;
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  return status === "published" ? (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
      已发布
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      草稿
    </span>
  );
}

export default function PostsTable({
  initialData,
  initialSearch,
  initialStatus,
  initialMsg,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<ArticleStatus | "">(initialStatus);
  const [page, setPage] = useState(initialData.page);
  const [data, setData] = useState<ListData>(initialData);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(
    initialMsg ? { message: initialMsg, type: "success" } : null
  );
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 卸载时清理防抖计时器
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  /** 按条件拉取列表（事件驱动：搜索/筛选/翻页时显式调用） */
  const reload = useCallback(
    async (opts: { search: string; status: ArticleStatus | ""; page: number }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts.search.trim()) params.set("search", opts.search.trim());
        if (opts.status) params.set("status", opts.status);
        params.set("page", String(opts.page));
        const res = await fetch(`/api/admin/posts?${params.toString()}`);
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setToast({ message: "加载失败，请重试", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  function syncUrl(searchValue: string, statusValue: ArticleStatus | "", pageValue: number) {
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (statusValue) params.set("status", statusValue);
    if (pageValue > 1) params.set("page", String(pageValue));
    const qs = params.toString();
    window.history.replaceState(null, "", `/admin/posts${qs ? `?${qs}` : ""}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const trimmed = value.trim();
      setPage(1);
      syncUrl(trimmed, status, 1);
      reload({ search: trimmed, status, page: 1 });
    }, 300);
  }

  function handleStatusChange(value: ArticleStatus | "") {
    setStatus(value);
    setPage(1);
    syncUrl(search, value, 1);
    reload({ search, status: value, page: 1 });
  }

  function handlePageChange(p: number) {
    if (p < 1 || p > data.totalPages || p === page) return;
    setPage(p);
    syncUrl(search, status, p);
    reload({ search, status, page: p });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setToast({ message: "删除失败，请重试", type: "error" });
        return;
      }
      setToast({ message: "删除成功", type: "success" });
      setDeleteTarget(null);
      // 当前页删空则回退一页
      const nextPage = data.items.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      reload({ search, status, page: nextPage });
    } finally {
      setDeleting(false);
    }
  }

  const inputCls =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div>
      {/* 工具栏 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/posts/new"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          新建文章
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="按标题 / 摘要 / 分类搜索"
            className={`${inputCls} w-full sm:w-56`}
            aria-label="搜索文章"
          />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ArticleStatus | "")}
            className={`${inputCls} w-full sm:w-32`}
            aria-label="按状态筛选"
          >
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
      </div>

      {/* 桌面端表格 */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="w-24 px-4 py-3 font-medium">分类</th>
              <th className="w-24 px-4 py-3 font-medium">状态</th>
              <th className="w-36 px-4 py-3 font-medium">发布时间</th>
              <th className="w-20 px-4 py-3 font-medium">浏览量</th>
              <th className="w-32 px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {data.items.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60">
                <td className="max-w-0 px-4 py-3">
                  <span className="block truncate font-medium text-gray-900">{a.title}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.category || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-gray-500">
                  {a.status === "published" ? formatDateTime(a.publishedAt) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">{a.viewCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/posts/${a.id}/edit`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(a)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片列表 */}
      <div className="space-y-3 sm:hidden">
        {data.items.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/admin/posts/${a.id}/edit`}
                className="line-clamp-2 font-medium text-gray-900"
              >
                {a.title}
              </Link>
              <StatusBadge status={a.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{a.category || "未分类"}</span>
              <span aria-hidden>·</span>
              <span>{a.status === "published" ? formatDateTime(a.publishedAt) : "未发布"}</span>
              <span aria-hidden>·</span>
              <span>{a.viewCount} 阅读</span>
            </div>
            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
              <Link
                href={`/admin/posts/${a.id}/edit`}
                className="flex-1 rounded-md bg-indigo-50 py-1.5 text-center text-xs font-medium text-indigo-600"
              >
                编辑
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(a)}
                className="flex-1 rounded-md bg-red-50 py-1.5 text-xs font-medium text-red-600"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {!loading && data.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-16 text-center text-sm text-gray-500">
          暂无文章，点击左上角「新建文章」开始写作
        </div>
      )}

      {/* 分页 */}
      {data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => handlePageChange(data.page - 1)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {data.page} / {data.totalPages}（共 {data.total} 篇）
          </span>
          <button
            type="button"
            disabled={data.page >= data.totalPages}
            onClick={() => handlePageChange(data.page + 1)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">删除文章</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              确定删除《{deleteTarget.title}》？<br />删除后不可恢复。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? "删除中…" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
