"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  ShoppingCart as CartIcon,
  Plus,
  ChevronRight,
  Lock,
  Backpack,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo, isPrivate } from "@/lib/scope";
import { USERS } from "@/lib/types";
import { todayISO, greetingFor, shortDate } from "@/lib/date";
import { BUCKET_LABEL, PRIO, dueBucket } from "@/lib/todo";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarWithScope } from "@/components/Avatar";
import { ActivityIcon } from "@/components/ActivityIcon";
import { GoalProgress } from "@/components/GoalProgress";
import { RoundCheck } from "@/components/RoundCheck";
import { CycleTile } from "@/components/CycleTile";
import { CycleStrip } from "@/components/CycleStrip";
import { TagChips } from "@/components/TagChips";
import { ClientOnly } from "@/components/ClientOnly";
import { QuickAddFAB } from "@/components/QuickAddFAB";
import { Sheet } from "@/components/Sheet";
import { ActivitySheet } from "@/components/sheets/ActivitySheet";
import { ShoppingSheet } from "@/components/sheets/ShoppingSheet";
import { TodoSheet } from "@/components/sheets/TodoSheet";
import { GoalSheet } from "@/components/sheets/GoalSheet";
import { CycleSheet } from "@/components/sheets/CycleSheet";
import { ActivityAddSheet } from "@/components/sheets/ActivityAddSheet";
import { TodoAddSheet } from "@/components/sheets/TodoAddSheet";
import { GoalAddSheet } from "@/components/sheets/GoalAddSheet";
import type { Activity, Goal, ShoppingItem, Todo } from "@/lib/types";

export default function HeutePage() {
  return (
    <ClientOnly fallback={<HeuteSkeleton />}>
      <HeuteContent />
    </ClientOnly>
  );
}

function HeuteSkeleton() {
  return (
    <div className="px-4 pt-4">
      <ScreenHeader title="…" subtitle="Lädt" />
    </div>
  );
}

