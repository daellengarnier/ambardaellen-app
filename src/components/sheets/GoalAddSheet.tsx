"use client";

import { useState } from "react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { ScopeToggle } from "../ScopeToggle";
import type { Goal, Period, Scope, Term, UserId } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: Omit<Goal, "id" | "by">) => void;
  currentUser: UserId;
};

type Kind = "einmalig" | "wiederkehrend";

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
  onAdd: (input: Omit<Goal, "id" | "by">) => void;
  currentUser: UserId;
}) {
  const [kind, setKind] = useState<Kind>("wiederkehrend");
  const [title, setTitle] = useState("");
  const [term, setTerm] = useState<Term>("kurz");
  const [target, setTarget] = useState(3);
  const [unit, setUnit] = useState("");
  const [period, setPeriod] = useState<Period>("woche");
  const [scope, setScope] = useState<Scope>("geteilt");

  const submit = () => {
    if (!title.trim()) return;
    if (kind === "wiederkehrend") {
      onAdd({
        kind: "wiederkehrend",
        title: title.trim(),
        target: Math.max(1, target),
        unit: unit.trim() || "mal",
        period,
        log: {},
        scope,
      });
    } else {
      onAdd({
        kind: "einmalig",
        title: title.trim(),
        term,
        target: Math.max(1, target),
        unit: unit.trim(),
        current: 0,
        steps: [],
        scope,
      });
    }
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title="Neues Ziel">
      <div className="uplabel text-[10.5px] mt-1 mb-1.5" style={{ color: "var(--muted)" }}>
        Art
      </div>
      <Segmented
        value={kind}
        onChange={(k) => setKind(k as Kind)}
        options={[
          { value: "wiederkehrend", label: "Wiederkehrend" },
          { value: "einmalig", label: "Einmalig" },
        ]}
      />
      <p className="text-[11.5px] mt-1.5" style={{ color: "var(--muted)" }}>
        {kind === "wiederkehrend"
          ? "Gewohnheit oder Zähler, der sich pro Tag/Woche/Monat zurücksetzt."
          : "Ein fixes Ziel mit Schritten und einem Gesamtwert."}
      </p>

      <div className="mt-4">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Titel
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            kind === "wiederkehrend"
              ? "z. B. 3× Sport pro Woche"
              : "z. B. Sonntags wandern gehen"
          }
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      {kind === "wiederkehrend" ? (
        <>
          <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
            Wie oft
          </div>
          <Segmented
            value={period}
            onChange={(p) => setPeriod(p as Period)}
            options={[
              { value: "tag", label: "pro Tag" },
              { value: "woche", label: "pro Woche" },
              { value: "monat", label: "pro Monat" },
            ]}
          />

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
                Anzahl
              </div>
              <input
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value) || 1)}
                className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
                style={{ background: "rgba(228,217,191,0.5)" }}
              />
            </div>
            <div>
              <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
                Einheit
              </div>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="mal · km · Bücher"
                className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
                style={{ background: "rgba(228,217,191,0.5)" }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      <div className="uplabel text-[10.5px] mt-3 mb-1.5" style={{ color: "var(--muted)" }}>
        Sichtbar für
      </div>
      <ScopeToggle value={scope} onChange={setScope} currentUser={currentUser} />

      <button
        type="button"
        onClick={submit}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: "var(--terra)" }}
      >
        Anlegen
      </button>
    </Sheet>
  );
}
