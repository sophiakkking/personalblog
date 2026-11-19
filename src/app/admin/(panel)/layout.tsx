import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/admin-nav";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/change-password");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav username={user.username} />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
