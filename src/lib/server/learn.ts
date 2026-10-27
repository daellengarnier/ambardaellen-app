import { and, asc, eq, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client";
import type { CardDto, CardType, ChapterInfo, ChapterToday, DeckDto, StudyItem, StudyStats } from "../life";
import { directionsFor, schedule, type Direction, type Rating } from "../srs";

// ─── Einstellungen ──────────────────────────────────────────

export type StudySettings = {
  /** Neue Lernrichtungen pro Tag, über alle Decks. */
  newPerDay: number;
  /** Tagesziel: so viele Karten (neu und Wiederholung) pro Tag. */
  dailyGoal: number;
  /** Erinnerung per Push, wenn das Tagesziel noch offen ist. */
  reminderEnabled: boolean;
  /** Uhrzeit der Erinnerung in Zürich, "HH:MM". */
  reminderTime: string;
};

export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  newPerDay: 15,
  dailyGoal: 30,
  reminderEnabled: false,
  reminderTime: "19:00",
};

export const StudySettingsSchema = z.object({
  newPerDay: z.number().int().min(0).max(200),
  dailyGoal: z.number().int().min(1).max(1000),
  reminderEnabled: z.boolean(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Zeit als HH:MM"),
});

export async function getStudySettings(): Promise<StudySettings> {
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.key, "study")).limit(1);
  return { ...DEFAULT_STUDY_SETTINGS, ...((rows[0]?.value as Partial<StudySettings>) ?? {}) };
}

