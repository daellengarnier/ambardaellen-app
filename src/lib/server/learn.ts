import { and, asc, eq, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client";
import type { CardDto, CardType, DeckDto, StudyItem, StudyStats } from "../life";
import { directionsFor, schedule, type Direction, type Rating } from "../srs";

/** Neue Lernrichtungen pro Tag, über alle Decks. */
export const NEW_PER_DAY = 15;

// ─── Validierung ────────────────────────────────────────────

const text = (max: number) => z.string().trim().max(max).optional();

// Format wie die Deck-Dateien im Jarvis-Repo
// (areas/privat-lernen/vietnamesisch/decks/*.json).
export const DeckImportSchema = z.object({
  deck: z.object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/, "id: a-z, 0-9, Bindestrich"),
    title: z.string().trim().min(1).max(200),
    course: text(200),
    level: text(20),
    topic: text(200),
    source: text(2000),
    language: text(10),
  }),
  cards: z
    .array(
      z.object({
        type: z.enum(["vocab", "grammar", "phrase"]),
        front: z.string().trim().min(1).max(500),
        back_de: text(2000),
        back_en: text(2000),
        back_vi: text(2000),
        pos: text(40),
        category: text(80),
        example_vi: text(2000),
        example_de: text(2000),
        note: text(2000),
      }),
    )
    .min(1)
    .max(2000),
});

export type DeckImport = z.infer<typeof DeckImportSchema>;

// ─── Serialisierung ─────────────────────────────────────────

export function toCardDto(r: schema.CardRow): CardDto {
  return {
    id: r.id,
    deckId: r.deckId,
    type: r.type as CardType,
    front: r.front,
    backDe: r.backDe,
    backEn: r.backEn,
    backVi: r.backVi,
    pos: r.pos,
    category: r.category,
    exampleVi: r.exampleVi,
    exampleDe: r.exampleDe,
    note: r.note,
  };
}

// ─── Decks ──────────────────────────────────────────────────

export async function listDecks(today: string): Promise<DeckDto[]> {
  const rows = await db.execute<{
    id: string;
    title: string;
    course: string;
    level: string;
    topic: string;
    source: string;
    language: string;
    cards: number;
    items: number;
    learned: number;
    due: number;
    fresh: number;
  }>(sql`
    SELECT d.id, d.title, d.course, d.level, d.topic, d.source, d.language,
      (SELECT count(*)::int FROM cards c WHERE c.deck_id = d.id) AS cards,
      count(s.card_id)::int AS items,
      count(s.card_id) FILTER (WHERE s.introduced_on IS NOT NULL)::int AS learned,
      count(s.card_id) FILTER (WHERE s.introduced_on IS NOT NULL AND s.due <= ${today}::date)::int AS due,
      count(s.card_id) FILTER (WHERE s.introduced_on IS NULL)::int AS fresh
    FROM decks d
    LEFT JOIN cards c ON c.deck_id = d.id
    LEFT JOIN card_states s ON s.card_id = c.id
    GROUP BY d.id
    ORDER BY d.created_at, d.id
  `);
  return [...rows];
}

/** Deck anlegen oder aktualisieren. Lernstand bestehender Karten bleibt. */
export async function importDeck(input: DeckImport): Promise<{ deck: string; created: number; updated: number }> {
  const d = input.deck;
  return db.transaction(async (tx) => {
    await tx
      .insert(schema.decks)
      .values({
        id: d.id,
        title: d.title,
        course: d.course ?? "",
        level: d.level ?? "",
        topic: d.topic ?? "",
        source: d.source ?? "",
        language: d.language || "vi",
      })
      .onConflictDoUpdate({
        target: schema.decks.id,
        set: {
          title: d.title,
          course: d.course ?? "",
          level: d.level ?? "",
          topic: d.topic ?? "",
          source: d.source ?? "",
          updatedAt: new Date(),
        },
      });

    const existing = await tx
      .select({ type: schema.cards.type, front: schema.cards.front })
      .from(schema.cards)
      .where(eq(schema.cards.deckId, d.id));
    const known = new Set(existing.map((c) => `${c.type}\u0000${c.front}`));

    let created = 0;
    let updated = 0;
    for (const [i, c] of input.cards.entries()) {
      const values = {
        backDe: c.back_de ?? "",
        backEn: c.back_en ?? "",
        backVi: c.back_vi ?? "",
        pos: c.pos ?? "",
        category: c.category ?? "",
        exampleVi: c.example_vi ?? "",
        exampleDe: c.example_de ?? "",
        note: c.note ?? "",
        position: i,
      };
      const rows = await tx
        .insert(schema.cards)
        .values({ deckId: d.id, type: c.type, front: c.front, ...values })
        .onConflictDoUpdate({
          target: [schema.cards.deckId, schema.cards.type, schema.cards.front],
          set: { ...values, updatedAt: new Date() },
        })
        .returning({ id: schema.cards.id });
      if (known.has(`${c.type}\u0000${c.front}`)) updated++;
      else created++;
      await tx
        .insert(schema.cardStates)
        .values(directionsFor(c.type).map((direction) => ({ cardId: rows[0].id, direction })))
        .onConflictDoNothing();
    }
    return { deck: d.id, created, updated };
  });
}

