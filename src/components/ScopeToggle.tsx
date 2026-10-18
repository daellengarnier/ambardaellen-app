"use client";

import type { Scope, UserId } from "@/lib/types";

type Props = {
  value: Scope;
  onChange: (s: Scope) => void;
  currentUser: UserId;
  compact?: boolean;
};

/**
 * Früher: Umschalter "Gemeinsam / Nur ich". Seit dem Umbau zur
 * Ein-Personen-App gibt es keine Sichtbarkeit mehr. Die Komponente
 * bleibt als leere Hülle, bis Einkauf, Aktivitäten und Ziele in Phase 3
 * ihr eigenes Datenmodell ohne scope bekommen.
 */
export function ScopeToggle(props: Props) {
  void props;
  return null;
}
