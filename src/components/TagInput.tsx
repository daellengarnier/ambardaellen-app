"use client";

import { useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { TAG_SUGGESTIONS } from "@/lib/types";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  knownTags?: string[];
};

export function TagInput({ value, onChange, knownTags = [] }: Props) {
  const [input, setInput] = useState("");

  const suggestions = useMemo(() => {
    const all = new Set<string>([...TAG_SUGGESTIONS, ...knownTags.map((t) => t.toLowerCase())]);
    value.forEach((v) => all.delete(v.toLowerCase()));
    return [...all].sort();
  }, [value, knownTags]);

  const add = (raw: string) => {
    const t = raw.trim().toLowerCase().replace(/^#/, "");
    if (!t) return;
    if (value.map((v) => v.toLowerCase()).includes(t)) return;
    onChange([...value, t]);
    setInput("");
  };
  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5 items-center">
        {value.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => remove(t)}
            className="tap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium"
            style={{ background: "var(--terra-soft)", color: "var(--terra-deep)" }}
            aria-label={`Tag entfernen: ${t}`}
          >
            #{t} <X size={11} strokeWidth={2} />
          </button>
        ))}
        <div
          className="flex items-center gap-1 rounded-full px-1 py-0.5"
          style={{ background: "var(--cream-deep)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(input);
              } else if (e.key === "Backspace" && !input && value.length) {
                remove(value[value.length - 1]);
              }
            }}
            placeholder="+ Tag"
            className="bg-transparent text-[12px] px-2 py-1 w-[80px] focus:outline-none"
            style={{ color: "var(--ink)" }}
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => add(input)}
              className="tap w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--terra)", color: "white" }}
              aria-label="Tag hinzufügen"
            >
              <Plus size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="tap text-[11px] rounded-full px-2 py-0.5 font-medium"
              style={{ background: "transparent", color: "var(--muted)", border: "1px dashed var(--line)" }}
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
