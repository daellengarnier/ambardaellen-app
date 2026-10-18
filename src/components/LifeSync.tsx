"use client";

import { useEffect } from "react";
import { useLife } from "@/lib/lifeStore";

const POLL_MS = 30_000;

/**
 * Lädt Todos, Inbox und Tagesplan beim Start und danach regelmässig,
 * solange die App im Vordergrund ist. So erscheint, was Jarvis über die
 * API einträgt, ohne Neuladen.
 */
export function LifeSync() {
  const refresh = useLife((s) => s.refresh);

  useEffect(() => {
    refresh();
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  return null;
}
