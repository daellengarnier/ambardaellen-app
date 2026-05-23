"use client";

import { useMemo, useState } from "react";
import {
  ShoppingCart as CartIcon,
  Plus,
  Lock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo, isPrivate } from "@/lib/scope";
import { USERS } from "@/lib/types";
import { todayISO, greetingFor, shortDate } from "@/lib/date";
import { BUCKET_LABEL, PRIO, dueBucket } from "@/lib/todo";
import { Card } from "@/components/Card";
import { AvatarPair, AvatarWithScope } from "@/components/Avatar";
import { GoalProgress } from "@/components/GoalProgress";
import { RoundCheck } from "@/components/RoundCheck";
import { CycleTile } from "@/components/CycleTile";
import { ClientOnly } from "@/components/ClientOnly";
import { UserSwitcher } from "@/components/UserSwitcher";
import { ActivitySheet } from "@/components/sheets/ActivitySheet";
import { ShoppingSheet } from "@/components/sheets/ShoppingSheet";
import { TodoSheet } from "@/components/sheets/TodoSheet";
import { GoalSheet } from "@/components/sheets/GoalSheet";
import { CycleSheet } from "@/components/sheets/CycleSheet";
import type { Activity, Goal, ShoppingItem, Todo } from "@/lib/types";

export default function HeutePage() {
  return (
    <ClientOnly fallback={<HeuteSkeleton />}>
      <HeuteContent />
    </ClientOnly>
  );
}

function HeuteSkeleton() {
  return <div className="px-4 pt-4" />;
}

