import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式错误" },
      { status: 400 }
    );
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "请求格式错误" },
      { status: 400 }
    );
  }

  updateSettings(body as Record<string, string>);
  return NextResponse.json({ ok: true });
}