function HeuteContent() {
  const currentUser = useStore((s) => s.currentUser);
  const cycleOwner = useStore((s) => s.cycle.owner);
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
  const addTodo = useStore((s) => s.addTodo);

  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);
  const addActivity = useStore((s) => s.addActivity);

  const updateGoal = useStore((s) => s.updateGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const addGoal = useStore((s) => s.addGoal);
  const addGoalStep = useStore((s) => s.addGoalStep);
  const toggleGoalStep = useStore((s) => s.toggleGoalStep);
  const removeGoalStep = useStore((s) => s.removeGoalStep);

  const [openAct, setOpenAct] = useState<Activity | null>(null);
  const [openShop, setOpenShop] = useState<ShoppingItem | null>(null);
  const [openTodo, setOpenTodo] = useState<Todo | null>(null);
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);
  const [cycleOpen, setCycleOpen] = useState(false);

  const [addActOpen, setAddActOpen] = useState(false);
  const [addTodoOpen, setAddTodoOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [quickShopOpen, setQuickShopOpen] = useState(false);

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

  // Heute = alles was heute Zeit beansprucht: heutige Termine + überfällige/heutige Todos
  const todayActs = myActivities
    .filter((a) => a.date === today && a.status !== "erledigt")
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  const overdueAndTodayTodos = myTodos
    .filter((t) => !t.done)
    .filter((t) => t.due && t.due <= today)
    .sort((a, b) => {
      // Überfällige zuerst, dann nach Prio
      const da = a.due ? a.due.localeCompare(today) : 0;
      const db = b.due ? b.due.localeCompare(today) : 0;
      if (da !== db) return da - db;
      return PRIO[a.prio].rank - PRIO[b.prio].rank;
    });

  // Demnächst: die nächsten 3 geplanten Aktivitäten nach heute
  const upcomingActs = myActivities
    .filter((a) => a.status === "geplant" && a.date && a.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Bald-Reise mit Packliste (nächste 14 Tage, hat packlist > 0)
  const upcomingTrip = myActivities
    .filter(
      (a) =>
        a.packlist.length > 0 &&
        a.status === "geplant" &&
        a.date &&
        a.date >= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Andere Aufgaben (nicht heute/überfällig): nächste 7 Tage, top 3
  const soonTodos = myTodos
    .filter((t) => !t.done && t.due && t.due > today && dueBucket(t.due) !== "spaeter")
    .sort((a, b) => {
      const pr = PRIO[a.prio].rank - PRIO[b.prio].rank;
      if (pr !== 0) return pr;
      return a.due.localeCompare(b.due);
    })
    .slice(0, 3);

  // Einkauf-Vorschau
  const openShopItems = myShopping.filter((s) => !s.done && !s.spinnerei);
  const shopPreview = openShopItems.slice(0, 4);

  // Im Blick Ziel
  const topGoal = myGoals.find((g) => g.scope === "geteilt") ?? myGoals[0];

  const isCycleOwner = currentUser === cycleOwner;

  // Sync open goal aus Store
  const currentOpenGoal = openGoal ? goals.find((g) => g.id === openGoal.id) ?? null : null;

  // Nothing happening heute?
  const heuteEmpty = todayActs.length === 0 && overdueAndTodayTodos.length === 0;

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-1 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            {dateLine}
          </div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight mt-1">
            {greeting}
          </h1>
        </div>
        <div className="shrink-0 pt-1">
          <HeaderSwitcher />
        </div>
      </div>

      {/* Zyklus — asymmetrisch: voll für Ambar, Strip für Dällen */}
      <div className="px-4 mb-3">
        {isCycleOwner ? (
          <CycleTile onClick={() => setCycleOpen(true)} />
        ) : (
          <CycleStrip onClick={() => setCycleOpen(true)} />
        )}
      </div>

      {/* HEUTE — das einzige was wirklich heute zählt */}
      <section className="px-4 mb-4">
        <SectionTitle label="Heute" />
        {heuteEmpty ? (
          <Card className="p-4">
            <p className="text-[14px] italic text-center" style={{ color: "var(--ink-soft)" }}>
              Kein fester Termin, nichts überfällig. Ein leiser Tag.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayActs.map((a) => (
              <Card key={a.id} onClick={() => setOpenAct(a)} className="p-3 flex items-center gap-3">
                <div
                  className="shrink-0 flex flex-col items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: "var(--cream-deep)" }}
                >
                  <span className="serif text-[14px] leading-none">
                    {a.time || "—"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-medium truncate flex items-center gap-1.5">
                    {isPrivate(a) && <Lock size={11} strokeWidth={2} color="var(--muted)" />}
                    {a.title}
                  </div>
                  <div
                    className="text-[12px] mt-0.5 truncate flex items-center gap-1.5"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {a.place && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} strokeWidth={1.75} />
                        {a.place}
                      </span>
                    )}
                    {(a.tags ?? []).length > 0 && <TagChips tags={a.tags} size="xs" max={2} />}
                  </div>
                </div>
                <AvatarWithScope by={a.by} scope={a.scope} size={20} />
              </Card>
            ))}

            {overdueAndTodayTodos.length > 0 && (
              <Card className="p-1">
                {overdueAndTodayTodos.map((t, i) => {
                  const p = PRIO[t.prio];
                  const overdue = t.due < today;
                  return (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTodo(t);
                      }}
                      role="button"
                      tabIndex={0}
                      className="flex items-start gap-2.5 px-2.5 py-2.5 tap cursor-pointer"
                      style={
                        i < overdueAndTodayTodos.length - 1
                          ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                          : undefined
                      }
                    >
                      <RoundCheck
                        checked={false}
                        onClick={() => toggleTodo(t.id)}
                        size={20}
                        color={p.color}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] flex items-center gap-1.5">
                          {p.dot && (
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: p.color }}
                            />
                          )}
                          <span className="truncate">{t.text}</span>
                        </div>
                        <div
                          className="text-[11px] mt-0.5 flex items-center gap-1.5"
                          style={{ color: "var(--muted)" }}
                        >
                          <span
                            style={
                              overdue
                                ? { color: "#C5634B", fontWeight: 500 }
                                : undefined
                            }
                          >
                            {overdue
                              ? `überfällig · ${shortDate(t.due)}`
                              : "heute"}
                          </span>
                          {(t.tags ?? []).length > 0 && (
                            <TagChips tags={t.tags} size="xs" max={2} />
                          )}
                        </div>
                      </div>
                      <AvatarWithScope by={t.by} scope={t.scope} size={18} />
                    </div>
                  );
                })}
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Bald-Reise mit Packliste (innovativ — wird nur gezeigt wenn relevant) */}
      {upcomingTrip && (
        <section className="px-4 mb-3">
          <SectionTitle label="Demnächst auf Reise" />
          <Card
            onClick={() => setOpenAct(upcomingTrip)}
            className="p-3 flex items-center gap-3"
          >
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--terra-soft)", color: "var(--terra-deep)" }}
            >
              <Backpack size={18} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">{upcomingTrip.title}</div>
              <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {shortDate(upcomingTrip.date)} · Packliste{" "}
                {upcomingTrip.packlist.filter((p) => p.packed).length}/
                {upcomingTrip.packlist.length} fertig
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={1.75} color="var(--muted)" />
          </Card>
        </section>
      )}

      {/* Demnächst — kommende Termine */}
      {upcomingActs.length > 0 && (
        <section className="px-4 mb-3">
          <SectionTitle label="Demnächst" actionHref="/aktivitaeten" actionLabel="Alle" />
          <div className="space-y-1.5">
            {upcomingActs.map((a) => (
              <UpcomingActivityCard key={a.id} activity={a} onClick={() => setOpenAct(a)} />
            ))}
          </div>
        </section>
      )}

      {/* Aufgaben dieser Woche (kompakt) */}
      {soonTodos.length > 0 && (
        <section className="px-4 mb-3">
          <SectionTitle label="Diese Woche" actionHref="/todo" actionLabel="Alle" />
          <Card className="p-1">
            {soonTodos.map((t, i) => {
              const p = PRIO[t.prio];
              return (
                <div
                  key={t.id}
                  onClick={() => setOpenTodo(t)}
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-2.5 px-2.5 py-2 tap cursor-pointer"
                  style={
                    i < soonTodos.length - 1
                      ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                      : undefined
                  }
                >
                  <RoundCheck
                    checked={false}
                    onClick={() => toggleTodo(t.id)}
                    size={18}
                    color={p.color}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] truncate">{t.text}</div>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                      {BUCKET_LABEL[dueBucket(t.due)]}
                      {(t.tags ?? []).length > 0 && " · "}
                      {(t.tags ?? []).length > 0 && (
                        <TagChips tags={t.tags} size="xs" max={2} />
                      )}
                    </div>
                  </div>
                  <AvatarWithScope by={t.by} scope={t.scope} size={16} />
                </div>
              );
            })}
          </Card>
        </section>
      )}

      {/* Glance row: Einkauf + Im Blick */}
      <section className="px-4 mb-3 grid grid-cols-2 gap-2 items-stretch">
        <Link href="/einkauf" className="block">
          <Card className="p-3 h-full flex flex-col">
            <div
              className="uplabel text-[10px] flex items-center gap-1.5"
              style={{ color: "var(--ink-soft)" }}
            >
              <CartIcon size={11} strokeWidth={1.75} /> Einkauf
              <span style={{ color: "var(--muted)" }}>· {openShopItems.length}</span>
            </div>
            <div className="flex-1 mt-2 min-h-[60px]">
              {shopPreview.length === 0 ? (
                <div className="text-[12px] italic" style={{ color: "var(--ink-soft)" }}>
                  leer ✓
                </div>
              ) : (
                <ul className="space-y-1">
                  {shopPreview.slice(0, 3).map((s) => (
                    <li
                      key={s.id}
                      className="text-[12px] truncate flex items-center gap-1"
                    >
                      <span
                        className="inline-block w-1 h-1 rounded-full"
                        style={{ background: "var(--sage)" }}
                      />
                      {s.text}
                    </li>
                  ))}
                  {openShopItems.length > 3 && (
                    <li className="text-[11px]" style={{ color: "var(--muted)" }}>
                      +{openShopItems.length - 3} weitere
                    </li>
                  )}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setQuickShopOpen(true);
              }}
              className="tap mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium"
              style={{ color: "var(--terra)" }}
            >
              <Plus size={11} strokeWidth={2.25} /> schnell hinzufügen
            </button>
          </Card>
        </Link>

        {topGoal && (
          <Card onClick={() => setOpenGoal(topGoal)} className="p-3 h-full flex flex-col">
            <div
              className="uplabel text-[10px] flex items-center gap-1"
              style={{ color: "var(--ink-soft)" }}
            >
              Im Blick {isPrivate(topGoal) && <Lock size={9} strokeWidth={2} />}
            </div>
            <div className="text-[12.5px] font-semibold leading-snug line-clamp-2 mt-1.5 mb-2 flex-1">
              {topGoal.title}
            </div>
            <GoalProgress goal={topGoal} />
          </Card>
        )}
      </section>

      {/* Quick-Add FAB */}
      <QuickAddFAB
        onPick={(key) => {
          if (key === "activity") setAddActOpen(true);
          if (key === "todo") setAddTodoOpen(true);
          if (key === "shopping") setQuickShopOpen(true);
          if (key === "goal") setAddGoalOpen(true);
        }}
      />

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

      {/* Add-Sheets */}
      <ActivityAddSheet
        open={addActOpen}
        onClose={() => setAddActOpen(false)}
        onAdd={addActivity}
        currentUser={currentUser}
      />
      <TodoAddSheet
        open={addTodoOpen}
        onClose={() => setAddTodoOpen(false)}
        onAdd={addTodo}
        currentUser={currentUser}
      />
      <GoalAddSheet
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        onAdd={addGoal}
        currentUser={currentUser}
      />
      <QuickShoppingSheet
        open={quickShopOpen}
        onClose={() => setQuickShopOpen(false)}
        onAdd={(text, scope, spinnerei) => addShopping({ text, scope, spinnerei })}
        currentUser={currentUser}
      />
    </>
  );
}

