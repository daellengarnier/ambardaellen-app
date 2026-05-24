"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Calendar, ListTodo, ShoppingCart, Target, X } from "lucide-react";

type ActionKey = "activity" | "todo" | "shopping" | "goal";

type Action = {
  key: ActionKey;
  label: string;
  Icon: typeof Calendar;
  color: string;
};

const ACTIONS: Action[] = [
  { key: "activity", label: "Termin / Idee", Icon: Calendar, color: "var(--terra)" },
  { key: "todo", label: "Aufgabe", Icon: ListTodo, color: "var(--plum)" },
  { key: "shopping", label: "Einkauf-Item", Icon: ShoppingCart, color: "var(--sage)" },
  { key: "goal", label: "Ziel", Icon: Target, color: "var(--gold)" },
];

type Props = {
  onPick: (key: ActionKey) => void;
};

/**
 * Inline „+" Button (typischerweise im Header).
 * Klick öffnet ein Popover-Menü mit Schnell-Optionen.
 */
export function QuickAddMenu({ onPick }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tap w-9 h-9 rounded-full shadow-card flex items-center justify-center text-white"
        style={{ background: open ? "var(--ink)" : "var(--terra)" }}
        aria-label={open ? "Menü schließen" : "Schnell-Erfassung"}
        aria-expanded={open}
      >
        {open ? <X size={16} strokeWidth={2.25} /> : <Plus size={18} strokeWidth={2.25} />}
      </button>

      {open && (
        <>
          {/* Scrim, damit Klick ausserhalb schliesst (auch via touch) */}
          <div
            className="fixed inset-0 z-[70]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 flex flex-col gap-1.5 z-[71]"
            style={{ minWidth: 180 }}
          >
            {ACTIONS.map(({ key, label, Icon, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onPick(key);
                  setOpen(false);
                }}
                className="tap inline-flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full shadow-card text-[13.5px] font-medium qam-pop"
                style={{ background: "var(--paper)", color: "var(--ink)" }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 26,
                    height: 26,
                    background: color,
                    color: "white",
                  }}
                >
                  <Icon size={14} strokeWidth={2} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes qamPop {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        :global(.qam-pop) {
          animation: qamPop 200ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        :global(.qam-pop:nth-child(1)) {
          animation-delay: 0ms;
        }
        :global(.qam-pop:nth-child(2)) {
          animation-delay: 30ms;
        }
        :global(.qam-pop:nth-child(3)) {
          animation-delay: 60ms;
        }
        :global(.qam-pop:nth-child(4)) {
          animation-delay: 90ms;
        }
      `}</style>
    </div>
  );
}
