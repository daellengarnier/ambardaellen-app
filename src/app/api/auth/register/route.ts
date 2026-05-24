import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/server/auth";
import { getOrCreateSharedWorkspace } from "@/lib/server/workspace";
import { EMAIL_TO_USER, normalizeEmail } from "@/lib/auth";

const Body = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe." },
      { status: 400 },
    );
  }
  const email = normalizeEmail(parsed.data.email);
  const userId = EMAIL_TO_USER[email];
  if (!userId) {
    return NextResponse.json(
      { error: "Diese E-Mail ist nicht zugelassen." },
      { status: 403 },
    );
  }

  const existing = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.email, email))
    .limit(1);
  if (existing[0]) {
    return NextResponse.json(
      { error: "Account existiert bereits — bitte anmelden." },
      { status: 409 },
    );
  }

  const workspaceId = await getOrCreateSharedWorkspace();
  const passwordHash = await hashPassword(parsed.data.password);

  const inserted = await db
    .insert(schema.accounts)
    .values({ email, passwordHash, userId, workspaceId })
    .returning();
  const account = inserted[0];

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
