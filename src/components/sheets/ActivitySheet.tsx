"use client";

import { MapPin, Heart, Calendar as CalIcon, X } from "lucide-react";
import { Sheet } from "../Sheet";
import { DetailRow } from "../DetailRow";
import { ActivityIcon } from "../ActivityIcon";
import { Avatar } from "../Avatar";
import { ScopeToggle } from "../ScopeToggle";
import type { Activity, UserId } from "@/lib/types";
import { USERS } from "@/lib/types";
import { formatDate } from "@/lib/date";
import { downloadICS } from "@/lib/ical";

type Props = {
  activity: Activity | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<Activity>) => void;
  onDelete: (id: string) => void;
  currentUser: UserId;
};

export function ActivitySheet({ activity, onClose, onChange, onDelete, currentUser }: Props) {
  if (!activity) return null;
  const a = activity;
  return (
    <Sheet open onClose={onClose} title="Aktivität">
      <div className="flex items-center gap-3 mb-4">
        <ActivityIcon kind={a.icon} size={40} />
        <div className="flex-1 min-w-0">
          <div className="serif-i text-[22px] leading-tight">{a.title}</div>
          <div className="text-[13px] mt-1" style={{ color: "var(--ink-soft)" }}>
            {a.date ? formatDate(a.date) : "Ohne Datum"}
            {a.time && ` · ${a.time}`}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {a.place && <DetailRow label="Ort" value={a.place} icon={<MapPin size={16} />} />}
        <DetailRow
          label="Hinzugefügt von"
          value={
            <span className="inline-flex items-center gap-2">
              <Avatar id={a.by} size={20} />
              {USERS[a.by].name}
            </span>
          }
          icon={<Heart size={16} />}
        />
      </div>

      {a.note && (
        <div
          className="rounded-2xl p-3.5 mt-3"
          style={{ background: "rgba(228,217,191,0.5)" }}
        >
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            Notiz
          </div>
          <div className="text-[14.5px] mt-1 whitespace-pre-line leading-relaxed">{a.note}</div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
          Sichtbar für
        </div>
        <ScopeToggle
          value={a.scope || "geteilt"}
          onChange={(s) => onChange(a.id, { scope: s })}
          currentUser={currentUser}
          compact
        />
      </div>

      <div className="flex gap-2 mt-5">
        {a.status !== "erledigt" ? (
          <button
            type="button"
            onClick={() => {
              onChange(a.id, { status: "erledigt" });
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl text-white text-[15px] font-semibold tap"
            style={{ background: "var(--sage)" }}
          >
            Erledigt ✓
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onChange(a.id, { status: "geplant" });
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl text-[15px] font-semibold tap"
            style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
          >
            Wieder planen
          </button>
        )}
        {a.status === "idee" && (
          <button
            type="button"
            onClick={() => {
              onChange(a.id, { status: "geplant" });
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl text-white text-[15px] font-semibold tap"
            style={{ background: "var(--terra)" }}
          >
            Einplanen
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onDelete(a.id);
            onClose();
          }}
          className="px-4 rounded-2xl tap"
          style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
          aria-label="Löschen"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      {a.date && a.status !== "erledigt" && (
        <button
          type="button"
          onClick={() => downloadICS(a)}
          className="w-full mt-2.5 py-3 rounded-2xl text-[14.5px] font-semibold tap inline-flex items-center justify-center gap-2"
          style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
        >
          <CalIcon size={16} strokeWidth={1.75} /> Zum iPhone Kalender hinzufügen
        </button>
      )}
    </Sheet>
  );
}
