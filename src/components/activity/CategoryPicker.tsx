"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";
import { PACK_CATEGORIES_DEFAULT } from "@/lib/types";

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Bekannte Kategorien (aus bestehenden Items) zusätzlich zu den Defaults */
  knownCategories?: string[];
};

export function CategoryPicker({ value, onChange, knownCategories = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newCat, setNewCat] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreatingNew(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const all = Array.from(new Set([...PACK_CATEGORIES_DEFAULT, ...knownCategories])).sort(
    (a, b) => {
      const da = (PACK_CATEGORIES_DEFAULT as readonly string[]).indexOf(a);
      const db = (PACK_CATEGORIES_DEFAULT as readonly string[]).indexOf(b);
      if (da !== -1 && db !== -1) return da - db;
      if (da !== -1) return -1;
      if (db !== -1) return 1;
      return a.localeCompare(b);
    },
  );

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tap text-[11px] rounded-full px-2.5 py-1 font-medium inline-flex items-center gap-1"
        style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
      >
        {value || "Kategorie"}
        <ChevronDown size={11} strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute z-[110] left-0 mt-1 rounded-2xl shadow-card p-1.5"
          style={{ background: "var(--paper)", minWidth: 160 }}
        >
          <div className="max-h-[220px] overflow-y-auto phone-scroll">
            {all.map((c) => {
              const active = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className="tap w-full text-left text-[13px] px-3 py-1.5 rounded-xl inline-flex items-center gap-2"
                  style={
                    active
                      ? { background: "var(--cream-deep)", color: "var(--ink)" }
                      : { color: "var(--ink-soft)" }
                  }
                >
                  {active && <Check size={12} strokeWidth={2} />}
                  <span className={active ? "" : "pl-4"}>{c}</span>
                </button>
              );
            })}
          </div>

          {creatingNew ? (
            <div className="border-t mt-1 pt-1.5 flex items-center gap-1" style={{ borderColor: "var(--line)" }}>
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCat.trim()) {
                    onChange(newCat.trim());
                    setNewCat("");
                    setCreatingNew(false);
                    setOpen(false);
                  }
                }}
                placeholder="Neue Kategorie"
                autoFocus
                className="flex-1 bg-transparent text-[13px] px-2 py-1 min-w-0"
                style={{ color: "var(--ink)" }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCat.trim()) {
                    onChange(newCat.trim());
                    setNewCat("");
                    setCreatingNew(false);
                    setOpen(false);
                  }
                }}
                className="tap w-6 h-6 rounded-md flex items-center justify-center text-white"
                style={{ background: "var(--terra)" }}
                aria-label="Hinzufügen"
              >
                <Plus size={12} strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreatingNew(true)}
              className="tap w-full text-left text-[12px] px-3 py-1.5 rounded-xl inline-flex items-center gap-2"
              style={{ color: "var(--terra)", borderTop: "1px solid var(--line)", marginTop: 4 }}
            >
              <Plus size={11} strokeWidth={2.25} /> neue Kategorie
            </button>
          )}
        </div>
      )}
    </div>
  );
}
