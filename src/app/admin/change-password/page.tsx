import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/admin/change-password-form";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "修改密码",
};

export default async function ChangePasswordPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-center text-lg font-bold text-gray-900">修改密码</h1>
          {user.mustChangePassword && (
            <p className="mt-2 text-center text-sm text-amber-600">
              您正在使用初始密码，为安全起见请先修改密码
            </p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
