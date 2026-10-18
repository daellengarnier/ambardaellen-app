import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentSession, hashToken } from "@/lib/server/auth";
import { generateApiToken } from "@/lib/server/apiAuth";
import { parseBody, unauthorized } from "@/lib/server/http";

// Tokens verwaltet nur Alain selbst (Session), nie Jarvis per Token.

export async function GET() {
  if (!(await getCurrentSession())) return unauthorized();
  const rows = await db
    .select({
      id: schema.apiTokens.id,
      name: schema.apiTokens.name,
      createdAt: schema.apiTokens.createdAt,
      lastUsedAt: schema.apiTokens.lastUsedAt,
      revokedAt: schema.apiTokens.revokedAt,
    })
    .from(schema.apiTokens)
    .orderBy(desc(schema.apiTokens.createdAt));
  return NextResponse.json({ tokens: rows });
}

const Body = z.object({ name: z.string().trim().min(1).max(60) });

export async function POST(req: Request) {
  if (!(await getCurrentSession())) return unauthorized();
  const body = await parseBody(req, Body);
  if (!body.ok) return body.res;
  const token = generateApiToken();
  const rows = await db
    .insert(schema.apiTokens)
    .values({ name: body.data.name, tokenHash: hashToken(token) })
    .returning({ id: schema.apiTokens.id, name: schema.apiTokens.name, createdAt: schema.apiTokens.createdAt });
  // Klartext nur in dieser Antwort, danach nie wieder abrufbar.
  return NextResponse.json({ token, ...rows[0] }, { status: 201 });
}
