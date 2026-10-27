import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/apiAuth";
import { notFound, parseBody, unauthorized } from "@/lib/server/http";
import { getChapterToday, setChapterToday } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

// Kapitel des Tages: GET Stand, PUT { deckId } wählt das Kapitel für heute.
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json(await getChapterToday(todayZurich()));
}

export async function PUT(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, z.object({ deckId: z.string().min(1).max(64) }));
  if (!body.ok) return body.res;
  const today = todayZurich();
  if (!(await setChapterToday(today, body.data.deckId))) return notFound();
  return NextResponse.json(await getChapterToday(today));
}
