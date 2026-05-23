# Screens

Jeder Screen + jedes Bottom-Sheet im Detail. Beziehe dich beim Bauen immer parallel auf `reference/App.html` — dort ist das Layout pixelgenau definiert.

---

## Globaler Screen-Container

Jeder Tab-Screen ist ein scrollender Container:

```
<div className="phone-scroll overflow-y-auto h-full pt-[48px] pb-[96px]">
  …
</div>
```

- `pt-[48px]` reserviert Status-Bar (in echter App: Safe-Area-Top)
- `pb-[96px]` reserviert die floatende Tab-Bar (in echter App: Tab-Bar-Höhe + Safe-Area-Bottom)
- Vertikales Scrollen versteckt Scrollbar.
- Hinter dem Content liegt immer `<Atmosphere/>` + Notch.

---

## 1. Heute

**Code:** App.html ~Z. 820 (`HeuteScreen`)

### Layout (top → bottom)

1. **Begrüßungsblock** (`px-4 pt-1 pb-3`)
   - uplabel: Wochentag, Datum (`Sonntag, 23. Mai`)
   - Heading 30px semibold: dynamisch nach Tageszeit
     - `<11h` → „Guten Morgen"
     - `<18h` → „Hallo ihr zwei"
     - sonst → „Schönen Abend"
   - rechts: `<AvatarPair size={28}/>`

2. **Cycle-Tile** (`px-4 mb-2`) — siehe „CycleTile" unten

3. **Asymmetrisches 2-Spalten-Grid** (`grid-cols-2 gap-2`)
   - Linke Spalte (gestapelt):
     - **Termin-Tile** (Card, `p-3`): uplabel „Termine" + Datum, dann nächster Aktivitätstitel (line-clamp-2) + Zeit/Ort. Klick → Activity-Detail-Sheet. Wenn keine: italic „nichts geplant" → Klick = wechselt zu Akt-Tab.
     - **Ziel-Tile** (Card, `p-3`): uplabel „Im Blick" + Lock-Icon falls privat, Titel line-clamp-2, dann `<GoalProgress>`. Klick → Goal-Detail-Sheet.
   - Rechte Spalte:
     - **Einkauf-Tile** (Card, tall, full-height der linken Spalte):
       - Header: uplabel „Einkauf" mit Cart-Icon, rechts „N offen" als Action
       - Scrollende Liste der offenen, geteilten oder eigenen Items (RoundCheck-mini + Text)
       - Footer: Inline-Quick-Add-Input + Mini-Plus-Button (terra-bg)

4. **Aufgaben** (Pinnwand) (`px-4 mb-2`)
   - Header: uplabel „Aufgaben" + Action „Alle" (terra) rechts
   - 2×2 Grid: bis zu 4 Todo-Karten (sortiert nach Bucket + Prio)
   - Jede Karte: linker 3px-Prio-Strip, uplabel-Bucket („Überfällig"/„Heute"/…) + AvatarWithScope, Titel (clamp 3), unten „erledigen" mit Mini-RoundCheck
   - Wenn keine offenen Todos: Card mit italic Text „Keine offenen Aufgaben für die kommenden Tage."

### Heute-spezifische Datenlogik

```ts
// Aktivität fürs Termin-Tile:
const todayActs = visibleActs.filter(a => a.date === todayISO && a.status !== "erledigt");
const nextAct = todayActs[0] || visibleActs
  .filter(a => a.status === "geplant" && a.date && a.date > todayISO)
  .sort((a,b) => a.date.localeCompare(b.date))[0];

// Top-Goal: erstes geteiltes oder erstes sichtbares
const topGoal = myGoals.find(g => g.scope === "geteilt") || myGoals[0];

// Urgent-Todos: bis +7 Tage (oder ohne Datum), max 4
```

---

## 2. Aktivitäten

**Code:** App.html ~Z. 1049 (`AktScreen`)

### Layout
1. **Header**: „Aktivitäten" / „Gemeinsam unterwegs" + FAB rechts (Plus, `bg-terra`, `w-9 h-9`)
2. **Segmented**: Geplant / Ideen / Erledigt
3. **Scope-Filter Chips**: Alle / Gemeinsam / Nur {currentUser}
   - Aktiver Chip: `bg-[var(--ink)] text-[var(--paper)]`
   - Inaktiv: `bg-[var(--cream-deep)] text-[var(--ink-soft)]`
