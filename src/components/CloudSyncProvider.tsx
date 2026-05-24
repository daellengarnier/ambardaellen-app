"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useStore, type AuthAccount } from "@/lib/store";

const POLL_MS = 15_000;
const PUSH_DEBOUNCE_MS = 1_200;

type SyncResponse = { data: unknown; version: number };

async function fetchMe(): Promise<AuthAccount | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { account: AuthAccount | null };
    return body.account;
  } catch {
    return null;
  }
}

async function fetchSync(): Promise<SyncResponse | null> {
  try {
    const res = await fetch("/api/sync", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SyncResponse;
  } catch {
    return null;
  }
}

async function pushSync(
  baseVersion: number,
  data: unknown,
): Promise<{ ok: true; version: number } | { ok: false; conflict: SyncResponse | null; error: string }> {
  try {
    const res = await fetch("/api/sync", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ baseVersion, data }),
    });
    if (res.status === 409) {
      const body = (await res.json().catch(() => ({}))) as { current?: SyncResponse };
      return { ok: false, conflict: body.current ?? null, error: "Konflikt" };
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, conflict: null, error: body.error ?? `HTTP ${res.status}` };
    }
    const body = (await res.json()) as { version: number };
    return { ok: true, version: body.version };
  } catch (e) {
    return { ok: false, conflict: null, error: (e as Error).message };
  }
}

function isAppDataEmpty(data: unknown): boolean {
  if (!data || typeof data !== "object") return true;
  const d = data as Record<string, unknown>;
  const arrays = ["activities", "shopping", "todos", "goals", "packlistTemplates"];
  for (const k of arrays) {
    const v = d[k];
    if (Array.isArray(v) && v.length > 0) return false;
  }
  return true;
}

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const account = useStore((s) => s.account);
  const setAccount = useStore((s) => s.setAccount);
  const setAuthReady = useStore((s) => s.setAuthReady);
  const applyCloudData = useStore((s) => s.applyCloudData);
  const setCloudStatus = useStore((s) => s.setCloudStatus);
  const setCloudVersion = useStore((s) => s.setCloudVersion);
  const markPushed = useStore((s) => s.markPushed);

  const initStartedRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  // ── Initialer Auth-Check (einmalig nach Mount) ────────────────
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    (async () => {
      const me = await fetchMe();
      setAccount(me);
      if (me) {
        setCloudStatus("loading");
        const snap = await fetchSync();
        if (snap) {
          const localEmpty = isAppDataEmpty(useStore.getState().exportAppData());
          const remoteEmpty = isAppDataEmpty(snap.data);
          if (snap.version === 0 && remoteEmpty && !localEmpty) {
            // Frische Cloud, lokale Daten vorhanden → Migration
            const local = useStore.getState().exportAppData();
            const res = await pushSync(0, local);
            if (res.ok) setCloudVersion(res.version);
            setCloudStatus("idle");
          } else {
            applyCloudData(snap.data as Partial<ReturnType<typeof useStore.getState>>, snap.version);
            setCloudStatus("idle");
          }
        } else {
          setCloudStatus("error", "Konnte Daten nicht laden.");
        }
      }
      setAuthReady(true);
    })();
  }, [setAccount, setAuthReady, applyCloudData, setCloudStatus, setCloudVersion]);

  // ── Push: dirty flag → debounced PUT ──────────────────────────
  useEffect(() => {
    if (!account) return;
    const unsub = useStore.subscribe((state, prev) => {
      if (state.pendingPush && !prev.pendingPush) {
        if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
        pushTimerRef.current = setTimeout(async () => {
          if (inFlightRef.current) return;
          inFlightRef.current = true;
          const s = useStore.getState();
          if (!s.account) {
            inFlightRef.current = false;
            return;
          }
          setCloudStatus("syncing");
          const res = await pushSync(s.cloudVersion, s.exportAppData());
          if (res.ok) {
            setCloudVersion(res.version);
            markPushed();
            setCloudStatus("idle");
          } else if (res.conflict) {
            // Konflikt: Cloud-Stand übernehmen. Bei 2 Nutzern selten, OK.
            applyCloudData(
              res.conflict.data as Partial<ReturnType<typeof useStore.getState>>,
              res.conflict.version,
            );
            setCloudStatus("idle");
          } else {
            setCloudStatus("error", res.error);
          }
          inFlightRef.current = false;
        }, PUSH_DEBOUNCE_MS);
      }
    });
    return () => {
      unsub();
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [account, applyCloudData, markPushed, setCloudStatus, setCloudVersion]);

  // ── Poll: regelmässig pullen wenn Tab im Vordergrund ──────────
  useEffect(() => {
    if (!account) return;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (inFlightRef.current) return;
      const s = useStore.getState();
      if (!s.account || s.pendingPush) return;
      const snap = await fetchSync();
      if (snap && snap.version > s.cloudVersion) {
        applyCloudData(
          snap.data as Partial<ReturnType<typeof useStore.getState>>,
          snap.version,
        );
      }
    };
    const id = setInterval(tick, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [account, applyCloudData]);

  return <>{children}</>;
}
