import { eq } from "drizzle-orm";
import { db, schema } from "../db/client";
import { todayZurich } from "../life";
import { getStats, getStudySettings } from "./learn";
import { sendToAll } from "./push";

// Läuft im Server-Prozess (gestartet in src/instrumentation.ts) und
// schickt einmal pro Tag zur eingestellten Zeit eine Erinnerung, wenn
// das Lern-Tagesziel noch offen ist.

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

  const stats = await getStats(today);
  const waiting = stats.due + stats.newToday;
  if (stats.reviewedToday >= stats.dailyGoal || waiting === 0) return;
  const left = Math.min(waiting, stats.dailyGoal - stats.reviewedToday);
  await sendToAll({
    title: "Vietnamesisch",
    body:
      stats.reviewedToday > 0
        ? `Noch ${left} Karten bis zum Tagesziel (${stats.reviewedToday}/${stats.dailyGoal}).`
        : `${left} Karten warten auf dich.${stats.streak > 0 ? ` Serie: ${stats.streak} Tage.` : ""}`,
    url: "/lernen/ueben",
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
