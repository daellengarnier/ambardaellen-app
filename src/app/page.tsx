"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, ShoppingCart, ChevronRight, Plus, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo, isPrivate } from "@/lib/scope";
import { USERS } from "@/lib/types";
import {
  todayISO,
  greetingFor,
  longDate,
  shortDate,
  dayMonth,
  diffDays,
} from "@/lib/date";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarPair, AvatarWithScope } from "@/components/Avatar";
import { ActivityIcon } from "@/components/ActivityIcon";
import { GoalProgress } from "@/components/GoalProgress";
import { RoundCheck } from "@/components/RoundCheck";
import { CycleTile } from "@/components/CycleTile";
import { ClientOnly } from "@/components/ClientOnly";
import type { Activity, Todo } from "@/lib/types";

const PRIO_COLOR = {
  hoch: "var(--terra)",
  normal: "var(--sage)",
  tief: "var(--muted)",
} as const;

export default function HeutePage() {
  return (
    <ClientOnly fallback={<HeuteSkeleton />}>
      <HeuteContent />
    </ClientOnly>
  );
}

function HeuteSkeleton() {
  return (
    <div className="phone-scroll overflow-y-auto h-full pt-[48px] pb-[120px]">
      <div className="px-4 pt-1 pb-3 h-32" />
    </div>
  );
}

