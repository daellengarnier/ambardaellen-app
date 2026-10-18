import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/apiAuth";
import { UUID_RE, notFound, parseBody, unauthorized } from "@/lib/server/http";
import { deleteInboxItem, updateInboxItem } from "@/lib/server/life";

type Ctx = { params: Promise<{ id: string }> };

const Patch = z.object({
  text: z.string().trim().min(1).max(4000).optional(),
  processed: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await authenticate(req))) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  const body = await parseBody(req, Patch);
  if (!body.ok) return body.res;
  const item = await updateInboxItem(id, body.data);
  return item ? NextResponse.json({ item }) : notFound();
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await authenticate(req))) return unauthorized();
  const { id } = await params;
  if (!UUID_RE.test(id)) return notFound();
  return (await deleteInboxItem(id)) ? NextResponse.json({ ok: true }) : notFound();
}