function HeuteContent() {
  const currentUser = useStore((s) => s.currentUser);
  const activities = useStore((s) => s.activities);
  const shopping = useStore((s) => s.shopping);
  const todos = useStore((s) => s.todos);
  const goals = useStore((s) => s.goals);

  const addShopping = useStore((s) => s.addShopping);
  const toggleShopping = useStore((s) => s.toggleShopping);
  const updateShopping = useStore((s) => s.updateShopping);
  const removeShopping = useStore((s) => s.removeShopping);

  const toggleTodo = useStore((s) => s.toggleTodo);
  const updateTodo = useStore((s) => s.updateTodo);
  const removeTodo = useStore((s) => s.removeTodo);

  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);

  const updateGoal = useStore((s) => s.updateGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const addGoalStep = useStore((s) => s.addGoalStep);
  const toggleGoalStep = useStore((s) => s.toggleGoalStep);
  const removeGoalStep = useStore((s) => s.removeGoalStep);

  const [openAct, setOpenAct] = useState<Activity | null>(null);
  const [openShop, setOpenShop] = useState<ShoppingItem | null>(null);
  const [openTodo, setOpenTodo] = useState<Todo | null>(null);
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);
  const [cycleOpen, setCycleOpen] = useState(false);

  const today = todayISO();
  const greeting = greetingFor();
  const dateLine = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const myActivities = useMemo(() => visibleTo(activities, currentUser), [activities, currentUser]);
  const myShopping = useMemo(() => visibleTo(shopping, currentUser), [shopping, currentUser]);
  const myTodos = useMemo(() => visibleTo(todos, currentUser), [todos, currentUser]);
  const myGoals = useMemo(() => visibleTo(goals, currentUser), [goals, currentUser]);

  const todayActs = myActivities.filter((a) => a.date === today && a.status !== "erledigt");
  const nextAct =
    todayActs[0] ??
    myActivities
      .filter((a) => a.status === "geplant" && a.date && a.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

  const openShopItems = myShopping.filter((s) => !s.done && !s.spinnerei);

  const urgentTodos = myTodos
    .filter((t) => !t.done)
    .sort((a, b) => {
      const ba = dueBucket(a.due);
      const bb = dueBucket(b.due);
      const order: Record<string, number> = { ueber: 0, heute: 1, morgen: 2, woche: 3, spaeter: 4, kein: 5 };
      if (order[ba] !== order[bb]) return order[ba] - order[bb];
      return PRIO[a.prio].rank - PRIO[b.prio].rank;
    })
    .slice(0, 4);

  const topGoal = myGoals.find((g) => g.scope === "geteilt") ?? myGoals[0];

  // Sync currently-open goal with store
  const currentOpenGoal = openGoal ? goals.find((g) => g.id === openGoal.id) ?? null : null;

  return (
    <>
      <div className="px-4 pt-1 pb-3">
        <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
          {dateLine}
        </div>
        <div className="flex items-end justify-between gap-3 mt-1">
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight flex-1 min-w-0">
            {greeting}
          </h1>
          <AvatarPair size={28} />
        </div>
      </div>

      <div className="px-4 mb-2">
        <CycleTile onClick={() => setCycleOpen(true)} />
      </div>

      <div className="px-4 mb-3 grid grid-cols-2 gap-2 items-stretch">
        <div className="flex flex-col gap-2">
          <Card
            onClick={() => nextAct && setOpenAct(nextAct)}
            className="p-3 flex-1"
          >
            <div
              className="uplabel text-[10px] mb-1.5 flex items-center justify-between gap-1"
              style={{ color: "var(--muted)" }}
            >
              <span>Termine</span>
              {nextAct && (
                <span
                  className="text-[10px] normal-case tracking-normal font-medium"
                  style={{ color: USERS[nextAct.by].color }}
                >
                  {shortDate(nextAct.date)}
                </span>
              )}
            </div>
            {nextAct ? (
              <>
                <div className="text-[14px] font-semibold leading-snug line-clamp-2 mb-0.5 flex items-start gap-1.5">
                  {isPrivate(nextAct) && (
                    <Lock size={10} strokeWidth={2} color="var(--muted)" className="shrink-0 mt-1" />
                  )}
                  <span>{nextAct.title}</span>
                </div>
                <div
                  className="text-[11.5px] truncate"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {nextAct.time && <span>{nextAct.time}</span>}
                  {nextAct.place && ` · ${nextAct.place}`}
                </div>
              </>
            ) : (
              <div className="text-[12.5px] italic" style={{ color: "var(--muted)" }}>
                nichts geplant
              </div>
            )}
          </Card>

          {topGoal && (
            <Card onClick={() => setOpenGoal(topGoal)} className="p-3 flex-1">
              <div
                className="uplabel text-[10px] mb-1.5 flex items-center gap-1"
                style={{ color: "var(--muted)" }}
              >
                Im Blick {isPrivate(topGoal) && <Lock size={9} strokeWidth={2} />}
              </div>
              <div className="text-[12.5px] font-semibold leading-snug line-clamp-2 mb-2">
                {topGoal.title}
              </div>
              <GoalProgress goal={topGoal} />
            </Card>
          )}
        </div>

        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between">
            <div
              className="uplabel text-[10px] inline-flex items-center gap-1.5"
              style={{ color: "var(--ink-soft)" }}
            >
              <CartIcon size={11} strokeWidth={1.75} /> Einkauf
            </div>
            <span className="uplabel text-[9.5px]" style={{ color: "var(--muted)" }}>
              {openShopItems.length} offen
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            {openShopItems.length === 0 ? (
              <div className="px-3 py-3 text-[12px] italic" style={{ color: "var(--ink-soft)" }}>
                leer ✓
              </div>
            ) : (
              <div className="phone-scroll overflow-y-auto h-full">
                {openShopItems.map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenShop(s);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 tap cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(218,201,168,0.3)" }}
                    role="button"
                    tabIndex={0}
                  >
                    <RoundCheck
                      checked={false}
                      onClick={() => toggleShopping(s.id)}
                      size={16}
                      color="var(--sage)"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] truncate">{s.text}</div>
                    </div>
                    {isPrivate(s) && (
                      <Lock size={8} strokeWidth={2} color="var(--muted)" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <QuickAddShop
            onAdd={(text) =>
              addShopping({ text, scope: "geteilt", spinnerei: false })
            }
          />
        </Card>
      </div>

      <div className="px-4 mb-2">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <h2 className="uplabel text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
            Aufgaben
          </h2>
        </div>
        {urgentTodos.length === 0 ? (
          <Card className="p-3">
            <div className="text-[13px] italic" style={{ color: "var(--ink-soft)" }}>
              Keine offenen Aufgaben für die kommenden Tage.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {urgentTodos.map((t) => {
              const p = PRIO[t.prio];
              const bucket = dueBucket(t.due);
              const isOver = bucket === "ueber";
              const bucketLabel = bucket === "kein" ? "Offen" : BUCKET_LABEL[bucket];
              return (
                <Card
                  key={t.id}
                  onClick={() => setOpenTodo(t)}
                  className="p-2.5 relative"
                >
                  <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                    style={{ background: p.color, opacity: p.dot ? 1 : 0.35 }}
                  />
                  <div className="pl-1.5">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className="uplabel text-[9px] whitespace-nowrap"
                        style={{ color: isOver ? "#C5634B" : "var(--muted)" }}
                      >
                        {bucketLabel}
                      </span>
                      <AvatarWithScope by={t.by} scope={t.scope} size={14} />
                    </div>
                    <div className="text-[12.5px] font-semibold leading-snug line-clamp-3 mb-1">
                      {t.text}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10.5px]"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        <RoundCheck
                          checked={false}
                          onClick={() => toggleTodo(t.id)}
                          size={14}
                          color={p.color}
                        />
                        erledigen
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <UserSwitcher />

      {/* Sheets */}
      <ActivitySheet
        activity={openAct}
        onClose={() => setOpenAct(null)}
        onChange={(id, patch) => {
          updateActivity(id, patch);
          if (openAct && openAct.id === id) setOpenAct({ ...openAct, ...patch });
        }}
        onDelete={removeActivity}
        currentUser={currentUser}
      />
      <ShoppingSheet
        item={openShop}
        onClose={() => setOpenShop(null)}
        onToggle={toggleShopping}
        onChange={(id, patch) => {
          updateShopping(id, patch);
          if (openShop && openShop.id === id) setOpenShop({ ...openShop, ...patch });
        }}
        onDelete={removeShopping}
        currentUser={currentUser}
      />
      <TodoSheet
        todo={openTodo}
        onClose={() => setOpenTodo(null)}
        onChange={(id, patch) => {
          updateTodo(id, patch);
          if (openTodo && openTodo.id === id) setOpenTodo({ ...openTodo, ...patch });
        }}
        onDelete={removeTodo}
        currentUser={currentUser}
      />
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
      <CycleSheet open={cycleOpen} onClose={() => setCycleOpen(false)} />
    </>
  );
}

function QuickAddShop({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  const can = text.trim().length > 0;
  function submit() {
    if (!can) return;
    onAdd(text);
    setText("");
  }
  return (
    <div
      className="px-1.5 py-1 flex items-center gap-1"
      style={{
        borderTop: "1px solid rgba(218,201,168,0.5)",
        background: "rgba(228,217,191,0.25)",
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="+ hinzufügen"
        className="flex-1 bg-transparent text-[12px] py-1 px-1.5 min-w-0"
        style={{ color: "var(--ink)" }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!can}
        className="tap w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white"
        style={{ background: can ? "var(--terra)" : "var(--terra-soft)" }}
        aria-label="Hinzufügen"
      >
        <Plus size={12} strokeWidth={2.25} />
      </button>
    </div>
  );
}
