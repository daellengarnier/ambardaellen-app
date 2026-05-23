import type {
  Activity,
  Cycle,
  Goal,
  ShoppingItem,
  Todo,
} from "./types";
import { addDays, todayISO } from "./date";

const T = todayISO();

export const SEED_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    title: "Frühstück bei Tati",
    date: T,
    time: "09:30",
    place: "Café Tati, Kreuzberg",
    status: "geplant",
    by: "A",
    scope: "geteilt",
    note: "Sonntags-Tradition. Pancakes teilen.",
    icon: "coffee",
  },
  {
    id: "act-2",
    title: "Markt am Maybachufer",
    date: addDays(T, 2),
    time: "11:00",
    place: "Maybachufer",
    status: "geplant",
    by: "D",
    scope: "geteilt",
    note: "Gemüse für die Woche & Blumen.",
    icon: "leaf",
  },
  {
    id: "act-3",
    title: "Kino — La Chimera",
    date: addDays(T, 5),
    time: "20:15",
    place: "Wolf Kino",
    status: "geplant",
    by: "A",
    scope: "geteilt",
    note: "",
    icon: "sparkle",
  },
  {
    id: "act-4",
    title: "Wochenendtrip Wien",
    date: "",
    time: "",
    place: "Wien",
    status: "idee",
    by: "D",
    scope: "geteilt",
    note: "Lange Wochenende, mit dem Zug.",
    icon: "heart",
  },
  {
    id: "act-5",
    title: "Bücher tauschen im Cargo",
    date: "",
    time: "",
    place: "Cargo Books",
    status: "idee",
    by: "A",
    scope: "geteilt",
    note: "",
    icon: "book",
  },
  {
    id: "act-6",
    title: "Telefonat mit Lukas",
    date: addDays(T, 1),
    time: "17:00",
    place: "",
    status: "geplant",
    by: "D",
    scope: "D",
    note: "Geburtstagsplanung.",
    icon: "house",
  },
];

const now = Date.now();

export const SEED_SHOPPING: ShoppingItem[] = [
  { id: "s-1", text: "Tomaten (San Marzano)", done: false, by: "A", scope: "geteilt", spinnerei: false, qty: "1 Dose", category: "lebensmittel", addedAt: now - 1000 * 60 * 60 * 2 },
  { id: "s-2", text: "Sauerteigbrot", done: false, by: "D", scope: "geteilt", spinnerei: false, qty: "", category: "lebensmittel", addedAt: now - 1000 * 60 * 60 * 5 },
  { id: "s-3", text: "Olivenöl", done: false, by: "A", scope: "geteilt", spinnerei: false, qty: "groß", category: "lebensmittel", addedAt: now - 1000 * 60 * 60 * 26 },
  { id: "s-4", text: "Zahnpasta", done: false, by: "A", scope: "geteilt", spinnerei: false, qty: "", category: "drogerie", addedAt: now - 1000 * 60 * 60 * 48 },
  { id: "s-5", text: "Waschmittel Sensitiv", done: false, by: "D", scope: "geteilt", spinnerei: false, qty: "", category: "drogerie", addedAt: now - 1000 * 60 * 60 * 24 },
  { id: "s-6", text: "Notizbuch Leuchtturm", done: false, by: "A", scope: "A", spinnerei: false, qty: "A5 dotted", category: "sonstiges", addedAt: now - 1000 * 60 * 60 * 3 },
  { id: "s-7", text: "Schmaler schwarzer Pulli", done: false, by: "D", scope: "D", spinnerei: true, qty: "", category: "sonstiges", addedAt: now - 1000 * 60 * 60 * 72 },
  { id: "s-8", text: "Plattenspieler", done: false, by: "A", scope: "geteilt", spinnerei: true, qty: "", category: "sonstiges", addedAt: now - 1000 * 60 * 60 * 120 },
  { id: "s-9", text: "Kaffee gemahlen", done: true, by: "D", scope: "geteilt", spinnerei: false, qty: "", category: "lebensmittel", addedAt: now - 1000 * 60 * 60 * 30 },
];

