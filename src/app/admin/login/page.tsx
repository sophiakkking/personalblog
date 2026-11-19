import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/login-form";
import { getSessionUser } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理员登录",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user && !user.mustChangePassword) redirect("/admin");
  if (user && user.mustChangePassword) redirect("/admin/change-password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
            PB
          </span>
          <h1 className="text-lg font-bold text-gray-900">{SITE_NAME} 管理后台</h1>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          仅博主本人可访问
        </p>
      </div>
    </div>
  );
}
