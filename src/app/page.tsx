"use client";

import { useState } from "react";
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
import { USERS, type ShoppingItem } from "@/lib/types";
import { todayISO, greetingFor, shortDate } from "@/lib/date";
import { BUCKET_LABEL, PRIO, dueBucket } from "@/lib/todo";
import { Card } from "@/components/Card";
import { AvatarWithScope } from "@/components/Avatar";
import { ActivityIcon } from "@/components/ActivityIcon";
import { GoalProgress } from "@/components/GoalProgress";
import { RoundCheck } from "@/components/RoundCheck";
import { DeleteAction } from "@/components/DeleteAction";
import { CycleHeroCard } from "@/components/CycleHeroCard";
import { TagChips } from "@/components/TagChips";
import { ClientOnly } from "@/components/ClientOnly";
import { QuickAddMenu } from "@/components/QuickAddMenu";
import { Sheet } from "@/components/Sheet";
import { useRouter } from "next/navigation";
import { ShoppingSheet } from "@/components/sheets/ShoppingSheet";
import { TodoSheet } from "@/components/sheets/TodoSheet";
import { GoalSheet } from "@/components/sheets/GoalSheet";
import { CycleSheet } from "@/components/sheets/CycleSheet";
import { ActivityAddSheet } from "@/components/sheets/ActivityAddSheet";
import { TodoAddSheet } from "@/components/sheets/TodoAddSheet";
import { GoalAddSheet } from "@/components/sheets/GoalAddSheet";
import type { Activity, Goal, Todo } from "@/lib/types";

export default function HeutePage() {
  return (
    <ClientOnly fallback={<HeuteSkeleton />}>
      <HeuteContent />
    </ClientOnly>
  );
}