// ─── Lernen ─────────────────────────────────────────────────

async function introducedToday(today: string): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.cardStates)
    .where(eq(schema.cardStates.introducedOn, today));
  return rows[0]?.n ?? 0;
}

/**
 * Was heute zu lernen ist: fällige Wiederholungen, dann neue Karten bis
 * zum Tageslimit. Die Gegenrichtung (DE→VI) einer Karte kommt erst an
 * einem späteren Tag als VI→DE dran.
 */
export async function getQueue(today: string, deckId?: string, newLimit = NEW_PER_DAY): Promise<StudyItem[]> {
  const s = schema.cardStates;
  const c = schema.cards;
  const deckCond = deckId ? eq(c.deckId, deckId) : undefined;

  const due = await db
    .select({ state: s, card: c })
    .from(s)
    .innerJoin(c, eq(s.cardId, c.id))
    .where(and(isNotNull(s.introducedOn), lte(s.due, today), deckCond))
    .orderBy(asc(s.due), asc(c.position))
    .limit(300);

  const budget = Math.max(0, newLimit - (await introducedToday(today)));
  let fresh: typeof due = [];
  if (budget > 0) {
    const sibling = sql`(SELECT introduced_on FROM card_states x WHERE x.card_id = ${s.cardId} AND x.direction = 'vi_de')`;
    fresh = await db
      .select({ state: s, card: c })
      .from(s)
      .innerJoin(c, eq(s.cardId, c.id))
      .where(
        and(
          isNull(s.introducedOn),
          deckCond,
          or(eq(s.direction, "vi_de"), sql`${sibling} < ${today}::date`),
        ),
      )
      .orderBy(asc(c.deckId), asc(c.position), asc(s.direction))
      .limit(budget);
  }

  return [...due, ...fresh].map(({ state, card }) => ({
    card: toCardDto(card),
    direction: state.direction as Direction,
    state: {
      intervalDays: state.intervalDays,
      ease: state.ease,
      reps: state.reps,
      lapses: state.lapses,
      isNew: state.introducedOn === null,
    },
  }));
}

export async function review(
  cardId: string,
  direction: Direction,
  rating: Rating,
  today: string,
): Promise<{ intervalDays: number; due: string } | null> {
  return db.transaction(async (tx) => {
    const s = schema.cardStates;
    const found = await tx
      .select()
      .from(s)
      .where(and(eq(s.cardId, cardId), eq(s.direction, direction)))
      .for("update");
    const cur = found[0];
    if (!cur) return null;
    const next = schedule(cur, rating);
    const rows = await tx
      .update(s)
      .set({
        intervalDays: next.intervalDays,
        ease: next.ease,
        reps: next.reps,
        lapses: next.lapses,
        due: sql`${today}::date + ${next.intervalDays}::int`,
        introducedOn: cur.introducedOn ?? today,
        lastReviewedAt: new Date(),
      })
      .where(and(eq(s.cardId, cardId), eq(s.direction, direction)))
      .returning({ due: s.due });
    await tx.insert(schema.cardReviews).values({
      cardId,
      direction,
      rating,
      intervalBefore: cur.intervalDays,
      intervalAfter: next.intervalDays,
    });
    return { intervalDays: next.intervalDays, due: rows[0].due! };
  });
}

export async function getStats(today: string): Promise<StudyStats> {
  const [dueRows, newToday, freshRows, reviewedRows, dayRows] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.cardStates)
      .where(and(isNotNull(schema.cardStates.introducedOn), lte(schema.cardStates.due, today))),
    introducedToday(today),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.cardStates)
      .where(isNull(schema.cardStates.introducedOn)),
    db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM card_reviews
      WHERE (reviewed_at AT TIME ZONE 'Europe/Zurich')::date = ${today}::date
    `),
    db.execute<{ day: string }>(sql`
      SELECT DISTINCT to_char((reviewed_at AT TIME ZONE 'Europe/Zurich')::date, 'YYYY-MM-DD') AS day
      FROM card_reviews
      WHERE reviewed_at > now() - interval '400 days'
      ORDER BY day DESC
    `),
  ]);

  // Serie: aufeinanderfolgende Lerntage bis heute (oder bis gestern,
  // solange heute noch nicht gelernt wurde).
  const days = new Set([...dayRows].map((r) => r.day));
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00Z`);
  if (!days.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    date: today,
    due: dueRows[0]?.n ?? 0,
    newToday: Math.min(Math.max(0, NEW_PER_DAY - newToday), freshRows[0]?.n ?? 0),
    newLimit: NEW_PER_DAY,
    reviewedToday: [...reviewedRows][0]?.n ?? 0,
    streak,
  };
}
