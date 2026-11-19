import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUploadsDir } from "@/lib/db";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** 提供后台上传的封面图 / 头像（文件名为随机 UUID，可长缓存） */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const name = path.basename(filename);
  const ext = path.extname(name).toLowerCase();
  if (!(ext in MIME)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.join(getUploadsDir(), name);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": MIME[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
