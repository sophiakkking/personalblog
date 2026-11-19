import type { Metadata } from "next";
import PostForm from "@/components/admin/post-form";
import { getCategories } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新建文章 - 管理后台",
};

export default function NewPostPage() {
  const categories = getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">新建文章</h1>
      <PostForm mode="new" categories={categories} />
    </div>
  );
}
