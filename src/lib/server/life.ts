import { and, asc, desc, eq, gte, ilike, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client";
import type {
  Actor,
  AreaDto,
  DayPlanDto,
  InboxDto,
  TodayDto,
  TodoDto,
  TodoStatus,
  World,
} from "../life";
import { TODO_STATUSES } from "../life";
import type { Priority } from "../types";
import { ISO_DATE_RE } from "./http";

// ─── Validierung ────────────────────────────────────────────

const isoDate = z.string().regex(ISO_DATE_RE, "Datum als YYYY-MM-DD");
const prio = z.enum(["hoch", "normal", "tief"]);

export const TodoCreateSchema = z.object({
  text: z.string().trim().min(1).max(500),
  note: z.string().max(10_000).optional(),
  area: z.string().nullable().optional(),
  due: isoDate.nullable().optional(),
  prio: prio.optional(),
  plannedFor: isoDate.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  source: z.string().max(40).optional(),
  sourceRef: z.string().max(2000).nullable().optional(),
});

export const TodoPatchSchema = TodoCreateSchema.partial().extend({
  status: z.enum(TODO_STATUSES as [TodoStatus, ...TodoStatus[]]).optional(),
});

export type TodoCreate = z.infer<typeof TodoCreateSchema>;
export type TodoPatchInput = z.infer<typeof TodoPatchSchema>;

// ─── Serialisierung ─────────────────────────────────────────

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toTodoDto(r: schema.TodoRow): TodoDto {
  return {
    id: r.id,
    text: r.text,
    note: r.note,
    area: r.areaKey,
    due: r.due,
    prio: r.prio as Priority,
    status: r.status as TodoStatus,
    plannedFor: r.plannedFor,
    doneAt: iso(r.doneAt),
    tags: r.tags,
    source: r.source,
    sourceRef: r.sourceRef,
    createdBy: r.createdBy as Actor,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toInboxDto(r: schema.InboxRow): InboxDto {
  return {
    id: r.id,
    text: r.text,
    source: r.source,
    createdBy: r.createdBy as Actor,
    createdAt: r.createdAt.toISOString(),
    processedAt: iso(r.processedAt),
    todoId: r.todoId,
  };
}

export function toDayPlanDto(r: schema.DayPlanRow): DayPlanDto {
  return {
    date: r.date,
    note: r.note,
    updatedBy: r.updatedBy as Actor,
    updatedAt: r.updatedAt.toISOString(),
  };
}

// ─── Bereiche ───────────────────────────────────────────────

export async function listAreas(): Promise<AreaDto[]> {
  const rows = await db.select().from(schema.areas).orderBy(asc(schema.areas.sort));
  return rows.map((r) => ({ ...r, world: r.world as World }));
}

/** Prüft, ob ein Bereichsschlüssel existiert (null = kein Bereich, immer ok). */
export async function isValidArea(key: string | null | undefined): Promise<boolean> {
  if (key === null || key === undefined) return true;
  const rows = await db
    .select({ key: schema.areas.key })
    .from(schema.areas)
    .where(eq(schema.areas.key, key))
    .limit(1);
  return rows.length > 0;
}

// ─── Todos ──────────────────────────────────────────────────

export type TodoFilter = {
  status?: TodoStatus[];
  area?: string;
  world?: World;
  dueBefore?: string;
  plannedFor?: string;
  q?: string;
  limit?: number;
};

export async function listTodos(f: TodoFilter = {}): Promise<TodoDto[]> {
  const t = schema.todos;
  const conds = [];
  if (f.status?.length) conds.push(inArray(t.status, f.status));
  if (f.area) conds.push(eq(t.areaKey, f.area));
  if (f.world) {
    conds.push(
      inArray(
        t.areaKey,
        db.select({ key: schema.areas.key }).from(schema.areas).where(eq(schema.areas.world, f.world)),
      ),
    );
  }
  if (f.dueBefore) conds.push(lte(t.due, f.dueBefore));
  if (f.plannedFor) conds.push(eq(t.plannedFor, f.plannedFor));
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(or(ilike(t.text, like), ilike(t.note, like))!);
  }
  const rows = await db
    .select()
    .from(t)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(sql`${t.due} asc nulls last`, desc(t.createdAt))
    .limit(Math.min(Math.max(f.limit ?? 500, 1), 2000));
  return rows.map(toTodoDto);
}

export async function getTodo(id: string): Promise<TodoDto | null> {
  const rows = await db.select().from(schema.todos).where(eq(schema.todos.id, id)).limit(1);
  return rows[0] ? toTodoDto(rows[0]) : null;
}

export async function createTodo(input: TodoCreate, actor: Actor): Promise<TodoDto> {
  const rows = await db
    .insert(schema.todos)
    .values({
      text: input.text,
      note: input.note ?? "",
      areaKey: input.area ?? null,
      due: input.due ?? null,
      prio: input.prio ?? "normal",
      plannedFor: input.plannedFor ?? null,
      tags: input.tags ?? [],
      source: input.source ?? (actor === "jarvis" ? "jarvis" : "app"),
      sourceRef: input.sourceRef ?? null,
      createdBy: actor,
    })
    .returning();
  return toTodoDto(rows[0]);
}

export async function updateTodo(id: string, patch: TodoPatchInput): Promise<TodoDto | null> {
  const set: Partial<typeof schema.todos.$inferInsert> = { updatedAt: new Date() };
  if (patch.text !== undefined) set.text = patch.text;
  if (patch.note !== undefined) set.note = patch.note;
  if (patch.area !== undefined) set.areaKey = patch.area;
  if (patch.due !== undefined) set.due = patch.due;
  if (patch.prio !== undefined) set.prio = patch.prio;
  if (patch.plannedFor !== undefined) set.plannedFor = patch.plannedFor;
  if (patch.tags !== undefined) set.tags = patch.tags;
  if (patch.source !== undefined) set.source = patch.source;
  if (patch.sourceRef !== undefined) set.sourceRef = patch.sourceRef;
  if (patch.status !== undefined) {
    set.status = patch.status;
    set.doneAt = patch.status === "erledigt" ? new Date() : null;
  }
  const rows = await db.update(schema.todos).set(set).where(eq(schema.todos.id, id)).returning();
  return rows[0] ? toTodoDto(rows[0]) : null;
}

export async function deleteTodo(id: string): Promise<boolean> {
  const rows = await db
    .delete(schema.todos)
    .where(eq(schema.todos.id, id))
    .returning({ id: schema.todos.id });
  return rows.length > 0;
}

// ─── Inbox ──────────────────────────────────────────────────

export async function listInbox(onlyOpen: boolean): Promise<InboxDto[]> {
  const i = schema.inboxItems;
  const rows = await db
    .select()
    .from(i)
    .where(onlyOpen ? isNull(i.processedAt) : undefined)
    .orderBy(desc(i.createdAt))
    .limit(500);
  return rows.map(toInboxDto);
}

export async function countOpenInbox(): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.inboxItems)
    .where(isNull(schema.inboxItems.processedAt));
  return rows[0]?.n ?? 0;
}

