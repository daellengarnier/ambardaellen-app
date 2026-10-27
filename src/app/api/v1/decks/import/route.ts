import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { DeckImportSchema, importDeck } from "@/lib/server/learn";

// POST /api/v1/decks/import  Body: { deck: {...}, cards: [...] }
// Gleiches Deck nochmal importieren aktualisiert die Inhalte, der
// Lernstand bleibt. Karten werden über (Typ, Vorderseite) erkannt.
export async function POST(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, DeckImportSchema);
  if (!body.ok) return body.res;
  return NextResponse.json(await importDeck(body.data), { status: 201 });
}
