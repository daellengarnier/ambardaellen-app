"use client";

import { Lock, Users } from "lucide-react";
import type { Scope, UserId } from "@/lib/types";
import { USERS } from "@/lib/types";

type Props = {
  value: Scope;
  onChange: (s: Scope) => void;
  currentUser: UserId;
  compact?: boolean;
};

export function ScopeToggle({ value, onChange, currentUser, compact = false }: Props) {
  const u = USERS[currentUser];
  const sizeClass = compact ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[13px]";
  const iconSize = compact ? 12 : 13;
  return (
    <div
      className="inline-flex p-1 rounded-full"
      style={{ background: "var(--cream-deep)" }}
    >
      <button
        type="button"
        onClick={() => onChange("geteilt")}
        className={`${sizeClass} rounded-full font-medium inline-flex items-center gap-1.5 tap`}
        style={
          value === "geteilt"
            ? { background: "var(--paper)", color: "var(--ink)" }
            : { color: "var(--ink-soft)", background: "transparent" }
        }
      >
        <Users size={iconSize} strokeWidth={1.75} /> Gemeinsam
      </button>
      <button
        type="button"
        onClick={() => onChange(currentUser)}
        className={`${sizeClass} rounded-full font-medium inline-flex items-center gap-1.5 tap`}
        style={
          value === currentUser
            ? { background: "var(--paper)", color: "var(--ink)" }
            : { color: "var(--ink-soft)", background: "transparent" }
        }
      >
        <Lock size={iconSize} strokeWidth={2} /> Nur {u.name}
      </button>
    </div>
  );
}
