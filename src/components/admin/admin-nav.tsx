"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/admin", label: "仪表盘", icon: "dashboard" },
  { href: "/admin/posts", label: "文章管理", icon: "posts" },
  { href: "/admin/settings", label: "站点设置", icon: "settings" },
] as const;

function NavIcon({ name }: { name: (typeof NAV_ITEMS)[number]["icon"] }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    posts: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 3.5h9a2 2 0 0 1 2 2V16l-2.5-1.5L10 16l-2.5-1.5L5 16V5.5a2 2 0 0 1 2-2h-3a1 1 0 0 1 0-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 6.5h4.5M7 9h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    settings: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="2.8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M15.3 4.7l-1.6 1.6M6.3 13.7l-1.6 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return <>{paths[name]}</>;
}

export default function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const navList = (
    <>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setDrawerOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-indigo-50 font-medium text-indigo-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-gray-100 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 3h9v6H4V3ZM4 11h6v6H4v-6ZM12.5 11H16v6h-3.5v-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M14 9.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          查看站点
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M8 3H4.5a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 4.5 17H8M12.5 6.5 16 10l-3.5 3.5M16 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          退出登录
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            PB
          </span>
          <span className="font-bold text-gray-900">{SITE_NAME}</span>
        </div>
        <div className="flex h-10 items-center px-5 text-xs text-gray-400">
          你好，{username}
        </div>
        {navList}
      </aside>

      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            PB
          </span>
          <span className="font-bold text-gray-900">{SITE_NAME}</span>
        </div>
        <button
          type="button"
          aria-label="打开菜单"
          className="flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* 移动端抽屉 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-gray-100 px-5">
              <span className="font-bold text-gray-900">菜单</span>
              <button
                type="button"
                aria-label="关闭菜单"
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                onClick={() => setDrawerOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {navList}
          </div>
        </div>
      )}
    </>
  );
}
