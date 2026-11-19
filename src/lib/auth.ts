import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "./db";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 10;

export interface SessionUser {
  id: number;
  username: string;
  mustChangePassword: boolean;
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  must_change_password: number;
}

interface SessionRow {
  token: string;
  expires_at: string;
  id: number;
  username: string;
  must_change_password: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 86400000
  ).toISOString();
  getDb()
    .prepare(
      "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    )
    .run(token, userId, expiresAt, new Date().toISOString());
  return token;
}

export function destroySession(token: string) {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = getDb()
    .prepare(
      `SELECT s.token, s.expires_at, u.id, u.username, u.must_change_password
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as unknown as SessionRow | undefined;
  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(row.token);
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    mustChangePassword: !!row.must_change_password,
  };
}

export function getUserByUsername(username: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as unknown as UserRow | undefined;
}

export function updatePassword(userId: number, password: string) {
  const hash = bcrypt.hashSync(password, 10);
  getDb()
    .prepare(
      "UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?"
    )
    .run(hash, userId);
}

// ---------- 登录防暴力破解（进程内计数，重启后重置） ----------

interface LockEntry {
  failures: number;
  lockedUntil: number;
}

const lockMap = new Map<string, LockEntry>();

export function checkLoginLock(
  username: string
): { locked: true; retryAfterSeconds: number } | { locked: false } {
  const entry = lockMap.get(username);
  if (!entry || entry.lockedUntil <= Date.now()) return { locked: false };
  return {
    locked: true,
    retryAfterSeconds: Math.ceil((entry.lockedUntil - Date.now()) / 1000),
  };
}

export function recordLoginFailure(username: string) {
  const entry = lockMap.get(username) ?? { failures: 0, lockedUntil: 0 };
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
    entry.failures = 0;
  }
  lockMap.set(username, entry);
}

export function clearLoginFailures(username: string) {
  lockMap.delete(username);
}

/**
 * API 鉴权：未登录或（默认情况下）尚未完成初始密码修改时返回 null。
 * 调用方对 null 返回 401。
 */
export async function requireAdmin(opts?: {
  allowPendingPasswordChange?: boolean;
}): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.mustChangePassword && !opts?.allowPendingPasswordChange) return null;
  return user;
}
