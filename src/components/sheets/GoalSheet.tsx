"use client";

import { useState } from "react";
import { Flag, Check, Plus, X, Repeat, Flame } from "lucide-react";
import { Sheet } from "../Sheet";
import { Segmented } from "../Segmented";
import { ScopeToggle } from "../ScopeToggle";
import { AvatarWithScope } from "../Avatar";
import { GoalProgress } from "../GoalProgress";
import {
  currentStreak,
  valueInPeriod,
  PERIOD_LABEL_PER,
} from "@/lib/recurringGoal";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/date";
import type { Goal, Period, Term, UserId } from "@/lib/types";

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

export function GoalSheet(props: Props) {
  if (!props.goal) return null;
  if (props.goal.kind === "wiederkehrend") {
    return <RecurringDetail {...props} goal={props.goal} />;
  }
  return <OneTimeDetail {...props} goal={props.goal} />;
}

function RecurringDetail({
  goal,
  onClose,
  onChange,
  onDelete,
  currentUser,
}: Props & { goal: Goal }) {
  const logGoalProgress = useStore((s) => s.logGoalProgress);
  const value = valueInPeriod(goal);
  const streak = currentStreak(goal);
  const pct = Math.min(100, Math.round((value / Math.max(1, goal.target)) * 100));
  const unit = goal.unit || "mal";
  const period: Period = goal.period ?? "woche";

  return (
    <Sheet open onClose={onClose} title="Gewohnheit">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="uplabel text-[10px] flex items-center gap-1.5 mb-1"
            style={{ color: "var(--muted)" }}
          >
            <Repeat size={11} strokeWidth={2} />
            {goal.target} {unit} {PERIOD_LABEL_PER[period]}
          </div>
          <div className="serif text-[24px] leading-tight">{goal.title}</div>
        </div>
        <AvatarWithScope by={goal.by} scope={goal.scope} size={24} />
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(228,217,191,0.5)" }}>
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="mono text-[28px] font-semibold leading-none">{value}</span>
            <span className="text-[14px]" style={{ color: "var(--muted)" }}>
              / {goal.target} {unit}
            </span>
          </div>
          <span
            className="mono text-[13px] inline-flex items-center gap-1"
            style={{ color: streak > 0 ? "var(--terra)" : "var(--ink-soft)" }}
          >
            {streak > 0 && <Flame size={12} strokeWidth={2} />}
            {streak > 0 ? `${streak} Streak` : `${pct}%`}
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--cream-deep)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${pct}%`,
              background: value >= goal.target ? "var(--sage)" : "var(--terra)",
            }}
          />
        </div>
        <div className="flex gap-2 mt-3">
          {[-1, 1, 5].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => logGoalProgress(goal.id, todayISO(), d)}
              className="flex-1 py-2 rounded-xl text-[14px] font-medium tap"
              style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
        <div
          className="text-[11px] mt-2 text-center"
          style={{ color: "var(--muted)" }}
        >
          Heute eintragen (Statistiken kommen demnächst)
        </div>
      </div>

      <div className="uplabel text-[10.5px] mt-4 mb-1.5" style={{ color: "var(--muted)" }}>
        Periode
      </div>
      <Segmented
        value={period}
        onChange={(p) => onChange(goal.id, { period: p as Period })}
        options={[
          { value: "tag", label: "pro Tag" },
          { value: "woche", label: "pro Woche" },
          { value: "monat", label: "pro Monat" },
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

function OneTimeDetail({
  goal,
  onClose,
  onChange,
  onDelete,
  onAddStep,
  onToggleStep,
  onRemoveStep,
  currentUser,
}: Props & { goal: Goal }) {
  const [newStep, setNewStep] = useState("");
  const steps = goal.steps ?? [];
  const current = goal.current ?? 0;
  const term: Term = goal.term ?? "kurz";
  const doneSteps = steps.filter((s) => s.done).length;
  const pct = Math.min(100, Math.round((current / Math.max(goal.target, 1)) * 100));

  const bumpCurrent = (delta: number) => {
    onChange(goal.id, {
      current: Math.max(0, Math.min(goal.target, current + delta)),
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
            {TERM_LABEL[term]}
          </div>
          <div className="serif text-[24px] leading-tight">{goal.title}</div>
        </div>
        <AvatarWithScope by={goal.by} scope={goal.scope} size={24} />
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(228,217,191,0.5)" }}>
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="mono text-[28px] font-semibold leading-none">{current}</span>
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
          {doneSteps} / {steps.length}
        </span>
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(228,217,191,0.35)" }}
      >
        {steps.length === 0 && (
          <div className="px-3.5 py-3 text-[13px]" style={{ color: "var(--muted)" }}>
            Noch keine Schritte.
          </div>
        )}
        {steps.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 px-3 py-2.5"
            style={
              i < steps.length - 1
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
        value={term}
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
