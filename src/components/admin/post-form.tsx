"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Article, ArticleStatus } from "@/lib/posts";
import MarkdownRenderer from "@/components/markdown-renderer";
import Toast, { type ToastState } from "./toast";

interface Props {
  mode: "new" | "edit";
  initial?: Article | null;
  categories: string[];
}

export default function PostForm({ mode, initial, categories }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 未保存离开提醒
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function markDirty() {
    setDirty(true);
  }

  async function handleUpload(file: File) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setToast({ message: "仅支持 JPG / PNG / WebP / GIF 图片", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "图片大小不能超过 5MB", type: "error" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setToast({ message: data.error ?? "上传失败", type: "error" });
        return;
      }
      setCover(data.url);
      markDirty();
      setToast({ message: "图片上传成功", type: "success" });
    } catch {
      setToast({ message: "上传失败，请重试", type: "error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(targetStatus: ArticleStatus) {
    setError("");
    if (!title.trim()) return setError("请填写标题");
    if (title.trim().length > 100) return setError("标题不能超过 100 个字符");
    if (!category.trim()) return setError("请填写或选择分类");
    if (!content.trim()) return setError("正文不能为空");
    if (summary.length > 300) return setError("摘要不能超过 300 个字符");

    // 草稿转发布时二次确认
    if (
      targetStatus === "published" &&
      mode === "edit" &&
      initial?.status === "draft" &&
      !window.confirm("确认发布该文章？发布后所有访客可见。")
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsText
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      const url = mode === "new" ? "/api/admin/posts" : `/api/admin/posts/${initial!.id}`;
      const res = await fetch(url, {
        method: mode === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          tags,
          summary: summary.trim(),
          cover,
          content,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "保存失败，请重试");
        return;
      }

      setDirty(false);
      if (targetStatus === "draft" && mode === "new") {
        // 草稿创建成功后留在编辑页，可继续写作
        setToast({ message: "草稿已保存", type: "success" });
        router.replace(`/admin/posts/${data.id}/edit`);
        router.refresh();
      } else if (targetStatus === "draft") {
        setToast({ message: "草稿已保存", type: "success" });
      } else {
        router.push("/admin/posts?msg=发布成功");
        router.refresh();
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (dirty && !window.confirm("有未保存的修改，确定放弃？")) return;
    router.push("/admin/posts");
  }

  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";
  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* 主列 */}
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className={labelCls}>
            标题 <span className="text-red-500">*</span>
            <span className="ml-2 font-normal text-gray-400">{title.length}/100</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            className={`${inputCls} text-base font-medium`}
            placeholder="输入文章标题"
            autoFocus={mode === "new"}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={labelCls}>
              正文 <span className="text-red-500">*</span>
            </span>
            <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs">
              {(["edit", "preview"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPreviewTab(tab)}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    previewTab === tab
                      ? "bg-indigo-600 font-medium text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab === "edit" ? "编辑" : "预览"}
                </button>
              ))}
            </div>
          </div>
          {previewTab === "edit" ? (
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); markDirty(); }}
              rows={18}
              className="w-full rounded-lg border border-gray-300 p-4 font-mono text-sm leading-relaxed outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder={"支持 Markdown 语法，例如：\n# 一级标题\n**加粗**、`代码`、[链接](https://example.com)\n\n```js\nconst hello = \"world\";\n```"}
            />
          ) : (
            <div className="min-h-80 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              {content.trim() ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-sm text-gray-400">暂无内容可预览</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 侧列 */}
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">分类与标签</h3>
          <label htmlFor="category" className={labelCls}>
            分类 <span className="text-red-500">*</span>
          </label>
          <input
            id="category"
            type="text"
            list="category-options"
            value={category}
            onChange={(e) => { setCategory(e.target.value); markDirty(); }}
            className={inputCls}
            placeholder="如：技术 / 生活 / 随笔"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <label htmlFor="tags" className={`${labelCls} mt-4`}>
            标签 <span className="ml-1 font-normal text-gray-400">逗号分隔，最多 10 个</span>
          </label>
          <input
            id="tags"
            type="text"
            value={tagsText}
            onChange={(e) => { setTagsText(e.target.value); markDirty(); }}
            className={inputCls}
            placeholder="如：Next.js, React"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label htmlFor="summary" className={labelCls}>
            摘要 <span className="ml-1 font-normal text-gray-400">{summary.length}/300</span>
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => { setSummary(e.target.value); markDirty(); }}
            rows={4}
            className={`${inputCls} resize-y`}
            placeholder="不填则首页不展示摘要"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">封面图</h3>
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="封面预览" className="mb-3 aspect-video w-full rounded-lg border border-gray-200 object-cover" />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              {uploading ? "上传中…" : "本地上传"}
            </button>
            {cover && (
              <button
                type="button"
                onClick={() => { setCover(""); markDirty(); }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                移除
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          <input
            type="url"
            value={cover.startsWith("/uploads/") ? "" : cover}
            onChange={(e) => { setCover(e.target.value); markDirty(); }}
            className={`${inputCls} mt-2`}
            placeholder="或直接粘贴图片 URL"
            aria-label="封面图 URL"
          />
          <p className="mt-1.5 text-xs text-gray-400">支持 JPG / PNG / WebP / GIF，≤ 5MB</p>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("published")}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? "提交中…" : mode === "edit" && initial?.status === "published" ? "更新" : "发布"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("draft")}
            className="w-full rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            存为草稿
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleCancel}
            className="w-full rounded-lg py-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            取消
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
