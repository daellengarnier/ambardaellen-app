# Interactions & Behavior

State-Management, Flows, Transitions, Edge-Cases.

---

## State Architecture

Der gesamte App-State lebt im Root-`<App/>`-Komponent (App.html Z. 2448) — dort einfache `useState`-Hooks:

```ts
const [tab,          setTab]          = useState<TabId>("heute");
const [currentUser,  setCurrentUser]  = useState<UserId>("D");

const [activities,   setActivities]   = useState<Activity[]>(SEED_ACTIVITIES);
const [shopping,     setShopping]     = useState<ShoppingItem[]>(SEED_SHOPPING);
const [todos,        setTodos]        = useState<Todo[]>(SEED_TODOS);
const [goals,        setGoals]        = useState<Goal[]>(SEED_GOALS);
const [cycle,        setCycle]        = useState<Cycle>(SEED_CYCLE);

// Sheet open states (jeweils das aktive Objekt oder null)
const [openAct,      setOpenAct]      = useState<Activity | null>(null);
const [openShop,     setOpenShop]     = useState<ShoppingItem | null>(null);
const [openTodo,     setOpenTodo]     = useState<Todo | null>(null);
const [openGoal,     setOpenGoal]     = useState<Goal | null>(null);
const [cycleOpen,    setCycleOpen]    = useState(false);

// Add-Sheets
const [addActOpen,   setAddActOpen]   = useState(false);
const [addTodoOpen,  setAddTodoOpen]  = useState(false);
const [addGoalOpen,  setAddGoalOpen]  = useState(false);
```

