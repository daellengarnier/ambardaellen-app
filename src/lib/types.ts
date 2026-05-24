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

export type PacklistItem = {
  id: string;
  text: string;
  packed: boolean;
  scope: Scope; // gemeinsam packen vs persönlich (eigene Sachen)
  by: UserId; // wer hat das Item hinzugefügt
  category: string; // "Dokumente", "Kleidung", "Hygiene", ... oder eigen
  assignedTo?: UserId; // optional: wer kümmert sich um Besorgen/Einpacken
};

export type PacklistTemplateItem = {
  id: string;
  text: string;
  scope: Scope; // Default-Scope wenn die Vorlage angewendet wird
  category: string;
};

export type PreTripItem = {
  id: string;
  text: string;
  done: boolean;
  by: UserId;
  scope: Scope;
};

export type TripSegmentKind = "flight" | "train" | "bus" | "car" | "ferry" | "other";

export type TripSegment = {
  id: string;
  kind: TripSegmentKind;
  from: string; // "Berlin BER"
  to: string; // "Wien VIE"
  depart: string; // ISO datetime "2024-06-07T08:30" (datetime-local)
  arrive: string; // ISO datetime
  ref: string; // Flugnummer, Buchungs-Nr.
  note: string;
};

export const PACK_CATEGORIES_DEFAULT = [
  "Dokumente",
  "Kleidung",
  "Schuhe",
  "Hygiene",
  "Elektronik",
  "Outdoor",
  "Snacks",
  "Sonstiges",
] as const;

export type PacklistTemplate = {
  id: string;
  name: string;
  by: UserId;
  scope: Scope; // geteilt = beide nutzen sie, sonst nur für den Eigentümer
  items: PacklistTemplateItem[];
};

export type Activity = {
  id: string;
  title: string;
  date: ISODate | "";
  dateEnd: ISODate | ""; // optional — bei mehrtägigen Trips
  time: HHMM | "";
  place: string;
  status: ActivityStatus;
  by: UserId;
  scope: Scope;
  note: string;
  icon: ActivityIconKind;
  tags: string[];
  packlist: PacklistItem[];
  segments: TripSegment[];
  preTripShopping: PreTripItem[];
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
  tags: string[];
};

// Tag-Vorschläge für Bereiche / Kontexte
export const TAG_SUGGESTIONS = [
  "arbeit",
  "haushalt",
  "familie",
  "freunde",
  "gesundheit",
  "finanzen",
  "hobby",
  "spinnerei",
  "reise",
  "lernen",
] as const;

export type Term = "kurz" | "mittel" | "lang";

export type GoalStep = {
  id: string;
  text: string;
  done: boolean;
};

export type GoalKind = "einmalig" | "wiederkehrend";
export type Period = "tag" | "woche" | "monat";

export type Goal = {
  id: string;
  title: string;
  by: UserId;
  scope: Scope;
  kind: GoalKind;

  // Einheit + Zielwert. Bei „einmalig" der Gesamtwert (z. B. 5000€),
  // bei „wiederkehrend" der Sollwert pro Periode (z. B. 3 Sport-Sessions
  // pro Woche). Default-Einheit "mal" für Habits.
  target: number;
  unit: string;

  // Nur „einmalig":
  term?: Term;
  current?: number;
  steps?: GoalStep[];

  // Nur „wiederkehrend":
  period?: Period;
  /** ISO-Datum → aufaddierter Wert an diesem Tag. */
  log?: Record<ISODate, number>;
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
