import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { getChapterQueue, getQueue, type StudyMode } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

// GET /api/v1/study/queue[?deck=svff-l2-b1][&mode=mix|vi_de|de_vi][&extra=10]
// extra: so viele neue Karten zusätzlich zum Tageslimit.
// chapter=1: die heute noch offenen Karten des Kapitels des Tages.
// review=1: nur Fällige auffrischen, keine neuen Karten.
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const p = new URL(req.url).searchParams;
  const m = p.get("mode");
  const mode: StudyMode = m === "vi_de" || m === "de_vi" ? m : "mix";
  if (p.get("chapter") === "1") {
    return NextResponse.json({ items: await getChapterQueue(todayZurich(), mode) });
  }
  const extra = Math.min(200, Math.max(0, Number(p.get("extra")) || 0));
  return NextResponse.json({
    items: await getQueue(todayZurich(), {
      deckId: p.get("deck") || undefined,
      mode,
      extra,
      includeNew: p.get("review") !== "1",
    }),
  });
}
