import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/apiAuth";
import { ISO_DATE_RE, jsonError, parseBody, unauthorized } from "@/lib/server/http";
import { getDayPlan, upsertDayPlan } from "@/lib/server/life";

type Ctx = { params: Promise<{ date: string }> };

export async function GET(req: Request, { params }: Ctx) {
  if (!(await authenticate(req))) return unauthorized();
  const { date } = await params;
  if (!ISO_DATE_RE.test(date)) return jsonError(400, "Datum als YYYY-MM-DD.");
  return NextResponse.json({ plan: await getDayPlan(date) });
}

const Body = z.object({ note: z.string().max(10_000) });

export async function PUT(req: Request, { params }: Ctx) {
  const actor = await authenticate(req);
  if (!actor) return unauthorized();
  const { date } = await params;
  if (!ISO_DATE_RE.test(date)) return jsonError(400, "Datum als YYYY-MM-DD.");
  const body = await parseBody(req, Body);
  if (!body.ok) return body.res;
  return NextResponse.json({ plan: await upsertDayPlan(date, body.data.note, actor) });
}
