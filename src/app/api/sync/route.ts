import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/server/auth";
import { loadState, saveState } from "@/lib/server/workspace";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const state = await loadState(session.account.workspaceId);
  return NextResponse.json(state);
}

const PutBody = z.object({
  baseVersion: z.number().int().nonnegative(),
  data: z.unknown(),
});

export async function PUT(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const parsed = PutBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }
  const result = await saveState(
    session.account.workspaceId,
    parsed.data.baseVersion,
    parsed.data.data,
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: "Konflikt — neuere Version auf Server.", current: result.current },
      { status: 409 },
    );
  }
  return NextResponse.json({ version: result.version });
}
