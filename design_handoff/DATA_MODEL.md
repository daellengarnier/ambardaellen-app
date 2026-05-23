# Data Model

TypeScript-Typen für alle Entitäten. Quelle: `SEED_*`-Konstanten in `App.html` (Zeilen ~320–425) + tatsächlicher Component-Code.

---

## Common

```ts
type UserId = "A" | "D";
type Scope  = "geteilt" | UserId;   // "A" oder "D" = "nur dieser User"
type ISODate = string;              // "YYYY-MM-DD"
type HHMM    = string;              // "HH:MM"
```

## User

```ts
type User = {
  id: UserId;
  name: string;       // "Ambar" | "Dällen"
  color: string;      // hex — siehe DESIGN_TOKENS
  soft: string;       // hex (lighter variant)
};
```

Im Prototyp fix definiert (`USERS` in App.html), in der echten App aus Auth/Pairing-Flow geladen.

---

## Activity

```ts
type ActivityStatus = "geplant" | "idee" | "erledigt";

type Activity = {
  id: string;
  title: string;
  date: ISODate | "";          // "" = ohne Datum (besonders bei Ideen)
  time: HHMM | "";
  place: string;
  status: ActivityStatus;
  by: UserId;                  // wer hat's erstellt
  scope: Scope;
  note: string;
  icon: "coffee" | "leaf" | "heart" | "sparkle" | "book" | "house";
};
```

## ShoppingItem

```ts
type ShoppingItem = {
  id: string;
  text: string;
  done: boolean;
  by: UserId;
  scope: Scope;
  spinnerei: boolean;          // true = Wunschliste / Nice-to-have (eigene Sektion + ✦)
  qty: string;                 // freitext: "1 Dose", "groß", "4er", ""
  added: string;               // human-readable: "vor 2 Std", "heute", "vor 5 Tagen"
                               // → in echter App: addedAt: Date + Formatter
};
```

## Todo

```ts
type Priority = "hoch" | "normal" | "tief";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  due: ISODate | "";
  prio: Priority;
  by: UserId;
  scope: Scope;
  when: string;                // "vor 2 Tagen" (= addedAt human-readable)
  note: string;
};
```

## Goal

```ts
type Term = "kurz" | "mittel" | "lang";

type GoalStep = {
  id: string;
  text: string;
  done: boolean;
};

type Goal = {
  id: string;
  title: string;
  term: Term;
  target: number;
  current: number;
  unit: string;                // "€" | "%" | "Stück" | "Läufe" | "" (counts)
  by: UserId;
  scope: Scope;
  steps: GoalStep[];
};
```

Progress-% = `Math.min(100, Math.round((current/target)*100))`.

---

## Cycle

```ts
type Mood     = "weich" | "okay" | "klar" | "fokussiert" | "energisch" | "dunkel" | "aufgewühlt";
type FlowLevel = 0 | 1 | 2 | 3;    // 0=keine, 1=leicht, 2=mittel, 3=stark
type Symptom  =
  | "krämpfe" | "müde" | "kopfweh" | "blähbauch"
  | "brustempfindlich" | "libido" | "akne" | "schlaflos"
  | "rückenschmerz" | "weinerlich";

type CycleDayEntry = {
  flow?: FlowLevel;
  mood?: Mood;
  energy?: 1 | 2 | 3 | 4 | 5;
  symptoms?: Symptom[];
  note?: string;
};

type Cycle = {
  owner: UserId;               // wer trackt? Im Prototyp fix "A"
  scope: Scope;                // "geteilt" → beide sehen, nur owner editiert
  avgCycle: number;            // Tage, default 28
  avgPeriod: number;           // Tage, default 5
  periodStarts: ISODate[];     // chronologisch, letzte = aktuell aktive
  entries: Record<ISODate, CycleDayEntry>;
};
```

### Cycle Analysis (computed)

Funktion `cycleAnalysis(cycle, today)` in App.html ~Z. 488 liefert:

```ts
type CycleAnalysis = {
  day: number;                 // 1-based Zyklustag
  cycLen: number;
  lastStart: ISODate;
  nextPeriod: ISODate;
  ovulationDate: ISODate;
  ovulationDayInCycle: number; // = cycLen - 14
  fertileStart: number;        // = ovulationDayInCycle - 3
  fertileEnd: number;          // = ovulationDayInCycle + 1
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  phase: "menstruation" | "follikel" | "fertil" | "luteal" | "ueberfaellig";
  phaseLabel: string;          // lokalisiert: "Menstruation", "Folliklephase", "Eisprung", "Fruchtbares Fenster", "Lutealphase", "Überfällig (n T.)"
  color: string;               // hex
  isFertile: boolean;
  isOvulation: boolean;
  isPeriod: boolean;
};
```

> Lutealphase ist immer ~14 Tage — Standard für Zyklus-Apps. Bitte als Konstante belassen.

---

## Permissions / Visibility-Logik

Globale Helper in App.html ~Z. 595:

```ts
function visibleTo<T extends { scope?: Scope }>(items: T[], user: UserId): T[] {
  return items.filter(it => !it.scope || it.scope === "geteilt" || it.scope === user);
}

function isPrivate(it: { scope?: Scope }): boolean {
  return !!it.scope && it.scope !== "geteilt";
}
```

**Regel:** Im UI wird **NIE** ein Item mit `scope === "A"` für User `D` gerendert (und umgekehrt). Backend muss das auch durchsetzen (nicht nur UI-Filter).

---

## Seed-Daten

Alle Seed-Datensätze stehen in App.html als `SEED_ACTIVITIES`, `SEED_SHOPPING`, `SEED_TODOS`, `SEED_GOALS`, `SEED_CYCLE`. Du kannst sie 1:1 als Demo-Daten / Fixtures übernehmen.

---

## Vorgeschlagenes Backend-Schema (Firestore)

```
users/{userId}             → {name, color, partnerId, ...}
couples/{coupleId}         → {memberAId, memberDId, createdAt}

couples/{coupleId}/activities/{id}     → Activity
couples/{coupleId}/shopping/{id}       → ShoppingItem
couples/{coupleId}/todos/{id}          → Todo
couples/{coupleId}/goals/{id}          → Goal
couples/{coupleId}/cycle/{ownerId}     → Cycle (one per couple, owner field decides editor)
couples/{coupleId}/cycle/{ownerId}/entries/{date} → CycleDayEntry
```

Security Rule (Pseudo):
```
match /couples/{c}/{coll}/{doc} {
  allow read:  if request.auth.uid in get(/couples/$(c)).data.members
              && (resource.data.scope == "geteilt"
                  || resource.data.scope == get(/users/$(request.auth.uid)).data.shortId);
  allow write: if request.auth.uid in get(/couples/$(c)).data.members
              && (resource.data.scope == "geteilt"
                  || resource.data.scope == get(/users/$(request.auth.uid)).data.shortId);
}
```
