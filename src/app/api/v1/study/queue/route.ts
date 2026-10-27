import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { getQueue } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

// GET /api/v1/study/queue[?deck=svff-l2-b1]
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const deck = new URL(req.url).searchParams.get("deck") || undefined;
  return NextResponse.json({ items: await getQueue(todayZurich(), deck) });
}
