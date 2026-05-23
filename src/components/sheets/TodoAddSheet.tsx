"use client";

import { useState } from "react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { ScopeToggle } from "../ScopeToggle";
import type { Priority, Scope, Todo, UserId } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: Pick<Todo, "text" | "scope" | "prio" | "due">) => void;
  currentUser: UserId;
};

export function TodoAddSheet({ open, onClose, onAdd, currentUser }: Props) {
  if (!open) return null;
  return <TodoAddForm onClose={onClose} onAdd={onAdd} currentUser={currentUser} />;
}

function TodoAddForm({
  onClose,
  onAdd,
  currentUser,
}: {
  onClose: () => void;
  onAdd: (input: Pick<Todo, "text" | "scope" | "prio" | "due">) => void;
  currentUser: UserId;
}) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [prio, setPrio] = useState<Priority>("normal");
  const [scope, setScope] = useState<Scope>("geteilt");

  return (
    <Sheet open onClose={onClose} title="Neue Aufgabe">
      <div className="mt-3">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Was?
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="z. B. Mietvertrag verlängern"
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      <div className="mt-3">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Fällig (optional)
        </div>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Priorität
      </div>
      <Segmented
        value={prio}
        onChange={(v) => setPrio(v as Priority)}
        options={[
          { value: "tief", label: "Tief" },
          { value: "normal", label: "Normal" },
          { value: "hoch", label: "Hoch" },
        ]}
      />

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Sichtbar für
      </div>
      <ScopeToggle value={scope} onChange={setScope} currentUser={currentUser} />

      <button
        type="button"
        onClick={() => {
          if (!text.trim()) return;
          onAdd({ text: text.trim(), due, prio, scope });
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