export async function saveStudySettings(patch: Partial<StudySettings>): Promise<StudySettings> {
  const next = StudySettingsSchema.parse({ ...(await getStudySettings()), ...patch });
  await db
    .insert(schema.settings)
    .values({ key: "study", value: next })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: next, updatedAt: new Date() } });
  return next;
}

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
    position: z.number().int().optional(),
  }),
  cards: z
    .array(
      z.object({
        type: z.enum(["vocab", "grammar", "phrase", "sentence"]),
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

/**
 * Rohformat aus Kursexporten: { kurs, karten: [{ lektion, deck,
 * vorderseite, rueckseite, zusatz }] }. "zusatz" mit "EN:" = Vokabel,
 * mit "Struktur:" = Satz mit Tipp. Ergibt ein Deck pro Lektion.
 */
export const RawImportSchema = z.object({
  kurs: z.string().trim().min(1).max(200),
  karten: z
    .array(
      z.object({
        lektion: z.number().int().min(0).max(999),
        deck: z.string().trim().min(1).max(200),
        vorderseite: z.string().trim().min(1).max(500),
        rueckseite: z.string().trim().min(1).max(2000),
        zusatz: z.string().trim().max(2000).optional(),
      }),
    )
    .min(1)
    .max(5000),
});

export function convertRaw(raw: z.infer<typeof RawImportSchema>): DeckImport[] {
  const level = /level\s*0*(\d+)/i.exec(raw.kurs)?.[1];
  const prefix = /svff/i.test(raw.kurs) && level
    ? `svff-l${level}`
    : raw.kurs.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const decks = new Map<number, DeckImport>();
  for (const k of raw.karten) {
    let d = decks.get(k.lektion);
    if (!d) {
      d = {
        deck: {
          id: `${prefix}-b${k.lektion}`,
          title: k.deck.replace(/^Bài 0?(\d+)\s*[–-]\s*/, "Bài $1: "),
          course: raw.kurs.replace(/\s+[–-]\s+/g, ", "),
          position: k.lektion,
        },
        cards: [],
      };
      decks.set(k.lektion, d);
    }
    const z = k.zusatz ?? "";
    if (/^Struktur:/i.test(z)) {
      d.cards.push({ type: "sentence", front: k.vorderseite, back_de: k.rueckseite, note: z.replace(/^Struktur:\s*/i, "") });
    } else {
      d.cards.push({
        type: "vocab",
        front: k.vorderseite,
        back_de: k.rueckseite,
        ...(/^EN:/i.test(z) ? { back_en: z.replace(/^EN:\s*/i, "") } : { note: z }),
      });
    }
  }
  // Wörter vor Sätzen, damit die Sätze die Wörter schon voraussetzen können.
  for (const d of decks.values()) {
    d.cards.sort((a, b) => Number(a.type === "sentence") - Number(b.type === "sentence"));
  }
  return [...decks.values()].sort((a, b) => (a.deck.position ?? 0) - (b.deck.position ?? 0));
}

/** "thơm / dứa" und "dứa / thơm" sind dieselbe Vokabel. */
function altKey(front: string): string {
  return front
    .split("/")
    .map((p) => p.trim().toLowerCase())
    .sort()
    .join("|");
}

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
    ORDER BY d.position, d.created_at, d.id
  `);
  return [...rows];
}

/**
 * Deck anlegen oder aktualisieren. Lernstand bestehender Karten bleibt.
 * Felder, die beim Import fehlen, bleiben wie sie sind. Doppelte werden
 * erkannt: Vokabeln mit vertauschten Varianten ("a / b"), und Sätze, die
 * schon als Satzkarte (phrase) im Deck sind.
 */
export async function importDeck(
  input: DeckImport,
): Promise<{ deck: string; created: number; updated: number; skipped: number }> {
  const d = input.deck;
  return db.transaction(async (tx) => {
    const deckValues = {
      title: d.title,
      ...(d.course !== undefined && { course: d.course }),
      ...(d.level !== undefined && { level: d.level }),
      ...(d.topic !== undefined && { topic: d.topic }),
      ...(d.source !== undefined && { source: d.source }),
      ...(d.position !== undefined && { position: d.position }),
    };
    await tx
      .insert(schema.decks)
      .values({ id: d.id, language: d.language || "vi", ...deckValues })
      .onConflictDoUpdate({ target: schema.decks.id, set: { ...deckValues, updatedAt: new Date() } });

    const existing = await tx
      .select({ type: schema.cards.type, front: schema.cards.front, backVi: schema.cards.backVi, position: schema.cards.position })
      .from(schema.cards)
      .where(eq(schema.cards.deckId, d.id));
    const known = new Map(existing.map((c) => [`${c.type}\u0000${c.front}`, c.front]));
    const vocabByAlt = new Map(existing.filter((c) => c.type === "vocab").map((c) => [altKey(c.front), c.front]));
    const phraseVi = new Set(existing.filter((c) => c.type === "phrase").map((c) => c.backVi.trim()));
    let nextPos = existing.reduce((m, c) => Math.max(m, c.position + 1), 0);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const c of input.cards) {
      if (c.type === "sentence" && phraseVi.has(c.front.trim())) {
        skipped++;
        continue;
      }
      const front = (c.type === "vocab" && vocabByAlt.get(altKey(c.front))) || c.front;
      const isKnown = known.has(`${c.type}\u0000${front}`);
      const values = {
        ...(c.back_de !== undefined && { backDe: c.back_de }),
        ...(c.back_en !== undefined && { backEn: c.back_en }),
        ...(c.back_vi !== undefined && { backVi: c.back_vi }),
        ...(c.pos !== undefined && { pos: c.pos }),
        ...(c.category !== undefined && { category: c.category }),
        ...(c.example_vi !== undefined && { exampleVi: c.example_vi }),
        ...(c.example_de !== undefined && { exampleDe: c.example_de }),
        ...(c.note !== undefined && { note: c.note }),
      };
      const rows = await tx
        .insert(schema.cards)
        .values({ deckId: d.id, type: c.type, front, position: nextPos, ...values })
        .onConflictDoUpdate({
          target: [schema.cards.deckId, schema.cards.type, schema.cards.front],
          set: { ...values, updatedAt: new Date() },
        })
        .returning({ id: schema.cards.id });
      if (isKnown) {
        updated++;
      } else {
        created++;
        nextPos++;
        known.set(`${c.type}\u0000${front}`, front);
      }
      await tx
        .insert(schema.cardStates)
        .values(directionsFor(c.type).map((direction) => ({ cardId: rows[0].id, direction })))
        .onConflictDoNothing();
    }
    return { deck: d.id, created, updated, skipped };
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

export type StudyMode = "mix" | Direction;

/**
 * Was heute zu lernen ist: fällige Wiederholungen, dann neue Karten bis
 * zum Tageslimit (plus `extra`, wenn Alain mehr will). Im gemischten
 * Modus kommt die Gegenrichtung (DE→VI) einer Karte erst an einem
 * späteren Tag als VI→DE. Wer gezielt DE→VI übt, bekommt sie sofort.
 */
export async function getQueue(
  today: string,
  opts: { deckId?: string; mode?: StudyMode; extra?: number } = {},
): Promise<StudyItem[]> {
  const s = schema.cardStates;
  const c = schema.cards;
  const mode = opts.mode ?? "mix";
  const deckCond = opts.deckId ? eq(c.deckId, opts.deckId) : undefined;
  const dirCond = mode === "mix" ? undefined : eq(s.direction, mode);

  const due = await db
    .select({ state: s, card: c })
    .from(s)
    .innerJoin(c, eq(s.cardId, c.id))
    .where(and(isNotNull(s.introducedOn), lte(s.due, today), deckCond, dirCond))
    .orderBy(asc(s.due), asc(c.position))
    .limit(500);

  const { newPerDay } = await getStudySettings();
  const budget = Math.max(0, newPerDay - (await introducedToday(today))) + Math.max(0, opts.extra ?? 0);
  let fresh: typeof due = [];
  if (budget > 0) {
    const sibling = sql`(SELECT introduced_on FROM card_states x WHERE x.card_id = ${s.cardId} AND x.direction = 'vi_de')`;
    fresh = await db
      .select({ state: s, card: c })
      .from(s)
      .innerJoin(c, eq(s.cardId, c.id))
      .innerJoin(schema.decks, eq(c.deckId, schema.decks.id))
      .where(
        and(
          isNull(s.introducedOn),
          deckCond,
          dirCond,
          mode === "mix" ? or(eq(s.direction, "vi_de"), sql`${sibling} < ${today}::date`) : undefined,
        ),
      )
      .orderBy(asc(schema.decks.position), asc(c.deckId), asc(c.position), asc(s.direction))
      .limit(Math.min(budget, 500));
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
  const [settings, dueRows, newToday, freshRows, reviewedRows, dayRows] = await Promise.all([
    getStudySettings(),
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
    newToday: Math.min(Math.max(0, settings.newPerDay - newToday), freshRows[0]?.n ?? 0),
    newLimit: settings.newPerDay,
    fresh: freshRows[0]?.n ?? 0,
    dailyGoal: settings.dailyGoal,
    reviewedToday: [...reviewedRows][0]?.n ?? 0,
    streak,
  };
}

// ─── Kapitel des Tages ──────────────────────────────────────
// Jeden Tag ein ganzes Kapitel (Deck) einmal durcharbeiten. Alain wählt,
// welches. Erledigt ist es, wenn jede Karte des Kapitels heute bewertet
// wurde. Die Bewertungen fliessen wie sonst in die Wiederholung ein.

async function listChapters(): Promise<ChapterInfo[]> {
  const rows = await db.execute<{ id: string; title: string; position: number; cards: number; last_completed: string | null }>(sql`
    WITH per_day AS (
      SELECT c.deck_id, (r.reviewed_at AT TIME ZONE 'Europe/Zurich')::date AS day, count(DISTINCT r.card_id) AS n
      FROM card_reviews r JOIN cards c ON c.id = r.card_id
      GROUP BY 1, 2
    ), totals AS (
      SELECT deck_id, count(*) AS total FROM cards GROUP BY 1
    )
    SELECT d.id, d.title, d.position, t.total::int AS cards,
      to_char(max(p.day) FILTER (WHERE p.n >= t.total), 'YYYY-MM-DD') AS last_completed
    FROM decks d
    JOIN totals t ON t.deck_id = d.id
    LEFT JOIN per_day p ON p.deck_id = d.id
    GROUP BY d.id, d.title, d.position, t.total
    ORDER BY d.position, d.id
  `);
  return [...rows].map((r) => ({
    id: r.id,
    title: r.title,
    position: r.position,
    cards: r.cards,
    lastCompleted: r.last_completed,
  }));
}

async function chosenChapter(today: string): Promise<string | null> {
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.key, "study.today")).limit(1);
  const v = rows[0]?.value as { date?: string; deckId?: string } | undefined;
  return v?.date === today && v.deckId ? v.deckId : null;
}

async function reviewedTodayInDeck(today: string, deckId: string): Promise<Set<string>> {
  const rows = await db.execute<{ card_id: string }>(sql`
    SELECT DISTINCT r.card_id FROM card_reviews r JOIN cards c ON c.id = r.card_id
    WHERE c.deck_id = ${deckId}
      AND (r.reviewed_at AT TIME ZONE 'Europe/Zurich')::date = ${today}::date
  `);
  return new Set([...rows].map((r) => r.card_id));
}

export async function getChapterToday(today: string): Promise<ChapterToday> {
  const [chapters, chosen] = await Promise.all([listChapters(), chosenChapter(today)]);
  const chapter = chapters.find((c) => c.id === chosen) ?? null;
  const done = chapter ? (await reviewedTodayInDeck(today, chapter.id)).size : 0;
  const total = chapter?.cards ?? 0;
  const never = chapters.find((c) => !c.lastCompleted);
  const oldest = [...chapters].sort((a, b) => (a.lastCompleted ?? "").localeCompare(b.lastCompleted ?? ""))[0];
  return {
    date: today,
    chapter,
    done: Math.min(done, total),
    total,
    completed: chapter !== null && done >= total,
    suggestion: (never ?? oldest)?.id ?? null,
    chapters,
  };
}

export async function setChapterToday(today: string, deckId: string): Promise<boolean> {
  const exists = await db.select({ id: schema.decks.id }).from(schema.decks).where(eq(schema.decks.id, deckId)).limit(1);
  if (!exists[0]) return false;
  const value = { date: today, deckId };
  await db
    .insert(schema.settings)
    .values({ key: "study.today", value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  return true;
}

/**
 * Die heute noch offenen Karten des gewählten Kapitels, in Kapitel-
 * reihenfolge. Pro Karte eine Richtung: fest gewählt, oder gemischt die
 * schwächere der beiden (kürzerer Abstand). Grammatik immer VI→DE.
 */
export async function getChapterQueue(today: string, mode: StudyMode = "mix"): Promise<StudyItem[]> {
  const deckId = await chosenChapter(today);
  if (!deckId) return [];
  const reviewed = await reviewedTodayInDeck(today, deckId);
  const rows = await db
    .select({ state: schema.cardStates, card: schema.cards })
    .from(schema.cardStates)
    .innerJoin(schema.cards, eq(schema.cardStates.cardId, schema.cards.id))
    .where(eq(schema.cards.deckId, deckId))
    .orderBy(asc(schema.cards.position), asc(schema.cardStates.direction));

  const byCard = new Map<string, { card: schema.CardRow; states: schema.CardStateRow[] }>();
  for (const r of rows) {
    if (reviewed.has(r.card.id)) continue;
    const e = byCard.get(r.card.id) ?? { card: r.card, states: [] };
    e.states.push(r.state);
    byCard.set(r.card.id, e);
  }

  return [...byCard.values()].map(({ card, states }, i) => {
    const strength = (s: schema.CardStateRow) => (s.introducedOn === null ? -1 : s.intervalDays);
    let state =
      mode === "mix"
        ? [...states].sort((a, b) => strength(a) - strength(b) || (i % 2 === 0 ? 1 : -1) * a.direction.localeCompare(b.direction))[0]
        : (states.find((s) => s.direction === mode) ?? states[0]);
    if (!state) state = states[0];
    return {
      card: toCardDto(card),
      direction: state.direction as Direction,
      state: {
        intervalDays: state.intervalDays,
        ease: state.ease,
        reps: state.reps,
        lapses: state.lapses,
        isNew: state.introducedOn === null,
      },
    };
  });
}
