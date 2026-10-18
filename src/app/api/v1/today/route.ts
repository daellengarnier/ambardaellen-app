import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { ISO_DATE_RE, jsonError, unauthorized } from "@/lib/server/http";
import { getToday } from "@/lib/server/life";
import { todayZurich } from "@/lib/life";

// GET /api/v1/today[?date=YYYY-MM-DD]  Standard: heute in Zürich.
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const date = new URL(req.url).searchParams.get("date") ?? todayZurich();
  if (!ISO_DATE_RE.test(date)) return jsonError(400, "Datum als YYYY-MM-DD.");
  return NextResponse.json(await getToday(date));
}
