# Components

Alle wiederverwendbaren Komponenten aus `App.html`. Bitte als gleichnamige Komponenten in deinem Stack nachbauen — sie sind die Bausteine jedes Screens.

---

## Avatar

```
<Avatar id="A" size={24} ring={false} />
```

Kreis mit Initialbuchstabe in `USERS[id].color`. `ring` zeichnet einen 2px-Paper-Ring außen (für AvatarPair).

- Font-Size = `size * 0.45`
- Text: weiß, semibold
- Background: User-Farbe (`#C77052` / `#7E9A79`)

## AvatarPair

```
<AvatarPair size={22} />
```

A und D überlappt mit `marginLeft: -size/3`. Verwendung: oben rechts auf Heute + Einkauf.

## AvatarWithScope

```
<AvatarWithScope by="A" scope="geteilt" size={20} />
```

Avatar + bei `isPrivate` ein kleines Lock-Badge unten rechts. Auf 55% des Avatar-Sizes.

## Card

```
<Card onClick={…} className="p-3">…</Card>
```

- `bg-[var(--paper)]`, `rounded-2xl` (16px), `shadow-card`
- Wenn `onClick` gesetzt: `tap` Klasse (scale-95 on press)
- Universelle Surface — Karten, Listen-Container, Tile-Wrapper, Quick-Add-Box.

## Sheet (Bottom Sheet)

```
<Sheet open={bool} onClose={fn} title="…">
  {children}
</Sheet>
```

- Position: absolute bottom, `rounded-t-3xl`, `shadow-float`
- Max-height: `78%` des Screens
- Animation: `sheet-enter` (320ms, slide-up cubic-bezier)
- Scrim hinter: `bg-black/30`, `scrim-enter` (240ms fade)
- Drag-Handle oben (`w-10 h-1.5 bg-[var(--line)] rounded-full`)
- Titel: serif-i 24px
- Schließen-X oben rechts
- Inhalt scrollt vertikal (versteckte Scrollbar via `phone-scroll`)

## ScreenHeader

```
<ScreenHeader title="Todo" subtitle="3 offen" right={<Button…/>} />
```

- Subtitle: uplabel klein
- Title: `serif-i text-[36px] leading-[0.95]`
- Right-slot: meist FAB oder AvatarPair

## Segmented

```
<Segmented value="geplant" onChange={setFilter}
  options={[
    { value: "geplant",  label: "Geplant" },
    { value: "idee",     label: "Ideen" },
    { value: "erledigt", label: "Erledigt" },
  ]}/>
```

Pill-Container `bg-[var(--cream-deep)]`, padding-1. Aktives Item: `bg-[var(--paper)] shadow-card`. Inaktiv: text-ink-soft.

## ScopeToggle

```
<ScopeToggle value={scope} onChange={setScope} currentUser="A" compact={false} />
```

Wie Segmented, zwei Optionen:
- `Gemeinsam` (mit `IconUsers`)
- `Nur ${USERS[currentUser].name}` (mit `IconLock`)

`compact` reduziert auf 11.5px Text + tighter padding.

## RoundCheck

```
<RoundCheck checked={bool} onClick={fn} color="var(--terra)" size={22} />
```

- Wenn unchecked: nur Border 1.6px `var(--line)`
- Wenn checked: gefüllt mit `color`, weißer Tick mit Draw-Animation (`tick-path`)
- Sizes: 14 (Heute-Tile), 16 (Heute-Shopping-Mini), 20–22 (Standard)
- Farben: `var(--sage)` für Shopping/Default, `var(--terra)` für Spinnerei + Hoch-Prio, prio.color für Todos

## ActivityIcon

```
<ActivityIcon kind="coffee" />
```

- 36×36 Box, `rounded-xl`, `bg-[var(--cream-deep)]`, `color: var(--ink)`
- 18px Icon mittig
- Icons: `coffee`, `leaf`, `heart`, `sparkle`, `book`, `house` → fallback `IconCal`

## GoalProgress

```
<GoalProgress goal={goal} />
```

- Bar: `h-2 rounded-full bg-[var(--cream-deep)]`
- Fill: `bg: USERS[goal.by].color`, animiert 500ms
- Unter der Bar: `current / target [unit]` links, `pct%` rechts (text-12.5 muted)

## Empty

```
<Empty icon={<IconCal size={22}/>} title="Noch nichts hier" body="…" />
```

- Center, 48×48 Cream-Bubble mit Icon
- Title 16/medium, Body 14 muted, max-width 260

## ScopeBadge

Kleines 14px Lock-Glyph mit Paper-Ring. Für Avatar-Overlays.

## Tag

```
<Tag label="kreuzberg" />
```

Pill: `bg-[var(--cream-deep)] text-[var(--ink-soft)]`, 11.5px, `#` Prefix.

## ShoppingRow / TodoRow

Generische List-Row-Komponenten, beide mit:
- `RoundCheck` links
- Text + Meta-Line (Sub: qty, addedAt / due, note)
- `AvatarWithScope` rechts
- `dense` Variante für „Erledigt"-Sektion (kleinere Höhen)

Siehe App.html ~Z. 1099 (ShoppingRow) und ~Z. 1338 (TodoRow) für genaue Markups.

---

## Icons (Inline SVG, lucide-Style)

Alle Icons sind inline SVG mit `viewBox="0 0 24 24"`, `stroke="currentColor"`, `strokeWidth=1.75` default.

`<Svg size strokeWidth className>` ist die Base. Verfügbare Icons im Prototyp:

`IconHome`, `IconCal`, `IconCart`, `IconNote`, `IconTarget`, `IconPlus`, `IconCheck`, `IconCheckSquare`, `IconList`, `IconX`, `IconSearch`, `IconClock`, `IconChev`, `IconMore`, `IconPin`, `IconHeart`, `IconSparkle`, `IconFlag`, `IconLeaf`, `IconCoffee`, `IconBook`, `IconHouse`, `IconLock`, `IconUsers`

→ Falls du eine echte Icon-Library nimmst: **Lucide** ist die direkte Entsprechung. Pfade matchen 1:1 oder fast-1:1.

## Status Bar

iOS-Style — 9:41 links, Signal+WiFi+Battery rechts. Nur im Prototyp; in der echten App liefert das OS.

## Tab Bar

5 Tabs (Heute / Aktivitäten / Einkauf / Todo / Ziele). Container `rounded-[26px]`, `bg-rgba(251,246,232,0.85)`, `backdrop-blur`. Aktiv-Indicator: leichter Gradient-Overlay terra→plum. Floating über einer Gradient-Mask, damit Content sauber drunter durch scrollen kann.

→ In React Native: `@react-navigation/bottom-tabs` mit `tabBarStyle` Custom-Background + Blur via `expo-blur`.

## CycleTile / CycleSheet

Spezialfälle — Code in App.html ~Z. 2062 und ~Z. 2264. Detaillierte Beschreibung in SCREENS.md → „Zyklus-Sheet".

---

## Atmosphere

Hintergrund-SVG mit 5 driftenden Blobs + rotierenden Ringen + Grain-Pattern. Code in App.html Z. 116. Bitte als statische Komponente einmal je Screen-Root mounten — nicht pro Tab neu.

→ In React Native: `react-native-svg` oder als statisches Background-Bild (PNG export aus dem Web-Prototyp) wenn Performance-Probleme.
→ In SwiftUI: `Canvas { ctx, size in … }` mit `TimelineView(.animation)`.
