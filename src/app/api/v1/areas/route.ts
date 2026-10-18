import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { listAreas } from "@/lib/server/life";

export async function GET(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  return NextResponse.json({ areas: await listAreas() });
}
