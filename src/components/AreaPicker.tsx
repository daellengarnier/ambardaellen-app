"use client";

import type { AreaDto, World } from "@/lib/life";
import { WORLD_LABEL } from "@/lib/life";

/** Kräftige Farbe der Welt: Flächen, aktive Chips (weisse Schrift lesbar). */
export const WORLD_COLOR: Record<World, string> = {
  spinnerei: "var(--spinnerei)",
  privat: "var(--privat-text)",
};

/** Getönter Hintergrund und Schriftfarbe für Labels. */
export const WORLD_TINT: Record<World, { bg: string; fg: string }> = {
  spinnerei: { bg: "var(--spinnerei-soft)", fg: "var(--spinnerei-text)" },
  privat: { bg: "var(--privat-soft)", fg: "var(--privat-text)" },
};

type Props = {
  areas: AreaDto[];
  value: string | null;
  onChange: (key: string | null) => void;
};

/** Bereich wählen: Chips gruppiert nach Spinnerei und Privat. */
export function AreaPicker({ areas, value, onChange }: Props) {
  const worlds: World[] = ["spinnerei", "privat"];
  return (
    <div className="space-y-2">
      {worlds.map((w) => (
        <div key={w}>
          <div className="text-[11px] mb-1" style={{ color: WORLD_TINT[w].fg, fontWeight: 700 }}>
            {WORLD_LABEL[w]}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {areas
              .filter((a) => a.world === w)
              .map((a) => {
                const active = value === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => onChange(active ? null : a.key)}
                    className="tap text-[12px] rounded-full px-2.5 py-1 font-medium"
                    style={
                      active
                        ? { background: WORLD_COLOR[w], color: "white" }
                        : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
                    }
                  >
                    {a.name}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Kleines Label für den Bereich eines Todos. */
export function AreaChip({ area }: { area: AreaDto | undefined }) {
  if (!area) return null;
  return (
    <span
      className="inline-flex items-center rounded-lg px-2 text-[11px] font-bold leading-[18px]"
      style={{ color: WORLD_TINT[area.world].fg, background: WORLD_TINT[area.world].bg }}
    >
      {area.name}
    </span>
  );
}
