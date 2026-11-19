"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/settings";
import MarkdownRenderer from "@/components/markdown-renderer";
import Toast, { type ToastState } from "./toast";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [bioTab, setBioTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
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
      set("avatar", data.url);
      setToast({ message: "头像上传成功", type: "success" });
    } catch {
      setToast({ message: "上传失败，请重试", type: "error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok || !data.ok) {
        setToast({ message: data.error ?? "保存失败，请重试", type: "error" });
        return;
      }
      setToast({ message: "设置已保存", type: "success" });
    } catch {
      setToast({ message: "网络错误，请稍后重试", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";
  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="max-w-2xl space-y-5">
      {/* 基本信息 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">基本信息</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nickname" className={labelCls}>昵称</label>
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              onChange={(e) => set("nickname", e.target.value)}
              className={inputCls}
              maxLength={30}
            />
          </div>
          <div>
            <label htmlFor="signature" className={labelCls}>一句话签名</label>
            <input
              id="signature"
              type="text"
              value={form.signature}
              onChange={(e) => set("signature", e.target.value)}
              className={inputCls}
              maxLength={60}
              placeholder="如：全栈工程师 · 记录技术与生活"
            />
          </div>
        </div>
      </section>

      {/* 头像 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">头像</h2>
        <div className="flex items-center gap-4">
          {form.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.avatar} alt="头像预览" className="h-16 w-16 rounded-full border border-gray-200 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-xl font-bold text-white">
              {(form.nickname || "M").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                {uploading ? "上传中…" : "上传头像"}
              </button>
              {form.avatar && (
                <button
                  type="button"
                  onClick={() => set("avatar", "")}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                >
                  移除
                </button>
              )}
            </div>
            <input
              type="url"
              value={form.avatar.startsWith("/uploads/") ? "" : form.avatar}
              onChange={(e) => set("avatar", e.target.value)}
              className={inputCls}
              placeholder="或直接粘贴头像图片 URL"
              aria-label="头像图片 URL"
            />
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
        </div>
      </section>

      {/* 自我介绍 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">自我介绍</h2>
          <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs">
            {(["edit", "preview"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setBioTab(tab)}
                className={`rounded-md px-3 py-1 transition-colors ${
                  bioTab === tab
                    ? "bg-indigo-600 font-medium text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab === "edit" ? "编辑" : "预览"}
              </button>
            ))}
          </div>
        </div>
        {bioTab === "edit" ? (
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-gray-300 p-4 font-mono text-sm leading-relaxed outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="支持 Markdown 语法，将展示在「关于我」页面"
          />
        ) : (
          <div className="min-h-40 rounded-lg border border-gray-200 p-4">
            {form.bio.trim() ? (
              <MarkdownRenderer content={form.bio} />
            ) : (
              <p className="text-sm text-gray-400">暂无内容可预览</p>
            )}
          </div>
        )}
      </section>

      {/* 联系方式 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">联系方式</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelCls}>邮箱</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label htmlFor="github" className={labelCls}>GitHub</label>
            <input
              id="github"
              type="url"
              value={form.github}
              onChange={(e) => set("github", e.target.value)}
              className={inputCls}
              placeholder="https://github.com/xxx"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">留空的联系方式不会展示在「关于我」页面</p>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? "保存中…" : "保存设置"}
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
