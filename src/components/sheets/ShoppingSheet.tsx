"use client";

import { Heart, Clock, X, Users, Lock } from "lucide-react";
import { Sheet } from "../Sheet";
import { DetailRow } from "../DetailRow";
import { Avatar } from "../Avatar";
import type { ShoppingItem, UserId } from "@/lib/types";
import { USERS } from "@/lib/types";
import { relativeWhen } from "@/lib/date";

type Props = {
  item: ShoppingItem | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onChange: (id: string, patch: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
  currentUser: UserId;
};

export function ShoppingSheet({ item, onClose, onToggle, onChange, onDelete, currentUser }: Props) {
  if (!item) return null;
  return (
    <Sheet open onClose={onClose} title="Eintrag">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[24px] font-semibold leading-tight flex items-center gap-1.5">
            {item.spinnerei && <span style={{ color: "var(--terra)" }}>✦</span>}
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
        <DetailRow
          label="Hinzugefügt von"
          value={
            <span className="inline-flex items-center gap-2">
              <Avatar id={item.by} size={20} />
              {USERS[item.by].name}
            </span>
          }
          icon={<Heart size={16} />}
        />
        <DetailRow label="Wann" value={relativeWhen(item.addedAt)} icon={<Clock size={16} />} />
      </div>

      <div className="uplabel text-[10.5px] mt-4 mb-1.5" style={{ color: "var(--muted)" }}>
        Liste
      </div>
      <div
        className="inline-flex p-0.5 rounded-full"
        style={{ background: "var(--cream-deep)" }}
      >
        <button
          type="button"
          onClick={() => onChange(item.id, { spinnerei: false, scope: "geteilt" })}
          className="px-2.5 py-1 text-[12px] rounded-full tap font-medium inline-flex items-center gap-1"
          style={
            !item.spinnerei && item.scope === "geteilt"
              ? { background: "var(--paper)", color: "var(--ink)" }
              : { color: "var(--ink-soft)" }
          }
        >
          <Users size={12} /> Gemeinsam
        </button>
        <button
          type="button"
          onClick={() => onChange(item.id, { spinnerei: false, scope: currentUser })}
          className="px-2.5 py-1 text-[12px] rounded-full tap font-medium inline-flex items-center gap-1"
          style={
            !item.spinnerei && item.scope !== "geteilt"
              ? { background: "var(--paper)", color: "var(--ink)" }
              : { color: "var(--ink-soft)" }
          }
        >
          <Lock size={12} strokeWidth={2} /> Privat
        </button>
        <button
          type="button"
          onClick={() => onChange(item.id, { spinnerei: true })}
          className="px-2.5 py-1 text-[12px] rounded-full tap font-medium inline-flex items-center gap-1"
          style={
            item.spinnerei
              ? { background: "var(--paper)", color: "var(--terra)" }
              : { color: "var(--ink-soft)" }
          }
        >
          <span>✦</span> Spinnerei
        </button>
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
