"use client";

import { ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { cycleAnalysis } from "@/lib/cycle";
import { USERS } from "@/lib/types";

/**
 * Kompakte 1-Zeile-Anzeige des Zyklus — gedacht für den Partner (Dällen),
 * der den Zyklus nicht ownt, aber Phase + Tag + nächstes Event sehen will.
 */
export function CycleStrip({ onClick }: { onClick?: () => void }) {
  const cycle = useStore((s) => s.cycle);
  const analysis = cycleAnalysis(cycle);
  if (!analysis) return null;

  const nextEvent =
    analysis.daysUntilPeriod >= 0 && analysis.daysUntilPeriod <= analysis.daysUntilOvulation
      ? analysis.daysUntilPeriod === 0
        ? "Periode heute"
        : `Periode in ${analysis.daysUntilPeriod}T`
      : analysis.daysUntilOvulation === 0
        ? "Eisprung heute"
        : analysis.daysUntilOvulation > 0
          ? `Eisprung in ${analysis.daysUntilOvulation}T`
          : `${-analysis.daysUntilPeriod}T überfällig`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap w-full flex items-center gap-2.5 rounded-2xl px-3 py-2"
      style={{
        background: "var(--paper)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(33,25,19,0.04), 0 6px 16px -10px rgba(75,48,80,0.16)",
      }}
    >
      <span
        className="shrink-0 rounded-full"
        style={{
          width: 10,
          height: 10,
          background: analysis.color,
          boxShadow: `0 0 0 3px ${analysis.color}22`,
        }}
        aria-hidden="true"
      />
      <span className="text-[12px] flex-1 min-w-0 text-left" style={{ color: "var(--ink-soft)" }}>
        <span className="font-medium" style={{ color: "var(--ink)" }}>
          {USERS[cycle.owner].name}
        </span>{" "}
        · <span style={{ color: analysis.color }}>{analysis.phaseLabel}</span> · Tag{" "}
        {analysis.day} · <span style={{ color: "var(--ink)" }}>{nextEvent}</span>
      </span>
      <ChevronRight size={14} strokeWidth={1.75} color="var(--muted)" />
    </button>
  );
}
