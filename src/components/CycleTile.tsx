"use client";

import { Card } from "./Card";
import { Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { cycleAnalysis } from "@/lib/cycle";

export function CycleTile({ onClick }: { onClick?: () => void }) {
  const cycle = useStore((s) => s.cycle);
  const currentUser = useStore((s) => s.currentUser);
  const analysis = cycleAnalysis(cycle);
  if (!analysis) return null;
  const canEdit = cycle.owner === currentUser;

  const progressPct = Math.min(100, Math.round((analysis.day / analysis.cycLen) * 100));

  const nextEventLabel =
    analysis.daysUntilPeriod <= analysis.daysUntilOvulation && analysis.daysUntilPeriod >= 0
      ? `${analysis.daysUntilPeriod} ${analysis.daysUntilPeriod === 1 ? "Tag" : "Tage"} bis Periode`
      : analysis.daysUntilOvulation >= 0
        ? `${analysis.daysUntilOvulation} ${analysis.daysUntilOvulation === 1 ? "Tag" : "Tage"} bis Eisprung`
        : `Tag ${analysis.day} von ${analysis.cycLen}`;

  return (
    <div className="px-4 mb-2">
      <Card
        onClick={canEdit ? onClick : undefined}
        className="p-3.5 relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="uplabel text-[10px] text-[var(--muted)] mb-1.5 flex items-center gap-1.5">
              <span>Zyklus · Ambar</span>
              {!canEdit && <Lock size={10} strokeWidth={2} color="var(--muted)" />}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="serif text-[22px] leading-none" style={{ color: analysis.color }}>
                {analysis.phaseLabel}
              </span>
            </div>
            <div className="text-[12.5px] text-[var(--ink-soft)] mt-1.5 mono">
              Tag {analysis.day} von {analysis.cycLen} · {nextEventLabel}
            </div>
          </div>

          <div
            className="rounded-full"
            style={{
              width: 44,
              height: 44,
              background: `conic-gradient(${analysis.color} ${progressPct * 3.6}deg, var(--cream-deep) 0)`,
              boxShadow: "inset 0 0 0 6px var(--paper)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cream-deep)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progressPct}%`, background: analysis.color }}
          />
        </div>
      </Card>
    </div>
  );
}