function HeuteSkeleton() {
  return <div className="px-4 pt-4 h-screen" />;
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
  const addTodo = useStore((s) => s.addTodo);

  const addActivity = useStore((s) => s.addActivity);

  const updateGoal = useStore((s) => s.updateGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const addGoal = useStore((s) => s.addGoal);
  const addGoalStep = useStore((s) => s.addGoalStep);
  const toggleGoalStep = useStore((s) => s.toggleGoalStep);
  const removeGoalStep = useStore((s) => s.removeGoalStep);

  const router = useRouter();
  const openAct = (a: Activity) => router.push(`/aktivitaeten/${a.id}`);
  const [openShop, setOpenShop] = useState<ShoppingItem | null>(null);
  const [openTodo, setOpenTodo] = useState<Todo | null>(null);
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);
  const [cycleOpen, setCycleOpen] = useState(false);

  const [addActOpen, setAddActOpen] = useState(false);
  const [addTodoOpen, setAddTodoOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [quickShopOpen, setQuickShopOpen] = useState<null | { spinnerei: boolean }>(null);

  const today = todayISO();
  const userName = USERS[currentUser].name;
  const greeting = greetingFor(new Date(), userName);
  const dateLine = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const myActivities = visibleTo(activities, currentUser);
  const myShopping = visibleTo(shopping, currentUser);
  const myTodos = visibleTo(todos, currentUser);
  const myGoals = visibleTo(goals, currentUser);

  // Einkauf-Listen (offen)
  const privatItems = myShopping.filter((s) => !s.done && !s.spinnerei);
  const spinnereiItems = myShopping.filter((s) => !s.done && s.spinnerei);

  // Heute = heutige Termine + überfällige/heutige Todos
  const todayActs = myActivities
    .filter((a) => a.date === today && a.status !== "erledigt")
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  const overdueAndTodayTodos = myTodos
    .filter((t) => !t.done && t.due && t.due <= today)
    .sort((a, b) => {
      const da = a.due ? a.due.localeCompare(today) : 0;
      const db = b.due ? b.due.localeCompare(today) : 0;
      if (da !== db) return da - db;
      return PRIO[a.prio].rank - PRIO[b.prio].rank;
    });

  // Demnächst: 3 nächste Aktivitäten
  const upcomingActs = myActivities
    .filter((a) => a.status === "geplant" && a.date && a.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Bald-Reise mit Packliste
  const upcomingTrip = myActivities
    .filter(
      (a) =>
        a.packlist.length > 0 && a.status === "geplant" && a.date && a.date >= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Diese Woche Todos (nicht heute/überfällig)
  const soonTodos = myTodos
    .filter((t) => !t.done && t.due && t.due > today && dueBucket(t.due) !== "spaeter")
    .sort((a, b) => {
      const pr = PRIO[a.prio].rank - PRIO[b.prio].rank;
      if (pr !== 0) return pr;
      return a.due.localeCompare(b.due);
    })
    .slice(0, 3);

  // Top Goal
  const topGoal = myGoals.find((g) => g.scope === "geteilt") ?? myGoals[0];

  const currentOpenGoal = openGoal ? goals.find((g) => g.id === openGoal.id) ?? null : null;
  const heuteEmpty = todayActs.length === 0 && overdueAndTodayTodos.length === 0;

  return (
    <>
      {/* Header: Greeting + User-Switch */}
      <div className="px-4 pt-1 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            {dateLine}
          </div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight mt-1 truncate">
            {greeting}
          </h1>
        </div>
        <div className="shrink-0 pt-1 flex items-center gap-2">
          <HeaderSwitcher />
          <QuickAddMenu
            onPick={(key) => {
              if (key === "activity") setAddActOpen(true);
              if (key === "todo") setAddTodoOpen(true);
              if (key === "shopping") setQuickShopOpen({ spinnerei: false });
              if (key === "goal") setAddGoalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Zyklus — Hero Ring (für beide User) */}
      <div className="px-4 mb-3">
        <CycleHeroCard onOpenSheet={() => setCycleOpen(true)} />
      </div>

      {/* Einkauf-Kacheln: Privat | Spinnerei */}
      <div className="px-4 mb-3 grid grid-cols-2 gap-2 items-stretch">
        <ShoppingTile
          label="Privat"
          accent="var(--sage)"
          icon={<CartIcon size={11} strokeWidth={1.75} />}
          items={privatItems}
          onAdd={(text) => addShopping({ text, scope: "geteilt", spinnerei: false })}
          onOpenItem={setOpenShop}
          onToggle={toggleShopping}
          onRemove={removeShopping}
          onQuickAdd={() => setQuickShopOpen({ spinnerei: false })}
        />
        <ShoppingTile
          label="Spinnerei"
          accent="var(--terra)"
          icon={<span style={{ color: "var(--terra)", fontSize: 11 }}>✦</span>}
          items={spinnereiItems}
          onAdd={(text) => addShopping({ text, scope: "geteilt", spinnerei: true })}
          onOpenItem={setOpenShop}
          onToggle={toggleShopping}
          onRemove={removeShopping}
          onQuickAdd={() => setQuickShopOpen({ spinnerei: true })}
        />
      </div>

      {/* HEUTE — heutige Termine + überfällige/heutige Todos */}
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
              <Card key={a.id} onClick={() => openAct(a)} className="p-3 flex items-center gap-3">
                <div
                  className="shrink-0 flex flex-col items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: "var(--cream-deep)" }}
                >
                  <span className="serif text-[14px] leading-none">{a.time || "—"}</span>
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
                      className="flex items-start gap-2 px-2.5 py-2.5 tap cursor-pointer"
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
                              overdue ? { color: "#C5634B", fontWeight: 500 } : undefined
                            }
                          >
                            {overdue ? `überfällig · ${shortDate(t.due)}` : "heute"}
                          </span>
                          {(t.tags ?? []).length > 0 && (
                            <TagChips tags={t.tags} size="xs" max={2} />
                          )}
                        </div>
                      </div>
                      <AvatarWithScope by={t.by} scope={t.scope} size={18} />
                      <DeleteAction
                        kind="Aufgabe"
                        label={t.text}
                        onConfirm={() => removeTodo(t.id)}
                      />
                    </div>
                  );
                })}
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Demnächst auf Reise (Packliste) */}
      {upcomingTrip && (
        <section className="px-4 mb-3">
          <SectionTitle label="Demnächst auf Reise" />
          <Card
            onClick={() => openAct(upcomingTrip)}
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

      {/* Demnächst */}
      {upcomingActs.length > 0 && (
        <section className="px-4 mb-3">
          <SectionTitle label="Demnächst" actionHref="/aktivitaeten" actionLabel="Alle" />
          <div className="space-y-1.5">
            {upcomingActs.map((a) => (
              <UpcomingActivityCard key={a.id} activity={a} onClick={() => openAct(a)} />
            ))}
          </div>
        </section>
      )}

      {/* Diese Woche */}
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
                  <DeleteAction
                    kind="Aufgabe"
                    label={t.text}
                    onConfirm={() => removeTodo(t.id)}
                    size={12}
                  />
                </div>
              );
            })}
          </Card>
        </section>
      )}

      {/* Im Blick */}
      {topGoal && (
        <section className="px-4 mb-3">
          <SectionTitle label="Im Blick" actionHref="/ziele" actionLabel="Ziele" />
          <Card onClick={() => setOpenGoal(topGoal)} className="p-3.5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="text-[14px] font-medium leading-snug min-w-0">{topGoal.title}</div>
              <AvatarWithScope by={topGoal.by} scope={topGoal.scope} size={20} />
            </div>
            <GoalProgress goal={topGoal} />
          </Card>
        </section>
      )}

      {/* Detail-Sheets */}
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
        open={quickShopOpen !== null}
        initialSpinnerei={quickShopOpen?.spinnerei ?? false}
        onClose={() => setQuickShopOpen(null)}
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

