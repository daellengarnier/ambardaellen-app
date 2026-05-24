"use client";

import type { ReactNode } from "react";
import { HamburgerMenu } from "./HamburgerMenu";

type Props = {
  title: string;
  subtitle?: string;
  /** Zusätzliche Action (z. B. + Button) links neben dem Hamburger-Menü. */
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
  return (
    <header className="px-4 pt-1 pb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {subtitle && (
          <div className="uplabel text-[10px] text-[var(--muted)] mb-2">
            {subtitle}
          </div>
        )}
        <h1 className="serif-i text-[36px] leading-[0.95] text-[var(--ink)]">
          {title}
        </h1>
      </div>
      <div className="shrink-0 pt-1 flex items-center gap-2">
        {right}
        <HamburgerMenu />
      </div>
    </header>
  );
}
