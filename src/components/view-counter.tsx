"use client";

import { useEffect } from "react";

/**
 * 浏览量 +1（同一访客会话内重复刷新不累加，用 sessionStorage 去重）
 */
export default function ViewCounter({ id }: { id: number }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage 不可用时退化为直接计数
    }
    fetch(`/api/posts/${id}/view`, { method: "POST", keepalive: true }).catch(
      () => {}
    );
  }, [id]);

  return null;
}
