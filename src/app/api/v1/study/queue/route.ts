import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { getQueue, type StudyMode } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

// GET /api/v1/study/queue[?deck=svff-l2-b1][&mode=mix|vi_de|de_vi][&extra=10]
// extra: so viele neue Karten zusätzlich zum Tageslimit.
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const p = new URL(req.url).searchParams;
  const m = p.get("mode");
  const mode: StudyMode = m === "vi_de" || m === "de_vi" ? m : "mix";
  const extra = Math.min(200, Math.max(0, Number(p.get("extra")) || 0));
  return NextResponse.json({
    items: await getQueue(todayZurich(), { deckId: p.get("deck") || undefined, mode, extra }),
  });
}