function ShoppingTile({
  label,
  accent,
  icon,
  items,
  onAdd,
  onOpenItem,
  onToggle,
  onRemove,
  onQuickAdd,
}: {
  label: string;
  accent: string;
  icon: React.ReactNode;
  items: ShoppingItem[];
  onAdd: (text: string) => void;
  onOpenItem: (it: ShoppingItem) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onQuickAdd: () => void;
}) {
  const [input, setInput] = useState("");
  const submit = () => {
    const t = input.trim();
    if (!t) return;
    onAdd(t);
    setInput("");
  };
  const isSpinnerei = label === "Spinnerei";
  // Höhe für max. 6 Items (jede Zeile ~28px inkl. Gap). Über 6 → scrollen.
  const LIST_HEIGHT_MAX_6 = 28 * 6;

  return (
    <Card className="p-3 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div
          className="uplabel text-[10px] inline-flex items-center gap-1.5"
          style={{ color: "var(--ink-soft)" }}
        >
          {icon} {label}
          <span style={{ color: "var(--muted)" }}>· {items.length}</span>
        </div>
        <Link
          href="/einkauf"
          className="tap inline-flex items-center"
          style={{ color: "var(--muted)" }}
          aria-label="Alle"
        >
          <ChevronRight size={14} strokeWidth={1.75} />
        </Link>
      </div>

      <div className="mb-2">
        {items.length === 0 ? (
          <div
            className="text-[12px] italic"
            style={{ color: "var(--ink-soft)", minHeight: 80 }}
          >
            {isSpinnerei ? "noch keine Wünsche" : "leer ✓"}
          </div>
        ) : (
          <ul
            className="space-y-1.5 phone-scroll overflow-y-auto pr-1"
            style={{ maxHeight: LIST_HEIGHT_MAX_6 }}
          >
            {items.map((s) => (
              <li key={s.id} className="text-[12.5px] flex items-center gap-1">
                <RoundCheck
                  checked={false}
                  onClick={() => onToggle(s.id)}
                  size={16}
                  color={accent}
                  ariaLabel={`${s.text} abhaken`}
                />
                <button
                  type="button"
                  onClick={() => onOpenItem(s)}
                  className="tap flex-1 min-w-0 inline-flex items-center gap-1 text-left"
                >
                  {isSpinnerei && (
                    <span style={{ color: "var(--terra)", fontSize: 10 }}>✦</span>
                  )}
                  <span className="truncate">{s.text}</span>
                  {isPrivate(s) && <Lock size={9} strokeWidth={2} color="var(--muted)" />}
                </button>
                <DeleteAction
                  label={s.text}
                  onConfirm={() => onRemove(s.id)}
                  size={11}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="flex items-center gap-1 rounded-xl px-1.5 py-1"
        style={{ background: "rgba(228,217,191,0.4)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={isSpinnerei ? "Wunsch?" : "Was fehlt?"}
          className="flex-1 bg-transparent text-[12px] py-1 px-1.5 min-w-0"
          style={{ color: "var(--ink)" }}
        />
        <button
          type="button"
          onClick={submit}
          onDoubleClick={onQuickAdd}
          className="tap w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white"
          style={{ background: input.trim() ? accent : "var(--cream-deep)" }}
          aria-label="Hinzufügen"
        >
          <Plus size={12} strokeWidth={2.25} />
        </button>
      </div>
    </Card>
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
  initialSpinnerei,
  onClose,
  onAdd,
  currentUser,
}: {
  open: boolean;
  initialSpinnerei: boolean;
  onClose: () => void;
  onAdd: (text: string, scope: "geteilt" | "A" | "D", spinnerei: boolean) => void;
  currentUser: "A" | "D";
}) {
  if (!open) return null;
  return (
    <QuickShoppingForm
      initialSpinnerei={initialSpinnerei}
      onClose={onClose}
      onAdd={onAdd}
      currentUser={currentUser}
    />
  );
}

function QuickShoppingForm({
  initialSpinnerei,
  onClose,
  onAdd,
  currentUser,
}: {
  initialSpinnerei: boolean;
  onClose: () => void;
  onAdd: (text: string, scope: "geteilt" | "A" | "D", spinnerei: boolean) => void;
  currentUser: "A" | "D";
}) {
  const [text, setText] = useState("");
  const [scope, setScope] = useState<"geteilt" | "A" | "D">("geteilt");
  const [spinnerei, setSpinnerei] = useState(initialSpinnerei);
  return (
    <Sheet open onClose={onClose} title={spinnerei ? "Spinnerei" : "Einkauf-Item"}>
      <div className="mt-3">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          {spinnerei ? "Was wünschst du dir?" : "Was fehlt?"}
        </div>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              onAdd(text.trim(), scope, spinnerei);
              onClose();
            }
          }}
          placeholder={spinnerei ? "z. B. Plattenspieler" : "z. B. Olivenöl"}
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>
      <div className="mt-3 flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setScope("geteilt");
            setSpinnerei(false);
          }}
          className="tap text-[12px] font-medium rounded-full px-3 py-1.5"
          style={
            scope === "geteilt" && !spinnerei
              ? { background: "var(--ink)", color: "var(--paper)" }
              : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
          }
        >
          Gemeinsam
        </button>
        <button
          type="button"
          onClick={() => {
            setScope(currentUser);
            setSpinnerei(false);
          }}
          className="tap text-[12px] font-medium rounded-full px-3 py-1.5"
          style={
            scope === currentUser && !spinnerei
              ? { background: "var(--ink)", color: "var(--paper)" }
              : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
          }
        >
          Privat
        </button>
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
