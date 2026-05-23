# Handoff: Ambar & Dällen — Paar-App

Eine intime Companion-App für ein Paar (Ambar + Dällen) zum gemeinsamen Organisieren des Alltags: Termine, Einkaufsliste, Aufgaben, Ziele und Zyklustracking. Hauptthema: **wir zwei** — geteilte und private Bereiche koexistieren in einer warmen, ruhigen Atmosphäre.

---

## ⚠️ Über die Dateien in diesem Paket

Die Dateien im Ordner `reference/` sind **Design-Referenzen, kein produktiver Code**. `App.html` ist ein in-HTML-React-Prototyp, der Aussehen, Layout und Verhalten zeigt — er ist **nicht** dafür gedacht, 1:1 ausgeliefert zu werden.

**Deine Aufgabe als Entwickler:** Diese Designs in deiner Zielumgebung umsetzen — am besten als **React Native (Expo)** oder **SwiftUI**, weil die App auf dem iPhone leben soll. Wenn du Web zuerst bauen willst, ist **Next.js + React + Tailwind** ein direkter Pfad (das Prototype-CSS lässt sich fast wörtlich übernehmen). Etablierte Bibliotheken und Patterns deines Stacks haben Vorrang vor dem Prototype-Code.

## Fidelity

**High-fidelity (hifi).** Farben, Typografie, Spacing, Radien, Schatten, Bewegungs-Easings und Copy sind final. Bitte pixelnah umsetzen. Inhalte sind Seed-Daten — bitte beim ersten Launch durch echtes Onboarding ersetzen (siehe „Offene Punkte" unten).

---

## Inhalt dieses Paketes

```
design_handoff_ambar_daellen/
├── README.md                     ← dieses Dokument (lies das zuerst)
├── DESIGN_TOKENS.md              ← alle Farben, Type-Scale, Spacing, Schatten als Liste
├── COMPONENTS.md                 ← alle wiederverwendbaren Komponenten dokumentiert
├── SCREENS.md                    ← jeder Screen + jedes Bottom-Sheet im Detail
├── DATA_MODEL.md                 ← TypeScript-Typen für alle Entitäten
├── INTERACTIONS.md               ← Flows, Animationen, States
└── reference/
    ├── App.html                  ← der volle Prototyp (öffne im Browser zum Spielen)
    ├── preview.png               ← Screenshot Heute-Screen
    ├── preview2.png              ← Screenshot weitere Screens
    └── cycle-preview.png         ← Screenshot Zyklus-Sheet
```

Lies in dieser Reihenfolge: **README → DESIGN_TOKENS → DATA_MODEL → SCREENS → COMPONENTS → INTERACTIONS.**

---

## App-Konzept in einem Absatz

Zwei Menschen teilen sich einen digitalen „Küchentisch". Jedes Item (Termin, Einkauf, Todo, Ziel, Zyklustag) gehört entweder **„Gemeinsam"** (beide sehen es) oder **„Privat"** (nur der Ersteller sieht es). Der Zyklus ist der Anker des Heute-Screens — von beiden einsehbar, aber nur von Ambar editierbar. Visuell warm, ruhig, mit Instrument-Serif-Headlines, gedeckten Erdtönen, watercolor-Atmosphäre im Hintergrund. Keine Gamification, keine Streaks, keine Notifications-Anxiety — diese App ist „slow software".

## Die fünf Tabs

| Tab | Zweck |
|---|---|
| **Heute** | Übersicht: Begrüßung, Zyklus-Tile, nächster Termin, Ziel im Blick, Einkauf-Snippet mit Quick-Add, 4 dringende Todos. |
| **Aktivitäten** | Termine + Date-Ideen — Filter: Geplant / Ideen / Erledigt, gruppiert nach Datum. |
| **Einkauf** | 3 Sektionen: Gemeinsam, Privat, **Spinnerei** (Wünsche / Nice-to-haves). Quick-Add oben. |
| **Todo** | Buckets nach Fälligkeit (Überfällig, Heute, Morgen, Woche, Später, ohne Datum). Suche + Scope-Filter. |
| **Ziele** | Gruppiert nach Zeithorizont (Kurz / Mittel / Lang). Pro Ziel: Fortschritt, Schritte zum Abhaken. |

## Globale Konzepte

- **Two-user model.** Es gibt fix zwei Nutzer: `A = Ambar (Terracotta #C77052)` und `D = Dällen (Sage #7E9A79)`. Der Prototyp hat unten einen User-Switcher — in der echten App wird beim Login entschieden, wer du bist.
- **Scope.** Jedes Item hat `scope ∈ {"geteilt", "A", "D"}`. `visibleTo(items, currentUser)` filtert aus, was dem anderen privat gehört.
- **Privacy indicator.** Privates wird mit einem kleinen Lock-Glyph (siehe `IconLock`) oder Lock-Badge auf dem Avatar markiert. **Nie** privaten Inhalt zeigen, der dem anderen Nutzer gehört.
- **Atmosphäre.** Hinter jedem Screen läuft ein extrem langsamer Hintergrund: 5 driftende Watercolor-Blobs (Terracotta/Sage/Rose/Gold/Plum), konzentrische Ringe + Speichen die in 180s rotieren, plus statisches SVG-Grain. Mix-Blend-Mode `multiply` macht es organisch. Niemals stören.
- **Atomare Komponenten.** `Card`, `Sheet`, `RoundCheck`, `Segmented`, `ScopeToggle`, `AvatarWithScope`, `ActivityIcon`, `GoalProgress`, `Empty`, `ScreenHeader` → siehe COMPONENTS.md.

## Phone Frame

Der Prototyp zeigt ein 390 × 844 iPhone-13/14-Frame mit Notch und Status Bar. **In der echten App entfällt der Frame** — das wird der echte iPhone-Screen. Aber: Status-Bar-Padding (`pt-[48px]`) und Bottom-Tab-Padding (`pb-[96px]`) entsprechen Safe-Area-Insets — übernimm sie als `useSafeAreaInsets()` in React Native bzw. `safeAreaInset(.top/.bottom)` in SwiftUI.

## Sprache & Tonalität

- **Sprache: Deutsch (DE).** Bitte 1:1 die Copy aus dem Prototyp übernehmen.
- **Tonalität:** warm, ein bisschen poetisch (Instrument-Serif für Headlines, italic für Sheet-Titel), aber pragmatisch. Beispiele:
  - „Wohin wir wollen" (Ziele-Subtitle)
  - „Gemeinsam unterwegs" (Aktivitäten-Subtitle)
  - „Sammle Ideen für Dates und Ausflüge — ohne Druck." (Empty State)
  - „Spinnerei" für Wunsch-Einkäufe (Wishlist)
- **Kein Englisch**, keine Tech-Begriffe. „Privat", nicht „Private". „Gemeinsam", nicht „Shared".

## Offene Punkte für die Umsetzung

1. **Auth / Pairing-Flow.** Im Prototyp gibt es ihn nicht. Du brauchst: Einladung per Code/Link, beide User onboarden sich gegenseitig.
2. **Backend.** Daten in `SEED_*`-Konstanten in `App.html` (Zeilen 320–425). Realistisches Backend: **Firebase Firestore** oder **Supabase**, eine Collection pro Entität, Doc-Level Permissions für `scope`.
3. **Persistenz von Cycle-Daten.** Sensitive Health-Daten — bitte mit Care: Apple HealthKit / Google Fit-Integration optional, lokal verschlüsselt (Keychain) Default.
4. **iCal-Export.** Im Prototyp gibt es `toICS(activity)` + `downloadICS(activity)` (App.html, ~Z. 542). Auf iOS: `EventKit` direkt nutzen statt ICS-Download.
5. **Notifications.** Bewusst nicht im Prototyp. Frage Designer, ob/welche.
6. **Multi-Language.** Nur DE — wenn EN gewünscht: i18n von Anfang an.

---

Bei Fragen zur visuellen Auslegung: **immer im Prototyp `App.html` nachschauen** (im Browser öffnen), dort ist das Ground Truth.
