import type { Activity, ShoppingItem, Todo, UserId } from "./types";
import { todayISO, diffDays } from "./date";

export type FeedKind =
  | "shopping_added"
  | "todo_added"
  | "activity_today"
  | "todo_due_today"
  | "todo_overdue"
  | "trip_upcoming";

export type FeedEvent = {
  id: string;
  kind: FeedKind;
  at?: number; // ms-Timestamp wenn vorhanden
  by?: UserId;
  title: string;
  detail?: string;
};

export type FeedSections = {
  /** Items vom anderen User, hinzugefügt seit dem letzten Öffnen. */
  neu: FeedEvent[];
  /** Was heute auf der Tagesordnung steht. */
  heute: FeedEvent[];
  /** Was überfällig ist. */
  ueberfaellig: FeedEvent[];
  /** Trips in den nächsten 14 Tagen mit Packlisten-Stand. */
  trips: FeedEvent[];
};

type Input = {
  activities: Activity[];
  shopping: ShoppingItem[];
  todos: Todo[];
  currentUser: UserId;
  lastSeen: number;
};

export function buildFeed(input: Input): FeedSections {
  const today = todayISO();

  // NEU vom anderen User
  const neu: FeedEvent[] = [];
  input.shopping.forEach((s) => {
    if (s.done) return;
    if (s.by === input.currentUser) return;
    if (!s.addedAt || s.addedAt <= input.lastSeen) return;
    // nur Items die für mich sichtbar sind (geteilt oder mein scope)
    if (s.scope !== "geteilt" && s.scope !== input.currentUser) return;
    neu.push({
      id: `shop-${s.id}`,
      kind: "shopping_added",
      at: s.addedAt,
      by: s.by,
      title: s.text,
      detail: s.spinnerei ? "Spinnerei" : "Einkauf",
    });
  });
  input.todos.forEach((t) => {
    if (t.done) return;
    if (t.by === input.currentUser) return;
    if (!t.addedAt || t.addedAt <= input.lastSeen) return;
    if (t.scope !== "geteilt" && t.scope !== input.currentUser) return;
    neu.push({
      id: `todo-${t.id}`,
      kind: "todo_added",
      at: t.addedAt,
      by: t.by,
      title: t.text,
      detail: t.due ? `fällig ${t.due}` : "Todo",
    });
  });
  neu.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

  // HEUTE
  const heute: FeedEvent[] = [];
  input.activities.forEach((a) => {
    if (a.status !== "geplant") return;
    if (!a.date) return;
    if (a.scope !== "geteilt" && a.scope !== input.currentUser) return;
    const d = diffDays(a.date, today);
    if (d === 0) {
      heute.push({
        id: `act-${a.id}`,
        kind: "activity_today",
        by: a.by,
        title: a.title,
        detail: a.time ? `heute · ${a.time}` : "heute",
      });
    }
  });
  input.todos.forEach((t) => {
    if (t.done || !t.due) return;
    if (t.scope !== "geteilt" && t.scope !== input.currentUser) return;
    const d = diffDays(t.due, today);
    if (d === 0) {
      heute.push({
        id: `todo-due-${t.id}`,
        kind: "todo_due_today",
        by: t.by,
        title: t.text,
        detail: "heute fällig",
      });
    }
  });

  // ÜBERFÄLLIG
  const ueberfaellig: FeedEvent[] = [];
  input.todos.forEach((t) => {
    if (t.done || !t.due) return;
    if (t.scope !== "geteilt" && t.scope !== input.currentUser) return;
    const d = diffDays(t.due, today);
    if (d < 0) {
      ueberfaellig.push({
        id: `todo-over-${t.id}`,
        kind: "todo_overdue",
        by: t.by,
        title: t.text,
        detail: `${Math.abs(d)} T. überfällig`,
      });
    }
  });
  input.activities.forEach((a) => {
    if (a.status !== "geplant" || !a.date) return;
    if (a.scope !== "geteilt" && a.scope !== input.currentUser) return;
    const d = diffDays(a.date, today);
    if (d < 0) {
      ueberfaellig.push({
        id: `act-over-${a.id}`,
        kind: "todo_overdue",
        by: a.by,
        title: a.title,
        detail: `${Math.abs(d)} T. vergangen`,
      });
    }
  });
  ueberfaellig.sort((a, b) => a.title.localeCompare(b.title));

  // ANSTEHENDE TRIPS (mit Packliste)
  const trips: FeedEvent[] = [];
  input.activities.forEach((a) => {
    if (a.status !== "geplant" || !a.date) return;
    if (a.scope !== "geteilt" && a.scope !== input.currentUser) return;
    if (a.packlist.length === 0) return;
    const d = diffDays(a.date, today);
    if (d >= 0 && d <= 14) {
      const packed = a.packlist.filter((p) => p.packed).length;
      trips.push({
        id: `trip-${a.id}`,
        kind: "trip_upcoming",
        by: a.by,
        title: a.title,
        detail: `in ${d} T. · Packliste ${packed}/${a.packlist.length}`,
      });
    }
  });
  trips.sort((a, b) => a.title.localeCompare(b.title));

  return { neu, heute, ueberfaellig, trips };
}

export function feedTotalCount(f: FeedSections): number {
  return f.neu.length + f.heute.length + f.ueberfaellig.length;
}
