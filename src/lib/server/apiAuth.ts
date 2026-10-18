import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "../db/client";
import { getCurrentSession, hashToken } from "./auth";
import type { Actor } from "../life";

const TOKEN_PREFIX = "jv_";

/** Neues API-Token. Der Klartext wird nur einmal zurückgegeben. */
export function generateApiToken(): string {
  return TOKEN_PREFIX + randomBytes(32).toString("base64url");
}

async function actorFromBearer(req: Request): Promise<Actor | null> {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match || !match[1].startsWith(TOKEN_PREFIX)) return null;

  const rows = await db
    .select({ id: schema.apiTokens.id })
    .from(schema.apiTokens)
    .where(
      and(
        eq(schema.apiTokens.tokenHash, hashToken(match[1])),
        isNull(schema.apiTokens.revokedAt),
      ),
    )
    .limit(1);
  const token = rows[0];
  if (!token) return null;

  await db
    .update(schema.apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiTokens.id, token.id));
  return "jarvis";
}

/**
 * Wer ruft die API auf? Alain über das Session-Cookie der App oder
 * Jarvis über ein Bearer-Token. null = nicht angemeldet.
 */
export async function authenticate(req: Request): Promise<Actor | null> {
  if (req.headers.has("authorization")) return actorFromBearer(req);
  const session = await getCurrentSession();
  return session ? "alain" : null;
}
