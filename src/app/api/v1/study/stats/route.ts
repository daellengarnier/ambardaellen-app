import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { getStats } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json(await getStats(todayZurich()));
}
