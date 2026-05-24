import type { Cycle, ISODate } from "./types";
import { addDays, diffDays, todayISO } from "./date";

export type Phase = "menstruation" | "follikel" | "fertil" | "ovulation" | "luteal" | "ueberfaellig";

export const MOODS: Array<{ id: string; label: string; emoji: string }> = [
  { id: "weich", label: "weich", emoji: "🌧" },
  { id: "okay", label: "okay", emoji: "·" },
  { id: "klar", label: "klar", emoji: "☁︎" },
  { id: "fokussiert", label: "fokussiert", emoji: "◐" },
  { id: "energisch", label: "energisch", emoji: "✦" },
  { id: "dunkel", label: "dunkel", emoji: "▢" },
  { id: "aufgewühlt", label: "aufgewühlt", emoji: "≋" },
];

export const SYMPTOMS = [
  "krämpfe",
  "müde",
  "kopfweh",
  "blähbauch",
  "brustempfindlich",
  "libido",
  "akne",
  "schlaflos",
  "rückenschmerz",
  "weinerlich",
] as const;

export const FLOW: Array<{ v: 0 | 1 | 2 | 3; label: string }> = [
  { v: 0, label: "—" },
  { v: 1, label: "leicht" },
  { v: 2, label: "mittel" },
  { v: 3, label: "stark" },
];

export const PHASE_HINTS: Record<Phase, string> = {
  menstruation: "Ruhe, Wärme, weniger Reize. Wenig Plan, viel Spielraum.",
  follikel: "Energie steigt. Gut für neue Projekte und längere Spaziergänge.",
  fertil: "Sozial, kreativ, klar im Kopf. Termine ruhig vollpacken.",
  ovulation: "Sozial, kreativ, klar im Kopf. Termine ruhig vollpacken.",
  luteal: "Innere Phase. Routinen helfen. Auf Schlaf achten.",
  ueberfaellig: "Periode ist überfällig. Wenn unsicher, Termin checken.",
};

export function phaseForDay(cycle: { avgCycle: number; avgPeriod: number }, dayInCycle: number): Phase {
  if (dayInCycle <= cycle.avgPeriod) return "menstruation";
  const ov = cycle.avgCycle - 14;
  if (dayInCycle < ov - 3) return "follikel";
  if (dayInCycle === ov) return "ovulation";
  if (dayInCycle <= ov + 1) return "fertil";
  if (dayInCycle <= cycle.avgCycle) return "luteal";
  return "ueberfaellig";
}

export const PHASE_COLOR_MAP: Record<Phase, string> = {
  menstruation: "#A8484E",
  follikel: "#D4A86A",
  fertil: "#E07A5F",
  ovulation: "#E07A5F",
  luteal: "#8DA888",
  ueberfaellig: "#A8484E",
};

/**
 * Dunklere Varianten der Phasenfarben für Text auf hellem Hintergrund.
 * Die hellen PHASE_COLOR_MAP-Töne (Folliklephase-Gold, Luteal-Grün)
 * haben auf Cream zu wenig Kontrast, wenn sie als Textfarbe verwendet
 * werden. Diese Map bringt jeden Ton auf ein lesbares Niveau und
 * behält die Farbkodierung.
 */
export const PHASE_TEXT_COLOR_MAP: Record<Phase, string> = {
  menstruation: "#8E3A3F",
  follikel: "#8C6730",
  fertil: "#A04B30",
  ovulation: "#A04B30",
  luteal: "#4E6A48",
  ueberfaellig: "#8E3A3F",
};

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
