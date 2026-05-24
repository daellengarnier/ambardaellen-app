import { eq } from "drizzle-orm";
import { db, schema } from "../db/client";

/**
 * Wir betreiben einen einzigen Workspace ("Ambar & Dällen").
 * Beim ersten Account-Registrieren wird er erzeugt; jeder weitere
 * Account joint demselben Workspace.
 */
export async function getOrCreateSharedWorkspace(): Promise<string> {
  const existing = await db.select().from(schema.workspaces).limit(1);
  if (existing[0]) return existing[0].id;

  const inserted = await db
    .insert(schema.workspaces)
    .values({ name: "Ambar & Dällen" })
    .returning({ id: schema.workspaces.id });
  const workspaceId = inserted[0].id;

  await db.insert(schema.workspaceState).values({
    workspaceId,
    data: {},
    version: 0,
  });

  return workspaceId;
}

export async function loadState(
  workspaceId: string,
): Promise<{ data: unknown; version: number }> {
  const rows = await db
    .select()
    .from(schema.workspaceState)
    .where(eq(schema.workspaceState.workspaceId, workspaceId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    await db.insert(schema.workspaceState).values({
      workspaceId,
      data: {},
      version: 0,
    });
    return { data: {}, version: 0 };
  }
  return { data: row.data, version: row.version };
}

export type SaveResult =
  | { ok: true; version: number }
  | { ok: false; conflict: true; current: { data: unknown; version: number } };

export async function saveState(
  workspaceId: string,
  baseVersion: number,
  nextData: unknown,
): Promise<SaveResult> {
  const current = await loadState(workspaceId);
  if (current.version !== baseVersion) {
    return { ok: false, conflict: true, current };
  }
  const nextVersion = baseVersion + 1;
  await db
    .update(schema.workspaceState)
    .set({
      data: nextData as object,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(schema.workspaceState.workspaceId, workspaceId));
  return { ok: true, version: nextVersion };
}
