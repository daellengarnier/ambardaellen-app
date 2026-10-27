"use client";

import { Clock, X } from "lucide-react";
import { Sheet } from "../Sheet";
import { DetailRow } from "../DetailRow";
import type { ShoppingItem, UserId } from "@/lib/types";
import { relativeWhen } from "@/lib/date";

type Props = {
  item: ShoppingItem | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  /** Wird von den Aufrufern noch übergeben, das Sheet ändert aber nichts mehr. */
  onChange?: (id: string, patch: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
  currentUser?: UserId;
};

export function ShoppingSheet({ item, onClose, onToggle, onDelete }: Props) {
  if (!item) return null;
  return (
    <Sheet open onClose={onClose} title="Eintrag">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[24px] font-semibold leading-tight flex items-center gap-1.5">
            {item.text}
          </div>
          {item.qty && (
            <div className="text-[13.5px] mt-1" style={{ color: "var(--ink-soft)" }}>
              {item.qty}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <DetailRow label="Wann" value={relativeWhen(item.addedAt)} icon={<Clock size={16} />} />
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={() => {
            onToggle(item.id);
            onClose();
          }}
          className="flex-1 py-3 rounded-2xl text-[15px] font-semibold tap"
          style={
            item.done
              ? { background: "var(--cream-deep)", color: "var(--ink)" }
              : { background: "var(--sage)", color: "white" }
          }
        >
          {item.done ? "Wieder offen" : "Gekauft ✓"}
        </button>
        <button
          type="button"
          onClick={() => {
            onDelete(item.id);
            onClose();
          }}
          className="px-4 rounded-2xl tap"
          style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
          aria-label="Löschen"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>
    </Sheet>
  );
}
