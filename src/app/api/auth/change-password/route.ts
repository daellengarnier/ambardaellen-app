import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import {
  getCurrentSession,
  hashPassword,
  verifyPassword,
} from "@/lib/server/auth";

const Body = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neues Passwort muss mindestens 6 Zeichen lang sein." },
      { status: 400 },
    );
  }
  const ok = await verifyPassword(
    parsed.data.oldPassword,
    session.account.passwordHash,
  );
  if (!ok) {
    return NextResponse.json(
      { error: "Aktuelles Passwort stimmt nicht." },
      { status: 401 },
    );
  }
  const next = await hashPassword(parsed.data.newPassword);
  await db
    .update(schema.accounts)
    .set({ passwordHash: next })
    .where(eq(schema.accounts.id, session.account.id));
  return NextResponse.json({ ok: true });
}
