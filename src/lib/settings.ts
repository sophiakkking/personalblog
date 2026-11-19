import { getDb } from "./db";

export interface SiteSettings {
  nickname: string;
  signature: string;
  avatar: string;
  bio: string;
  email: string;
  github: string;
}

export const SETTINGS_DEFAULTS: SiteSettings = {
  nickname: "Morefun",
  signature: "全栈工程师 · 记录技术与生活",
  avatar: "",
  bio: "",
  email: "",
  github: "",
};

export function getSettings(): SiteSettings {
  const rows = getDb()
    .prepare("SELECT key, value FROM settings")
    .all() as unknown as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return { ...SETTINGS_DEFAULTS, ...map };
}

export function updateSettings(patch: Partial<SiteSettings>) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
  );
  for (const [key, value] of Object.entries(patch)) {
    if (key in SETTINGS_DEFAULTS && typeof value === "string") {
      stmt.run(key, value);
    }
  }
}
