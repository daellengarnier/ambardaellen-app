import type { Scope, UserId } from "./types";

export function visibleTo<T extends { scope?: Scope }>(items: T[], user: UserId): T[] {
  return items.filter((it) => !it.scope || it.scope === "geteilt" || it.scope === user);
}

export function isPrivate(it: { scope?: Scope }): boolean {
  return !!it.scope && it.scope !== "geteilt";
}