export async function createInboxItem(
  text: string,
  source: string,
  actor: Actor,
): Promise<InboxDto> {
  const rows = await db
    .insert(schema.inboxItems)
    .values({ text, source, createdBy: actor })
    .returning();
  return toInboxDto(rows[0]);
}

export async function updateInboxItem(
  id: string,
  patch: { text?: string; processed?: boolean },
): Promise<InboxDto | null> {
  const set: Partial<typeof schema.inboxItems.$inferInsert> = {};
  if (patch.text !== undefined) set.text = patch.text;
  if (patch.processed !== undefined) set.processedAt = patch.processed ? new Date() : null;
  if (Object.keys(set).length === 0) {
    const rows = await db.select().from(schema.inboxItems).where(eq(schema.inboxItems.id, id));
    return rows[0] ? toInboxDto(rows[0]) : null;
  }
  const rows = await db
    .update(schema.inboxItems)
    .set(set)
    .where(eq(schema.inboxItems.id, id))
    .returning();
  return rows[0] ? toInboxDto(rows[0]) : null;
}

export async function deleteInboxItem(id: string): Promise<boolean> {
  const rows = await db
    .delete(schema.inboxItems)
    .where(eq(schema.inboxItems.id, id))
    .returning({ id: schema.inboxItems.id });
  return rows.length > 0;
}

