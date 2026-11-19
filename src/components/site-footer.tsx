import { SITE_NAME } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-gray-500 sm:px-6">
        <p>
          © {new Date().getFullYear()} {SITE_NAME} · 记录技术与生活
        </p>
      </div>
    </footer>
  );
}
