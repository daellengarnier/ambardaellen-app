"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Play, Upload, ChevronRight, Settings2, Plus, Minus, Bell, BellOff } from "lucide-react";
import type { DeckDto, StudyStats } from "@/lib/life";
import { currentSubscription, disablePush, enablePush, pushSupported } from "@/lib/push";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { ClientOnly } from "@/components/ClientOnly";
import { Sheet } from "@/components/Sheet";
import { ChapterCard } from "@/components/ChapterCard";
import { useLife } from "@/lib/lifeStore";
import { Label } from "@/components/sheets/TodoAddSheet";

export default function LernenPage() {
  return (
    <ClientOnly fallback={<ScreenHeader title="Lernen" subtitle="Vietnamesisch" />}>
      <LernenContent />
    </ClientOnly>
  );
}

type Mode = "mix" | "vi_de" | "de_vi";
const MODES: Array<{ v: Mode; l: string }> = [
  { v: "mix", l: "Gemischt" },
  { v: "vi_de", l: "VI → DE" },
  { v: "de_vi", l: "DE → VI" },
];
const MODE_KEY = "lernen.mode";
const EXTRA = 10;

type StudySettings = { newPerDay: number; dailyGoal: number; reminderEnabled: boolean; reminderTime: string };
type Loaded = { decks: DeckDto[]; stats: StudyStats; settings: StudySettings };

async function load(): Promise<Loaded | null> {
  const [d, s, st] = await Promise.all([
    fetch("/api/v1/decks", { cache: "no-store" }),
    fetch("/api/v1/study/stats", { cache: "no-store" }),
    fetch("/api/v1/study/settings", { cache: "no-store" }),
  ]);
  if (!d.ok || !s.ok || !st.ok) return null;
  return {
    decks: ((await d.json()) as { decks: DeckDto[] }).decks,
    stats: (await s.json()) as StudyStats,
    settings: (await st.json()) as StudySettings,
  };
}

function readMode(): Mode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === "vi_de" || m === "de_vi" ? m : "mix";
  } catch {
    return "mix";
  }
}

function LernenContent() {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setModeState] = useState<Mode>(readMode);

  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      // ohne Speicher gilt die Wahl nur für diese Sitzung
    }
  };

  const refreshLife = useLife((s) => s.refresh);
  const reload = useCallback(async () => {
    refreshLife();
    const r = await load();
    setData(r);
    setError(r === null);
  }, [refreshLife]);

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
  const modeQuery = mode === "mix" ? "" : `mode=${mode}`;
  const href = (extra?: number, deck?: string) => {
    const q = [modeQuery, extra ? `extra=${extra}` : "", deck ? `deck=${encodeURIComponent(deck)}` : ""].filter(Boolean).join("&");
    return `/lernen/ueben${q ? `?${q}` : ""}`;
  };

  return (
    <>
      <ScreenHeader
        title="Lernen"
        subtitle="Vietnamesisch · Ziel B1 Mitte 2027"
        right={
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="tap w-11 h-11 rounded-full inline-flex items-center justify-center shadow-card"
            style={{ background: "var(--paper)" }}
            aria-label="Lern-Einstellungen"
          >
            <Settings2 size={18} strokeWidth={1.9} />
          </button>
        }
      />

      <div className="px-4 space-y-3">
        {error && (
          <p className="text-[13px]" style={{ color: "#B42318" }}>
            Konnte die Lerndaten nicht laden.
          </p>
        )}

        <ChapterCard showReviews={false} />

        <div
          className="grid grid-cols-3 gap-1 p-1 rounded-2xl"
          style={{ background: "var(--cream-deep)" }}
          role="radiogroup"
          aria-label="Richtung"
        >
          {MODES.map((m) => (
            <button
              key={m.v}
              type="button"
              role="radio"
              aria-checked={mode === m.v}
              onClick={() => setMode(m.v)}
              className="tap h-10 rounded-xl text-[13px] font-bold"
              style={mode === m.v ? { background: "var(--paper)", color: "var(--ink)" } : { color: "var(--ink-soft)" }}
            >
              {m.l}
            </button>
          ))}
        </div>

        {stats && (
          <Card className="p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[14.5px] font-semibold">Wiederholen</div>
                <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                  {stats.due === 1 ? "1 Karte fällig" : `${stats.due} Karten fällig`} · {stats.newToday} neue verfügbar
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[12.5px] font-bold" style={{ color: "var(--privat-text)" }}>
                <Flame size={14} strokeWidth={2.2} aria-hidden="true" />
                {stats.streak === 1 ? "1 Tag" : `${stats.streak} Tage`}
              </span>
            </div>
            <div className="flex gap-2">
              {todo > 0 && (
                <Link
                  href={href()}
                  className="tap flex-1 h-11 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[14px] font-bold"
                  style={{ background: "var(--ink)", color: "white" }}
                >
                  <Play size={15} strokeWidth={2.4} aria-hidden="true" /> Wiederholen
                </Link>
              )}
              {stats.fresh > stats.newToday && (
                <Link
                  href={href(EXTRA)}
                  className="tap flex-1 h-11 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[14px] font-bold"
                  style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
                >
                  <Plus size={15} strokeWidth={2.4} aria-hidden="true" /> {EXTRA} neue
                </Link>
              )}
            </div>
          </Card>
        )}

        {data && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1 pt-1">
              <h2 className="serif-i text-[20px]">Lektionen</h2>
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
                <Link key={d.id} href={href(undefined, d.id)} className="block">
                  <Card className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-semibold truncate" lang="vi">
                        {d.title}
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full" style={{ background: "var(--cream-deep)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "var(--sage)" }} />
                      </div>
                      <div className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>
                        {d.cards} Karten · {pct}% gelernt
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
      {data && (
        <SettingsSheet
          open={settingsOpen}
          initial={data.settings}
          onClose={() => setSettingsOpen(false)}
          onSaved={reload}
        />
      )}
    </>
  );
}

