import { NextResponse } from "next/server";
import {
  getUserByUsername,
  requireAdmin,
  updatePassword,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 允许尚未完成初始改密的用户调用本接口
  const user = await requireAdmin({ allowPendingPasswordChange: true });
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
  const b = body as Record<string, unknown>;
  const currentPassword = String(b.currentPassword ?? "");
  const newPassword = String(b.newPassword ?? "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, error: "请填写完整信息" },
      { status: 400 }
    );
  }
  if (
    newPassword.length < 8 ||
    !/[a-zA-Z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword)
  ) {
    return NextResponse.json(
      { ok: false, error: "新密码至少 8 位，且需同时包含字母和数字" },
      { status: 400 }
    );
  }

  const row = getUserByUsername(user.username);
  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
    return NextResponse.json(
      { ok: false, error: "原密码错误" },
      { status: 400 }
    );
  }

  updatePassword(user.id, newPassword);
  return NextResponse.json({ ok: true });
}
