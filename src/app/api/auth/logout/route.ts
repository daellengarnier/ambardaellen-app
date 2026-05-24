import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  destroySession,
  getCurrentSession,
  SESSION_COOKIE,
  verifySessionJwt,
} from "@/lib/server/auth";
import { cookies } from "next/headers";

export async function POST() {
  const session = await getCurrentSession();
  if (session) {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token) {
      const claims = await verifySessionJwt(token);
      if (claims?.sid) await destroySession(claims.sid);
    }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
