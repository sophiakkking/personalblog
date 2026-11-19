import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string; // 如 "/" 或 "/admin/posts"
}

function pageHref(basePath: string, p: number) {
  return `${basePath}?page=${p}`;
}

export default function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 计算显示的页码窗口（当前页前后各 2 个）
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const btnBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors";

  return (
    <nav aria-label="分页" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1)}
          className={`${btnBase} text-gray-600 hover:bg-gray-100`}
        >
          上一页
        </Link>
      ) : (
        <span className={`${btnBase} cursor-not-allowed text-gray-300`}>上一页</span>
      )}

      {/* 页码（移动端隐藏，仅保留上/下一页） */}
      <span className="hidden items-center gap-1.5 sm:flex">
        {start > 1 && (
          <>
            <Link href={pageHref(basePath, 1)} className={`${btnBase} text-gray-600 hover:bg-gray-100`}>
              1
            </Link>
            {start > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pages.map((p) =>
          p === page ? (
            <span
              key={p}
              aria-current="page"
              className={`${btnBase} bg-indigo-600 font-medium text-white`}
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={pageHref(basePath, p)}
              className={`${btnBase} text-gray-600 hover:bg-gray-100`}
            >
              {p}
            </Link>
          )
        )}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <Link
              href={pageHref(basePath, totalPages)}
              className={`${btnBase} text-gray-600 hover:bg-gray-100`}
            >
              {totalPages}
            </Link>
          </>
        )}
      </span>

      <span className="text-xs text-gray-400 sm:hidden">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={pageHref(basePath, page + 1)}
          className={`${btnBase} text-gray-600 hover:bg-gray-100`}
        >
          下一页
        </Link>
      ) : (
        <span className={`${btnBase} cursor-not-allowed text-gray-300`}>下一页</span>
      )}
    </nav>
  );
}
