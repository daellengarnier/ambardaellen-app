import type { Activity } from "./types";

function fmtIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

function escapeIcs(s: string): string {
  return (s || "").replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

export function toICS(activity: Activity): string {
  const start = activity.date
    ? new Date(`${activity.date}T${activity.time || "09:00"}:00`)
    : new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AmbarDaellen//PWA//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${activity.id}@ambardaellen.app`,
    `DTSTAMP:${fmtIcsDate(new Date())}`,
    `DTSTART:${fmtIcsDate(start)}`,
    `DTEND:${fmtIcsDate(end)}`,
    `SUMMARY:${escapeIcs(activity.title)}`,
    activity.place ? `LOCATION:${escapeIcs(activity.place)}` : null,
    activity.note ? `DESCRIPTION:${escapeIcs(activity.note)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadICS(activity: Activity): void {
  if (typeof window === "undefined") return;
  const ics = toICS(activity);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName =
    activity.title.replace(/[^A-Za-z0-9äöüÄÖÜß ]/g, "").trim().slice(0, 40) || "termin";
  a.download = `${safeName}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
