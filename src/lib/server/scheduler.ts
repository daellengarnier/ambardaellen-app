import { eq } from "drizzle-orm";
import { db, schema } from "../db/client";
import { todayZurich } from "../life";
import { getChapterToday, getStudySettings } from "./learn";
import { sendToAll } from "./push";

// Läuft im Server-Prozess (gestartet in src/instrumentation.ts) und
// schickt einmal pro Tag zur eingestellten Zeit eine Erinnerung, wenn
// das Kapitel des Tages noch offen ist.

const TICK_MS = 60_000;

function nowZurichHHMM(): string {
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

async function reminderTick() {
  const settings = await getStudySettings();
  if (!settings.reminderEnabled) return;
  const today = todayZurich();
  if (nowZurichHHMM() < settings.reminderTime) return;

  const last = await db.select().from(schema.settings).where(eq(schema.settings.key, "push.lastReminder")).limit(1);
  if (last[0]?.value === today) return;
  await db
    .insert(schema.settings)
    .values({ key: "push.lastReminder", value: today })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: today, updatedAt: new Date() } });

  // Tagesziel ist das Kapitel des Tages.
  const ch = await getChapterToday(today);
  if (ch.completed) return;
  const suggested = ch.chapters.find((c) => c.id === ch.suggestion);
  await sendToAll({
    title: "Vietnamesisch",
    body: ch.chapter
      ? `Noch ${ch.total - ch.done} Karten in ${ch.chapter.title}.`
      : `Heute noch kein Kapitel.${suggested ? ` Wie wärs mit ${suggested.title}?` : ""}`,
    url: "/lernen",
  });
}

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;
  setInterval(() => {
    reminderTick().catch((e) => console.error("[scheduler] Erinnerung fehlgeschlagen:", e));
  }, TICK_MS);
}
