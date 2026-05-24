"use client";

import { Lock } from "lucide-react";
import { Card } from "./Card";
import { CycleRing } from "./CycleRing";
import { useStore } from "@/lib/store";
import { cycleAnalysis } from "@/lib/cycle";
import { USERS } from "@/lib/types";

export function CycleHeroCard({ onClick }: { onClick?: () => void }) {
  const cycle = useStore((s) => s.cycle);
  const currentUser = useStore((s) => s.currentUser);
  const analysis = cycleAnalysis(cycle);
  if (!analysis) return null;
  const canEdit = currentUser === cycle.owner;

  return (
    <Card
      onClick={onClick}
      className="px-4 pt-5 pb-4 flex flex-col items-center relative overflow-hidden"
    >
      <div
        className="absolute top-3 left-4 uplabel text-[10px] inline-flex items-center gap-1"
        style={{ color: "var(--muted)" }}
      >
        Zyklus · {USERS[cycle.owner].name}
        {!canEdit && <Lock size={9} strokeWidth={2} />}
      </div>

      <CycleRing cycle={cycle} analysis={analysis} />

      <div
        className="serif-i text-[24px] leading-tight mt-1 text-center"
        style={{ color: analysis.color }}
      >
        {analysis.phaseLabel}
      </div>

      <div
        className="text-[12.5px] mt-1 text-center"
        style={{ color: "var(--ink-soft)" }}
      >
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
    </Card>
  );
}
