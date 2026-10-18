import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json(details ? { error, details } : { error }, { status });
}

export const unauthorized = () => jsonError(401, "Nicht angemeldet.");
export const notFound = () => jsonError(404, "Nicht gefunden.");

/** Body parsen und validieren. Liefert Daten oder eine fertige 400-Antwort. */
export async function parseBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; res: NextResponse }> {
  const raw = await req.json().catch(() => undefined);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, res: jsonError(400, "Ungültige Eingabe.", parsed.error.issues) };
  }
  return { ok: true, data: parsed.data };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
