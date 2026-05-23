"use client";

import { Lock } from "lucide-react";
import type { Scope, UserId } from "@/lib/types";
import { USERS } from "@/lib/types";
import { isPrivate } from "@/lib/scope";
import { useStore } from "@/lib/store";

type AvatarProps = {
  id: UserId;
  size?: number;
  ring?: boolean;
  dim?: boolean;
};

export function Avatar({ id, size = 24, ring = false, dim = false }: AvatarProps) {
  const u = USERS[id];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: u.color,
        fontSize: size * 0.45,
        boxShadow: ring ? "0 0 0 2px var(--paper)" : undefined,
        opacity: dim ? 0.42 : 1,
        transition: "opacity 200ms",
      }}
      aria-label={u.name}
    >
      {id}
    </span>
  );
}

export function AvatarPair({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex">
      <Avatar id="A" size={size} ring />
      <span style={{ marginLeft: -Math.round(size / 3) }}>
        <Avatar id="D" size={size} ring />
      </span>
    </span>
  );
}

/**
 * Header-Variante: aktiver User hat Ring + volle Farbe, anderer ist matt.
 * Tap auf einen Avatar wechselt den User.
 */
export function UserSwitchPair({ size = 28 }: { size?: number }) {
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  return (
    <span className="inline-flex items-center gap-0">
      {(["A", "D"] as const).map((id, i) => {
        const active = currentUser === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setCurrentUser(id)}
            className="tap inline-flex"
            style={{ marginLeft: i === 0 ? 0 : -Math.round(size / 3) }}
            aria-label={`Wechseln zu ${USERS[id].name}`}
            aria-pressed={active}
          >
            <Avatar id={id} size={size} ring={active} dim={!active} />
          </button>
        );
      })}
    </span>
  );
}

type WithScopeProps = {
  by: UserId;
  scope: Scope;
  size?: number;
};

export function AvatarWithScope({ by, scope, size = 20 }: WithScopeProps) {
  const badge = Math.round(size * 0.55);
  return (
    <span className="relative inline-flex">
      <Avatar id={by} size={size} />
      {isPrivate({ scope }) && (
        <span
          className="absolute bottom-[-2px] right-[-2px] rounded-full bg-[var(--paper)] flex items-center justify-center"
          style={{ width: badge, height: badge }}
        >
          <Lock size={Math.max(8, Math.round(badge * 0.6))} color="var(--ink-soft)" strokeWidth={2} />
        </span>
      )}
    </span>
  );
}
