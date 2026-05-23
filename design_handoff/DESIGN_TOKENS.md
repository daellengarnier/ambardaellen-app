# Design Tokens

Alle Werte sind aus `App.html` (`<style>`-Block, Zeilen ~17–46) verifiziert. Übernehme sie 1:1 in deinen Stack — als CSS-Variablen, Tailwind-Theme-Extension, SwiftUI-Colors oder StyleSheet-Konstanten.

---

## Farben

### Basisflächen (Cremes & Paper)

| Token | Hex | Verwendung |
|---|---|---|
| `--cream` | `#EFE6D3` | Screen-Hintergrund (`screen` Wrapper) |
| `--cream-deep` | `#E4D9BF` | Sekundäre Flächen, Segmented-Background, Chip-BG (inaktiv), Avatar-Placeholder, Progress-Bar-Track |
| `--paper` | `#FBF6E8` | Card-Hintergrund, aktiver Segmented-Pill, Sheet-Container |
| `--paper-2` | `#F5EEDB` | Selten — minimal kühlere Card-Variante (in `App.html` definiert aber sparsam genutzt) |

### Text

| Token | Hex | Verwendung |
|---|---|---|
| `--ink` | `#211913` | Primärtext, Headlines, aktive Icons |
| `--ink-soft` | `#4F4338` | Sekundärtext, Body, inaktive Tabs |
| `--muted` | `#978675` | Tertiär, Meta-Labels (uplabel), Captions, Placeholder, Trennlinien-Punkte |
| `--line` | `#DAC9A8` | Card-Trenner, Input-Borders |

### Akzente

