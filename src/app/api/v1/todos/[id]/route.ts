import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { UUID_RE, jsonError, notFound, parseBody, unauthorized } from "@/lib/server/http";
import { TodoPatchSchema, deleteTodo, getTodo, isValidArea, updateTodo } from "@/lib/server/life";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  if (!(await authenticate(req))) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  const todo = await getTodo(id);
  return todo ? NextResponse.json({ todo }) : notFound();
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await authenticate(req))) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  const body = await parseBody(req, TodoPatchSchema);
  if (!body.ok) return body.res;
  if (!(await isValidArea(body.data.area))) return jsonError(400, "Unbekannter Bereich.");
  const todo = await updateTodo(id, body.data);
  return todo ? NextResponse.json({ todo }) : notFound();
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await authenticate(req))) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  return (await deleteTodo(id)) ? NextResponse.json({ ok: true }) : notFound();
}
