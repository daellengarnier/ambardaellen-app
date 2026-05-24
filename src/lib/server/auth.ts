import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID, createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/client";

export const SESSION_COOKIE = "ad_session";
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 Tage

function jwtSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET fehlt oder zu kurz (min 32 Zeichen).");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 11);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

type JwtClaims = {
  sid: string; // session id
  aid: string; // account id
};

export async function signSessionJwt(claims: JwtClaims): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(jwtSecret());
}

export async function verifySessionJwt(token: string): Promise<JwtClaims | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (typeof payload.sid !== "string" || typeof payload.aid !== "string") {
      return null;
    }
    return { sid: payload.sid, aid: payload.aid };
  } catch {
    return null;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(accountId: string): Promise<string> {
  const sessionId = randomUUID();
  const token = await signSessionJwt({ sid: sessionId, aid: accountId });
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_S * 1000);
  await db.insert(schema.sessions).values({
    id: sessionId,
    accountId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export type CurrentSession = {
  account: typeof schema.accounts.$inferSelect;
};

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifySessionJwt(token);
  if (!claims) return null;

  const tokenHash = hashToken(token);
  const rows = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, claims.sid))
    .limit(1);
  const session = rows[0];
  if (!session) return null;
  if (session.tokenHash !== tokenHash) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  const accountRows = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, claims.aid))
    .limit(1);
  const account = accountRows[0];
  if (!account) return null;

  return { account };
}

export async function destroySession(sessionId: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
}
