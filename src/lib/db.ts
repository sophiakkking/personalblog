import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "blog.db");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
`;

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(SCHEMA);
  seedIfEmpty();
  return db;
}

export function getUploadsDir(): string {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  return UPLOADS_DIR;
}

function seedIfEmpty() {
  const d = getDb();
  const userCount = d.prepare("SELECT COUNT(*) AS n FROM users").get() as {
    n: number;
  };
  if (userCount.n > 0) return;

  // 默认管理员：admin / admin123，首次登录强制修改密码
  const hash = bcrypt.hashSync("admin123", 10);
  d.prepare(
    "INSERT INTO users (username, password_hash, must_change_password, created_at) VALUES (?, ?, 1, ?)"
  ).run("admin", hash, new Date().toISOString());

  const daysAgo = (n: number, h = 0) =>
    new Date(Date.now() - n * 86400000 - h * 3600000).toISOString();

  const seedArticles: Array<{
    title: string;
    slug: string;
    category: string;
    tags: string[];
    summary: string;
    content: string;
    status: "draft" | "published";
    viewCount: number;
    publishedDaysAgo?: number;
  }> = [
    {
      title: "欢迎来到我的博客",
      slug: "welcome-to-my-blog",
      category: "生活",
      tags: ["随笔", "公告"],
      summary: "这是我的个人博客的第一篇文章。在这里，我会记录技术学习、生活感悟和一切值得分享的东西。",
      content: `# 你好，欢迎光临 👋

这里是 **PersonalBlog**，我的个人博客。建这个站的初衷很简单：

> 把学到的东西写下来，把走过的路记下来。

## 我会写什么

- **技术文章**：Web 开发、工具使用、踩坑记录
- **生活随笔**：读书、旅行、日常思考
- **项目复盘**：做过的项目、学到的经验

## 联系我

如果你对我的文章有任何想法，欢迎通过「关于我」页面的联系方式找到我。

感谢你的来访，希望这里的内容对你有帮助。`,
      status: "published",
      viewCount: 128,
      publishedDaysAgo: 30,
    },
    {
      title: "用 Next.js 从零搭建个人博客",
      slug: "build-blog-with-nextjs",
      category: "技术",
      tags: ["Next.js", "React", "SQLite"],
      summary:
        "记录我用 Next.js App Router + SQLite 搭建这个博客的全过程：数据建模、后台管理、Markdown 渲染与响应式设计。",
      content: `# 用 Next.js 从零搭建个人博客

这篇文章记录我搭建本站的技术方案，希望对同样想自己写博客的人有帮助。

## 技术选型

| 层 | 方案 |
| --- | --- |
| 框架 | Next.js（App Router） |
| 样式 | Tailwind CSS |
| 数据库 | SQLite |
| 内容 | Markdown |

选择这套组合的原因：**部署简单、足够快、数据完全在自己手里**。

## 数据库初始化

博客的数据模型很简单，核心就是文章表：

\`\`\`sql
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);
\`\`\`

## Markdown 渲染

正文使用 Markdown 编写，渲染时做了三件事：

1. 支持 GFM 语法（表格、删除线、任务列表）
2. 代码块语法高亮
3. 禁用原始 HTML，防止 XSS

## 一些心得

- 前后台共用一个数据模型，接口层不要写两遍
- 列表页做好分页和空状态，细节决定体验
- 移动端优先思考排版，桌面端再增强

如果你也想搭一个，希望这篇文章能帮你少走弯路。`,
      status: "published",
      viewCount: 356,
      publishedDaysAgo: 21,
    },
    {
      title: "2026 年的一些随笔",
      slug: "2026-notes",
      category: "随笔",
      tags: ["年度总结", "生活"],
      summary: "一年又过去了。写下这一年里几个让我印象深刻的瞬间，和一些还没想明白的问题。",
      content: `# 2026 年的一些随笔

一年又过去了。照例写点什么。

## 关于坚持

坚持写作比想象中难，也比想象中有用。写完一篇能发出去的文章，比在脑子里想十篇都强。

## 关于工具

今年最大的感受是：**工具是为流程服务的，不是反过来**。换工具之前，先想清楚它要解决什么问题。

- 笔记工具换了又换，最后发现重要的是写，不是用什么写
- 效率工具越少越好，留下的都是每天真的会打开的

## 还没想明白的问题

1. 如何平衡「广度学习」和「深度专精」？
2. 什么样的内容值得公开发表？
3. 明年这个时候，我会在哪里？

希望明年的我，能回答其中至少一个。`,
      status: "published",
      viewCount: 89,
      publishedDaysAgo: 7,
    },
    {
      title: "草稿示例：还没写完的想法",
      slug: "draft-demo",
      category: "技术",
      tags: ["草稿"],
      summary: "这是一篇草稿，用于演示管理后台的草稿状态。",
      content: `# 还没写完的想法

这篇文章还在写作中……`,
      status: "draft",
      viewCount: 12,
    },
  ];

  const insert = d.prepare(
    `INSERT INTO articles
     (title, slug, category, tags, summary, cover, content, status, view_count, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const a of seedArticles) {
    const now = new Date().toISOString();
    const created = a.publishedDaysAgo ? daysAgo(a.publishedDaysAgo) : daysAgo(1);
    const publishedAt =
      a.status === "published" ? created : null;
    insert.run(
      a.title,
      a.slug,
      a.category,
      JSON.stringify(a.tags),
      a.summary,
      "",
      a.content,
      a.status,
      a.viewCount,
      created,
      now,
      publishedAt
    );
  }

  const defaults: Record<string, string> = {
    nickname: "Morefun",
    signature: "全栈工程师 · 记录技术与生活",
    avatar: "",
    bio: `你好，我是 **Morefun**，一名全栈工程师。

这个博客用来记录我的技术学习、项目经验和生活随笔。如果你喜欢这里的内容，欢迎常来看看。`,
    email: "",
    github: "",
  };
  const setSetting = d.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
  );
  for (const [k, v] of Object.entries(defaults)) {
    setSetting.run(k, v);
  }
}
