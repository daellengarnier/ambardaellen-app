import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/server/auth";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ account: null }, { status: 200 });
  }
  return NextResponse.json({
    account: {
      id: session.account.id,
      email: session.account.email,
      userId: session.account.userId,
      workspaceId: session.account.workspaceId,
    },
  });
}
