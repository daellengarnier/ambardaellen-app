"use client";

import { Coffee, Leaf, Heart, Sparkles, BookOpen, Home, Calendar } from "lucide-react";
import type { ActivityIconKind } from "@/lib/types";

const MAP: Record<ActivityIconKind, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  coffee: Coffee,
  leaf: Leaf,
  heart: Heart,
  sparkle: Sparkles,
  book: BookOpen,
  house: Home,
};

export function ActivityIcon({ kind, size = 36 }: { kind: ActivityIconKind; size?: number }) {
  const Icon = MAP[kind] ?? Calendar;
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--cream-deep)",
        color: "var(--ink)",
      }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.75} />
    </span>
  );
}
