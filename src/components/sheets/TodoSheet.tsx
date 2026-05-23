"use client";

import { Calendar as CalIcon, Clock, X } from "lucide-react";
import { Sheet } from "../Sheet";
import { DetailRow } from "../DetailRow";
import { Avatar } from "../Avatar";
import { ScopeToggle } from "../ScopeToggle";
import type { Priority, Todo, UserId } from "@/lib/types";
import { USERS } from "@/lib/types";
import { formatDate, relativeWhen } from "@/lib/date";
import { PRIO } from "@/lib/todo";

type Props = {
  todo: Todo | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  currentUser: UserId;
};

export function TodoSheet({ todo, onClose, onChange, onDelete, currentUser }: Props) {
  if (!todo) return null;
  const p = PRIO[todo.prio];
  return (
    <Sheet open onClose={onClose} title="Aufgabe">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[22px] font-semibold leading-tight flex-1 flex items-start gap-2">
          {p.dot && (
            <span
              className="inline-block w-2 h-2 rounded-full mt-2.5 shrink-0"
              style={{ background: p.color }}
            />
          )}
          <span>{todo.text}</span>
        </div>
        <Avatar id={todo.by} size={22} />
      </div>

      {todo.note && (
        <div
          className="rounded-2xl p-3 mt-3"
          style={{ background: "rgba(228,217,191,0.5)" }}
        >
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            Notiz
          </div>
          <div className="text-[14px] mt-1 whitespace-pre-line leading-relaxed">{todo.note}</div>
        </div>
      )}

      <div className="mt-4 space-y-1">
        <DetailRow
          label="Fällig"
          value={todo.due ? formatDate(todo.due) : "Ohne Datum"}
          icon={<CalIcon size={16} />}
        />
        <DetailRow
          label="Hinzugefügt"
          value={`${USERS[todo.by].name} · ${relativeWhen(todo.addedAt)}`}
          icon={<Clock size={16} />}
        />
      </div>

      <div className="uplabel text-[10.5px] mt-4 mb-1.5" style={{ color: "var(--muted)" }}>
        Priorität
      </div>
      <div
        className="inline-flex p-0.5 rounded-full"
        style={{ background: "var(--cream-deep)" }}
      >
        {(Object.entries(PRIO) as Array<[Priority, (typeof PRIO)[Priority]]>).map(([k, v]) => {
          const active = todo.prio === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(todo.id, { prio: k })}
              className="px-3 py-1 text-[12px] rounded-full font-medium tap inline-flex items-center gap-1"
              style={
                active
                  ? { background: "var(--paper)", color: v.color }
                  : { color: "var(--ink-soft)" }
              }
            >
              {v.dot && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: v.color }}
                />
              )}
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
          Sichtbar für
        </div>
        <ScopeToggle
          value={todo.scope || "geteilt"}
          onChange={(s) => onChange(todo.id, { scope: s })}
          currentUser={currentUser}
          compact
        />
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={() => {
            onChange(todo.id, { done: !todo.done });
            onClose();
          }}
          className="flex-1 py-3 rounded-2xl text-[15px] font-semibold tap"
          style={
            todo.done
              ? { background: "var(--cream-deep)", color: "var(--ink)" }
              : { background: "var(--sage)", color: "white" }
          }
        >
          {todo.done ? "Wieder offen" : "Erledigt ✓"}
        </button>
        <button
          type="button"
          onClick={() => {
            onDelete(todo.id);
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
