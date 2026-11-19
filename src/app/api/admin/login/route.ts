import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkLoginLock,
  clearLoginFailures,
  createSession,
  getUserByUsername,
  recordLoginFailure,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
  const username = String(b.username ?? "").trim();
  const password = String(b.password ?? "");
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "请输入账号和密码" },
      { status: 400 }
    );
  }

  const lock = checkLoginLock(username);
  if (lock.locked) {
    return NextResponse.json(
      {
        ok: false,
        error: `失败次数过多，请 ${Math.max(1, Math.ceil(lock.retryAfterSeconds / 60))} 分钟后重试`,
      },
      { status: 429 }
    );
  }

  const user = getUserByUsername(username);
  const valid = !!user && (await verifyPassword(password, user.password_hash));
  if (!valid || !user) {
    recordLoginFailure(username);
    return NextResponse.json(
      { ok: false, error: "账号或密码错误" },
      { status: 401 }
    );
  }

  clearLoginFailures(username);
  const token = createSession(user.id);

  const res = NextResponse.json({
    ok: true,
    mustChangePassword: !!user.must_change_password,
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 86400,
  });
  return res;
}
