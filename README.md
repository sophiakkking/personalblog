# PersonalBlog 个人博客系统

按《[PRD.md](./PRD.md)》（已定稿）实现的个人博客，包含用户端（首页 / 文章详情 / 关于我）与博主管理后台（登录 / 仪表盘 / 文章管理 / 站点设置）。

技术栈：Next.js 16（App Router）+ Tailwind CSS 4 + Node 内置 SQLite（`node:sqlite`，零原生编译依赖）。


## 快速开始

```bash
npm install
npm run dev
```

- 博客前台：http://localhost:3000
- 管理后台：http://localhost:3000/admin

默认管理员账号：`admin` / `admin123`（首次登录强制修改密码）。

## 数据存储

- SQLite 数据库：`data/blog.db`（首次启动自动建库并写入示例数据）
- 上传的图片：`uploads/`（封面图、头像，通过 `/uploads/<文件名>` 访问）

删除 `data/blog.db` 后重启即可重置为初始状态（含示例文章与默认账号）。

## 目录结构

```
src/
├── app/                    # 页面与 API 路由
│   ├── page.tsx            # 前台首页（文章列表 + 分页）
│   ├── posts/[slug]/       # 文章详情页（Markdown 渲染、上一篇/下一篇、浏览量）
│   ├── about/              # 关于我
│   ├── admin/
│   │   ├── login/          # 管理员登录
│   │   ├── change-password/# 修改密码（首次登录强制）
│   │   └── (panel)/        # 后台面板：仪表盘 / 文章管理 / 站点设置
│   ├── api/                # 登录、文章 CRUD、上传、浏览量等接口
│   └── uploads/[filename]/ # 上传图片访问
├── components/             # 前台与后台组件
└── lib/                    # 数据库、认证、文章、设置等数据层
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（Turbopack） |
| `npm run build` | 生产构建 |
| `npm start` | 生产模式启动 |
| `npm run lint` | ESLint 检查 |

## 安全说明

- 密码使用 bcrypt 加盐哈希存储，登录连续失败 5 次锁定 10 分钟（进程内计数）
- 会话使用 HttpOnly Cookie，有效期 7 天；所有后台接口校验登录态
- 文章 Markdown 渲染禁用原始 HTML，防 XSS
- 上传仅允许 JPG / PNG / WebP / GIF，≤ 5MB，随机文件名
