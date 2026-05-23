"use client";

import type { MouseEventHandler } from "react";

type Props = {
  checked: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  color?: string;
  size?: number;
  ariaLabel?: string;
};

export function RoundCheck({
  checked,
  onClick,
  color = "var(--sage)",
  size = 22,
  ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (checked ? "Erledigt — wieder öffnen" : "Erledigen")}
      aria-pressed={checked}
      className="tap shrink-0 rounded-full inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: checked ? "none" : "1.6px solid var(--line)",
        background: checked ? color : "transparent",
      }}
    >
      {checked && (
        <svg
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            className="tick-path"
            d="M3 8.5l3.5 3.5L13 5"
            stroke="#FBF6E8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
