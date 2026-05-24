"use client";

import { Trash2 } from "lucide-react";

type Props = {
  /** Beschreibung des Items im Confirm-Dialog (z. B. „Tomaten") */
  label: string;
  /** Optional vorangestelltes Substantiv im Confirm: „Aufgabe", „Aktivität", „Ziel"… */
  kind?: string;
  onConfirm: () => void;
  size?: number;
};

export function DeleteAction({ label, kind, onConfirm, size = 14 }: Props) {
  const prompt = kind
    ? `${kind} „${label}" wirklich löschen?`
    : `„${label}" wirklich löschen?`;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (typeof window !== "undefined" && window.confirm(prompt)) {
          onConfirm();
        }
      }}
      className="tap shrink-0 inline-flex items-center justify-center rounded-full"
      style={{ width: size + 12, height: size + 12, color: "var(--muted)" }}
      aria-label={`Löschen: ${label}`}
      title="Löschen"
    >
      <Trash2 size={size} strokeWidth={1.75} />
    </button>
  );
}
