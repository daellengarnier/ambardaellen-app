"use client";

import { Lock } from "lucide-react";
import { Card } from "./Card";
import { useStore } from "@/lib/store";
import { cycleAnalysis, PHASE_COLOR_MAP } from "@/lib/cycle";
import { USERS } from "@/lib/types";

export function CycleTile({ onClick }: { onClick?: () => void }) {
  const cycle = useStore((s) => s.cycle);
  const currentUser = useStore((s) => s.currentUser);
  const analysis = cycleAnalysis(cycle);
  if (!analysis) return null;
  const canEdit = cycle.owner === currentUser;

  const ovD = cycle.avgCycle - 14;
  const phases = [
    { from: 1, to: cycle.avgPeriod, color: PHASE_COLOR_MAP.menstruation },
    { from: cycle.avgPeriod, to: ovD - 3, color: PHASE_COLOR_MAP.follikel },
    { from: ovD - 3, to: ovD + 1, color: PHASE_COLOR_MAP.fertil },
    { from: ovD + 1, to: cycle.avgCycle, color: PHASE_COLOR_MAP.luteal },
  ];

  return (
    <Card onClick={onClick} className="p-3.5 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="shrink-0 flex flex-col items-center justify-center w-14 pt-1">
          <div
            className="text-[40px] leading-none font-semibold tracking-tight mono"
            style={{ color: analysis.color }}
          >
            {analysis.day}
          </div>
          <div className="uplabel text-[9px] mt-1" style={{ color: "var(--muted)" }}>
            Tag
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="uplabel text-[10px] flex items-center gap-1.5 mb-1"
            style={{ color: "var(--muted)" }}
          >
            Zyklus · {USERS[cycle.owner].name}
            {!canEdit && <Lock size={9} strokeWidth={2} />}
          </div>
          <div className="text-[16px] font-semibold leading-tight" style={{ color: analysis.color }}>
            {analysis.phaseLabel}
          </div>
          <div
            className="mt-2 relative h-2 rounded-full overflow-hidden"
            style={{ background: "var(--cream-deep)" }}
          >
            {phases.map((p, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${((p.from - 1) / cycle.avgCycle) * 100}%`,
                  width: `${((p.to - (p.from - 1)) / cycle.avgCycle) * 100}%`,
                  background: p.color,
                  opacity: 0.6,
                }}
              />
            ))}
            <div
              className="absolute"
              style={{
                top: -2,
                bottom: -2,
                left: `${((Math.min(analysis.day, cycle.avgCycle) - 0.5) / cycle.avgCycle) * 100}%`,
                width: 2.5,
                background: "var(--ink)",
                boxShadow: "0 0 0 2px var(--paper)",
                borderRadius: 2,
              }}
            />
          </div>
          <div
            className="flex items-center justify-between mt-1.5 text-[11px] gap-2"
            style={{ color: "var(--ink-soft)" }}
          >
            <span className="whitespace-nowrap">
              {analysis.daysUntilOvulation > 0
                ? `Eisprung in ${analysis.daysUntilOvulation} T.`
                : analysis.daysUntilOvulation === 0
                  ? "Eisprung heute"
                  : `Eisprung vor ${-analysis.daysUntilOvulation} T.`}
            </span>
            <span className="whitespace-nowrap">
              {analysis.daysUntilPeriod > 0
                ? `Periode in ${analysis.daysUntilPeriod} T.`
                : analysis.daysUntilPeriod === 0
                  ? "Periode heute"
                  : `${-analysis.daysUntilPeriod} T. überfällig`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
