import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/post-form";
import { getArticleById, getCategories } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = getArticleById(parseInt(id, 10));
  return {
    title: article ? `编辑：${article.title} - 管理后台` : "文章不存在 - 管理后台",
  };
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticleById(parseInt(id, 10));
  if (!article) notFound();

  const categories = getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">编辑文章</h1>
      <PostForm mode="edit" initial={article} categories={categories} />
    </div>
  );
}
