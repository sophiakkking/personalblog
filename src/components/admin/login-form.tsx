"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("请输入账号和密码");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "登录失败，请稍后重试");
        return;
      }
      router.replace(data.mustChangePassword ? "/admin/change-password" : "/admin");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">
          账号
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="请输入账号"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          密码
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="请输入密码"
          />
          <button
            type="button"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 3l14 14M9.6 5.9A6.6 6.6 0 0 1 10 5.8c2.6 0 5 1.6 6.5 4.2-.5 1-1.2 1.8-2 2.4M6 6.3C4.7 7.2 3.6 8.4 2.9 10c1.6 2.8 4 4.5 7.1 4.5.6 0 1.2-.1 1.7-.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M2.9 10C4.5 7.2 6.9 5.5 10 5.5s5.5 1.7 7.1 4.5c-1.6 2.8-4 4.5-7.1 4.5S4.5 12.8 2.9 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        </div>
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
        {loading ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
