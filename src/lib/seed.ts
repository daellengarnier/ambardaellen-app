import type {
  Activity,
  Cycle,
  Goal,
  PacklistTemplate,
  ShoppingItem,
  Todo,
} from "./types";

// ------------------------------------------------------------------
// Leere Seeds — die App startet vom leeren Stand.
// Alle Daten werden vom User selber eingetragen.
// ------------------------------------------------------------------

export const SEED_ACTIVITIES: Activity[] = [];

export const SEED_SHOPPING: ShoppingItem[] = [];

export const SEED_TODOS: Todo[] = [];

export const SEED_GOALS: Goal[] = [];

export const SEED_PACKLIST_TEMPLATES: PacklistTemplate[] = [];

export const SEED_CYCLE: Cycle = {
  owner: "A",
  scope: "geteilt",
  avgCycle: 28,
  avgPeriod: 5,
  periodStarts: [],
  entries: {},
};
