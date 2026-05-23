"use client";

import type { ReactNode, MouseEventHandler } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export function Card({ children, className = "", onClick }: Props) {
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={[
        "bg-[var(--paper)] rounded-2xl shadow-card",
        clickable ? "tap cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
