import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from "@/lib/server/auth";
import { normalizeEmail } from "@/lib/auth";

const Body = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const email = normalizeEmail(parsed.data.email);

  const rows = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.email, email))
    .limit(1);
  const account = rows[0];
  if (!account) {
    return NextResponse.json(
      { error: "Account nicht gefunden." },
      { status: 401 },
    );
  }
  const ok = await verifyPassword(parsed.data.password, account.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const token = await createSession(account.id);
  await setSessionCookie(token);

  return NextResponse.json({
    account: {
      id: account.id,
      email: account.email,
      userId: account.userId,
      workspaceId: account.workspaceId,
    },
  });
}