function HeaderSwitcher() {
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  return (
    <div
      className="inline-flex items-center p-0.5 rounded-full shadow-card"
      style={{ background: "var(--paper)" }}
    >
      {(["A", "D"] as const).map((id) => {
        const u = USERS[id];
        const active = currentUser === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setCurrentUser(id)}
            className="tap inline-flex items-center justify-center rounded-full font-semibold text-white"
            style={{
              width: 32,
              height: 32,
              fontSize: 14,
              background: u.color,
              opacity: active ? 1 : 0.4,
              transform: active ? "scale(1)" : "scale(0.86)",
              transition: "opacity 200ms, transform 200ms",
            }}
            aria-label={`Wechseln zu ${u.name}`}
            aria-pressed={active}
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({
  label,
  actionLabel,
  actionHref,
}: {
  label: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-1.5 px-0.5">
      <span className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[12px] font-medium tap"
          style={{ color: "var(--terra-deep)" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

function UpcomingActivityCard({
  activity,
  onClick,
}: {
  activity: Activity;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} className="p-3 flex items-center gap-3">
      <ActivityIcon kind={activity.icon} size={36} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium truncate flex items-center gap-1.5">
          {isPrivate(activity) && <Lock size={11} strokeWidth={2} color="var(--muted)" />}
          {activity.title}
        </div>
        <div
          className="text-[12px] mt-0.5 truncate flex items-center gap-1.5"
          style={{ color: "var(--ink-soft)" }}
        >
          <span style={{ color: USERS[activity.by].color, fontWeight: 500 }}>
            {shortDate(activity.date)}
          </span>
          {activity.time && (
            <span className="inline-flex items-center gap-0.5">
              <Clock size={10} strokeWidth={1.75} />
              {activity.time}
            </span>
          )}
          {activity.place && <span className="truncate">· {activity.place}</span>}
        </div>
        {(activity.tags ?? []).length > 0 && (
          <div className="mt-1">
            <TagChips tags={activity.tags} size="xs" max={3} />
          </div>
        )}
      </div>
      <AvatarWithScope by={activity.by} scope={activity.scope} size={20} />
    </Card>
  );
}

function QuickShoppingSheet({
  open,
  onClose,
  onAdd,
  currentUser,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, scope: "geteilt" | "A" | "D", spinnerei: boolean) => void;
  currentUser: "A" | "D";
}) {
  if (!open) return null;
  return <QuickShoppingForm onClose={onClose} onAdd={onAdd} currentUser={currentUser} />;
}

function QuickShoppingForm({
  onClose,
  onAdd,
  currentUser,
}: {
  onClose: () => void;
  onAdd: (text: string, scope: "geteilt" | "A" | "D", spinnerei: boolean) => void;
  currentUser: "A" | "D";
}) {
  const [text, setText] = useState("");
  const [scope, setScope] = useState<"geteilt" | "A" | "D">("geteilt");
  const [spinnerei, setSpinnerei] = useState(false);
  return (
    <Sheet open onClose={onClose} title="Einkauf-Item">
      <div className="mt-3">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Was fehlt?
        </div>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              onAdd(text.trim(), spinnerei ? scope : scope, spinnerei);
              onClose();
            }
          }}
          placeholder="z. B. Olivenöl"
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>
      <div className="mt-3 flex gap-1.5 flex-wrap">
        {(["geteilt", currentUser] as const).map((s) => {
          const isShared = s === "geteilt";
          const active = scope === s && !spinnerei;
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                setScope(s);
                setSpinnerei(false);
              }}
              className="tap text-[12px] font-medium rounded-full px-3 py-1.5"
              style={
                active
                  ? { background: "var(--ink)", color: "var(--paper)" }
                  : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
              }
            >
              {isShared ? "Gemeinsam" : "Privat"}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setSpinnerei(true)}
          className="tap text-[12px] font-medium rounded-full px-3 py-1.5"
          style={
            spinnerei
              ? { background: "var(--terra)", color: "white" }
              : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
          }
        >
          ✦ Spinnerei
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!text.trim()) return;
          onAdd(text.trim(), scope, spinnerei);
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
