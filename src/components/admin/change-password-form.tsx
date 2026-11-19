"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!current || !next || !confirm) {
      setError("请填写完整信息");
      return;
    }
    if (next.length < 8 || !/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) {
      setError("新密码至少 8 位，且需同时包含字母和数字");
      return;
    }
    if (next !== confirm) {
      setError("两次输入的新密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "修改失败，请稍后重试");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="current" className="mb-1.5 block text-sm font-medium text-gray-700">
          原密码
        </label>
        <input
          id="current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputCls}
          placeholder="请输入原密码"
        />
      </div>
      <div>
        <label htmlFor="next" className="mb-1.5 block text-sm font-medium text-gray-700">
          新密码
        </label>
        <input
          id="next"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={inputCls}
          placeholder="至少 8 位，包含字母和数字"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-700">
          确认新密码
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
          placeholder="再次输入新密码"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "提交中…" : "确认修改"}
      </button>
    </form>
  );
}
