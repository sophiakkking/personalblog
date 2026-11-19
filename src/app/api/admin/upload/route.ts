import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { getUploadsDir } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式错误" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "请选择图片文件" },
      { status: 400 }
    );
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "仅支持 JPG / PNG / WebP / GIF 图片" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, error: "图片大小不能超过 5MB" },
      { status: 400 }
    );
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  // uploads 目录是运行时数据目录，故意不在构建时静态追踪
  fs.writeFileSync(path.join(/* turbopackIgnore: true */ getUploadsDir(), filename), buffer);

  return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
}
