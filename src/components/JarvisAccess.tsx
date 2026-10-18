"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Copy, KeyRound } from "lucide-react";
import { relativeWhen } from "@/lib/date";

type TokenInfo = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

/**
 * API-Tokens für Jarvis verwalten. Ein neues Token wird genau einmal im
 * Klartext angezeigt, danach kennt die App nur noch den Hash.
 */
export function JarvisAccess() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/tokens", { cache: "no-store" });
    if (res.ok) setTokens(((await res.json()) as { tokens: TokenInfo[] }).tokens);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/v1/tokens", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<{ tokens: TokenInfo[] }>) : null))
      .then((body) => {
        if (alive && body) setTokens(body.tokens);
      });
    return () => {
      alive = false;
    };
  }, []);

  const create = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/v1/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Jarvis" }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Token konnte nicht erstellt werden.");
      return;
    }
    setFresh(((await res.json()) as { token: string }).token);
    setCopied(false);
    load();
  };

  const revoke = async (id: string) => {
    setConfirmRevoke(null);
    await fetch(`/api/v1/tokens/${id}`, { method: "DELETE" });
    load();
  };

  const active = tokens.filter((t) => !t.revokedAt);

  return (
    <div className="rounded-2xl p-3" style={{ background: "rgba(228,217,191,0.5)" }}>
      <div
        className="uplabel text-[10px] mb-1.5 inline-flex items-center gap-1.5"
        style={{ color: "var(--muted)" }}
      >
        <Bot size={11} strokeWidth={2} /> Jarvis-Zugang
      </div>
      <p className="text-[12px] mb-2.5" style={{ color: "var(--ink-soft)" }}>
        Mit einem Token kann Jarvis Todos, Inbox und Tagesplan lesen und schreiben.
      </p>

      {active.length > 0 && (
        <ul className="mb-2.5 space-y-1">
          {active.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-[12.5px]"
              style={{ background: "var(--paper)" }}
            >
              <span className="min-w-0">
                <span className="font-medium">{t.name}</span>
                <span className="block text-[11px]" style={{ color: "var(--muted)" }}>
                  {t.lastUsedAt
                    ? `zuletzt genutzt ${relativeWhen(Date.parse(t.lastUsedAt))}`
                    : "noch nie genutzt"}
                </span>
              </span>
              {confirmRevoke === t.id ? (
                <button
                  type="button"
                  onClick={() => revoke(t.id)}
                  className="tap text-[12px] font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: "var(--terra)" }}
                >
                  Wirklich?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRevoke(t.id)}
                  className="tap text-[12px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "var(--cream-deep)", color: "var(--terra-deep)" }}
                >
                  Widerrufen
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {fresh && (
        <div className="mb-2.5 rounded-xl p-2.5" style={{ background: "var(--paper)" }}>
          <div className="text-[11.5px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
            Nur jetzt sichtbar. In der Jarvis-Umgebung als Variable{" "}
            <code>LIFE_APP_TOKEN</code> hinterlegen.
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 break-all text-[11.5px]">{fresh}</code>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(fresh);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
              className="tap shrink-0 w-8 h-8 rounded-lg inline-flex items-center justify-center"
              style={{ background: "var(--cream-deep)" }}
              aria-label="Token kopieren"
            >
              {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[12px] mb-2" style={{ color: "#C5634B" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="tap w-full py-2.5 rounded-xl text-[13.5px] font-medium inline-flex items-center justify-center gap-2"
        style={{ background: "var(--paper)", color: "var(--ink)" }}
      >
        <KeyRound size={13} strokeWidth={1.75} />
        {busy ? "…" : "Neues Token erstellen"}
      </button>
    </div>
  );
}
