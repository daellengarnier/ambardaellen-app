export type UserId = "A" | "D";
export type Scope = "geteilt" | UserId;
export type ISODate = string; // YYYY-MM-DD
export type HHMM = string; // HH:MM

export type User = {
  id: UserId;
  name: string;
  color: string;
  soft: string;
};

export type ActivityStatus = "geplant" | "idee" | "erledigt";
export type ActivityIconKind =
  | "coffee"
  | "leaf"
  | "heart"
  | "sparkle"
  | "book"
  | "house";

export type Activity = {
  id: string;
  title: string;
  date: ISODate | "";
  time: HHMM | "";
  place: string;
  status: ActivityStatus;
  by: UserId;
  scope: Scope;
  note: string;
  icon: ActivityIconKind;
};

export type ShoppingItem = {
  id: string;
  text: string;
  done: boolean;
  by: UserId;
  scope: Scope;
  spinnerei: boolean;
  qty: string;
  category: "lebensmittel" | "drogerie" | "sonstiges";
  addedAt: number; // ms since epoch
};

export type Priority = "hoch" | "normal" | "tief";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  due: ISODate | "";
  prio: Priority;
  by: UserId;
  scope: Scope;
  addedAt: number;
  note: string;
};

export type Term = "kurz" | "mittel" | "lang";

export type GoalStep = {
  id: string;
  text: string;
  done: boolean;
};

export type Goal = {
  id: string;
  title: string;
  term: Term;
  target: number;
  current: number;
  unit: string;
  by: UserId;
  scope: Scope;
  steps: GoalStep[];
};

export type Mood =
  | "weich"
  | "okay"
  | "klar"
  | "fokussiert"
  | "energisch"
  | "dunkel"
  | "aufgewühlt";
export type FlowLevel = 0 | 1 | 2 | 3;
export type Symptom =
  | "krämpfe"
  | "müde"
  | "kopfweh"
  | "blähbauch"
  | "brustempfindlich"
  | "libido"
  | "akne"
  | "schlaflos"
  | "rückenschmerz"
  | "weinerlich";

export type CycleDayEntry = {
  flow?: FlowLevel;
  mood?: Mood;
  energy?: 1 | 2 | 3 | 4 | 5;
  symptoms?: Symptom[];
  note?: string;
};

export type Cycle = {
  owner: UserId;
  scope: Scope;
  avgCycle: number;
  avgPeriod: number;
  periodStarts: ISODate[];
  entries: Record<ISODate, CycleDayEntry>;
};

export const USERS: Record<UserId, User> = {
  A: { id: "A", name: "Ambar", color: "#C77052", soft: "#F2D9CB" },
  D: { id: "D", name: "Dällen", color: "#7E9A79", soft: "#D7E2D4" },
};
