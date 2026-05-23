"use client";

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
}) {
  return (
    <div
      className="inline-flex p-1 rounded-full"
      style={{ background: "var(--cream-deep)" }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3.5 py-1.5 rounded-full text-[13.5px] font-medium tap"
            style={
              active
                ? { background: "var(--paper)", color: "var(--ink)" }
                : { color: "var(--ink-soft)", background: "transparent" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
