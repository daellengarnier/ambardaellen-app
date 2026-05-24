import type { ISODate } from "./types";

const WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MO = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MO_LONG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export function todayISO(date: Date = new Date()): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const dt = parseISO(iso);
  dt.setDate(dt.getDate() + days);
  return todayISO(dt);
}

export function diffDays(a: ISODate, b: ISODate): number {
  const da = parseISO(a).getTime();
  const db = parseISO(b).getTime();
  return Math.round((da - db) / 86400000);
}

export function weekdayLong(iso: ISODate): string {
  return WD[parseISO(iso).getDay()];
}

export function dayMonth(iso: ISODate): { d: number; mShort: string; mLong: string } {
  const dt = parseISO(iso);
  return { d: dt.getDate(), mShort: MO[dt.getMonth()], mLong: MO_LONG[dt.getMonth()] };
}

export function shortDate(iso: ISODate): string {
  if (!iso) return "—";
  const t = todayISO();
  const d = diffDays(iso, t);
  if (d === 0) return "Heute";
  if (d === 1) return "Morgen";
  if (d === -1) return "Gestern";
  const { d: day, mShort } = dayMonth(iso);
  return `${day}. ${mShort}`;
}

export function longDate(iso: ISODate): string {
  return `${weekdayLong(iso)}, ${shortDate(iso)}`;
}

export function formatDate(iso: ISODate): string {
  if (!iso) return "";
  const t = todayISO();
  const d = diffDays(iso, t);
  const { d: day, mLong } = dayMonth(iso);
  const dayStr = `${day}. ${mLong}`;
  if (d === 0) return `Heute · ${dayStr}`;
  if (d === 1) return `Morgen · ${dayStr}`;
  if (d === -1) return `Gestern · ${dayStr}`;
  if (d > 1 && d < 7) return `${weekdayLong(iso)} · ${dayStr}`;
  return `${weekdayLong(iso)}, ${dayStr}`;
}

export function greetingFor(date: Date = new Date(), name?: string): string {
  const h = date.getHours();
  let g: string;
  if (h < 5) g = "Gute Nacht";
  else if (h < 11) g = "Guten Morgen";
  else if (h < 18) g = "Hallo";
  else if (h < 23) g = "Schönen Abend";
  else g = "Gute Nacht";
  return name ? `${g}, ${name}` : g;
}

export function relativeWhen(addedAt: number, now: number = Date.now()): string {
  const diffMs = now - addedAt;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  if (d === 1) return "gestern";
  if (d < 7) return `vor ${d} Tagen`;
  const w = Math.floor(d / 7);
  if (w < 5) return `vor ${w} Wochen`;
  return shortDate(todayISO(new Date(addedAt)));
}
