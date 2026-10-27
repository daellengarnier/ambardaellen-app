import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/server/apiAuth";
import { notFound, parseBody, unauthorized } from "@/lib/server/http";
import { review } from "@/lib/server/learn";
import { todayZurich } from "@/lib/life";

const Body = z.object({
  cardId: z.string().uuid(),
  direction: z.enum(["vi_de", "de_vi"]),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export async function POST(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const body = await parseBody(req, Body);
  if (!body.ok) return body.res;
  const { cardId, direction, rating } = body.data;
  const result = await review(cardId, direction, rating, todayZurich());
  return result ? NextResponse.json(result) : notFound();
}
