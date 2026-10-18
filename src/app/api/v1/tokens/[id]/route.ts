import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getCurrentSession } from "@/lib/server/auth";
import { UUID_RE, notFound, unauthorized } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

// Widerruft ein Token. Der Eintrag bleibt zur Nachvollziehbarkeit stehen.
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getCurrentSession())) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  const rows = await db
    .update(schema.apiTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.apiTokens.id, id), isNull(schema.apiTokens.revokedAt)))
    .returning({ id: schema.apiTokens.id });
  return rows.length ? NextResponse.json({ ok: true }) : notFound();
}
