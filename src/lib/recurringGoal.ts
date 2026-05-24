import type { Goal, Period } from "./types";

// Datum-Helfer ─────────────────────────────────────────────────────
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Montag der Woche zu d. */
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7; // Mo=0
  x.setDate(x.getDate() - dow);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Periode-Buckets ──────────────────────────────────────────────────

/** Erster Tag der Periode, in der `d` liegt. */
export function periodStart(period: Period, d: Date): Date {
  if (period === "tag") return startOfDay(d);
  if (period === "woche") return startOfWeek(d);
  return startOfMonth(d);
}

/** Erster Tag der nächsten Periode nach `d`. */
export function periodEnd(period: Period, d: Date): Date {
  const s = periodStart(period, d);
  if (period === "tag") return addDays(s, 1);
  if (period === "woche") return addDays(s, 7);
  const next = new Date(s);
  next.setMonth(next.getMonth() + 1);
  return next;
}

/** Tage der Periode, jeweils als ISO. */
export function isoDaysInPeriod(period: Period, anchor: Date): string[] {
  const start = periodStart(period, anchor);
  const end = periodEnd(period, anchor);
  const out: string[] = [];
  for (let cur = new Date(start); cur < end; cur = addDays(cur, 1)) {
    out.push(toISO(cur));
  }
  return out;
}

/** Summe des Logs für die Periode, die `anchor` enthält. */
export function valueInPeriod(
  goal: Goal,
  anchor: Date = new Date(),
): number {
  if (goal.kind !== "wiederkehrend" || !goal.period || !goal.log) return 0;
  const days = isoDaysInPeriod(goal.period, anchor);
  return days.reduce((sum, iso) => sum + (goal.log?.[iso] ?? 0), 0);
}

/** Periode erfüllt (Wert ≥ target)? */
export function isPeriodComplete(
  goal: Goal,
  anchor: Date = new Date(),
): boolean {
  if (goal.kind !== "wiederkehrend") return false;
  return valueInPeriod(goal, anchor) >= goal.target;
}

// Statistik-Helfer ─────────────────────────────────────────────────

/**
 * Aktuelle Streak in „Perioden in Folge erfüllt", endend bei der aktuellen
 * Periode (oder der direkt davor, falls die aktuelle noch nicht erfüllt
 * ist). Beispiel: tägliches Ziel, letzte 5 Tage erfüllt → 5.
 */
export function currentStreak(goal: Goal, today: Date = new Date()): number {
  if (goal.kind !== "wiederkehrend" || !goal.period) return 0;
  let count = 0;
  let cursor = periodStart(goal.period, today);
  // Aktuelle Periode überspringen, wenn noch nicht erfüllt — die Streak
  // bricht erst wenn die VORIGE auch nicht voll war.
  if (!isPeriodComplete(goal, cursor)) {
    cursor = addDays(cursor, -1);
    cursor = periodStart(goal.period, cursor);
  }
  while (isPeriodComplete(goal, cursor)) {
    count++;
    cursor = addDays(cursor, -1);
    cursor = periodStart(goal.period, cursor);
    if (count > 365) break;
  }
  return count;
}

/**
 * Liefert pro „Bucket" (Tag/Woche/Monat — abhängig vom Goal) den Wert,
 * neueste zuerst. Länge n.
 */
export function lastBuckets(
  goal: Goal,
  n: number,
  today: Date = new Date(),
): { label: string; value: number; complete: boolean; isCurrent: boolean }[] {
  if (goal.kind !== "wiederkehrend" || !goal.period) return [];
  const out: { label: string; value: number; complete: boolean; isCurrent: boolean }[] = [];
  let cursor = periodStart(goal.period, today);
  const currentStart = cursor.getTime();
  for (let i = 0; i < n; i++) {
    const value = valueInPeriod(goal, cursor);
    const label = labelFor(goal.period, cursor);
    out.push({
      label,
      value,
      complete: value >= goal.target,
      isCurrent: cursor.getTime() === currentStart,
    });
    cursor = addDays(cursor, -1);
    cursor = periodStart(goal.period, cursor);
  }
  return out;
}

function labelFor(period: Period, d: Date): string {
  if (period === "tag") {
    return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric" });
  }
  if (period === "woche") {
    return "KW " + isoWeek(d);
  }
  return d.toLocaleDateString("de-DE", { month: "short" });
}

function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((t.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return week;
}

/**
 * Durchschnittlicher Wert über die letzten n vollendeten Perioden
 * (die aktuelle, möglicherweise unvollständige, wird ausgenommen).
 */
export function averageOverLast(
  goal: Goal,
  n: number,
  today: Date = new Date(),
): number {
  const buckets = lastBuckets(goal, n + 1, today);
  const past = buckets.filter((b) => !b.isCurrent).slice(0, n);
  if (past.length === 0) return 0;
  const sum = past.reduce((s, b) => s + b.value, 0);
  return sum / past.length;
}

export const PERIOD_LABEL: Record<Period, string> = {
  tag: "Tag",
  woche: "Woche",
  monat: "Monat",
};

export const PERIOD_LABEL_PER: Record<Period, string> = {
  tag: "pro Tag",
  woche: "pro Woche",
  monat: "pro Monat",
};