/** Inbox-Eintrag in ein Todo verwandeln und als verarbeitet markieren. */
export async function processInboxItem(
  id: string,
  input: TodoCreate,
  actor: Actor,
): Promise<{ item: InboxDto; todo: TodoDto } | null> {
  return db.transaction(async (tx) => {
    const found = await tx
      .select()
      .from(schema.inboxItems)
      .where(eq(schema.inboxItems.id, id))
      .for("update");
    if (!found[0]) return null;
    const todoRows = await tx
      .insert(schema.todos)
      .values({
        text: input.text,
        note: input.note ?? "",
        areaKey: input.area ?? null,
        due: input.due ?? null,
        prio: input.prio ?? "normal",
        plannedFor: input.plannedFor ?? null,
        tags: input.tags ?? [],
        source: input.source ?? "inbox",
        sourceRef: input.sourceRef ?? null,
        createdBy: actor,
      })
      .returning();
    const itemRows = await tx
      .update(schema.inboxItems)
      .set({ processedAt: new Date(), todoId: todoRows[0].id })
      .where(eq(schema.inboxItems.id, id))
      .returning();
    return { item: toInboxDto(itemRows[0]), todo: toTodoDto(todoRows[0]) };
  });
}

// ─── Tagesplan ──────────────────────────────────────────────

export async function getDayPlan(date: string): Promise<DayPlanDto | null> {
  const rows = await db
    .select()
    .from(schema.dayPlans)
    .where(eq(schema.dayPlans.date, date))
    .limit(1);
  return rows[0] ? toDayPlanDto(rows[0]) : null;
}

export async function upsertDayPlan(date: string, note: string, actor: Actor): Promise<DayPlanDto> {
  const now = new Date();
  const rows = await db
    .insert(schema.dayPlans)
    .values({ date, note, updatedBy: actor, updatedAt: now })
    .onConflictDoUpdate({
      target: schema.dayPlans.date,
      set: { note, updatedBy: actor, updatedAt: now },
    })
    .returning();
  return toDayPlanDto(rows[0]);
}

// ─── Heute ──────────────────────────────────────────────────

export async function getToday(date: string): Promise<TodayDto> {
  const t = schema.todos;
  const open = eq(t.status, "offen");
  const notPlanned = or(isNull(t.plannedFor), sql`${t.plannedFor} <> ${date}`)!;
  // Tagesgrenzen in Zürich, damit "heute erledigt" stimmt.
  const dayStart = sql`(${date}::date)::timestamp AT TIME ZONE 'Europe/Zurich'`;
  const dayEnd = sql`(${date}::date + 1)::timestamp AT TIME ZONE 'Europe/Zurich'`;

  const [plan, planned, overdue, dueToday, doneToday, inboxOpen] = await Promise.all([
    getDayPlan(date),
    db.select().from(t).where(and(open, eq(t.plannedFor, date))).orderBy(asc(t.createdAt)),
    db.select().from(t).where(and(open, notPlanned, lt(t.due, date))).orderBy(asc(t.due)),
    db.select().from(t).where(and(open, notPlanned, eq(t.due, date))).orderBy(asc(t.createdAt)),
    db
      .select()
      .from(t)
      .where(and(eq(t.status, "erledigt"), gte(t.doneAt, dayStart), lt(t.doneAt, dayEnd)))
      .orderBy(desc(t.doneAt)),
    countOpenInbox(),
  ]);

  return {
    date,
    plan,
    planned: planned.map(toTodoDto),
    overdue: overdue.map(toTodoDto),
    dueToday: dueToday.map(toTodoDto),
    doneToday: doneToday.map(toTodoDto),
    inboxOpen,
  };
}
