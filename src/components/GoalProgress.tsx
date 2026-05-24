"use client";

import type { Goal } from "@/lib/types";
import { USERS } from "@/lib/types";

export function GoalProgress({ goal }: { goal: Goal }) {
  const current = goal.current ?? 0;
  const pct = Math.min(100, Math.round((current / Math.max(1, goal.target)) * 100));
  const color = USERS[goal.by].color;
  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--cream-deep)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[12.5px] text-[var(--muted)] mono">
        <span>
          {current.toLocaleString("de-DE")}
          {goal.unit ? ` / ${goal.target.toLocaleString("de-DE")} ${goal.unit}` : ` / ${goal.target}`}
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
