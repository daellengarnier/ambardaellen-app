"use client";

import { useMemo, useState } from "react";
import { Plus, Flag, ChevronRight, Users, Lock, Target, Repeat, Minus, Flame } from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo } from "@/lib/scope";
import { USERS } from "@/lib/types";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarWithScope } from "@/components/Avatar";
import { GoalProgress } from "@/components/GoalProgress";
import { DeleteAction } from "@/components/DeleteAction";
import { Empty } from "@/components/Empty";
import { ClientOnly } from "@/components/ClientOnly";
import { GoalSheet } from "@/components/sheets/GoalSheet";
import { GoalAddSheet } from "@/components/sheets/GoalAddSheet";
import { todayISO } from "@/lib/date";
import {
  currentStreak,
  valueInPeriod,
  PERIOD_LABEL_PER,
} from "@/lib/recurringGoal";
import type { Goal, Term } from "@/lib/types";

const TERM_LABEL: Record<Term, string> = {
  kurz: "Kurzfristig",
  mittel: "Mittelfristig",
  lang: "Langfristig",
};
const TERM_ORDER: Term[] = ["kurz", "mittel", "lang"];

type ScopeFilter = "alle" | "geteilt" | "nur-ich";

export default function ZielePage() {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <GoalContent />
    </ClientOnly>
  );
}

function Skeleton() {
  return (
    <div className="pt-2 pb-3">
      <ScreenHeader title="Ziele" subtitle="Wohin wir wollen" />
    </div>
  );
}

