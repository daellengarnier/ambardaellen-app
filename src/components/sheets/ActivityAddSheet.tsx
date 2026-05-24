"use client";

import { useState } from "react";
import { Heart, Coffee, Leaf, Sparkles, BookOpen, Home } from "lucide-react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { ScopeToggle } from "../ScopeToggle";
import { TagInput } from "../TagInput";
import { useStore } from "@/lib/store";
import type { Activity, ActivityIconKind, ActivityStatus, Scope, UserId } from "@/lib/types";

const ACT_ICONS: Array<{ v: ActivityIconKind; Icon: typeof Heart }> = [
  { v: "heart", Icon: Heart },
  { v: "coffee", Icon: Coffee },
  { v: "leaf", Icon: Leaf },
  { v: "sparkle", Icon: Sparkles },
  { v: "book", Icon: BookOpen },
  { v: "house", Icon: Home },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: Omit<Activity, "id" | "by">) => void;
  currentUser: UserId;
};

export function ActivityAddSheet({ open, onClose, onAdd, currentUser }: Props) {
  if (!open) return null;
  return <ActivityAddForm onClose={onClose} onAdd={onAdd} currentUser={currentUser} />;
}

function ActivityAddForm({
  onClose,
  onAdd,
  currentUser,
}: {
  onClose: () => void;
  onAdd: (input: Omit<Activity, "id" | "by">) => void;
  currentUser: UserId;
}) {
  const activities = useStore((s) => s.activities);
  const knownTags = Array.from(new Set(activities.flatMap((a) => a.tags ?? [])));

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [icon, setIcon] = useState<ActivityIconKind>("heart");
  const [status, setStatus] = useState<ActivityStatus>("geplant");
  const [scope, setScope] = useState<Scope>("geteilt");
  const [tags, setTags] = useState<string[]>([]);

  return (
    <Sheet open onClose={onClose} title="Neue Aktivität">
      <Field label="Was?" value={title} onChange={setTitle} placeholder="z. B. Picknick im Park" autoFocus />

      <div className="grid grid-cols-2 gap-2 mt-3">
        <DateField label="Datum" value={date} onChange={setDate} type="date" />
        <DateField label="Zeit" value={time} onChange={setTime} type="time" />
      </div>

      <div className="mt-3">
        <DateField
          label="Bis (optional, für mehrtägige Trips)"
          value={dateEnd}
          onChange={setDateEnd}
          type="date"
        />
      </div>

      <Field label="Ort (optional)" value={place} onChange={setPlace} placeholder="z. B. Tempelhofer Feld" />

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Status
      </div>
      <Segmented
        value={status}
        onChange={(v) => setStatus(v as ActivityStatus)}
        options={[
          { value: "geplant", label: "Geplant" },
          { value: "idee", label: "Idee" },
          { value: "erledigt", label: "Erledigt" },
        ]}
      />

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Bereiche / Tags
      </div>
      <TagInput value={tags} onChange={setTags} knownTags={knownTags} />

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Icon
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {ACT_ICONS.map(({ v, Icon }) => {
          const active = icon === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setIcon(v)}
              className="tap w-10 h-10 rounded-2xl flex items-center justify-center"
              style={
                active
                  ? { background: "var(--terra)", color: "white" }
                  : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
              }
              aria-label={v}
            >
              <Icon size={18} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Notiz (optional)
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Details, Reservierung, Links…"
        className="w-full rounded-2xl p-3 text-[14.5px] resize-none"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Sichtbar für
      </div>
      <ScopeToggle value={scope} onChange={setScope} currentUser={currentUser} />

      <button
        type="button"
        onClick={() => {
          if (!title.trim()) return;
          onAdd({
            title: title.trim(),
            date,
            dateEnd,
            time,
            place,
            status,
            scope,
            note,
            icon,
            tags,
            packlist: [],
          });
          onClose();
        }}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: "var(--terra)" }}
      >
        Hinzufügen
      </button>
    </Sheet>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="mt-3">
      <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: "date" | "time";
}) {
  return (
    <div>
      <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />
    </div>
  );
}
