import { NextResponse } from "next/server";
import { authenticate } from "@/lib/server/apiAuth";
import { unauthorized } from "@/lib/server/http";
import { sendToAll } from "@/lib/server/push";

export async function POST(req: Request) {
  if (!(await authenticate(req))) return unauthorized();
  const r = await sendToAll({ title: "Life-App", body: "So sehen Erinnerungen aus.", url: "/lernen" });
  return NextResponse.json(r);
}
