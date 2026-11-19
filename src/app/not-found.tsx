import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-indigo-100">404</p>
      <p className="text-gray-500">文章不存在或已被删除</p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        返回首页
      </Link>
    </div>
  );
}
