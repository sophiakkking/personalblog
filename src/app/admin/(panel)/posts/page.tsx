import type { Metadata } from "next";
import PostsTable from "@/components/admin/posts-table";
import { adminListArticles } from "@/lib/posts";
import type { ArticleStatus } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章管理 - 管理后台",
};

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    msg?: string;
  }>;
}) {
  const sp = await searchParams;
  const status: ArticleStatus | "" =
    sp.status === "published" || sp.status === "draft" ? sp.status : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = adminListArticles({
    search: sp.search ?? "",
    status,
    page,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">文章管理</h1>
      <PostsTable
        initialData={data}
        initialSearch={sp.search ?? ""}
        initialStatus={status}
        initialMsg={sp.msg}
      />
    </div>
  );
}
