"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

export function DetailRow({ label, value, icon }: Props) {
  return (
    <div
      className="flex items-center gap-3 py-2 border-b last:border-0"
      style={{ borderColor: "rgba(218,201,168,0.4)" }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
          {label}
        </div>
        <div className="text-[14.5px] truncate">{value}</div>
      </div>
    </div>
  );
}
