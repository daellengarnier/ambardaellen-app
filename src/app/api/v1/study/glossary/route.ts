import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { GlossaryImportSchema, getGlossary, upsertGlossary } from "@/lib/server/learn";

// GET /api/v1/study/glossary  → { entries: [{ vi, de, source }] }
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json({ entries: await getGlossary() });
}

// POST /api/v1/study/glossary  Body: { entries: [{ vi, de }] }, überschreibt gleiche Einträge.
export async function POST(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, GlossaryImportSchema);
  if (!body.ok) return body.res;
  return NextResponse.json({ upserted: await upsertGlossary(body.data.entries) });
}
