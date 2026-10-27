import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { getPublicKey } from "@/lib/server/push";

export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json({ publicKey: await getPublicKey() });
}
