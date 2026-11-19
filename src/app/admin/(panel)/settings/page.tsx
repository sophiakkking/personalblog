import type { Metadata } from "next";
import SettingsForm from "@/components/admin/settings-form";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "站点设置 - 管理后台",
};

export default function SettingsPage() {
  const settings = getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">站点设置</h1>
      <p className="text-sm text-gray-500">
        维护「关于我」页面展示的博主信息，保存后立即生效。
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
