import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 博客内容实时读写数据库，采用经典按需渲染；
  // 不启用 cacheComponents（它与 force-dynamic 段配置互斥）
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
