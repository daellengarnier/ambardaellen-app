import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { jsonError, unauthorized } from "@/lib/server/http";
import { DeckImportSchema, RawImportSchema, convertRaw, importDeck } from "@/lib/server/learn";

// POST /api/v1/decks/import
// Body entweder ein Deck { deck, cards } (Format der Jarvis-Decks) oder
// ein Kursexport { kurs, karten } (wird in ein Deck pro Lektion zerlegt).
// Erneuter Import aktualisiert Inhalte, der Lernstand bleibt.
export async function POST(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const raw = await req.json().catch(() => undefined);

  const asRaw = RawImportSchema.safeParse(raw);
  if (asRaw.success) {
    const results = [];
    for (const deck of convertRaw(asRaw.data)) results.push(await importDeck(deck));
    return NextResponse.json({ decks: results }, { status: 201 });
  }
  const asDeck = DeckImportSchema.safeParse(raw);
  if (asDeck.success) {
    return NextResponse.json({ decks: [await importDeck(asDeck.data)] }, { status: 201 });
  }
  const isRaw = raw && typeof raw === "object" && "karten" in raw;
  return jsonError(400, "Ungültige Eingabe.", (isRaw ? asRaw.error : asDeck.error).issues);
}
