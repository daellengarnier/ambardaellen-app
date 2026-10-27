import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/apiAuth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { removeSubscription, saveSubscription } from "@/lib/server/push";

const Sub = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({ p256dh: z.string().min(1).max(500), auth: z.string().min(1).max(500) }),
});

export async function POST(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, Sub);
  if (!body.ok) return body.res;
  await saveSubscription(body.data, (req.headers.get("user-agent") ?? "").slice(0, 300));
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, z.object({ endpoint: z.string().max(2000) }));
  if (!body.ok) return body.res;
  await removeSubscription(body.data.endpoint);
  return NextResponse.json({ ok: true });
}