→ **In der echten App:** Migration zu **Zustand** oder **Jotai** für Client-State, **TanStack Query** + **Firebase/Supabase** für Server-State. Optimistic Updates aktiv lassen (User-Empfinden ist „instant").

## CRUD-Operations

In App.html ~Z. 2469. Alle simpel:

```ts
const updateActivity = (a) => setActivities(activities.map(x => x.id===a.id?a:x));
const deleteActivity = (id) => setActivities(activities.filter(x => x.id!==id));

const toggleShopping = (id)   => setShopping(s.map(x => x.id===id ? {...x, done: !x.done} : x));
const quickAddShopping = (text) => {
  if (!text.trim()) return;
  setShopping([{ id: uid(), text: text.trim(), spinnerei: false,
                 done: false, by: currentUser, scope: "geteilt",
                 qty: "", added: "gerade eben" }, ...shopping]);
};

const toggleTodo = (id) => setTodos(t.map(x => x.id===id ? {...x, done: !x.done} : x));
// … etc.
```

> **Neue Items werden immer dem `currentUser` zugeschrieben** (`by: currentUser`), Default-Scope = `"geteilt"`.

---

## Navigation-Flows

### Tab-Wechsel
- Klick auf Tab-Item in TabBar → setTab(id)
- Keine Animation zwischen Tabs (Cross-Fade ist OK, aber im Prototyp instant)

### Heute → Detail
- Klick auf Termin-Tile → öffnet **ActivityDetail** mit nächstem Termin
- Klick auf Ziel-Tile → öffnet **GoalDetail**
- Klick auf Shopping-Mini-Row → öffnet **ShoppingDetail**
- Klick auf Todo-Pinnwand-Card → öffnet **TodoDetail**
- Klick auf Cycle-Tile (wenn `canEdit`) → öffnet **CycleSheet**
- „Alle" Action auf Aufgaben → `goTab("todo")`

### Tab-Screen → Detail
- Klick auf jede Liste-Row → entsprechendes Detail-Sheet
- FAB rechts oben → entsprechendes Add-Sheet

### Sheet → schließen
- X-Button oben rechts
- Tap auf Scrim hinter Sheet
- Auf Mobile: Swipe-Down-Gesture (im Prototyp nicht implementiert — in der echten App bitte ergänzen)

---

## Form-Validation

Minimal:
- **Add-Forms** akzeptieren keinen leeren Titel/Text (`text.trim()` muss truthy sein)
- Wenn ungültig: Submit-Button bleibt klickbar, aber `onAdd` wird nicht aufgerufen (silent fail)
- → **In der echten App:** Visuelles Feedback (Button disabled-State, Field-Highlight bei Submit-Versuch).

---

## Animationen — Detail

### Sheet-Open
1. Scrim erscheint mit `fadeIn 240ms ease-out`
2. Sheet slidet von unten ein: `sheetIn 320ms cubic-bezier(.22,1,.36,1)` (custom „smooth-out")

### Tap-Feedback
Jedes interaktive Element hat `.tap`:
```css
transition: transform .12s ease, background .12s ease;
&:active { transform: scale(0.97); }
```

### Checkbox-Tick
SVG-Path-Stroke-Animation, 220ms:
```css
@keyframes tickIn { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
```

### Goal-Progress-Bar
`transition: width 500ms` beim Update von `current/target`.

### Atmosphere (Hintergrund)
Permanente Schleife (Performance: GPU-only via `transform/opacity/filter`):
- 5 Blob-Drifts (28–47s)
- Hue-Drift global (60s)
- Ring-Spin (180s) + Ring-Pulse (18s)
- Statisches SVG-Grain (kein Anim)

→ **iOS:** Cap Atmosphere bei Low-Power-Mode (siehe `isLowPowerModeEnabled` + `prefersReducedMotion`). Wenn aus → statischer Snapshot.

---

## Interaktive States

### Shopping-Quick-Add
- Input leer → Button `bg-[var(--terra-soft)]` (heller, „nicht ready")
- Input gefüllt → Button `bg-[var(--terra)]`
- Enter-Key oder Button-Click → add

### Cycle-Tile View vs Edit
- `canEdit = (currentUser === cycle.owner)` → Tile reagiert auf Tap, öffnet Editor
- Sonst → View-Only, kein Klick, eventuell etwas gedämpft

### Privacy-Filter
Auf JEDEM Screen wird `visibleTo(items, currentUser)` vor der Render-Logik aufgerufen — niemals einen ungefilterten Array mappen.

### Scope-Toggle Behavior
Im Detail-Sheet: Ändert sofort `scope`-Feld via `onChange({...item, scope: newScope})`. Keine Bestätigung — direkter Apply.

### Add-Sheet Reset
`useEffect(() => { if (open) reset(); }, [open])` — beim Öffnen alle Felder zurücksetzen.

---

## Responsive Behavior

Aktuell **fixed 390 × 844** (iPhone). Für die echte App:
- **iPhone SE** (375×667): alles muss noch passen — bitte testen
- **iPhone Pro Max** (430×932): Spacing skaliert mit, Card-Width-Max bei 600?
- **iPad / Web**: Bitte mit Designer abstimmen — als Single-Column-Center? Multi-Pane? Im Prototyp nicht modelliert.

---

## Edge Cases

| Fall | Verhalten |
|---|---|
| Aktivität ohne Datum | wird in „Ohne Datum"-Gruppe einsortiert, sortiert ans Ende |
| Todo ohne `due` | landet in Bucket `kein` (= „Ohne Datum") |
| Todo überfällig (due < heute) | Bucket `ueber`, due-Text in `#C5634B font-medium`, immer ganz oben |
| Cycle: keine `periodStarts` | `cycleAnalysis` returnt null, kein Cycle-Tile rendered |
| Cycle: Tag > Avg-Cycle | Phase = `ueberfaellig`, Label „Überfällig (n T.)" |
| Goal: `current > target` | Progress-Bar capped bei 100%, aber Display zeigt echten Wert |
| Empty State pro Liste | jeweils mit `<Empty/>` (siehe Texte in jedem Screen) |
| Privates Item filtern | Server muss Privatsphäre durchsetzen — nie nur Client-Filter |

---

## Notifications (in echter App, optional)

Bewusst NICHT im Prototyp. Bei Bedarf bitte sparsam:
- Termin-Reminder (1h vorher, opt-in pro Event)
- Period-Start-Reminder (für Owner)
- Geteilter Termin neu/geändert vom Partner → soft ping
- KEIN Push für Shopping/Todo-Add (zu viel Lärm)

---

## Accessibility

Bisher im Prototyp nicht voll durchdekliniert. Für echte App:

- **Touch-Targets:** ≥44pt (Tab-Items, RoundChecks ≥22px aktuell — RoundCheck-mini auf Heute mit 14–16px ist **zu klein**, bitte vergrößern oder Hit-Slop ergänzen)
- **Kontraste:** `--muted` auf `--paper` ist ca. 4.0 — bitte für wichtigen Text auf `--ink-soft` (>7.0) hochziehen
- **Screen-Reader-Labels:** alle Icon-only-Buttons (FAB, X-Close, RoundCheck, Tabs) brauchen `aria-label` / `accessibilityLabel`
- **Reduced-Motion:** Atmosphere → statisch, Sheet-Slide → instant fade
- **VoiceOver-Reihenfolge in Sheets:** Titel → Inhalt → Action-Buttons (am Ende)

---

## Was bewusst NICHT in der App ist

- **Streaks / Gamification** — keine Series-Counts, kein „Du warst 7 Tage in Folge produktiv" Schwachsinn
- **Reactions / Emoji-Replies / Chat-Threads** — diese App ist eine geteilte Liste, kein Messenger
- **Push-FOMO** — keine red badges, keine notification-counts
- **Werbung, Pro-Features, Onboarding-Tutorials** — App soll sich anfühlen wie ein gemeinsames Notizbuch

Die Designentscheidungen sind bewusst zurückhaltend. Bitte beim Implementieren in der Versuchung widerstehen, „mehr UX" hinzuzufügen — die Reduktion ist Feature.
