"use client";

import { useState } from "react";

export interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface Segment extends DonutItem {
  frac: number;
  dash: number;
  offset: number;
}

/**
 * 分类分布环形图。
 * 配色来自 dataviz 技能验证过的分类色板（浅色模式）；
 * 段间留 2px 表面色缝隙；直接标签 + 数据列表满足对比度缓解规则。
 */
export default function CategoryDonut({
  items,
  total,
}: {
  items: DonutItem[];
  total: number;
}) {
  const [hovered, setHovered] = useState<Segment | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const size = 180;
  const center = size / 2;
  const r = 62;
  const strokeWidth = 26;
  const gap = 2; // 段间表面色缝隙
  const C = 2 * Math.PI * r;

  const segments: Segment[] = items.map((item, i) => {
    const frac = total > 0 ? item.value / total : 0;
    // 前 i 段弧长之和作为本段起点（无副作用计算）
    const offset =
      items.slice(0, i).reduce((sum, it) => {
        const f = total > 0 ? it.value / total : 0;
        return sum + f * C;
      }, 0);
    const dash = Math.max(frac * C - gap, 0.5);
    return { ...item, frac, dash, offset };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      {/* 环形图 */}
      <div
        className="relative shrink-0"
        onMouseLeave={() => setHovered(null)}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`分类分布环形图，共 ${total} 篇文章`}
        >
          {/* 底环 */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg) => {
            const dasharray = `${seg.dash} ${C - seg.dash}`;
            return (
              <g key={seg.label}>
                {/* 可见段 */}
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dasharray}
                  strokeDashoffset={-seg.offset}
                  transform={`rotate(-90 ${center} ${center})`}
                  opacity={hovered && hovered.label !== seg.label ? 0.45 : 1}
                  style={{ transition: "opacity 150ms" }}
                />
                {/* 加宽的透明命中区 */}
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={strokeWidth + 16}
                  strokeDasharray={dasharray}
                  strokeDashoffset={-seg.offset}
                  transform={`rotate(-90 ${center} ${center})`}
                  onMouseEnter={() => setHovered(seg)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
        {/* 中心总计 */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-400">篇文章</span>
        </div>
      </div>

      {/* 直接标签 + 数据列表（即表格视图） */}
      <ul className="w-full min-w-0 space-y-2.5">
        {segments.map((seg) => (
          <li
            key={seg.label}
            className="flex items-center gap-2.5 text-sm"
            onMouseEnter={() => setHovered(seg)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: seg.color }}
              aria-hidden
            />
            <span className="truncate text-gray-700">{seg.label}</span>
            <span className="ml-auto shrink-0 text-gray-400 tabular-nums">
              {seg.value} 篇 · {Math.round(seg.frac * 100)}%
            </span>
          </li>
        ))}
      </ul>

      {/* 悬停提示 */}
      {hovered && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{
            left: Math.min(mousePos.x + 12, window.innerWidth - 140),
            top: mousePos.y + 12,
          }}
        >
          {hovered.label}：{hovered.value} 篇（{Math.round(hovered.frac * 100)}%）
        </div>
      )}
    </div>
  );
}