4. **Liste** gruppiert nach Datum:
   - Gruppen-Header: uppercase-tracking-wide-muted, „Heute · 23. Mai" oder „Sonntag, 23. Mai" oder „Ohne Datum"
   - Items: Card `p-3 flex items-center gap-3`
     - `<ActivityIcon kind={icon}/>` links
     - Titel + Meta-Line (`IconClock` + Zeit, dann „· Ort")
     - `<AvatarWithScope/>` rechts
   - Klick → ActivityDetail-Sheet

### Empty States
- Filter „Ideen", leer → „Sammle Ideen für Dates und Ausflüge — ohne Druck."
- Sonst → „Plant euer nächstes Abenteuer."

---

## 3. Einkauf

**Code:** App.html ~Z. 1130 (`ShopScreen`)

### Layout
1. **Header**: „Einkauf" / „N offen" + AvatarPair
2. **Quick-Add-Card** (Card mit `p-2`):
   - Plus-Icon-Bubble (8×8 cream-deep, terra-icon)
   - Input „Was fehlt?"
   - Button „Hinzu" rechts — terra wenn input.trim()=true, sonst `--terra-soft`
   - Darunter Mini-Segmented (in Pill): Gemeinsam / Privat / **Spinnerei**
3. **Drei Sektionen** (jeweils nur wenn nicht leer):
   - **Gemeinsam** — Accent-Dot `var(--sage)`, IconUsers
   - **Privat · {Name}** — Accent-Dot in User-Farbe, IconLock
   - **Spinnerei** — Accent-Dot `var(--terra)`, ✦, Hint italic rechts: „Wünsche & Nice-to-haves"
   - Jede Sektion: Header `flex gap-1.5` mit Dot + Label + Count, dann Card mit ShoppingRows (Trenner zwischen Items: `border-b border-[var(--line)]/60`)
4. **Erledigt-Klapper** (collapsible): uplabel Button, dense ShoppingRows wenn aufgeklappt
5. Empty: „Liste ist leer / Tippe oben ein, was als nächstes mit muss."

### Quick-Add Logik
```ts
function add(input, scope, spinnerei) {
  prepend({
    id: uid(), text: input.trim(), spinnerei,
    done: false, by: currentUser, scope, qty: "", added: "gerade eben",
  });
}
```

---

## 4. Todo

**Code:** App.html ~Z. 1374 (`TodoScreen`)

### Layout
1. **Header**: „Todo" / „N offen" + FAB
2. **Suchfeld** (Card-Style, `IconSearch` links, X-Clear rechts wenn Query)
3. **Scope-Filter-Chips**: Alle / Gemeinsam / Privat
4. **Buckets** (in fester Reihenfolge — nur wenn nicht leer):
   - `ueber` → „Überfällig" (Dot `#C5634B`)
   - `heute` → „Heute" (Dot `var(--terra)`)
   - `morgen` → „Morgen"
   - `woche` → „Diese Woche"
   - `spaeter` → „Später"
   - `kein` → „Ohne Datum"
   - Jede Sektion: Header mit Dot + uplabel + Count, dann Card mit `<TodoRow>`s
5. **Erledigt-Klapper** ähnlich Einkauf

### Sortierung innerhalb Bucket
```ts
sort by PRIO.rank asc, then by due asc
// PRIO.rank: hoch=0, normal=1, tief=2
```

### TodoRow-Anzeige
- RoundCheck links (color = prio.color)
- Title-Line: wenn `prio.dot && !done` → kleiner farbiger Dot links vom Text
- Meta-Line: `due` (shortDate) + ggf. erste Zeile der Notiz
- Wenn überfällig + nicht done: due-Text in `#C5634B font-medium`
- AvatarWithScope rechts

---

## 5. Ziele

**Code:** App.html ~Z. 1454 (`GoalScreen`)

### Layout
1. **Header**: „Ziele" / „Wohin wir wollen" + FAB
2. **Scope-Filter-Chips**: Alle / Gemeinsam / Nur {Name}
3. **3 Gruppen** in fester Reihenfolge:
   - **Kurzfristig** (mit `IconFlag`)
   - **Mittelfristig**
   - **Langfristig**
   - Gruppen-Header: `serif`-ish uppercase tracking, Flag-Icon links
4. Jede Card (`p-3.5`):
   - Header-Zeile: Titel (medium 14.5px) + AvatarWithScope rechts
   - `<GoalProgress goal={g}/>`
   - Footer: „N / M Schritte" links, „Öffnen ›" (terra, font-medium) rechts

---

## Sheets (Bottom)

Alle Sheets nutzen den `<Sheet>`-Wrapper (siehe COMPONENTS.md).

### ActivityDetail (Code: App.html ~Z. 1582)
- Header: `<ActivityIcon/>` + serif-i Titel + datum/zeit
- DetailRow: Ort (IconPin), „Hinzugefügt von" (Avatar + Name)
- Notiz in cream-deep-Box (uplabel „Notiz" + preserve-line)
- ScopeToggle (compact) am Ende
- Buttons:
  - Wenn `status==="geplant"|"idee"`: „Erledigt ✓" (sage)
  - Wenn `status==="erledigt"`: „Wieder planen" (cream-deep)
  - Wenn `status==="idee"`: zusätzlich „Einplanen" (terra)
- iCal-Export-Link irgendwo (siehe `downloadICS` in App.html)

### ShoppingDetail
Ähnlich strukturiert: Edit-Felder für Menge, Notiz, Scope-Toggle, Spinnerei-Toggle, Delete-Button am Ende.

### TodoDetail (App.html ~Z. 1682)
- serif-i Titel
- RoundCheck zum Erledigen prominent
- Edit-Felder: Text, Notiz (multiline), Fälligkeit (date), Priorität (segmented), Scope-Toggle
- „Löschen"-Button am Ende (cream-deep ink-soft)

### GoalDetail (App.html ~Z. 1681)
- Header: uplabel mit Term-Label + Flag-Icon, serif-Titel, Avatar rechts
- **Progress-Block** (cream-deep/60 box):
  - Großer Wert: `current / target [unit]` (28px mono semibold)
  - Pct rechts
  - `<GoalProgress/>`
  - Drei Buttons: `−1`, `+1`, `+5` (gleichwertig in der Zeile)
- **Steps-Sektion**:
  - uplabel + counter „N / M"
  - Container mit Steps: 5×5 RoundedSquare-Check (sage wenn done), Text mit Strike wenn done, X-Button zum Löschen
  - Empty: italic „Noch keine Schritte."
- **Step-Hinzufügen-Zeile**: Input + Plus-Button (ink-bg)
- **Term-Toggle**: Segmented Kurz / Mittel / Lang
- **Scope-Toggle** (compact)
- „Ziel löschen" Button

### CycleSheet (App.html ~Z. 2264)
Eigener großer Editor — der komplexeste Bildschirm der App.

- Kopf: aktueller Zyklustag + Phase + Phase-Farbe als Bar
- Day-Picker: horizontaler Tag-Streifen der letzten ~14 Tage, je Tag mit Phase-Farbe markiert; aktueller Tag highlighted
- Editor für ausgewählten Tag:
  - **Flow** (Mens-Tage): 4 Stufen (—/leicht/mittel/stark)
  - **Mood**: 7 Optionen mit Emoji (siehe MOODS-Konstante)
  - **Energy**: 1–5 als Punkt-Skala
  - **Symptoms**: Multi-Select-Chips (10 Optionen)
  - **Note**: Freitext
- Settings: Avg-Cycle-Länge + Avg-Periode-Länge (Slider/Input)
- Period-Start-Marker: Button „Periode hat heute begonnen" → fügt todayISO zu `periodStarts` hinzu

> **Wichtig:** Nur `cycle.owner === currentUser` darf editieren — Partner sieht View-only.

### CycleTile (App.html ~Z. 2062) — auf Heute eingebettet

Hero-Tile (höher als andere Karten). Zeigt:
- aktuelle Phase (farbig) + Phase-Label
- Tag X von Y des Zyklus
- „N Tage bis Periode" / „N Tage bis Eisprung"
- visuelle Phase-Bar: kleiner Ring oder linearer Indikator
- Wenn `canEdit`: ganzer Tile klickbar → CycleSheet
- Wenn nicht `canEdit`: View-Mode, schwächerer State

### ActivityAddSheet / TodoAddSheet / GoalAddSheet
Forms zum Anlegen. Felder entsprechen den Detail-Sheets, default-Scope: `geteilt`. Bottom-Button „Hinzufügen" (terra, 15.5px semibold). Validierung: leere Titel ignorieren.

---

## Field- und DetailRow-Helper

- **`<Field label value onChange placeholder/>`** — Label-Input-Pair für Add/Edit-Sheets (label uplabel-style, Input `bg-cream-deep/60 rounded-2xl px-3.5 py-3 text-15px`)
- **`<DetailRow label value icon/>`** — Read-only-Anzeige in Detail-Sheets (Icon links, Label small muted, Value medium)