function HeuteContent() {
  const currentUser = useStore((s) => s.currentUser);
  const activities = useStore((s) => s.activities);
  const shopping = useStore((s) => s.shopping);
  const todos = useStore((s) => s.todos);
  const goals = useStore((s) => s.goals);
  const addShopping = useStore((s) => s.addShopping);
  const toggleShopping = useStore((s) => s.toggleShopping);
  const toggleTodo = useStore((s) => s.toggleTodo);

  const today = todayISO();
  const greeting = greetingFor();

  const visibleActs = useMemo(() => visibleTo(activities, currentUser), [activities, currentUser]);
  const visibleShop = useMemo(() => visibleTo(shopping, currentUser), [shopping, currentUser]);
  const visibleTodos = useMemo(() => visibleTo(todos, currentUser), [todos, currentUser]);
  const visibleGoals = useMemo(() => visibleTo(goals, currentUser), [goals, currentUser]);

  const todayActs = visibleActs
    .filter((a) => a.date === today && a.status !== "erledigt")
    .sort((a, b) => a.time.localeCompare(b.time));
  const upcomingActs = visibleActs
    .filter((a) => a.status === "geplant" && a.date && a.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2);
  const nextAct = todayActs[0] ?? upcomingActs[0];

  const topGoal =
    visibleGoals.find((g) => g.scope === "geteilt") ?? visibleGoals[0];

  const openShopping = visibleShop.filter((s) => !s.done && !s.spinnerei);
  const shopPreview = openShopping.slice(0, 4);

  const urgentTodos = visibleTodos
    .filter((t) => !t.done)
    .filter((t) => !t.due || diffDays(t.due, today) <= 7)
    .sort((a, b) => {
      const rank = { hoch: 0, normal: 1, tief: 2 };
      if (rank[a.prio] !== rank[b.prio]) return rank[a.prio] - rank[b.prio];
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    })
    .slice(0, 4);

  return (
    <div className="phone-scroll overflow-y-auto h-full pt-[48px] pb-[120px]">
      {/* Greeting */}
      <ScreenHeader
        title={greeting}
        subtitle={longDate(today)}
        right={<AvatarPair size={28} />}
      />

      {/* Today's activity (if any) */}
      {todayActs[0] && (
        <div className="px-4 mb-2">
          <ActivityCard activity={todayActs[0]} />
        </div>
      )}

      {/* Cycle tile */}
      <CycleTile />

      {/* Upcoming activities */}
      {upcomingActs.length > 0 && (
        <section className="px-4 mt-3 mb-3">
          <SectionHeader title="Demnächst" actionHref="/aktivitaeten" actionLabel="Alle" />
          <div className="space-y-2">
            {upcomingActs.map((a) => (
              <UpcomingActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </section>
      )}

      {/* Einkauf snippet */}
      <section className="px-4 mb-3">
        <SectionHeader
          title="Einkauf"
          actionHref="/einkauf"
          actionLabel={`${openShopping.length} offen`}
        />
        <Card className="p-2">
          <div className="space-y-0">
            {shopPreview.length === 0 ? (
              <div className="px-3 py-4 text-[13px] text-[var(--muted)] italic text-center">
                Keine offenen Einkäufe.
              </div>
            ) : (
              shopPreview.map((it, i) => (
                <div
                  key={it.id}
                  className={`flex items-center gap-2.5 px-2.5 py-2.5 ${
                    i < shopPreview.length - 1 ? "border-b border-[var(--line)]/60" : ""
                  }`}
                >
                  <RoundCheck
                    checked={false}
                    onClick={() => toggleShopping(it.id)}
                    color="var(--sage)"
                    size={20}
                    ariaLabel={`${it.text} erledigen`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] text-[var(--ink)] truncate">{it.text}</div>
                    {(it.qty || it.category) && (
                      <div className="text-[12px] text-[var(--muted)] truncate capitalize">
                        {it.category}
                        {it.qty ? ` · ${it.qty}` : ""}
                      </div>
                    )}
                  </div>
                  <AvatarWithScope by={it.by} scope={it.scope} size={20} />
                </div>
              ))
            )}
          </div>
          <QuickAddShop onAdd={(text) => addShopping({ text, scope: "geteilt", spinnerei: false })} />
        </Card>
      </section>

      {/* Im Blick (top goal) */}
      {topGoal && (
        <section className="px-4 mb-3">
          <SectionHeader title="Im Blick" actionHref="/ziele" actionLabel="Ziele" />
          <Card className="p-3.5">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-medium text-[var(--ink)] line-clamp-2">
                  {topGoal.title}
                </div>
              </div>
              <AvatarWithScope by={topGoal.by} scope={topGoal.scope} size={20} />
            </div>
            <div className="mt-2.5">
              <GoalProgress goal={topGoal} />
            </div>
          </Card>
        </section>
      )}

      {/* Aufgaben Pinnwand */}
      <section className="px-4 mb-2">
        <SectionHeader title="Aufgaben" actionHref="/todo" actionLabel="Alle" />
        {urgentTodos.length === 0 ? (
          <Card className="p-4">
            <p className="text-[13.5px] italic text-[var(--ink-soft)] text-center">
              Keine offenen Aufgaben für die kommenden Tage.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {urgentTodos.map((t) => (
              <TodoPinCard key={t.id} todo={t} onToggle={() => toggleTodo(t.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-1.5 px-0.5">
      <span className="uplabel text-[10px] text-[var(--muted)]">{title}</span>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[12px] font-medium text-[var(--terra-deep)] tap"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Card className="p-3 flex items-center gap-3">
      <ActivityIcon kind={activity.icon} size={36} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-medium text-[var(--ink)] truncate flex items-center gap-1.5">
          {isPrivate({ scope: activity.scope }) && (
            <Lock size={12} strokeWidth={2} color="var(--muted)" />
          )}
          {activity.title}
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] mt-0.5">
          {activity.time && (
            <>
              <Clock size={12} strokeWidth={1.75} />
              <span>{activity.time}</span>
            </>
          )}
          {activity.place && (
            <>
              <span>·</span>
              <span className="truncate">{activity.place}</span>
            </>
          )}
        </div>
      </div>
      <AvatarWithScope by={activity.by} scope={activity.scope} size={22} />
    </Card>
  );
}

function UpcomingActivityCard({ activity }: { activity: Activity }) {
  const { d, mShort } = activity.date ? dayMonth(activity.date) : { d: 0, mShort: "" };
  return (
    <Link href="/aktivitaeten" className="block tap">
      <Card className="p-3 flex items-center gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-xl shrink-0"
          style={{ width: 44, height: 44, background: "var(--cream-deep)" }}
        >
          <span className="uplabel text-[9px] text-[var(--ink-soft)] leading-none">{mShort}</span>
          <span className="serif text-[18px] leading-none mt-1 text-[var(--ink)]">{d}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-medium text-[var(--ink)] truncate flex items-center gap-1.5">
            {isPrivate({ scope: activity.scope }) && (
              <Lock size={11} strokeWidth={2} color="var(--muted)" />
            )}
            {activity.title}
          </div>
          <div className="text-[12.5px] text-[var(--muted)] truncate mt-0.5">
            {shortDate(activity.date)}
            {activity.time ? ` · ${activity.time}` : ""}
            {activity.place ? ` · ${activity.place}` : ""}
          </div>
        </div>
        <ChevronRight size={18} color="var(--muted)" strokeWidth={1.75} />
      </Card>
    </Link>
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
    <div className="flex items-center gap-2 pt-2 px-1 pb-1">
      <span
        className="inline-flex items-center justify-center rounded-full shrink-0"
        style={{ width: 28, height: 28, background: "var(--cream-deep)", color: "var(--terra)" }}
      >
        <ShoppingCart size={14} strokeWidth={2} />
      </span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Was fehlt?"
        className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--muted)]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!can}
        className="tap inline-flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 28,
          height: 28,
          background: can ? "var(--terra)" : "var(--terra-soft)",
          color: "white",
        }}
        aria-label="Hinzufügen"
      >
        <Plus size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}

function TodoPinCard({ todo, onToggle }: { todo: Todo; onToggle: () => void }) {
  const today = todayISO();
  const bucket = !todo.due
    ? "Ohne Datum"
    : diffDays(todo.due, today) < 0
      ? "Überfällig"
      : todo.due === today
        ? "Heute"
        : diffDays(todo.due, today) === 1
          ? "Morgen"
          : "Diese Woche";

  return (
    <Card className="p-2.5 relative overflow-hidden">
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
        style={{ background: PRIO_COLOR[todo.prio] }}
      />
      <div className="pl-1.5">
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <span className="uplabel text-[9.5px] text-[var(--muted)]">{bucket}</span>
          <AvatarWithScope by={todo.by} scope={todo.scope} size={16} />
        </div>
        <div className="text-[13px] text-[var(--ink)] line-clamp-3 leading-snug mb-2">
          {todo.prio === "hoch" && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
              style={{ background: PRIO_COLOR.hoch }}
            />
          )}
          {todo.text}
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--ink-soft)]">
          <RoundCheck
            checked={false}
            onClick={onToggle}
            color={PRIO_COLOR[todo.prio]}
            size={16}
          />
          <button
            type="button"
            onClick={onToggle}
            className="tap"
          >
            erledigen
          </button>
        </div>
      </div>
    </Card>
  );
}
