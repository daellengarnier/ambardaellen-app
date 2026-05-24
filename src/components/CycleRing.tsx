"use client";

import type { Cycle } from "@/lib/types";
import { PHASE_COLOR_MAP, type CycleAnalysis, type Phase } from "@/lib/cycle";

type Props = {
  cycle: Cycle;
  analysis: CycleAnalysis;
  size?: number;
  /** Wenn gesetzt: Phase-Bögen sind klickbar. */
  onPhaseClick?: (phase: Phase) => void;
  /** Wenn gesetzt: highlightet diese Phase mit voller Deckkraft. */
  highlightedPhase?: Phase | null;
};

export function CycleRing({
  cycle,
  analysis,
  size = 200,
  onPhaseClick,
  highlightedPhase,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(size * 0.39);
  const sw = Math.round(size * 0.07);
  const len = cycle.avgCycle;
  const ovD = len - 14;

  const arcPath = (from: number, to: number) => {
    const f = Math.max(0, from - 1);
    const t = Math.min(len, to);
    if (t <= f) return "";
    const a0 = (f / len) * Math.PI * 2 - Math.PI / 2;
    const a1 = (t / len) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };

  const phases: Array<{ phase: Phase; from: number; to: number; color: string }> = [
    { phase: "menstruation", from: 1, to: cycle.avgPeriod, color: PHASE_COLOR_MAP.menstruation },
    { phase: "follikel", from: cycle.avgPeriod + 1, to: ovD - 3 - 1, color: PHASE_COLOR_MAP.follikel },
    { phase: "fertil", from: ovD - 3, to: ovD + 1, color: PHASE_COLOR_MAP.fertil },
    { phase: "luteal", from: ovD + 2, to: len, color: PHASE_COLOR_MAP.luteal },
  ];

  const dayClamped = (((analysis.day - 0.5) % len) + len) % len;
  const at = (dayClamped / len) * Math.PI * 2 - Math.PI / 2;
  const mx = cx + r * Math.cos(at);
  const my = cy + r * Math.sin(at);

  const ot = ((ovD - 0.5) / len) * Math.PI * 2 - Math.PI / 2;
  const ox = cx + r * Math.cos(ot);
  const oy = cy + r * Math.sin(ot);

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--cream-deep)" strokeWidth={sw} />
        {phases.map((p) => {
          const dimmed = highlightedPhase != null && highlightedPhase !== p.phase;
          return (
            <path
              key={p.phase}
              d={arcPath(p.from, p.to)}
              fill="none"
              stroke={p.color}
              strokeWidth={sw}
              opacity={dimmed ? 0.3 : highlightedPhase === p.phase ? 1 : 0.85}
              strokeLinecap="butt"
              style={onPhaseClick ? { cursor: "pointer" } : undefined}
              onClick={onPhaseClick ? () => onPhaseClick(p.phase) : undefined}
            />
          );
        })}
        <circle
          cx={ox}
          cy={oy}
          r={3.5}
          fill={PHASE_COLOR_MAP.fertil}
          stroke="var(--paper)"
          strokeWidth="1.5"
        />
        <circle
          cx={mx}
          cy={my}
          r={Math.round(size * 0.05)}
          fill="var(--paper)"
          stroke={analysis.color}
          strokeWidth="3"
        />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill="#211913"
          fontSize={Math.round(size * 0.28)}
          fontWeight="400"
          fontStyle="italic"
          fontFamily="var(--font-instrument-serif), Georgia, serif"
        >
          {analysis.day}
        </text>
        <text
          x={cx}
          y={cy + Math.round(size * 0.11)}
          textAnchor="middle"
          fill="#978675"
          fontSize={Math.round(size * 0.048)}
          letterSpacing="3"
          fontWeight="600"
        >
          TAG · {len}
        </text>
      </svg>
    </div>
  );
}
