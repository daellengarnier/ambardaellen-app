"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Sun } from "lucide-react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { TagInput } from "../TagInput";
import { AreaPicker } from "../AreaPicker";
import { useLife } from "@/lib/lifeStore";
import { todayZurich, type TodoInput } from "@/lib/life";
import type { Priority } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: TodoInput) => void;
  title?: string;
  submitLabel?: string;
  initialText?: string;
  initialPlannedToday?: boolean;
  /** Zusätzliche Aktionen unter dem Hauptknopf (z.B. in der Inbox). */
  footer?: ReactNode;
};

export function TodoAddSheet({ open, ...rest }: Props) {
  if (!open) return null;
  return <TodoAddForm {...rest} />;
}

function TodoAddForm({
  onClose,
  onSubmit,
  title = "Neue Aufgabe",
  submitLabel = "Hinzufügen",
  initialText = "",
  initialPlannedToday = false,
  footer,
}: Omit<Props, "open">) {
  const areas = useLife((s) => s.areas);
  const todos = useLife((s) => s.todos);
  const knownTags = useMemo(() => Array.from(new Set(todos.flatMap((t) => t.tags))), [todos]);

  const [text, setText] = useState(initialText);
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");
  const [prio, setPrio] = useState<Priority>("normal");
  const [area, setArea] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [today, setToday] = useState(initialPlannedToday);

  const submit = () => {
    if (!text.trim()) return;
    onSubmit({
      text: text.trim(),
      note,
      due: due || null,
      prio,
      area,
      tags,
      plannedFor: today ? todayZurich() : null,
    });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={title}>
      <div className="mt-3">
        <Label>Was?</Label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
          placeholder="z. B. Gage für Doom Gong bestätigen"
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "var(--cream-deep)" }}
        />
      </div>

      <button
        type="button"
        onClick={() => setToday((v) => !v)}
        className="tap mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium"
        style={
          today
            ? { background: "var(--gold)", color: "white" }
            : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
        }
      >
        <Sun size={13} strokeWidth={2} /> Heute erledigen
      </button>

      <div className="mt-3">
        <Label>Bereich</Label>
        <AreaPicker areas={areas} value={area} onChange={setArea} />
      </div>

      <div className="mt-3">
        <Label>Fällig (optional)</Label>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "var(--cream-deep)" }}
        />
      </div>

      <div className="mt-3">
        <Label>Priorität</Label>
        <Segmented
          value={prio}
          onChange={(v) => setPrio(v as Priority)}
          options={[
            { value: "tief", label: "Tief" },
            { value: "normal", label: "Normal" },
            { value: "hoch", label: "Hoch" },
          ]}
        />
      </div>

      <div className="mt-3">
        <Label>Tags</Label>
        <TagInput value={tags} onChange={setTags} knownTags={knownTags} />
      </div>

      <div className="mt-3">
        <Label>Notiz (optional)</Label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Details, Kontakt, Links…"
          className="w-full rounded-2xl p-3 text-[14.5px] resize-none"
          style={{ background: "var(--cream-deep)" }}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: text.trim() ? "var(--terra)" : "var(--terra-soft)" }}
      >
        {submitLabel}
      </button>
      {footer}
    </Sheet>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
      {children}
    </div>
  );
}