| Token | Hex | Verwendung |
|---|---|---|
| `--terra` | `#C5634B` | Primäre Akzentfarbe — Hauptbuttons (FAB, „Hinzufügen"), Prio-Hoch-Indikator, „Spinnerei"-Marker (✦), Active-Tab-Color |
| `--terra-deep` | `#A14934` | Active-Tab-Text (deeper variant), Hover-Pressed |
| `--terra-soft` | `#ECC4B0` | Inaktive Primary-Button-Variante (disabled-Look bei leerem Input) |
| `--sage` | `#7E977B` | Sekundär — Erledigt-Button, „Gemeinsam"-Indikator, Shopping-Checkbox-Active, Goal-Owner-D-Progress |
| `--sage-soft` | `#CBD8C2` | sehr selten |
| `--plum` | `#4B3050` | dunkler Lila-Akzent in Atmosphere + Schatten-Tints |
| `--plum-soft` | `#C7B0CB` | – |
| `--gold` | `#C8973F` | Atmosphere-Blob |
| `--gold-soft` | `#E8D29A` | – |
| `--rose` | `#C77F77` | Atmosphere-Blob |

### User-Identitätsfarben

Diese kommen als Inline-Konstanten (siehe `USERS` in `App.html` ~Z. 296):

| User | `color` | `soft` |
|---|---|---|
| **A** (Ambar) | `#C77052` (Terracotta) | `#F2D9CB` |
| **D** (Dällen) | `#7E9A79` (Sage) | `#D7E2D4` |

> Hinweis: `USERS.A.color` (`#C77052`) ist leicht heller als `--terra` (`#C5634B`). Das ist Absicht — die User-Farbe ist „weicher", die Akzentfarbe ist „bewusster". Bitte beide getrennt halten.

### Zyklus-Phasen-Farben

| Phase | Hex |
|---|---|
| Menstruation | `#A8484E` |
| Folliklephase | `#D4A86A` |
| Fertiles Fenster / Eisprung | `#E07A5F` |
| Lutealphase | `#8DA888` |
| Überfällig | `#A8484E` |

### Prio-Farben (Todos)

| Prio | Hex | Dot? |
|---|---|---|
| Hoch | `#C5634B` (= `--terra`) | ja |
| Normal | `#7E977B` (= `--sage`) | nein |
| Tief | `#978675` (= `--muted`) | nein |

### Seitenrand (außerhalb des Phone-Frames)

Body-Hintergrund: `rgb(203, 164, 76)` — sattes Senfgelb. **Nur im Prototyp** sichtbar (rundherum). In der echten App entfällt das.

---

## Typografie

### Family-Stack

```css
/* System */
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;

/* Serif (Instrument Serif, Google Fonts) */
.serif    { font-family: 'Instrument Serif', 'Cormorant Garamond', Georgia, serif; font-style: normal; letter-spacing: -0.012em; }
.serif-i  { font-family: 'Instrument Serif', 'Cormorant Garamond', Georgia, serif; font-style: italic; letter-spacing: -0.012em; }
```

> Im Prototyp zusätzlich geladen: `Instrument Sans` — wird aktuell **nicht** referenziert; kann entfernt werden. **System-Font** (San Francisco auf iOS, Roboto auf Android) für UI-Body.
>
> `Instrument Serif` MUSS geladen werden — sie ist der Charakter der Marke.

### Skala (alle px-Werte)

| Class / Usage | Size | Weight | Letter-Spacing | Font |
|---|---|---|---|---|
| Screen-Title (`ScreenHeader h1`) | 36 / line 0.95 | 400 (Instrument Serif italic) | -0.012em | `.serif-i` |
| Heute-Begrüßung (`Guten Morgen`) | 30 | 600 (semibold) | tight | system |
| Sheet-Titel (`Sheet h3`) | 24 | 400 | -0.012em | `.serif-i` |
| Goal-Detail-Titel | 24 / line tight | 400 | – | `.serif` |
| Goal-Progress-Value (groß) | 28, semibold, tabular-nums | – | – | `mono` |
| Card-Title (Akt-Liste) | 14.5 | 500 | – | system |
| Body / List-Item | 14 | 400 | – | system |
| Body dense | 13.5 | 400 | – | system |
| Meta / Subtitle | 13 | 400 | – | system |
| Caption | 12 / 11.5 | 400–500 | – | system |
| **uplabel** | 10–11 | 600 | 0.18em | UPPERCASE — verwendet für ALL kleine Section-Headers |
| Tabs-Label | 10 | 500 (inaktiv) / 600 (aktiv) | 0.1 | system |
| Status-Bar | 14 | 600 | – | system |

### Utility-Klassen aus `App.html`

```css
.serif      /* Instrument Serif (normal) */
.serif-i    /* Instrument Serif (italic)  */
.mono       /* font-feature: "tnum"; tabular-nums */
.uplabel    /* text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600 */
```

### Body-Settings (globally)

```css
-webkit-font-smoothing: antialiased;
text-rendering: optimizeLegibility;
letter-spacing: -0.005em;
```

---

## Spacing

Tailwind-Default (4px-Grid). Häufige Werte:

| Use | Tailwind | Pixel |
|---|---|---|
| Horizontal Screen-Padding | `px-4` | 16px |
| Card-Padding (Standard) | `p-3` / `p-3.5` | 12–14px |
| Card-Padding (klein) | `p-2.5` | 10px |
| Stack zw. Section-Groups | `space-y-3.5` | 14px |
| Stack zw. List-Items | `space-y-1.5` | 6px |
| Bottom-Tab-Reservierung | `pb-[96px]` | 96px |
| Top-Status-Bar-Reservierung | `pt-[48px]` | 48px |
| Sheet-Innen-Padding | `px-5 pb-7` | 20px / 28px |

---

## Border-Radius

| Use | Token / Tailwind | Pixel |
|---|---|---|
| Card | `rounded-2xl` | 16px |
| Sheet Top | `rounded-t-3xl` | 24px |
| Phone-Frame | `52px` | 52px |
| Screen innerhalb Frame | `40px` | 40px |
| Pill / Chip / FAB | `rounded-full` | 9999px |
| Tab-Bar Container | `rounded-[26px]` | 26px |
| Tab-Item Active Indicator | `rounded-2xl` | 16px |
| Input | `rounded-2xl` | 16px |
| Activity-Icon-Container | `rounded-xl` | 12px |
| Small chips / squares (Checkbox-Step) | `rounded-md` | 6px |

---

## Schatten

```css
.shadow-card {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.55),
    0 1px 0 rgba(33,25,19,0.04),
    0 14px 32px -16px rgba(75,48,80,0.16),
    0 2px 6px -2px rgba(75,48,80,0.06);
}

.shadow-float {
  box-shadow:
    0 8px 24px -10px rgba(33,25,19,0.28),
    0 28px 56px -22px rgba(75,48,80,0.30),
    inset 0 1px 0 rgba(255,255,255,0.65);
}

.shadow-glow-terra { box-shadow: 0 12px 30px -14px rgba(197,99,75,0.45); }
.shadow-glow-plum  { box-shadow: 0 12px 30px -14px rgba(75,48,80,0.45); }
```

- `shadow-card` = Karten, Tab-Bar, aktive Segmented-Pills
- `shadow-float` = Bottom-Sheets, FAB-Buttons (Aktiv-Variante)
- Glow-Schatten = optionale Akzentschatten für hervorgehobene Tiles (z.B. Cycle-Tile heute)

---

## Animationen / Easings

```css
/* Sheet einblenden */
@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
.sheet-enter { animation: sheetIn 320ms cubic-bezier(.22,1,.36,1); }

/* Scrim fade */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.scrim-enter { animation: fadeIn 240ms ease-out; }

/* Tap feedback (alle interaktiven Elemente) */
.tap { transition: transform .12s ease, background .12s ease; }
.tap:active { transform: scale(0.97); }

/* Checkbox-Tick-Draw */
@keyframes tickIn { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
.tick-path { stroke-dasharray: 16; animation: tickIn 220ms ease-out forwards; }
```

### Atmosphere-Animationen (Hintergrund)

- 5 Blob-Drift-Loops: `driftA…E`, 28–47s, `ease-in-out infinite`
- `hueDrift` 60s — sehr subtle Saturation/Hue-Wandern
- `slowSpin` 180s — konzentrische Ringe rotieren
- `ringPulse` 18s — Ringe pulsen mit ±6% Scale
- Grain: statisches SVG-Pattern, `opacity: 0.42`, `mix-blend-mode: multiply`

> **Performance-Tipp:** In React Native diese Animationen mit `react-native-reanimated` umsetzen (oder per `Lottie`-Export). In SwiftUI: `TimelineView` + `Canvas` für Blobs, `withAnimation(.linear(duration: 180).repeatForever)` für Spin.

---

## Dot-Pattern (Placeholder)

```css
.dot-bg {
  background-image: radial-gradient(rgba(154,142,126,0.35) 1px, transparent 1px);
  background-size: 12px 12px;
}
```
