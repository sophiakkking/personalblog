import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  deleteArticle,
  getArticleById,
  updateArticle,
  validateArticleInput,
} from "@/lib/posts";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** 更新：PUT /api/admin/posts/[id] */
export async function PUT(req: Request, { params }: Params) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (Number.isNaN(articleId) || !getArticleById(articleId)) {
    return NextResponse.json(
      { ok: false, error: "文章不存在" },
      { status: 404 }
    );
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

  updateArticle(articleId, input);
  return NextResponse.json({ ok: true, id: articleId });
}

/** 删除：DELETE /api/admin/posts/[id] */
export async function DELETE(_req: Request, { params }: Params) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (Number.isNaN(articleId)) {
    return NextResponse.json(
      { ok: false, error: "文章不存在" },
      { status: 404 }
    );
  }

  deleteArticle(articleId);
  return NextResponse.json({ ok: true });
}
