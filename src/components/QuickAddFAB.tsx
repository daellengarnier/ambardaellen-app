"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Calendar, ListTodo, ShoppingCart, Target, X } from "lucide-react";

type Action = {
  key: "activity" | "todo" | "shopping" | "goal";
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
  onPick: (key: Action["key"]) => void;
};

export function QuickAddFAB({ onPick }: Props) {
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
    <div
      ref={ref}
      className="fixed z-[80] mx-auto pointer-events-none"
      style={{
        left: 0,
        right: 0,
        bottom: "calc(env(safe-area-inset-bottom) + 118px)",
        maxWidth: 480,
      }}
    >
      <div className="relative h-0">
        <div
          className="absolute right-4 flex flex-col items-end gap-2 pointer-events-auto"
          style={{ bottom: 0 }}
        >
          {open &&
            ACTIONS.map(({ key, label, Icon, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onPick(key);
                  setOpen(false);
                }}
                className="tap inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-card text-[13.5px] font-medium fab-pop"
                style={{ background: "var(--paper)", color: "var(--ink)" }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    background: color,
                    color: "white",
                  }}
                >
                  <Icon size={13} strokeWidth={2} />
                </span>
                {label}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="tap w-14 h-14 rounded-full shadow-float flex items-center justify-center"
            style={{
              background: open ? "var(--ink)" : "var(--terra)",
              color: "white",
            }}
            aria-label={open ? "Menü schließen" : "Schnell-Erfassung"}
            aria-expanded={open}
          >
            {open ? <X size={22} strokeWidth={2} /> : <Plus size={26} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fabPop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        :global(.fab-pop) {
          animation: fabPop 220ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        :global(.fab-pop:nth-child(1)) {
          animation-delay: 0ms;
        }
        :global(.fab-pop:nth-child(2)) {
          animation-delay: 40ms;
        }
        :global(.fab-pop:nth-child(3)) {
          animation-delay: 80ms;
        }
        :global(.fab-pop:nth-child(4)) {
          animation-delay: 120ms;
        }
      `}</style>
    </div>
  );
}
