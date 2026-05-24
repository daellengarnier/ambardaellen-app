"use client";

import { useMemo, useState } from "react";
import { Plus, Flag, ChevronRight, Users, Lock, Target } from "lucide-react";
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

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("alle");
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const myGoals = useMemo(() => {
    let arr = visibleTo(goals, currentUser);
    if (scopeFilter === "geteilt") arr = arr.filter((g) => g.scope === "geteilt");
    if (scopeFilter === "nur-ich") arr = arr.filter((g) => g.scope === currentUser);
    return arr;
  }, [goals, scopeFilter, currentUser]);

  const grouped = useMemo(() => {
    const m: Record<Term, Goal[]> = { kurz: [], mittel: [], lang: [] };
    myGoals.forEach((g) => m[g.term].push(g));
    return m;
  }, [myGoals]);

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
                  const doneSteps = g.steps.filter((s) => s.done).length;
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
                          {doneSteps} / {g.steps.length} Schritte
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
