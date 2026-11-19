import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MarkdownRenderer from "@/components/markdown-renderer";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `关于我 - ${SITE_NAME}`,
};

export default function AboutPage() {
  const settings = getSettings();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* 博主信息区 */}
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          {settings.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.avatar}
              alt={settings.nickname}
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-gray-200"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-3xl font-bold text-white shadow-lg">
              {(settings.nickname || "M").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {settings.nickname || "博主"}
            </h1>
            {settings.signature && (
              <p className="mt-1 text-sm text-gray-500">{settings.signature}</p>
            )}
          </div>

          {/* 联系方式 */}
          {(settings.github || settings.email) && (
            <div className="flex items-center gap-3">
              {settings.github && (
                <a
                  href={settings.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-900"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  aria-label="邮箱"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-900"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <rect x="2" y="4" width="16" height="12" rx="2" />
                    <path d="m3 6 7 5 7-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* 自我介绍 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          {settings.bio ? (
            <MarkdownRenderer content={settings.bio} />
          ) : (
            <p className="text-center text-gray-400">
              博主还没有写自我介绍，敬请期待～
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