function Stepper({ value, onChange, step, min, max, unit }: { value: number; onChange: (v: number) => void; step: number; min: number; max: number; unit: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="tap w-11 h-11 rounded-full inline-flex items-center justify-center"
        style={{ background: "var(--cream-deep)" }}
        aria-label={`Weniger ${unit}`}
      >
        <Minus size={16} strokeWidth={2.2} />
      </button>
      <span className="serif text-[26px] w-14 text-center tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="tap w-11 h-11 rounded-full inline-flex items-center justify-center"
        style={{ background: "var(--cream-deep)" }}
        aria-label={`Mehr ${unit}`}
      >
        <Plus size={16} strokeWidth={2.2} />
      </button>
      <span className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
        {unit}
      </span>
    </div>
  );
}

function SettingsSheet({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: StudySettings;
  onClose: () => void;
  onSaved: () => void;
}) {
  if (!open) return null;
  return <SettingsForm initial={initial} onClose={onClose} onSaved={onSaved} />;
}

function SettingsForm({ initial, onClose, onSaved }: { initial: StudySettings; onClose: () => void; onSaved: () => void }) {
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [deviceOn, setDeviceOn] = useState<boolean | null>(null);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    currentSubscription().then((sub) => alive && setDeviceOn(sub !== null));
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    setBusy(true);
    await fetch("/api/v1/study/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(s),
    });
    setBusy(false);
    onSaved();
    onClose();
  };

  const toggleDevice = async () => {
    setPushMsg(null);
    if (deviceOn) {
      await disablePush();
      setDeviceOn(false);
      return;
    }
    const r = await enablePush();
    if (r.ok) {
      setDeviceOn(true);
      setS((x) => ({ ...x, reminderEnabled: true }));
    } else {
      setPushMsg(r.error);
    }
  };

  const test = async () => {
    const res = await fetch("/api/v1/push/test", { method: "POST" });
    const r = (await res.json().catch(() => ({}))) as { sent?: number };
    setPushMsg(r.sent ? "Test gesendet." : "Kein Gerät hat die Nachricht angenommen.");
  };

  return (
    <Sheet open onClose={onClose} title="Lernen einstellen">
      <div className="mt-3 space-y-5">
        <div>
          <Label>Neue Karten pro Tag</Label>
          <Stepper value={s.newPerDay} onChange={(v) => setS({ ...s, newPerDay: v })} step={5} min={0} max={100} unit="neue" />
          <p className="text-[12px] mt-1.5" style={{ color: "var(--muted)" }}>
            Gilt für „Wiederholen“. Das Kapitel des Tages geht immer ganz durch.
          </p>
        </div>

        <div>
          <Label>Erinnerung</Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={s.reminderEnabled}
              onClick={() => setS({ ...s, reminderEnabled: !s.reminderEnabled })}
              className="tap h-11 px-4 rounded-full text-[13.5px] font-bold"
              style={s.reminderEnabled ? { background: "var(--ink)", color: "white" } : { background: "var(--cream-deep)", color: "var(--ink)" }}
            >
              {s.reminderEnabled ? "An" : "Aus"}
            </button>
            <label className="flex items-center gap-2 text-[13.5px]">
              um
              <input
                type="time"
                value={s.reminderTime}
                onChange={(e) => setS({ ...s, reminderTime: e.target.value })}
                className="h-11 rounded-xl px-3 text-[15px]"
                style={{ background: "var(--cream-deep)" }}
              />
            </label>
          </div>
          <p className="text-[12px] mt-1.5" style={{ color: "var(--muted)" }}>
            Einmal pro Tag, nur wenn das Kapitel des Tages noch offen ist.
          </p>
        </div>

        <div className="rounded-2xl p-3" style={{ background: "var(--paper-2)" }}>
          <div className="text-[13.5px] font-semibold">Benachrichtigungen auf diesem Gerät</div>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--muted)" }}>
            {pushSupported()
              ? "Auf dem iPhone nur aus der App auf dem Home-Bildschirm."
              : "Hier nicht möglich. Auf dem iPhone: in Safari Teilen → Zum Home-Bildschirm, dann dort öffnen."}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={toggleDevice}
              disabled={deviceOn === null}
              className="tap h-11 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5"
              style={{ background: "var(--ink)", color: "white" }}
            >
              {deviceOn ? <BellOff size={15} aria-hidden="true" /> : <Bell size={15} aria-hidden="true" />}
              {deviceOn ? "Ausschalten" : "Einschalten"}
            </button>
            {deviceOn && (
              <button
                type="button"
                onClick={test}
                className="tap h-11 px-4 rounded-xl text-[13.5px] font-semibold"
                style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
              >
                Testen
              </button>
            )}
          </div>
          {pushMsg && (
            <p className="text-[12.5px] mt-2 font-semibold" style={{ color: "var(--ink-soft)" }}>
              {pushMsg}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: "var(--terra)" }}
      >
        {busy ? "…" : "Speichern"}
      </button>
    </Sheet>
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
      decks?: Array<{ created: number; updated: number; skipped: number }>;
      error?: string;
      details?: Array<{ path: (string | number)[]; message: string }>;
    };
    if (!res.ok || !r.decks) {
      const first = r.details?.[0];
      setMsg({ ok: false, text: first ? `${first.path.join(".")}: ${first.message}` : (r.error ?? "Fehler") });
      return;
    }
    const sum = r.decks.reduce((a, d) => ({ c: a.c + d.created, u: a.u + d.updated }), { c: 0, u: 0 });
    setMsg({ ok: true, text: `${r.decks.length} ${r.decks.length === 1 ? "Lektion" : "Lektionen"}: ${sum.c} neue, ${sum.u} aktualisierte Karten.` });
    setJson("");
    onDone();
  };

  return (
    <Sheet open onClose={onClose} title="Importieren">
      <p className="text-[13px] mt-2" style={{ color: "var(--ink-soft)" }}>
        Kursexport (<code>kurs</code>, <code>karten</code>) oder ein Deck (<code>deck</code>, <code>cards</code>). Bestehende
        Lektionen werden ergänzt, dein Lernstand bleibt.
      </p>
      <label className="block mt-3">
        <span className="sr-only">JSON</span>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={10}
          placeholder='{ "kurs": "...", "karten": [ ... ] }'
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
