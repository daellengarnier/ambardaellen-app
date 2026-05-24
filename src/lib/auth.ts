import type { UserId } from "./types";

export type Account = {
  email: string;
  userId: UserId;
  passwordSalt: string;
  passwordHash: string;
  createdAt: number;
};

/** Mapping fix: jede Email gehört eindeutig zu einem User-Slot. */
export const EMAIL_TO_USER: Record<string, UserId> = {
  "ambar@al-daellen.ch": "A",
  "alain@al-daellen.ch": "D",
};

export const USER_TO_EMAIL: Record<UserId, string> = {
  A: "ambar@al-daellen.ch",
  D: "alain@al-daellen.ch",
};

export const ALLOWED_EMAILS = Object.keys(EMAIL_TO_USER);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string): boolean {
  return normalizeEmail(email) in EMAIL_TO_USER;
}

export function userIdForEmail(email: string): UserId | null {
  return EMAIL_TO_USER[normalizeEmail(email)] ?? null;
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

export function newSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hash));
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const test = await hashPassword(password, salt);
  return test === hash;
}
