import type { ISODate, Priority } from "./types";
import { diffDays, todayISO } from "./date";

export type DueBucket = "ueber" | "heute" | "morgen" | "woche" | "spaeter" | "kein";

export const BUCKET_LABEL: Record<DueBucket, string> = {
  ueber: "Überfällig",
  heute: "Heute",
  morgen: "Morgen",
  woche: "Diese Woche",
  spaeter: "Später",
  kein: "Ohne Datum",
};

export const BUCKET_ORDER: DueBucket[] = ["ueber", "heute", "morgen", "woche", "spaeter", "kein"];

export function dueBucket(due: ISODate | ""): DueBucket {
  if (!due) return "kein";
  const d = diffDays(due, todayISO());
  if (d < 0) return "ueber";
  if (d === 0) return "heute";
  if (d === 1) return "morgen";
  if (d <= 7) return "woche";
  return "spaeter";
}

export const PRIO: Record<Priority, { label: string; color: string; dot: boolean; rank: number }> = {
  hoch: { label: "Hoch", color: "#C5634B", dot: true, rank: 0 },
  normal: { label: "Normal", color: "#7E977B", dot: false, rank: 1 },
  tief: { label: "Tief", color: "#978675", dot: false, rank: 2 },
};
