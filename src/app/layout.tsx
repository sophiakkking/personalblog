import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description: "个人博客：记录技术学习、项目经验与生活随笔",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
