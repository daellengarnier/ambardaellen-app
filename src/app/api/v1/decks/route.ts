import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { listDecks } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json({ decks: await listDecks(todayZurich()) });
}
