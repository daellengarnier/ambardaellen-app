"use client";

import { useMemo, useState } from "react";
import { Calendar as CalIcon, Clock, ExternalLink, Sparkles, Sun, Trash2 } from "lucide-react";
import { Sheet } from "../Sheet";
import { DetailRow } from "../DetailRow";
import { TagInput } from "../TagInput";
import { AreaPicker } from "../AreaPicker";
import { Label } from "./TodoAddSheet";
import { useLife } from "@/lib/lifeStore";
import { todayZurich, type TodoDto, type TodoPatch } from "@/lib/life";
import type { Priority } from "@/lib/types";
import { relativeWhen } from "@/lib/date";
import { PRIO } from "@/lib/todo";

type Props = {
  /** ID statt Objekt: das Sheet liest immer den aktuellen Stand aus dem Store. */
  todoId: string | null;
  onClose: () => void;
};

const SOURCE_LABEL: Record<string, string> = {
  app: "App",
  jarvis: "Jarvis",
  telegram: "Telegram",
  inbox: "Inbox",
  migration: "alte App",
  "orga-app": "Orga-App Spinnerei",
};

export function TodoSheet({ todoId, onClose }: Props) {
  const todo = useLife((s) => s.todos.find((t) => t.id === todoId) ?? null);
  if (!todo) return null;
  // key: Formular neu aufsetzen, wenn ein anderes Todo geöffnet wird.
  return <TodoDetail key={todo.id} todo={todo} onClose={onClose} />;
}

function TodoDetail({ todo, onClose }: { todo: TodoDto; onClose: () => void }) {
  const areas = useLife((s) => s.areas);
  const todos = useLife((s) => s.todos);
  const updateTodo = useLife((s) => s.updateTodo);
  const removeTodo = useLife((s) => s.removeTodo);

  const [text, setText] = useState(todo.text);
  const [note, setNote] = useState(todo.note);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const knownTags = useMemo(
    () => Array.from(new Set(todos.flatMap((t) => t.tags))).filter((t) => !todo.tags.includes(t)),
    [todos, todo.tags],
  );

  const change = (patch: TodoPatch) => updateTodo(todo.id, patch);
  const today = todayZurich();
  const plannedToday = todo.plannedFor === today;
  const done = todo.status !== "offen";
  const sourceIsLink = todo.sourceRef && /^https?:\/\//.test(todo.sourceRef);

  return (
    <Sheet open onClose={onClose} title="Aufgabe">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text.trim() && text.trim() !== todo.text && change({ text: text.trim() })}
        className="w-full bg-transparent text-[21px] font-semibold leading-tight"
        aria-label="Titel"
      />

      <button
        type="button"
        onClick={() => change({ plannedFor: plannedToday ? null : today })}
        className="tap mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium"
        style={
          plannedToday
            ? { background: "var(--gold)", color: "white" }
            : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
        }
      >
        <Sun size={13} strokeWidth={2} /> {plannedToday ? "Für heute geplant" : "Heute erledigen"}
      </button>

      <div className="mt-4">
        <Label>Bereich</Label>
        <AreaPicker areas={areas} value={todo.area} onChange={(area) => change({ area })} />
      </div>

      <div className="mt-4">
        <Label>Fällig</Label>
        <input
          type="date"
          value={todo.due ?? ""}
          onChange={(e) => change({ due: e.target.value || null })}
          className="w-full rounded-2xl px-3.5 py-2.5 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      <div className="mt-4">
        <Label>Priorität</Label>
        <div className="inline-flex p-0.5 rounded-full" style={{ background: "var(--cream-deep)" }}>
          {(Object.entries(PRIO) as Array<[Priority, (typeof PRIO)[Priority]]>).map(([k, v]) => {
            const active = todo.prio === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => change({ prio: k })}
                className="px-3 py-1 text-[12px] rounded-full font-medium tap inline-flex items-center gap-1"
                style={active ? { background: "var(--paper)", color: v.color } : { color: "var(--ink-soft)" }}
              >
                {v.dot && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />}
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Label>Tags</Label>
        <TagInput value={todo.tags} onChange={(tags) => change({ tags })} knownTags={knownTags} />
      </div>

      <div className="mt-4">
        <Label>Notiz</Label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== todo.note && change({ note })}
          rows={3}
          placeholder="Details, Kontakt, Links…"
          className="w-full rounded-2xl p-3 text-[14.5px] resize-none"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      <div className="mt-3 space-y-1">
        <DetailRow
          label="Erstellt"
          value={`${todo.createdBy === "jarvis" ? "Jarvis" : "Alain"} · ${relativeWhen(Date.parse(todo.createdAt))}`}
          icon={todo.createdBy === "jarvis" ? <Sparkles size={16} /> : <Clock size={16} />}
        />
        <DetailRow
          label="Quelle"
          value={
            sourceIsLink ? (
              <a
                href={todo.sourceRef!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline"
              >
                {SOURCE_LABEL[todo.source] ?? todo.source} <ExternalLink size={12} />
              </a>
            ) : (
              SOURCE_LABEL[todo.source] ?? todo.source
            )
          }
          icon={<CalIcon size={16} />}
        />
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={() => {
            change({ status: done ? "offen" : "erledigt" });
            onClose();
          }}
          className="flex-1 py-3 rounded-2xl text-[15px] font-semibold tap"
          style={done ? { background: "var(--cream-deep)", color: "var(--ink)" } : { background: "var(--sage)", color: "white" }}
        >
          {done ? "Wieder offen" : "Erledigt ✓"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              return;
            }
            removeTodo(todo.id);
            onClose();
          }}
          className="px-4 rounded-2xl tap text-[13px] font-medium inline-flex items-center gap-1.5"
          style={
            confirmDelete
              ? { background: "var(--terra)", color: "white" }
              : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
          }
          aria-label="Löschen"
        >
          <Trash2 size={16} strokeWidth={1.75} />
          {confirmDelete && "Löschen?"}
        </button>
      </div>
    </Sheet>
  );
}
