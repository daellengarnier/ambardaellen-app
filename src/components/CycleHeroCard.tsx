"use client";

import { useEffect, useState } from "react";
import { Lock, ChevronRight } from "lucide-react";
import { CycleRing } from "./CycleRing";
import { useStore } from "@/lib/store";
import { PHASE_HINTS, PHASE_TEXT_COLOR_MAP, cycleAnalysis, type Phase } from "@/lib/cycle";
import { USERS } from "@/lib/types";

const PHASE_LABEL: Record<Phase, string> = {
  menstruation: "Menstruation",
  follikel: "Folliklephase",
  fertil: "Fruchtbares Fenster",
  ovulation: "Eisprung",
  luteal: "Lutealphase",
  ueberfaellig: "Überfällig",
};

export function CycleHeroCard({ onOpenSheet }: { onOpenSheet: () => void }) {
  const cycle = useStore((s) => s.cycle);
  const currentUser = useStore((s) => s.currentUser);
  const analysis = cycleAnalysis(cycle);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  // Tap-Auswahl nach 4 Sekunden zurücksetzen, damit der Default (heutige Phase) wieder erscheint.
  useEffect(() => {
    if (!selectedPhase) return;
    const t = setTimeout(() => setSelectedPhase(null), 4500);
    return () => clearTimeout(t);
  }, [selectedPhase]);

  const canEdit = currentUser === cycle.owner;

  if (!analysis) {
    return (
      <button
        type="button"
        onClick={onOpenSheet}
        className="tap w-full px-4 py-5 text-center block"
      >
        <div
          className="uplabel text-[10px] inline-flex items-center justify-center gap-1 mb-2"
          style={{ color: "var(--muted)" }}
        >
          Zyklus · {USERS[cycle.owner].name}
          {!canEdit && <Lock size={9} strokeWidth={2} />}
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {canEdit
            ? "Noch keine Zyklus-Daten. Tippe hier um den ersten Periode-Start einzutragen."
            : `${USERS[cycle.owner].name} hat noch keine Zyklus-Daten eingetragen.`}
        </p>
      </button>
    );
  }

  // Wenn der User einen Bogen angetippt hat, zeigen wir diese Phase. Sonst die heutige.
  const displayPhase: Phase = selectedPhase ?? analysis.phase;
  const displayColor = PHASE_TEXT_COLOR_MAP[displayPhase];
  const displayLabel = PHASE_LABEL[displayPhase];

  return (
    <div className="px-1 pt-1 pb-2 flex flex-col items-center relative">
      <div className="w-full flex items-center justify-between mb-1">
        <div
          className="uplabel text-[10px] inline-flex items-center gap-1"
          style={{ color: "var(--muted)" }}
        >
          Zyklus · {USERS[cycle.owner].name}
          {!canEdit && <Lock size={9} strokeWidth={2} />}
        </div>
        <button
          type="button"
          onClick={onOpenSheet}
          className="tap inline-flex items-center"
          style={{ color: "var(--muted)" }}
          aria-label="Zyklus-Details öffnen"
        >
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>

      <CycleRing
        cycle={cycle}
        analysis={analysis}
        size={156}
        highlightedPhase={selectedPhase}
        onPhaseClick={(p) => setSelectedPhase((cur) => (cur === p ? null : p))}
      />

      <div
        className="serif text-[22px] leading-tight mt-1 text-center"
        style={{ color: displayColor }}
      >
        {displayLabel}
      </div>

      {selectedPhase ? (
        <div
          className="text-[11.5px] mt-1 text-center px-2 leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {PHASE_HINTS[selectedPhase]}
        </div>
      ) : (
        <div
          className="text-[12px] mt-1 text-center"
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
      )}
    </div>
  );
}
