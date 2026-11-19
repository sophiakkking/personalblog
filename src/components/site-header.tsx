"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于我" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900 hover:text-indigo-600"
          onClick={() => setOpen(false)}
        >
          {SITE_NAME}
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive(l.href)
                  ? "bg-indigo-50 font-medium text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* 移动端汉堡按钮 */}
        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          className="flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 py-2 sm:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm ${
                isActive(l.href)
                  ? "bg-indigo-50 font-medium text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
