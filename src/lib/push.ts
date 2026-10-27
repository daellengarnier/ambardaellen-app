"use client";

// Push-Benachrichtigungen auf diesem Gerät ein- und ausschalten.
// Auf dem iPhone nur, wenn die App zum Home-Bildschirm hinzugefügt wurde.

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function enablePush(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!pushSupported()) {
    return { ok: false, error: "Dieses Gerät kann keine Benachrichtigungen. Auf dem iPhone: App zuerst zum Home-Bildschirm hinzufügen." };
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, error: "Benachrichtigungen wurden nicht erlaubt." };
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const keyRes = await fetch("/api/v1/push/key", { cache: "no-store" });
  if (!keyRes.ok) return { ok: false, error: "Schlüssel nicht abrufbar." };
  const { publicKey } = (await keyRes.json()) as { publicKey: string };
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
  const res = await fetch("/api/v1/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return res.ok ? { ok: true } : { ok: false, error: "Gerät konnte nicht registriert werden." };
}

export async function disablePush(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) return;
  await fetch("/api/v1/push/subscribe", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
}
