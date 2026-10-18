// Gemeinsame Typen der Life-App, genutzt von Server (API) und Client.

import type { ISODate, Priority } from "./types";

export type World = "spinnerei" | "privat";
export type Actor = "alain" | "jarvis";
export type TodoStatus = "offen" | "erledigt" | "verworfen";

export type AreaDto = {
  key: string;
  name: string;
  world: World;
  sort: number;
};

export type TodoDto = {
  id: string;
  text: string;
  note: string;
  area: string | null;
  due: ISODate | null;
  prio: Priority;
  status: TodoStatus;
  plannedFor: ISODate | null;
  doneAt: string | null;
  tags: string[];
  source: string;
  sourceRef: string | null;
  createdBy: Actor;
  createdAt: string;
  updatedAt: string;
};

export type InboxDto = {
  id: string;
  text: string;
  source: string;
  createdBy: Actor;
  createdAt: string;
  processedAt: string | null;
  todoId: string | null;
};

export type DayPlanDto = {
  date: ISODate;
  note: string;
  updatedBy: Actor;
  updatedAt: string;
};

export type TodayDto = {
  date: ISODate;
  plan: DayPlanDto | null;
  /** Offene Todos mit plannedFor = date. */
  planned: TodoDto[];
  /** Offene Todos mit Frist vor date, nicht für heute geplant. */
  overdue: TodoDto[];
  /** Offene Todos mit Frist = date, nicht für heute geplant. */
  dueToday: TodoDto[];
  /** Heute erledigte Todos. */
  doneToday: TodoDto[];
  inboxOpen: number;
};

export type TodoInput = {
  text: string;
  note?: string;
  area?: string | null;
  due?: ISODate | null;
  prio?: Priority;
  plannedFor?: ISODate | null;
  tags?: string[];
  source?: string;
  sourceRef?: string | null;
};

export type TodoPatch = Partial<TodoInput> & { status?: TodoStatus };

export const TODO_STATUSES: TodoStatus[] = ["offen", "erledigt", "verworfen"];

export const WORLD_LABEL: Record<World, string> = {
  spinnerei: "Spinnerei",
  privat: "Privat",
};

/** Heutiges Datum in Zürich, unabhängig von der Zeitzone des Servers. */
export function todayZurich(now: Date = new Date()): ISODate {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
