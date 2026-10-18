import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { UUID_RE, jsonError, notFound, parseBody, unauthorized } from "@/lib/server/http";
import { TodoCreateSchema, isValidArea, processInboxItem } from "@/lib/server/life";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/v1/inbox/:id/process  Body wie POST /api/v1/todos.
// Legt das Todo an und markiert den Inbox-Eintrag als verarbeitet.
export async function POST(req: Request, { params }: Ctx) {
  const actor = await authenticate(req);
  if (!actor) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  const body = await parseBody(req, TodoCreateSchema);
  if (!body.ok) return body.res;
  if (!(await isValidArea(body.data.area))) return jsonError(400, "Unbekannter Bereich.");
  const result = await processInboxItem(id, body.data, actor);
  return result ? NextResponse.json(result, { status: 201 }) : notFound();
}
