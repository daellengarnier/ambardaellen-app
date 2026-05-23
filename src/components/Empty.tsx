"use client";

import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  body: string;
};

export function Empty({ icon, title, body }: Props) {
  return (
    <div className="px-5 py-10 text-center">
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
      >
        {icon}
      </div>
      <div className="text-[16px] font-medium mb-1">{title}</div>
      <div
        className="text-[14px] max-w-[260px] mx-auto leading-relaxed"
        style={{ color: "var(--muted)" }}
      >
        {body}
      </div>
    </div>
  );
}
