import crypto from "node:crypto";
import { getDb } from "./db";

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  summary: string;
  cover: string;
  content: string;
  status: ArticleStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface ArticleRow {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string;
  summary: string;
  cover: string;
  content: string;
  status: ArticleStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

function rowToArticle(r: ArticleRow): Article {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(r.tags);
    if (Array.isArray(parsed)) tags = parsed.map(String);
  } catch {
    tags = [];
  }
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    tags,
    summary: r.summary,
    cover: r.cover,
    content: r.content,
    status: r.status,
    viewCount: r.view_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  };
}

export interface ArticleInput {
  title: string;
  category: string;
  tags: string[];
  summary: string;
  cover: string;
  content: string;
  status: ArticleStatus;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 文章表单输入校验（前台 API 与表单共用同一规则） */
export function validateArticleInput(raw: unknown): {
  error?: string;
  input?: ArticleInput;
} {
  if (!raw || typeof raw !== "object") return { error: "请求格式错误" };
  const b = raw as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const category = typeof b.category === "string" ? b.category.trim() : "";
  const content = typeof b.content === "string" ? b.content : "";
  const summary = typeof b.summary === "string" ? b.summary.trim() : "";
  const cover = typeof b.cover === "string" ? b.cover.trim() : "";
  const status = b.status;
  const tagsRaw = Array.isArray(b.tags) ? b.tags : [];

  if (!title) return { error: "请填写标题" };
  if (title.length > 100) return { error: "标题不能超过 100 个字符" };
  if (!category) return { error: "请填写或选择分类" };
  if (!content.trim()) return { error: "正文不能为空" };
  if (summary.length > 300) return { error: "摘要不能超过 300 个字符" };
  if (status !== "draft" && status !== "published") {
    return { error: "状态不合法" };
  }

  const tags = tagsRaw
    .slice(0, 10)
    .map((t) => String(t).trim())
    .filter(Boolean);

  return { input: { title, category, content, summary, cover, status, tags } };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 前台：分页获取已发布文章 */
export function listPublished(page: number, pageSize = 10): Paginated<Article> {
  const db = getDb();
  const { n } = db
    .prepare("SELECT COUNT(*) AS n FROM articles WHERE status = 'published'")
    .get() as { n: number };
  const totalPages = Math.max(1, Math.ceil(n / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const rows = db
    .prepare(
      `SELECT * FROM articles WHERE status = 'published'
       ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`
    )
    .all(pageSize, (p - 1) * pageSize) as unknown as ArticleRow[];
  return { items: rows.map(rowToArticle), total: n, page: p, pageSize, totalPages };
}

/** 前台：按 slug 获取已发布文章 */
export function getPublishedBySlug(slug: string): Article | null {
  const row = getDb()
    .prepare(
      "SELECT * FROM articles WHERE slug = ? AND status = 'published'"
    )
    .get(slug) as unknown as ArticleRow | undefined;
  return row ? rowToArticle(row) : null;
}

/** 详情页的上一篇 / 下一篇（按发布时间） */
export function getAdjacentPublished(
  publishedAt: string | null,
  id: number
): { prev: Article | null; next: Article | null } {
  if (!publishedAt) return { prev: null, next: null };
  const db = getDb();
  const prev = db
    .prepare(
      `SELECT * FROM articles
       WHERE status = 'published' AND (published_at < ? OR (published_at = ? AND id < ?))
       ORDER BY published_at DESC, id DESC LIMIT 1`
    )
    .get(publishedAt, publishedAt, id) as unknown as ArticleRow | undefined;
  const next = db
    .prepare(
      `SELECT * FROM articles
       WHERE status = 'published' AND (published_at > ? OR (published_at = ? AND id > ?))
       ORDER BY published_at ASC, id ASC LIMIT 1`
    )
    .get(publishedAt, publishedAt, id) as unknown as ArticleRow | undefined;
  return {
    prev: prev ? rowToArticle(prev) : null,
    next: next ? rowToArticle(next) : null,
  };
}

/** 后台：按 id 获取任意状态文章 */
export function getArticleById(id: number): Article | null {
  const row = getDb()
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(id) as unknown as ArticleRow | undefined;
  return row ? rowToArticle(row) : null;
}

/** 后台：列表 + 搜索 + 筛选 */
export function adminListArticles(params: {
  search?: string;
  status?: ArticleStatus | "";
  page?: number;
  pageSize?: number;
}): Paginated<Article> {
  const db = getDb();
  const pageSize = params.pageSize ?? 10;
  const conds: string[] = [];
  const args: (string | number)[] = [];

  if (params.search && params.search.trim()) {
    conds.push("(title LIKE ? OR summary LIKE ? OR category LIKE ?)");
    const kw = `%${params.search.trim()}%`;
    args.push(kw, kw, kw);
  }
  if (params.status === "draft" || params.status === "published") {
    conds.push("status = ?");
    args.push(params.status);
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const { n } = db
    .prepare(`SELECT COUNT(*) AS n FROM articles ${where}`)
    .get(...args) as { n: number };
  const totalPages = Math.max(1, Math.ceil(n / pageSize));
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages);

  const rows = db
    .prepare(
      `SELECT * FROM articles ${where}
       ORDER BY COALESCE(published_at, updated_at) DESC, id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...args, pageSize, (page - 1) * pageSize) as unknown as ArticleRow[];

  return { items: rows.map(rowToArticle), total: n, page, pageSize, totalPages };
}

/** 创建文章 */
export function createArticle(input: ArticleInput): Article {
  const db = getDb();
  const now = new Date().toISOString();
  const tempSlug = `tmp-${crypto.randomUUID()}`;
  const publishedAt = input.status === "published" ? now : null;

  const result = db
    .prepare(
      `INSERT INTO articles
       (title, slug, category, tags, summary, cover, content, status, view_count, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .run(
      input.title,
      tempSlug,
      input.category,
      JSON.stringify(input.tags),
      input.summary,
      input.cover,
      input.content,
      input.status,
      now,
      now,
      publishedAt
    );

  const id = Number(result.lastInsertRowid);
  const finalSlug = resolveSlug(input.title, id);
  db.prepare("UPDATE articles SET slug = ? WHERE id = ?").run(finalSlug, id);
  return getArticleById(id)!;
}

/** 更新文章 */
export function updateArticle(id: number, input: ArticleInput): Article | null {
  const db = getDb();
  const existing = getArticleById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  let publishedAt = existing.publishedAt;
  if (input.status === "published" && existing.status !== "published") {
    publishedAt = now;
  }
  if (input.status === "draft") {
    publishedAt = null;
  }

  db.prepare(
    `UPDATE articles SET
       title = ?, category = ?, tags = ?, summary = ?, cover = ?,
       content = ?, status = ?, updated_at = ?, published_at = ?
     WHERE id = ?`
  ).run(
    input.title,
    input.category,
    JSON.stringify(input.tags),
    input.summary,
    input.cover,
    input.content,
    input.status,
    now,
    publishedAt,
    id
  );

  // 标题变化时更新 slug
  const newSlug = resolveSlug(input.title, id);
  if (newSlug !== existing.slug) {
    db.prepare("UPDATE articles SET slug = ? WHERE id = ?").run(newSlug, id);
  }
  return getArticleById(id);
}

export function deleteArticle(id: number): boolean {
  const result = getDb().prepare("DELETE FROM articles WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}

export function incrementView(id: number) {
  getDb()
    .prepare("UPDATE articles SET view_count = view_count + 1 WHERE id = ?")
    .run(id);
}

function resolveSlug(title: string, id: number): string {
  const db = getDb();
  const base = slugify(title) || String(id);
  let slug = base;
  let i = 2;
  while (true) {
    const row = db
      .prepare("SELECT id FROM articles WHERE slug = ? AND id != ?")
      .get(slug, id);
    if (!row) return slug;
    slug = `${base}-${i}`;
    i += 1;
  }
}

/** 后台：全部已有分类（供表单下拉提示） */
export function getCategories(): string[] {
  const rows = getDb()
    .prepare(
      "SELECT DISTINCT category FROM articles WHERE category != '' ORDER BY category"
    )
    .all() as unknown as { category: string }[];
  return rows.map((r) => r.category);
}

/** 仪表盘统计 */
export function getStats() {
  const db = getDb();
  const totals = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
         SUM(view_count) AS totalViews
       FROM articles`
    )
    .get() as unknown as {
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
  };

  const byCategory = db
    .prepare(
      `SELECT category, COUNT(*) AS count FROM articles
       WHERE category != '' GROUP BY category ORDER BY MIN(id) ASC`
    )
    .all() as unknown as { category: string; count: number }[];

  const recentRows = db
    .prepare(
      "SELECT * FROM articles ORDER BY updated_at DESC, id DESC LIMIT 5"
    )
    .all() as unknown as ArticleRow[];

  const topRows = db
    .prepare(
      "SELECT * FROM articles ORDER BY view_count DESC, id DESC LIMIT 5"
    )
    .all() as unknown as ArticleRow[];

  return {
    total: totals.total ?? 0,
    published: totals.published ?? 0,
    drafts: totals.drafts ?? 0,
    totalViews: totals.totalViews ?? 0,
    byCategory: byCategory.map((c) => ({ category: c.category, count: Number(c.count) })),
    recent: recentRows.map(rowToArticle),
    topViews: topRows.map(rowToArticle),
  };
}
