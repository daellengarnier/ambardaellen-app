"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Play, Upload, ChevronRight } from "lucide-react";
import type { DeckDto, StudyStats } from "@/lib/life";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { ClientOnly } from "@/components/ClientOnly";
import { Sheet } from "@/components/Sheet";

export default function LernenPage() {
  return (
    <ClientOnly fallback={<ScreenHeader title="Lernen" subtitle="Vietnamesisch" />}>
      <LernenContent />
    </ClientOnly>
  );
}

type Loaded = { decks: DeckDto[]; stats: StudyStats };

async function load(): Promise<Loaded | null> {
  const [d, s] = await Promise.all([
    fetch("/api/v1/decks", { cache: "no-store" }),
    fetch("/api/v1/study/stats", { cache: "no-store" }),
  ]);
  if (!d.ok || !s.ok) return null;
  return { decks: ((await d.json()) as { decks: DeckDto[] }).decks, stats: (await s.json()) as StudyStats };
}

function LernenContent() {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const reload = useCallback(async () => {
    const r = await load();
    setData(r);
    setError(r === null);
  }, []);

  useEffect(() => {
    let alive = true;
    load().then((r) => {
      if (!alive) return;
      setData(r);
      setError(r === null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = data?.stats;
  const todo = stats ? stats.due + stats.newToday : 0;

  return (
    <>
      <ScreenHeader title="Lernen" subtitle="Vietnamesisch · Ziel B1 Mitte 2027" />

      <div className="px-4 space-y-3">
        {error && (
          <p className="text-[13px]" style={{ color: "#B42318" }}>
            Konnte die Lerndaten nicht laden.
          </p>
        )}

        {stats && (
          <section
            className="rounded-[22px] p-4 flex flex-col gap-3"
            style={{ background: "var(--privat)", color: "var(--ink)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[13px] font-bold">Heute</div>
                <div className="serif text-[44px] leading-none mt-1">{todo}</div>
                <div className="text-[13px] font-medium mt-1">
                  {stats.due === 1 ? "1 Wiederholung" : `${stats.due} Wiederholungen`} · {stats.newToday} neu
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-[12.5px] font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Flame size={15} strokeWidth={2.2} aria-hidden="true" />
                  {stats.streak === 1 ? "1 Tag" : `${stats.streak} Tage`}
                </span>
                <span>{stats.reviewedToday} heute geübt</span>
              </div>
            </div>
            {todo > 0 ? (
              <Link
                href="/lernen/ueben"
                className="tap h-12 rounded-2xl inline-flex items-center justify-center gap-2 text-[15px] font-bold"
                style={{ background: "var(--ink)", color: "white" }}
              >
                <Play size={16} strokeWidth={2.4} aria-hidden="true" /> Lernen starten
              </Link>
            ) : (
              <p className="text-[13.5px] font-semibold">Für heute alles erledigt.</p>
            )}
          </section>
        )}

        {data && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1 pt-1">
              <h2 className="serif-i text-[20px]">Decks</h2>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="tap inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-full"
                style={{ background: "var(--paper)", color: "var(--ink)" }}
              >
                <Upload size={14} strokeWidth={2} aria-hidden="true" /> Importieren
              </button>
            </div>
            {data.decks.map((d) => {
              const pct = d.items ? Math.round((d.learned / d.items) * 100) : 0;
              return (
                <Link key={d.id} href={`/lernen/ueben?deck=${encodeURIComponent(d.id)}`} className="block">
                  <Card className="p-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11.5px] font-bold" style={{ color: "var(--muted)" }}>
                        {[d.level, d.course].filter(Boolean).join(" · ")}
                      </div>
                      <div className="text-[15px] font-semibold truncate mt-0.5" lang="vi">
                        {d.title}
                      </div>
                      {d.topic && (
                        <div className="text-[12.5px] truncate" style={{ color: "var(--ink-soft)" }}>
                          {d.topic}
                        </div>
                      )}
                      <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--cream-deep)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "var(--sage)" }} />
                      </div>
                      <div className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>
                        {d.cards} Karten · {d.learned}/{d.items} gelernt
                        {d.due > 0 && ` · ${d.due} fällig`}
                      </div>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.8} color="var(--muted)" aria-hidden="true" />
                  </Card>
                </Link>
              );
            })}
          </section>
        )}
      </div>

      <ImportSheet open={importOpen} onClose={() => setImportOpen(false)} onDone={reload} />
    </>
  );
}

function ImportSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [json, setJson] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const submit = async () => {
    setMsg(null);
    let body: unknown;
    try {
      body = JSON.parse(json);
    } catch {
      setMsg({ ok: false, text: "Kein gültiges JSON." });
      return;
    }
    setBusy(true);
    const res = await fetch("/api/v1/decks/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    const r = (await res.json().catch(() => ({}))) as {
      created?: number;
      updated?: number;
      error?: string;
      details?: Array<{ path: (string | number)[]; message: string }>;
    };
    if (!res.ok) {
      const first = r.details?.[0];
      setMsg({ ok: false, text: first ? `${first.path.join(".")}: ${first.message}` : (r.error ?? "Fehler") });
      return;
    }
    setMsg({ ok: true, text: `${r.created} neue, ${r.updated} aktualisierte Karten.` });
    setJson("");
    onDone();
  };

  return (
    <Sheet open onClose={onClose} title="Deck importieren">
      <p className="text-[13px] mt-2" style={{ color: "var(--ink-soft)" }}>
        JSON mit <code>deck</code> und <code>cards</code>, wie die Lektionen im Jarvis-Repo. Ein bestehendes Deck wird
        aktualisiert, dein Lernstand bleibt.
      </p>
      <label className="block mt-3">
        <span className="sr-only">Deck als JSON</span>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={10}
          placeholder='{ "deck": { "id": "...", "title": "..." }, "cards": [ ... ] }'
          className="w-full rounded-2xl p-3 text-[13px] font-mono resize-none"
          style={{ background: "var(--cream-deep)" }}
        />
      </label>
      {msg && (
        <p className="text-[13px] mt-2 font-semibold" style={{ color: msg.ok ? "var(--sage)" : "#B42318" }}>
          {msg.text}
        </p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={busy || !json.trim()}
        className="w-full mt-4 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: json.trim() ? "var(--terra)" : "var(--terra-soft)" }}
      >
        {busy ? "…" : "Importieren"}
      </button>
    </Sheet>
  );
}
