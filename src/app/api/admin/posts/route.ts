import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  adminListArticles,
  createArticle,
  validateArticleInput,
} from "@/lib/posts";

export const dynamic = "force-dynamic";

/** 列表：GET /api/admin/posts?search=&status=&page= */
export async function GET(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const sp = new URL(req.url).searchParams;
  const search = sp.get("search") ?? "";
  const statusRaw = sp.get("status") ?? "";
  const status = statusRaw === "published" || statusRaw === "draft" ? statusRaw : "";
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);

  const data = adminListArticles({ search, status, page, pageSize: 10 });
  return NextResponse.json(data);
}

/** 新建：POST /api/admin/posts */
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

  const { error, input } = validateArticleInput(body);
  if (error || !input) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  const article = createArticle(input);
  return NextResponse.json({ ok: true, id: article.id });
}
