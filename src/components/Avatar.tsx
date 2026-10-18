"use client";

import type { Scope, UserId } from "@/lib/types";
import { USERS } from "@/lib/types";

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



type WithScopeProps = {
  by: UserId;
  scope: Scope;
  size?: number;
};

/**
 * Früher Ersteller-Avatar mit Schloss für Privates. In der
 * Ein-Personen-App ohne Aussage, darum leer. Fällt in Phase 3 weg.
 */
export function AvatarWithScope(props: WithScopeProps) {
  void props;
  return null;
}