export const SEED_TODOS: Todo[] = [
  { id: "t-1", text: "Steuererklärung abschicken", done: false, due: addDays(T, -2), prio: "hoch", by: "A", scope: "A", addedAt: now - 1000 * 60 * 60 * 96, note: "" },
  { id: "t-2", text: "Müll rausbringen", done: false, due: T, prio: "normal", by: "D", scope: "geteilt", addedAt: now - 1000 * 60 * 60 * 8, note: "" },
  { id: "t-3", text: "Anruf Hausverwaltung", done: false, due: addDays(T, 1), prio: "normal", by: "A", scope: "geteilt", addedAt: now - 1000 * 60 * 60 * 12, note: "wegen Heizung im Bad" },
  { id: "t-4", text: "Geschenk für Mama", done: false, due: addDays(T, 4), prio: "hoch", by: "D", scope: "D", addedAt: now - 1000 * 60 * 60 * 24, note: "" },
  { id: "t-5", text: "Bibliothek: Bücher zurück", done: false, due: addDays(T, 6), prio: "tief", by: "A", scope: "geteilt", addedAt: now - 1000 * 60 * 60 * 60, note: "" },
  { id: "t-6", text: "Yoga-Termin verschieben", done: false, due: "", prio: "tief", by: "A", scope: "A", addedAt: now - 1000 * 60 * 60 * 10, note: "" },
  { id: "t-7", text: "Pflanzen gießen", done: true, due: addDays(T, -1), prio: "normal", by: "D", scope: "geteilt", addedAt: now - 1000 * 60 * 60 * 26, note: "" },
];

export const SEED_GOALS: Goal[] = [
  {
    id: "g-1",
    title: "Sparen für Sommerreise Portugal",
    term: "mittel",
    target: 2400,
    current: 1350,
    unit: "€",
    by: "A",
    scope: "geteilt",
    steps: [
      { id: "g1s1", text: "Reiseziele engere Auswahl", done: true },
      { id: "g1s2", text: "Flug-Preise tracken", done: true },
      { id: "g1s3", text: "Unterkunft Lissabon recherchieren", done: false },
      { id: "g1s4", text: "Mietwagen vs. Zug entscheiden", done: false },
    ],
  },
  {
    id: "g-2",
    title: "3× pro Woche laufen",
    term: "kurz",
    target: 12,
    current: 7,
    unit: "Läufe",
    by: "D",
    scope: "D",
    steps: [
      { id: "g2s1", text: "Schuhe wieder rausstellen", done: true },
      { id: "g2s2", text: "Lauf-Playlist machen", done: true },
      { id: "g2s3", text: "Sonntag 10k", done: false },
    ],
  },
  {
    id: "g-3",
    title: "Eigene Wohnung mit Garten",
    term: "lang",
    target: 100,
    current: 18,
    unit: "%",
    by: "A",
    scope: "geteilt",
    steps: [
      { id: "g3s1", text: "Budget-Plan erstellen", done: true },
      { id: "g3s2", text: "Banken vergleichen", done: false },
      { id: "g3s3", text: "Gebiete eingrenzen", done: false },
    ],
  },
  {
    id: "g-4",
    title: "Wöchentlich Italienisch üben",
    term: "kurz",
    target: 20,
    current: 9,
    unit: "Wochen",
    by: "D",
    scope: "geteilt",
    steps: [
      { id: "g4s1", text: "Duolingo täglich", done: true },
      { id: "g4s2", text: "Tandem-Partner finden", done: false },
    ],
  },
];

export const SEED_CYCLE: Cycle = {
  owner: "A",
  scope: "geteilt",
  avgCycle: 29,
  avgPeriod: 5,
  periodStarts: [addDays(T, -42), addDays(T, -13)],
  entries: {
    [addDays(T, -13)]: { flow: 3, mood: "weich", energy: 2, symptoms: ["krämpfe", "müde"], note: "" },
    [addDays(T, -12)]: { flow: 2, mood: "okay", energy: 3, symptoms: ["krämpfe"], note: "" },
    [addDays(T, -11)]: { flow: 1, mood: "klar", energy: 3, symptoms: [], note: "" },
    [addDays(T, -2)]: { mood: "energisch", energy: 5, symptoms: [], note: "lange spaziert" },
    [addDays(T, -1)]: { mood: "fokussiert", energy: 4, symptoms: [], note: "" },
  },
};
