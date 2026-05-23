import type { Cycle, ISODate } from "./types";
import { addDays, diffDays, todayISO } from "./date";

export type Phase = "menstruation" | "follikel" | "fertil" | "ovulation" | "luteal" | "ueberfaellig";

export type CycleAnalysis = {
  day: number;
  cycLen: number;
  lastStart: ISODate;
  nextPeriod: ISODate;
  ovulationDate: ISODate;
  ovulationDayInCycle: number;
  fertileStart: number;
  fertileEnd: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  phase: Phase;
  phaseLabel: string;
  color: string;
  isFertile: boolean;
  isOvulation: boolean;
  isPeriod: boolean;
};

const PHASE_COLORS: Record<Phase, string> = {
  menstruation: "#A8484E",
  follikel: "#D4A86A",
  fertil: "#E07A5F",
  ovulation: "#E07A5F",
  luteal: "#8DA888",
  ueberfaellig: "#A8484E",
};

const PHASE_LABELS: Record<Phase, string> = {
  menstruation: "Menstruation",
  follikel: "Folliklephase",
  fertil: "Fruchtbares Fenster",
  ovulation: "Eisprung",
  luteal: "Lutealphase",
  ueberfaellig: "Überfällig",
};

export function cycleAnalysis(cycle: Cycle, today: ISODate = todayISO()): CycleAnalysis | null {
  if (cycle.periodStarts.length === 0) return null;
  const lastStart = [...cycle.periodStarts].sort().slice(-1)[0];
  const cycLen = cycle.avgCycle;
  const day = diffDays(today, lastStart) + 1;
  const ovulationDayInCycle = cycLen - 14;
  const fertileStart = ovulationDayInCycle - 3;
  const fertileEnd = ovulationDayInCycle + 1;
  const ovulationDate = addDays(lastStart, ovulationDayInCycle - 1);
  const nextPeriod = addDays(lastStart, cycLen);
  const daysUntilPeriod = diffDays(nextPeriod, today);
  const daysUntilOvulation = diffDays(ovulationDate, today);

  let phase: Phase;
  if (day <= cycle.avgPeriod) phase = "menstruation";
  else if (day === ovulationDayInCycle) phase = "ovulation";
  else if (day >= fertileStart && day <= fertileEnd) phase = "fertil";
  else if (day < ovulationDayInCycle) phase = "follikel";
  else if (day > cycLen) phase = "ueberfaellig";
  else phase = "luteal";

  const isFertile = phase === "fertil" || phase === "ovulation";
  const isOvulation = phase === "ovulation";
  const isPeriod = phase === "menstruation";
  const phaseLabel =
    phase === "ueberfaellig"
      ? `Überfällig (${day - cycLen} T.)`
      : PHASE_LABELS[phase];

  return {
    day,
    cycLen,
    lastStart,
    nextPeriod,
    ovulationDate,
    ovulationDayInCycle,
    fertileStart,
    fertileEnd,
    daysUntilPeriod,
    daysUntilOvulation,
    phase,
    phaseLabel,
    color: PHASE_COLORS[phase],
    isFertile,
    isOvulation,
    isPeriod,
  };
}
