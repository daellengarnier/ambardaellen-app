import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentSession, hashPassword } from "@/lib/server/auth";

const Body = z.object({
  newPassword: z.string().min(6),
});

/**
 * Setzt das Passwort des Partners (gleicher Workspace, anderer User-Slot)
 * neu. Pragmatisch für ein 2-Personen-Setup ohne Mail-Reset-Flow:
 * der Partner muss eingeloggt sein, dann darf er das andere Passwort
 * zurücksetzen. Alle Sessions des Partners werden anschliessend
 * gelöscht, damit ein evtl. zugängliches altes Cookie nicht mehr greift.
 */
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

  const partners = await db
    .select()
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.workspaceId, session.account.workspaceId),
        ne(schema.accounts.id, session.account.id),
      ),
    )
    .limit(1);
  const partner = partners[0];
  if (!partner) {
    return NextResponse.json(
      { error: "Kein Partner-Account in diesem Workspace." },
      { status: 404 },
    );
  }

  const next = await hashPassword(parsed.data.newPassword);
  await db
    .update(schema.accounts)
    .set({ passwordHash: next })
    .where(eq(schema.accounts.id, partner.id));
  await db.delete(schema.sessions).where(eq(schema.sessions.accountId, partner.id));

  return NextResponse.json({ ok: true, email: partner.email });
}
