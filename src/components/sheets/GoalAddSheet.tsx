"use client";

import { useState } from "react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { ScopeToggle } from "../ScopeToggle";
import type { Goal, Scope, Term, UserId } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: Omit<Goal, "id" | "by" | "steps" | "current">) => void;
  currentUser: UserId;
};

export function GoalAddSheet({ open, onClose, onAdd, currentUser }: Props) {
  if (!open) return null;
  return <GoalAddForm onClose={onClose} onAdd={onAdd} currentUser={currentUser} />;
}

function GoalAddForm({
  onClose,
  onAdd,
  currentUser,
}: {
  onClose: () => void;
  onAdd: (input: Omit<Goal, "id" | "by" | "steps" | "current">) => void;
  currentUser: UserId;
}) {
  const [title, setTitle] = useState("");
  const [term, setTerm] = useState<Term>("kurz");
  const [target, setTarget] = useState(5);
  const [unit, setUnit] = useState("");
  const [scope, setScope] = useState<Scope>("geteilt");

  return (
    <Sheet open onClose={onClose} title="Neues Ziel">
      <div className="mt-3">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Ziel
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z. B. Sonntags wandern gehen"
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Zeithorizont
      </div>
      <Segmented
        value={term}
        onChange={(t) => setTerm(t as Term)}
        options={[
          { value: "kurz", label: "Kurz" },
          { value: "mittel", label: "Mittel" },
          { value: "lang", label: "Lang" },
        ]}
      />

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div>
          <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
            Zielwert
          </div>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
            className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
            style={{ background: "rgba(228,217,191,0.5)" }}
          />
        </div>
        <div>
          <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
            Einheit (z. B. €, %)
          </div>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="optional"
            className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
            style={{ background: "rgba(228,217,191,0.5)" }}
          />
        </div>
      </div>

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Sichtbar für
      </div>
      <ScopeToggle value={scope} onChange={setScope} currentUser={currentUser} />

      <button
        type="button"
        onClick={() => {
          if (!title.trim()) return;
          onAdd({ title: title.trim(), term, target: target || 1, unit, scope });
          onClose();
        }}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: "var(--terra)" }}
      >
        Anlegen
      </button>
    </Sheet>
  );
}
