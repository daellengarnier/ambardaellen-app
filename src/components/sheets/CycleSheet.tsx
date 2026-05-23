"use client";

import { Lock } from "lucide-react";
import { Sheet } from "../Sheet";
import { Card } from "../Card";
import { CycleRing } from "../CycleRing";
import { CycleCalendar } from "../CycleCalendar";
import { useStore } from "@/lib/store";
import {
  FLOW,
  MOODS,
  PHASE_HINTS,
  SYMPTOMS,
  cycleAnalysis,
  PHASE_COLOR_MAP,
} from "@/lib/cycle";
import { shortDate, todayISO } from "@/lib/date";
import { USERS } from "@/lib/types";
import type { CycleDayEntry, FlowLevel, Mood, Symptom } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CycleSheet({ open, onClose }: Props) {
  const cycle = useStore((s) => s.cycle);
  const updateCycle = useStore((s) => s.updateCycle);
  const currentUser = useStore((s) => s.currentUser);

  if (!open) return null;

  const analysis = cycleAnalysis(cycle);
  if (!analysis) return null;

  const canEdit = currentUser === cycle.owner;
  const today = todayISO();
  const todayEntry: CycleDayEntry = cycle.entries[today] || {};

  const updateEntry = (patch: Partial<CycleDayEntry>) => {
    if (!canEdit) return;
    updateCycle({
      entries: { ...cycle.entries, [today]: { ...todayEntry, ...patch } },
    });
  };

  const toggleSymptom = (s: Symptom) => {
    if (!canEdit) return;
    const cur = todayEntry.symptoms || [];
    const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
    updateEntry({ symptoms: next });
  };

  const markPeriodToday = () => {
    if (!canEdit) return;
    if (cycle.periodStarts.includes(today)) return;
    updateCycle({
      periodStarts: [...cycle.periodStarts, today].sort(),
      entries: {
        ...cycle.entries,
        [today]: { ...todayEntry, flow: (todayEntry.flow ?? 2) as FlowLevel },
      },
    });
  };

  const setAvgCycle = (n: number) => {
    if (!canEdit) return;
    updateCycle({ avgCycle: Math.max(20, Math.min(45, n)) });
  };
  const setAvgPeriod = (n: number) => {
    if (!canEdit) return;
    updateCycle({ avgPeriod: Math.max(2, Math.min(10, n)) });
  };

  return (
    <Sheet open onClose={onClose} title={`Zyklus · ${USERS[cycle.owner].name}`}>
      {!canEdit && (
        <div
          className="rounded-2xl p-2.5 mb-3 text-[12.5px] inline-flex items-center gap-2"
          style={{ background: "rgba(228,217,191,0.7)", color: "var(--ink-soft)" }}
        >
          <Lock size={13} strokeWidth={2} /> Nur {USERS[cycle.owner].name} kann bearbeiten — du siehst Phase und Stimmung
        </div>
      )}

      <CycleRing cycle={cycle} analysis={analysis} />

      <div className="text-center mt-1 mb-2">
        <div className="serif-i text-[26px] leading-tight" style={{ color: analysis.color }}>
          {analysis.phaseLabel}
        </div>
        <div className="text-[12.5px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
          {analysis.daysUntilOvulation > 0
            ? `Eisprung in ${analysis.daysUntilOvulation} T.`
            : analysis.daysUntilOvulation === 0
              ? "Eisprung heute"
              : `${-analysis.daysUntilOvulation} T. nach Eisprung`}
          {" · "}
          {analysis.daysUntilPeriod > 0
            ? `Periode in ${analysis.daysUntilPeriod} T.`
            : analysis.daysUntilPeriod === 0
              ? "Periode heute"
              : `${-analysis.daysUntilPeriod} T. überfällig`}
        </div>
      </div>

      <div className="rounded-2xl p-3 mt-1" style={{ background: "rgba(228,217,191,0.5)" }}>
        <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {PHASE_HINTS[analysis.phase]}
        </div>
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={markPeriodToday}
          disabled={cycle.periodStarts.includes(today)}
          className="w-full mt-3 py-2.5 rounded-2xl text-[13.5px] font-semibold tap"
          style={
            cycle.periodStarts.includes(today)
              ? { background: "var(--cream-deep)", color: "var(--muted)" }
              : { background: "#A8484E", color: "white" }
          }
        >
          {cycle.periodStarts.includes(today)
            ? "Periode heute eingetragen ✓"
            : "Periode hat heute begonnen"}
        </button>
      )}

      {canEdit && (
        <div className="mt-3 rounded-2xl p-3" style={{ background: "rgba(228,217,191,0.5)" }}>
          <div className="uplabel text-[10.5px] mb-2" style={{ color: "var(--muted)" }}>
            Heute eintragen
          </div>

          <div className="mb-3">
            <div className="text-[11px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Blutung
            </div>
            <div className="flex gap-1">
              {FLOW.map((f) => {
                const active = todayEntry.flow === f.v;
                return (
                  <button
                    key={f.v}
                    type="button"
                    onClick={() => updateEntry({ flow: f.v })}
                    className="flex-1 py-1.5 rounded-xl text-[12px] font-medium tap"
                    style={
                      active
                        ? { background: PHASE_COLOR_MAP.menstruation, color: "white" }
                        : { background: "var(--paper)", color: "var(--ink-soft)" }
                    }
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[11px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Stimmung
            </div>
            <div className="flex gap-1 flex-wrap">
              {MOODS.map((m) => {
                const active = todayEntry.mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateEntry({ mood: m.id as Mood })}
                    className="px-2.5 py-1 rounded-full text-[11.5px] font-medium tap inline-flex items-center gap-1"
                    style={
                      active
                        ? { background: "var(--ink)", color: "var(--paper)" }
                        : { background: "var(--paper)", color: "var(--ink-soft)" }
                    }
                  >
                    <span>{m.emoji}</span> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[11px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Energie
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (todayEntry.energy ?? 0) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateEntry({ energy: n as 1 | 2 | 3 | 4 | 5 })}
                    className="flex-1 py-1.5 rounded-xl text-[12px] font-medium tap"
                    style={
                      active
                        ? { background: "var(--sage)", color: "white" }
                        : { background: "var(--paper)", color: "var(--ink-soft)" }
                    }
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-2">
            <div className="text-[11px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Symptome
            </div>
            <div className="flex gap-1 flex-wrap">
              {SYMPTOMS.map((s) => {
                const on = (todayEntry.symptoms || []).includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className="px-2.5 py-1 rounded-full text-[11.5px] font-medium tap"
                    style={
                      on
                        ? { background: "var(--terra)", color: "white" }
                        : { background: "var(--paper)", color: "var(--ink-soft)" }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Notiz
            </div>
            <textarea
              value={todayEntry.note || ""}
              onChange={(e) => updateEntry({ note: e.target.value })}
              rows={2}
              placeholder="Wie geht's dir heute?"
              className="w-full rounded-xl p-2.5 text-[13px] resize-none"
              style={{ background: "var(--paper)" }}
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        <CycleCalendar cycle={cycle} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Card className="p-2.5">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            Ø Zyklus
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {canEdit && (
              <button
                type="button"
                onClick={() => setAvgCycle(cycle.avgCycle - 1)}
                className="w-6 h-6 rounded-full text-[14px] tap"
                style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
                aria-label="−"
              >
                −
              </button>
            )}
            <div className="text-[15px] font-semibold">{cycle.avgCycle} T.</div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setAvgCycle(cycle.avgCycle + 1)}
                className="w-6 h-6 rounded-full text-[14px] tap"
                style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
                aria-label="+"
              >
                +
              </button>
            )}
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            Ø Periode
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {canEdit && (
              <button
                type="button"
                onClick={() => setAvgPeriod(cycle.avgPeriod - 1)}
                className="w-6 h-6 rounded-full text-[14px] tap"
                style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
              >
                −
              </button>
            )}
            <div className="text-[15px] font-semibold">{cycle.avgPeriod} T.</div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setAvgPeriod(cycle.avgPeriod + 1)}
                className="w-6 h-6 rounded-full text-[14px] tap"
                style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
              >
                +
              </button>
            )}
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            Nächste Periode
          </div>
          <div className="text-[14px] font-medium mt-0.5">{shortDate(analysis.nextPeriod)}</div>
        </Card>
        <Card className="p-2.5">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            Eisprung
          </div>
          <div className="text-[14px] font-medium mt-0.5">{shortDate(analysis.ovulationDate)}</div>
        </Card>
      </div>

      <div className="text-[11px] mt-3 text-center" style={{ color: "var(--muted)" }}>
        Vorhersage basiert auf {cycle.periodStarts.length} aufgezeichneten Zyklen.
      </div>
    </Sheet>
  );
}
