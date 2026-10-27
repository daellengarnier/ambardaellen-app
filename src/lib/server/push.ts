import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/client";

// Web Push für Erinnerungen. Die VAPID-Schlüssel erzeugt die App beim
// ersten Gebrauch selbst und legt sie in den Einstellungen ab, so braucht
// der Server keine zusätzliche Konfiguration.

type Vapid = { publicKey: string; privateKey: string };

async function getVapid(): Promise<Vapid> {
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.key, "push.vapid")).limit(1);
  if (rows[0]) return rows[0].value as Vapid;
  const keys = webpush.generateVAPIDKeys();
  await db.insert(schema.settings).values({ key: "push.vapid", value: keys }).onConflictDoNothing();
  // Bei gleichzeitigem Erzeugen gewinnt der erste Eintrag.
  const again = await db.select().from(schema.settings).where(eq(schema.settings.key, "push.vapid")).limit(1);
  return again[0].value as Vapid;
}

export async function getPublicKey(): Promise<string> {
  return (await getVapid()).publicKey;
}

export async function saveSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }, userAgent: string) {
  await db
    .insert(schema.pushSubscriptions)
    .values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent })
    .onConflictDoUpdate({
      target: schema.pushSubscriptions.endpoint,
      set: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent },
    });
}

export async function removeSubscription(endpoint: string) {
  await db.delete(schema.pushSubscriptions).where(eq(schema.pushSubscriptions.endpoint, endpoint));
}

export type PushPayload = { title: string; body: string; url?: string };

/** An alle Geräte senden. Abgelaufene Abos werden dabei entfernt. */
export async function sendToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const vapid = await getVapid();
  const subs = await db.select().from(schema.pushSubscriptions);
  let sent = 0;
  let failed = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
        { vapidDetails: { subject: "https://app.al-daellen.ch", ...vapid }, TTL: 60 * 60 * 6 },
      );
      sent++;
    } catch (e) {
      failed++;
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await removeSubscription(s.endpoint);
    }
  }
  return { sent, failed };
}
