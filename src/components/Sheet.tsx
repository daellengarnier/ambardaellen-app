"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, children }: Props) {
  const incSheetOpen = useStore((s) => s.incSheetOpen);
  const decSheetOpen = useStore((s) => s.decSheetOpen);

  useEffect(() => {
    if (!open) return;
    incSheetOpen();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      decSheetOpen();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, incSheetOpen, decSheetOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/30 scrim-enter pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[480px] sheet-enter pointer-events-auto">
        <div
          className="rounded-t-3xl shadow-float overflow-hidden flex flex-col"
          style={{
            background: "var(--paper)",
            maxHeight: "88dvh",
            paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
          }}
        >
          <div className="flex justify-center pt-2 pb-1 shrink-0">
            <div className="w-10 h-1.5 rounded-full" style={{ background: "var(--line)" }} />
          </div>
          {title && (
            <div className="flex items-center justify-between px-5 pt-1 pb-2 shrink-0">
              <h3 className="serif-i text-[26px] leading-tight" style={{ color: "var(--mens)" }}>{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="tap p-1.5 -mr-1 rounded-full"
                style={{ color: "var(--ink-soft)" }}
                aria-label="Schliessen"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
          )}
          <div className="phone-scroll overflow-y-auto px-5 pb-7 grow">{children}</div>
        </div>
      </div>
    </div>
  );
}
