import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/apiAuth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { createInboxItem, listInbox } from "@/lib/server/life";

// GET /api/v1/inbox            → nur unverarbeitete
// GET /api/v1/inbox?all=1      → alle (neueste zuerst, max. 500)
export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const all = new URL(req.url).searchParams.get("all") === "1";
  return NextResponse.json({ items: await listInbox(!all) });
}

const Body = z.object({
  text: z.string().trim().min(1).max(4000),
  source: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const actor = await authenticate(req);
  if (!actor) return unauthorized();
  const body = await parseBody(req, Body);
  if (!body.ok) return body.res;
  const source = body.data.source ?? (actor === "jarvis" ? "jarvis" : "app");
  const item = await createInboxItem(body.data.text, source, actor);
  return NextResponse.json({ item }, { status: 201 });
}
