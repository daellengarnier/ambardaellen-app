"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "ad-last-seen-notifs";

function getSnapshot(): number {
  try {
    const raw = localStorage.getItem(KEY);
    return Number(raw) || 0;
  } catch {
    return 0;
  }
}

function getServerSnapshot(): number {
  // Vor Hydration / im SSR-Pfad gibt es keinen lokalen Stand. 0 = "alles
  // ist neu" — sobald der Client gemounted ist, springt der Wert auf den
  // echten localStorage-Stand.
  return 0;
}

function subscribe(cb: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Lokal pro Gerät: wann hat dieser User zuletzt den Notification-Feed
 * geöffnet? Wird nicht in die Cloud gespiegelt — jeder hält seinen
 * eigenen "Gelesen-Stand".
 */
export function useLastSeen(): [number, () => void] {
  const val = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const markSeen = useCallback(() => {
    const now = Date.now();
    try {
      localStorage.setItem(KEY, String(now));
      // Im selben Tab feuert das storage-Event nicht — manuell anstossen.
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    } catch {
      // ignorieren
    }
  }, []);

  return [val, markSeen];
}
