// Wiederholung nach Abständen, vereinfacht nach SM-2 (wie Anki).
// Wird vom Server zum Speichern und vom Client für die Vorschau der
// Abstände auf den Knöpfen genutzt.

export type Rating = 1 | 2 | 3 | 4;
export type Direction = "vi_de" | "de_vi";

export type SrsState = {
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
};

export const RATING_LABEL: Record<Rating, string> = {
  1: "Nochmal",
  2: "Schwer",
  3: "Gut",
  4: "Leicht",
};

const MIN_EASE = 1.3;
const MAX_INTERVAL = 365;

/** Neuer Zustand nach einer Bewertung. intervalDays 0 = heute nochmal. */
export function schedule(s: SrsState, rating: Rating): SrsState {
  const prev = s.intervalDays;
  let ease = s.ease;
  let interval: number;
  let lapses = s.lapses;

  switch (rating) {
    case 1:
      if (prev > 0) lapses += 1;
      ease = Math.max(MIN_EASE, ease - 0.2);
      interval = 0;
      break;
    case 2:
      ease = Math.max(MIN_EASE, ease - 0.15);
      interval = Math.max(1, Math.round(prev * 1.2));
      break;
    case 3:
      interval = prev === 0 ? 1 : prev === 1 ? 3 : Math.max(prev + 1, Math.round(prev * ease));
      break;
    case 4:
      ease = ease + 0.15;
      interval = prev === 0 ? 3 : Math.max(prev + 2, Math.round(prev * ease * 1.3));
      break;
  }

  return {
    intervalDays: Math.min(MAX_INTERVAL, interval),
    ease: Math.round(ease * 100) / 100,
    reps: s.reps + 1,
    lapses,
  };
}

/** Kurzform für die Knöpfe: "gleich", "1 Tag", "12 Tage", "3 Mt." */
export function intervalLabel(days: number): string {
  if (days <= 0) return "gleich";
  if (days === 1) return "1 Tag";
  if (days < 30) return `${days} Tage`;
  if (days < 365) return `${Math.round(days / 30)} Mt.`;
  return "1 Jahr";
}

/** Welche Richtungen eine Karte hat: Grammatik nur VI→DE. */
export function directionsFor(type: string): Direction[] {
  return type === "grammar" ? ["vi_de"] : ["vi_de", "de_vi"];
}
