"use client";

import { useState } from "react";
import { Flag, Check, Plus, X } from "lucide-react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { ScopeToggle } from "../ScopeToggle";
import { AvatarWithScope } from "../Avatar";
import { GoalProgress } from "../GoalProgress";
import type { Goal, Term, UserId } from "@/lib/types";

const TERM_LABEL: Record<Term, string> = {
  kurz: "Kurzfristig",
  mittel: "Mittelfristig",
  lang: "Langfristig",
};

type Props = {
  goal: Goal | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<Goal>) => void;
  onDelete: (id: string) => void;
  onAddStep: (goalId: string, text: string) => void;
  onToggleStep: (goalId: string, stepId: string) => void;
  onRemoveStep: (goalId: string, stepId: string) => void;
  currentUser: UserId;
};

export function GoalSheet({
  goal,
  onClose,
  onChange,
  onDelete,
  onAddStep,
  onToggleStep,
  onRemoveStep,
  currentUser,
}: Props) {
  const [newStep, setNewStep] = useState("");
  if (!goal) return null;

  const doneSteps = goal.steps.filter((s) => s.done).length;
  const pct = Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));

  const bumpCurrent = (delta: number) => {
    onChange(goal.id, {
      current: Math.max(0, Math.min(goal.target, goal.current + delta)),
    });
  };

  return (
    <Sheet open onClose={onClose} title="Ziel">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="uplabel text-[10px] flex items-center gap-1.5 mb-1"
            style={{ color: "var(--muted)" }}
          >
            <Flag size={11} strokeWidth={2} />
            {TERM_LABEL[goal.term]}
          </div>
          <div className="serif text-[24px] leading-tight">{goal.title}</div>
        </div>
        <AvatarWithScope by={goal.by} scope={goal.scope} size={24} />
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(228,217,191,0.5)" }}>
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="mono text-[28px] font-semibold leading-none">{goal.current}</span>
            <span className="text-[14px]" style={{ color: "var(--muted)" }}>
              / {goal.target}
              {goal.unit ? ` ${goal.unit}` : ""}
            </span>
          </div>
          <span className="mono text-[13px]" style={{ color: "var(--ink-soft)" }}>
            {pct}%
          </span>
        </div>
        <GoalProgress goal={goal} />
        <div className="flex gap-2 mt-3">
          {[-1, 1, 5].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => bumpCurrent(d)}
              className="flex-1 py-2 rounded-xl text-[14px] font-medium tap"
              style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>

      <div
        className="uplabel text-[10.5px] mt-4 mb-1.5 flex items-center justify-between"
        style={{ color: "var(--muted)" }}
      >
        <span>Schritte</span>
        <span className="mono text-[10.5px] tracking-normal normal-case">
          {doneSteps} / {goal.steps.length}
        </span>
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(228,217,191,0.35)" }}
      >
        {goal.steps.length === 0 && (
          <div className="px-3.5 py-3 text-[13px]" style={{ color: "var(--muted)" }}>
            Noch keine Schritte.
          </div>
        )}
        {goal.steps.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 px-3 py-2.5"
            style={
              i < goal.steps.length - 1
                ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                : undefined
            }
          >
            <button
              type="button"
              onClick={() => onToggleStep(goal.id, s.id)}
              className="w-5 h-5 rounded-md tap shrink-0 flex items-center justify-center"
              style={
                s.done
                  ? {
                      background: "var(--sage)",
                      borderColor: "var(--sage)",
                      color: "white",
                    }
                  : {
                      background: "var(--paper)",
                      border: "1px solid rgba(151,134,117,0.6)",
                    }
              }
              aria-label={s.done ? "Schritt offen" : "Schritt erledigt"}
            >
              {s.done && <Check size={13} strokeWidth={3} />}
            </button>
            <div
              className="flex-1 text-[14px] leading-snug"
              style={s.done ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
            >
              {s.text}
            </div>
            <button
              type="button"
              onClick={() => onRemoveStep(goal.id, s.id)}
              className="tap p-1"
              style={{ color: "var(--muted)" }}
              aria-label="Schritt entfernen"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newStep.trim()) {
              onAddStep(goal.id, newStep);
              setNewStep("");
            }
          }}
          placeholder="Schritt hinzufügen…"
          className="flex-1 rounded-2xl px-3.5 py-2.5 text-[14px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
        <button
          type="button"
          onClick={() => {
            if (!newStep.trim()) return;
            onAddStep(goal.id, newStep);
            setNewStep("");
          }}
          className="px-3 rounded-2xl tap"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
          aria-label="Schritt hinzufügen"
        >
          <Plus size={16} strokeWidth={2.4} />
        </button>
      </div>

      <div className="uplabel text-[10.5px] mt-4 mb-1.5" style={{ color: "var(--muted)" }}>
        Zeithorizont
      </div>
      <Segmented
        value={goal.term}
        onChange={(t) => onChange(goal.id, { term: t as Term })}
        options={[
          { value: "kurz", label: "Kurz" },
          { value: "mittel", label: "Mittel" },
          { value: "lang", label: "Lang" },
        ]}
      />

      <div className="flex items-center justify-between mt-3">
        <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
          Sichtbar für
        </div>
        <ScopeToggle
          value={goal.scope || "geteilt"}
          onChange={(s) => onChange(goal.id, { scope: s })}
          currentUser={currentUser}
          compact
        />
      </div>

      <button
        type="button"
        onClick={() => {
          onDelete(goal.id);
          onClose();
        }}
        className="w-full mt-5 py-3 rounded-2xl text-[14px] font-medium tap"
        style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
      >
        Ziel löschen
      </button>
    </Sheet>
  );
}