function GoalContent() {
  const goals = useStore((s) => s.goals);
  const currentUser = useStore((s) => s.currentUser);
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const addGoalStep = useStore((s) => s.addGoalStep);
  const toggleGoalStep = useStore((s) => s.toggleGoalStep);
  const removeGoalStep = useStore((s) => s.removeGoalStep);
  const logGoalProgress = useStore((s) => s.logGoalProgress);

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("alle");
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const myGoals = useMemo(() => {
    let arr = visibleTo(goals, currentUser);
    if (scopeFilter === "geteilt") arr = arr.filter((g) => g.scope === "geteilt");
    if (scopeFilter === "nur-ich") arr = arr.filter((g) => g.scope === currentUser);
    return arr;
  }, [goals, scopeFilter, currentUser]);

  const recurringGoals = useMemo(
    () => myGoals.filter((g) => g.kind === "wiederkehrend"),
    [myGoals],
  );
  const oneTimeGoals = useMemo(
    () => myGoals.filter((g) => g.kind !== "wiederkehrend"),
    [myGoals],
  );

  const grouped = useMemo(() => {
    const m: Record<Term, Goal[]> = { kurz: [], mittel: [], lang: [] };
    oneTimeGoals.forEach((g) => {
      const t = g.term ?? "kurz";
      m[t].push(g);
    });
    return m;
  }, [oneTimeGoals]);

  // Sync openGoal with store updates so step toggles reflect immediately.
  const currentOpenGoal = openGoal ? goals.find((g) => g.id === openGoal.id) ?? null : null;

  return (
    <>
      <ScreenHeader
        title="Ziele"
        subtitle="Wohin wir wollen"
        right={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="tap w-9 h-9 rounded-full text-white shadow-card flex items-center justify-center"
            style={{ background: "var(--terra)" }}
            aria-label="Ziel hinzufügen"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        }
      />

      <div className="px-4 pb-1.5 flex gap-1.5">
        {([
          { v: "alle", l: "Alle" },
          { v: "geteilt", l: "Gemeinsam", icon: <Users size={11} strokeWidth={1.75} /> },
          {
            v: "nur-ich",
            l: `Nur ${USERS[currentUser].name}`,
            icon: <Lock size={11} strokeWidth={2} />,
          },
        ] as Array<{ v: ScopeFilter; l: string; icon?: React.ReactNode }>).map((o) => {
          const active = scopeFilter === o.v;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => setScopeFilter(o.v)}
              className="px-2.5 py-1 text-[11.5px] rounded-full font-medium tap inline-flex items-center gap-1"
              style={
                active
                  ? { background: "var(--ink)", color: "var(--paper)" }
                  : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
              }
            >
              {o.icon}
              {o.l}
            </button>
          );
        })}
      </div>

      <div className="px-4 space-y-3.5">
        {myGoals.length === 0 && (
          <Empty
            icon={<Target size={22} strokeWidth={1.75} />}
            title="Noch keine Ziele"
            body="Was willst du erreichen? Klein anfangen, einfach loslegen."
          />
        )}

        {recurringGoals.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <Repeat size={12} strokeWidth={1.75} color="var(--ink-soft)" />
              <h2
                className="text-[11.5px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--ink-soft)" }}
              >
                Gewohnheiten &amp; Wiederkehrend
              </h2>
            </div>
            <div className="space-y-1.5">
              {recurringGoals.map((g) => (
                <RecurringGoalCard
                  key={g.id}
                  goal={g}
                  onOpen={() => setOpenGoal(g)}
                  onLog={(delta) => logGoalProgress(g.id, todayISO(), delta)}
                  onRemove={() => removeGoal(g.id)}
                />
              ))}
            </div>
          </div>
        )}

        {TERM_ORDER.map((term) => {
          const items = grouped[term];
          if (items.length === 0) return null;
          return (
            <div key={term}>
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <Flag size={12} strokeWidth={1.75} color="var(--ink-soft)" />
                <h2
                  className="text-[11.5px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {TERM_LABEL[term]}
                </h2>
              </div>
              <div className="space-y-1.5">
                {items.map((g) => {
                  const steps = g.steps ?? [];
                  const doneSteps = steps.filter((s) => s.done).length;
                  return (
                    <Card key={g.id} onClick={() => setOpenGoal(g)} className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-[14.5px] font-medium leading-snug pr-2 flex-1 min-w-0">
                          {g.title}
                        </div>
                        <AvatarWithScope by={g.by} scope={g.scope} size={20} />
                        <DeleteAction
                          kind="Ziel"
                          label={g.title}
                          onConfirm={() => removeGoal(g.id)}
                        />
                      </div>
                      <GoalProgress goal={g} />
                      <div
                        className="flex items-center justify-between mt-2 text-[11.5px]"
                        style={{ color: "var(--muted)" }}
                      >
                        <span>
                          {doneSteps} / {steps.length} Schritte
                        </span>
                        <span
                          className="inline-flex items-center gap-1 font-medium"
                          style={{ color: "var(--terra)" }}
                        >
                          Öffnen <ChevronRight size={11} strokeWidth={1.75} />
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <GoalSheet
        goal={currentOpenGoal}
        onClose={() => setOpenGoal(null)}
        onChange={updateGoal}
        onDelete={removeGoal}
        onAddStep={addGoalStep}
        onToggleStep={toggleGoalStep}
        onRemoveStep={removeGoalStep}
        currentUser={currentUser}
      />

      <GoalAddSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addGoal}
        currentUser={currentUser}
      />
    </>
  );
}

function RecurringGoalCard({
  goal,
  onOpen,
  onLog,
  onRemove,
}: {
  goal: Goal;
  onOpen: () => void;
  onLog: (delta: number) => void;
  onRemove: () => void;
}) {
  if (goal.kind !== "wiederkehrend" || !goal.period) return null;
  const value = valueInPeriod(goal);
  const pct = Math.min(100, Math.round((value / Math.max(1, goal.target)) * 100));
  const done = value >= goal.target;
  const streak = currentStreak(goal);
  const unit = goal.unit || "mal";

  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={onOpen}
          className="tap flex-1 text-left min-w-0"
        >
          <div className="text-[14.5px] font-medium leading-snug pr-2 truncate">
            {goal.title}
          </div>
          <div
            className="text-[11px] mt-0.5 inline-flex items-center gap-1"
            style={{ color: "var(--muted)" }}
          >
            {goal.target} {unit} {PERIOD_LABEL_PER[goal.period]}
            {streak > 0 && (
              <span
                className="inline-flex items-center gap-0.5 ml-1"
                style={{ color: "var(--terra)" }}
              >
                · <Flame size={10} strokeWidth={2} /> {streak}
              </span>
            )}
          </div>
        </button>
        <AvatarWithScope by={goal.by} scope={goal.scope} size={20} />
        <DeleteAction kind="Ziel" label={goal.title} onConfirm={onRemove} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onLog(-1)}
          disabled={value <= 0}
          className="tap w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background: "var(--cream-deep)",
            color: value <= 0 ? "var(--muted)" : "var(--ink-soft)",
            opacity: value <= 0 ? 0.5 : 1,
          }}
          aria-label="Eintrag entfernen"
        >
          <Minus size={14} strokeWidth={2} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
              {value} / {goal.target} {unit}
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              {done ? "erfüllt ✓" : `${pct}%`}
            </div>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--cream-deep)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${pct}%`,
                background: done ? "var(--sage)" : "var(--terra)",
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLog(1)}
          className="tap w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 text-white shadow-card"
          style={{ background: done ? "var(--sage)" : "var(--terra)" }}
          aria-label="Eintrag hinzufügen"
        >
          <Plus size={16} strokeWidth={2.25} />
        </button>
      </div>
    </Card>
  );
}
