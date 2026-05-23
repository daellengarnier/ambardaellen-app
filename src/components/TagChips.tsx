"use client";

type Props = {
  tags: string[];
  size?: "xs" | "sm" | "md";
  max?: number;
};

const TAG_COLOR: Record<string, { bg: string; fg: string }> = {
  arbeit: { bg: "rgba(75,48,80,0.12)", fg: "var(--plum)" },
  haushalt: { bg: "rgba(126,151,123,0.18)", fg: "#4F6B4C" },
  familie: { bg: "rgba(199,127,119,0.18)", fg: "#9A4E45" },
  freunde: { bg: "rgba(232,210,154,0.4)", fg: "#7A5E1F" },
  gesundheit: { bg: "rgba(126,151,123,0.18)", fg: "#4F6B4C" },
  finanzen: { bg: "rgba(75,48,80,0.12)", fg: "var(--plum)" },
  hobby: { bg: "rgba(232,210,154,0.4)", fg: "#7A5E1F" },
  spinnerei: { bg: "rgba(197,99,75,0.14)", fg: "var(--terra)" },
  reise: { bg: "rgba(199,127,119,0.18)", fg: "#9A4E45" },
  lernen: { bg: "rgba(75,48,80,0.12)", fg: "var(--plum)" },
};

const DEFAULT: { bg: string; fg: string } = {
  bg: "var(--cream-deep)",
  fg: "var(--ink-soft)",
};

const SIZES = {
  xs: { px: "0.45rem", py: "0.1rem", fs: 9.5 },
  sm: { px: "0.55rem", py: "0.15rem", fs: 10.5 },
  md: { px: "0.65rem", py: "0.2rem", fs: 11.5 },
};

export function TagChips({ tags, size = "sm", max }: Props) {
  if (!tags || tags.length === 0) return null;
  const shown = max ? tags.slice(0, max) : tags;
  const rest = max && tags.length > max ? tags.length - max : 0;
  const s = SIZES[size];
  return (
    <span className="inline-flex flex-wrap gap-1 items-center">
      {shown.map((tag) => {
        const c = TAG_COLOR[tag.toLowerCase()] ?? DEFAULT;
        return (
          <span
            key={tag}
            className="rounded-full font-medium leading-none"
            style={{
              background: c.bg,
              color: c.fg,
              paddingLeft: s.px,
              paddingRight: s.px,
              paddingTop: s.py,
              paddingBottom: s.py,
              fontSize: s.fs,
              letterSpacing: 0.1,
            }}
          >
            #{tag}
          </span>
        );
      })}
      {rest > 0 && (
        <span
          className="rounded-full font-medium leading-none"
          style={{
            background: DEFAULT.bg,
            color: DEFAULT.fg,
            paddingLeft: s.px,
            paddingRight: s.px,
            paddingTop: s.py,
            paddingBottom: s.py,
            fontSize: s.fs,
          }}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
