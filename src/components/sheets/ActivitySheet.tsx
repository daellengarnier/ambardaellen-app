"use client";

import { useState } from "react";
import {
  MapPin,
  Heart,
  Calendar as CalIcon,
  X,
  Check,
  Plus,
  RotateCcw,
  Users,
  Lock,
  Layers,
} from "lucide-react";
import { Sheet } from "../Sheet";
import { DetailRow } from "../DetailRow";
import { ActivityIcon } from "../ActivityIcon";
import { Avatar } from "../Avatar";
import { ScopeToggle } from "../ScopeToggle";
import { TagInput } from "../TagInput";
import { PacklistTemplatePicker } from "./PacklistTemplatePicker";
import { useStore } from "@/lib/store";
import type { Activity, PacklistItem, Scope, UserId } from "@/lib/types";
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
  const activities = useStore((s) => s.activities);
  const addPacklistItem = useStore((s) => s.addPacklistItem);
  const togglePacklistItem = useStore((s) => s.togglePacklistItem);
  const removePacklistItem = useStore((s) => s.removePacklistItem);
  const resetPacklist = useStore((s) => s.resetPacklist);

  // Live-Sync: aktuelle Packliste aus dem Store ziehen.
  const live = activity ? activities.find((x) => x.id === activity.id) ?? activity : null;

  const [packInput, setPackInput] = useState("");
  const [packScope, setPackScope] = useState<Scope>("geteilt");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  if (!live) return null;
  const a = live;

  const knownTags = Array.from(new Set(activities.flatMap((x) => x.tags ?? []))).filter(
    (t) => !(a.tags ?? []).includes(t),
  );

  const packedCount = a.packlist.filter((p) => p.packed).length;
  // Nur eigene Privat-Items + Gemeinsam-Items zeigen.
  const visiblePacklist = a.packlist.filter(
    (p) => p.scope === "geteilt" || p.scope === currentUser,
  );

  const submitPack = () => {
    if (!packInput.trim()) return;
    addPacklistItem(a.id, packInput, packScope);
    setPackInput("");
  };

  return (
    <Sheet open onClose={onClose} title="Aktivität">
      <div className="flex items-center gap-3 mb-4">
        <ActivityIcon kind={a.icon} size={40} />
        <div className="flex-1 min-w-0">
          <div className="serif-i text-[22px] leading-tight">{a.title}</div>
          <div className="text-[13px] mt-1" style={{ color: "var(--ink-soft)" }}>
            {a.date
              ? a.dateEnd && a.dateEnd !== a.date
                ? `${formatDate(a.date)} – ${formatDate(a.dateEnd)}`
                : formatDate(a.date)
              : "Ohne Datum"}
            {a.time && ` · ${a.time}`}
          </div>
        </div>
      </div>

      {/* Datums-Editor */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="uplabel text-[10px] mb-1.5" style={{ color: "var(--muted)" }}>
            Datum
          </div>
          <input
            type="date"
            value={a.date}
            onChange={(e) => onChange(a.id, { date: e.target.value })}
            className="w-full rounded-2xl px-3 py-2 text-[14px]"
            style={{ background: "rgba(228,217,191,0.5)" }}
          />
        </div>
        <div>
          <div className="uplabel text-[10px] mb-1.5" style={{ color: "var(--muted)" }}>
            Bis (optional)
          </div>
          <input
            type="date"
            value={a.dateEnd}
            onChange={(e) => onChange(a.id, { dateEnd: e.target.value })}
            className="w-full rounded-2xl px-3 py-2 text-[14px]"
            style={{ background: "rgba(228,217,191,0.5)" }}
          />
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

      <div className="uplabel text-[10.5px] mt-4 mb-1.5" style={{ color: "var(--muted)" }}>
        Bereiche / Tags
      </div>
      <TagInput
        value={a.tags ?? []}
        onChange={(next) => onChange(a.id, { tags: next })}
        knownTags={knownTags}
      />

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

      {/* Packliste */}
      <div className="mt-5">
        <div
          className="uplabel text-[10.5px] mb-2 flex items-center justify-between"
          style={{ color: "var(--muted)" }}
        >
          <span>
            Packliste {a.packlist.length > 0 && `· ${packedCount}/${a.packlist.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTemplatePickerOpen(true)}
              className="tap inline-flex items-center gap-1 normal-case tracking-normal text-[11px] font-medium"
              style={{ color: "var(--terra)" }}
            >
              <Layers size={11} strokeWidth={2} /> Vorlage
            </button>
            {a.packlist.length > 0 && (
              <button
                type="button"
                onClick={() => resetPacklist(a.id)}
                className="tap inline-flex items-center gap-1 normal-case tracking-normal text-[11px] font-medium"
                style={{ color: "var(--ink-soft)" }}
              >
                <RotateCcw size={11} strokeWidth={2} /> reset
              </button>
            )}
          </div>
        </div>

        {visiblePacklist.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden mb-2"
            style={{ background: "rgba(228,217,191,0.4)" }}
          >
            {visiblePacklist.map((p, i) => (
              <PacklistRow
                key={p.id}
                item={p}
                last={i === visiblePacklist.length - 1}
                onToggle={() => togglePacklistItem(a.id, p.id)}
                onRemove={() => removePacklistItem(a.id, p.id)}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 items-stretch">
          <div className="flex-1 flex items-center rounded-2xl px-3 gap-2" style={{ background: "rgba(228,217,191,0.5)" }}>
            <input
              value={packInput}
              onChange={(e) => setPackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitPack();
              }}
              placeholder="Was muss mit?"
              className="flex-1 bg-transparent text-[14px] py-2.5"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <button
            type="button"
            onClick={submitPack}
            className="px-3 rounded-2xl tap text-white"
            style={{ background: "var(--terra)" }}
            aria-label="Item hinzufügen"
          >
            <Plus size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex gap-1.5 mt-1.5">
          <button
            type="button"
            onClick={() => setPackScope("geteilt")}
            className="tap text-[11px] rounded-full px-2.5 py-1 font-medium inline-flex items-center gap-1"
            style={
              packScope === "geteilt"
                ? { background: "var(--paper)", color: "var(--ink)" }
                : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
            }
          >
            <Users size={11} strokeWidth={1.75} /> gemeinsam packen
          </button>
          <button
            type="button"
            onClick={() => setPackScope(currentUser)}
            className="tap text-[11px] rounded-full px-2.5 py-1 font-medium inline-flex items-center gap-1"
            style={
              packScope === currentUser
                ? { background: "var(--paper)", color: "var(--ink)" }
                : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
            }
          >
            <Lock size={11} strokeWidth={2} /> nur für mich
          </button>
        </div>
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

      <PacklistTemplatePicker
        open={templatePickerOpen}
        activityId={a.id}
        onClose={() => setTemplatePickerOpen(false)}
      />
    </Sheet>
  );
}

function PacklistRow({
  item,
  last,
  onToggle,
  onRemove,
}: {
  item: PacklistItem;
  last: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5"
      style={last ? undefined : { borderBottom: "1px solid rgba(218,201,168,0.4)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-5 h-5 rounded-md tap shrink-0 flex items-center justify-center"
        style={
          item.packed
            ? { background: "var(--sage)", color: "white" }
            : { background: "var(--paper)", border: "1px solid rgba(151,134,117,0.6)" }
        }
        aria-label={item.packed ? "Wieder offen" : "Eingepackt"}
      >
        {item.packed && <Check size={13} strokeWidth={3} />}
      </button>
      <div
        className="flex-1 text-[14px] leading-snug min-w-0"
        style={item.packed ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
      >
        {item.text}
      </div>
      {item.scope !== "geteilt" ? (
        <Lock size={11} strokeWidth={2} color="var(--muted)" />
      ) : (
        <Users size={11} strokeWidth={1.75} color="var(--muted)" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="tap p-1"
        style={{ color: "var(--muted)" }}
        aria-label="Entfernen"
      >
        <X size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
}
