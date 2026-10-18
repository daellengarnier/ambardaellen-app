"use client";

import type { AreaDto, World } from "@/lib/life";
import { WORLD_LABEL } from "@/lib/life";

export const WORLD_COLOR: Record<World, string> = {
  spinnerei: "var(--terra)",
  privat: "var(--sage)",
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
          <div className="text-[10.5px] mb-1" style={{ color: WORLD_COLOR[w], fontWeight: 600 }}>
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
      className="inline-flex items-center rounded-full px-1.5 text-[10.5px] font-medium leading-[16px]"
      style={{
        color: WORLD_COLOR[area.world],
        background: area.world === "spinnerei" ? "rgba(197,99,75,0.12)" : "rgba(126,151,123,0.16)",
      }}
    >
      {area.name}
    </span>
  );
}
