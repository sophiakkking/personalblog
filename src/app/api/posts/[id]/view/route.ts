import { NextResponse } from "next/server";
import { getArticleById, incrementView } from "@/lib/posts";

export const dynamic = "force-dynamic";

/** 浏览量 +1（前台公开接口，客户端 sessionStorage 去重后调用） */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (Number.isNaN(articleId) || !getArticleById(articleId)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  incrementView(articleId);
  return NextResponse.json({ ok: true });
}
