"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  ShoppingCart as CartIcon,
  Plus,
  ChevronRight,
  Backpack,
  Inbox as InboxIcon,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useLife, areaByKey } from "@/lib/lifeStore";
import { OWNER_NAME, type ShoppingItem } from "@/lib/types";
import { todayISO, greetingFor, shortDate } from "@/lib/date";
import { todayZurich, type TodoDto } from "@/lib/life";
import { PRIO } from "@/lib/todo";
import { Card } from "@/components/Card";
import { ActivityIcon } from "@/components/ActivityIcon";
import { GoalProgress } from "@/components/GoalProgress";
import { RoundCheck } from "@/components/RoundCheck";
import { DeleteAction } from "@/components/DeleteAction";
import { TagChips } from "@/components/TagChips";
import { TodoRow } from "@/components/TodoRow";
import { ClientOnly } from "@/components/ClientOnly";
import { QuickAddMenu } from "@/components/QuickAddMenu";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Sheet } from "@/components/Sheet";
import { ShoppingSheet } from "@/components/sheets/ShoppingSheet";
import { TodoSheet } from "@/components/sheets/TodoSheet";
import { GoalSheet } from "@/components/sheets/GoalSheet";
import { ActivityAddSheet } from "@/components/sheets/ActivityAddSheet";
import { TodoAddSheet } from "@/components/sheets/TodoAddSheet";
import { GoalAddSheet } from "@/components/sheets/GoalAddSheet";
import type { Activity, Goal } from "@/lib/types";

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

const byPrio = (a: TodoDto, b: TodoDto) => PRIO[a.prio].rank - PRIO[b.prio].rank;

const WORLDS = [
  { key: "spinnerei", label: "Spinnerei", bg: "var(--spinnerei)", fg: "#FFFFFF" },
  { key: "privat", label: "Privat", bg: "var(--privat)", fg: "var(--ink)" },
] as const;

function HeuteContent() {
  const currentUser = useStore((s) => s.currentUser);
  const activities = useStore((s) => s.activities);
  const shopping = useStore((s) => s.shopping);
  const goals = useStore((s) => s.goals);

  const addShopping = useStore((s) => s.addShopping);
  const toggleShopping = useStore((s) => s.toggleShopping);
  const updateShopping = useStore((s) => s.updateShopping);
  const removeShopping = useStore((s) => s.removeShopping);

  const addActivity = useStore((s) => s.addActivity);

  const updateGoal = useStore((s) => s.updateGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const addGoal = useStore((s) => s.addGoal);
  const addGoalStep = useStore((s) => s.addGoalStep);
  const toggleGoalStep = useStore((s) => s.toggleGoalStep);
  const removeGoalStep = useStore((s) => s.removeGoalStep);

  const todos = useLife((s) => s.todos);
  const areas = useLife((s) => s.areas);
  const inbox = useLife((s) => s.inbox);
  const plan = useLife((s) => s.plan);
  const addTodo = useLife((s) => s.addTodo);
  const toggleTodo = useLife((s) => s.toggleTodo);
  const addInbox = useLife((s) => s.addInbox);

  const router = useRouter();
  const openAct = (a: Activity) => router.push(`/aktivitaeten/${a.id}`);
  const [openShop, setOpenShop] = useState<ShoppingItem | null>(null);
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);
  const [openGoal, setOpenGoal] = useState<Goal | null>(null);

  const [addActOpen, setAddActOpen] = useState(false);
  const [addTodoOpen, setAddTodoOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [inboxNoteOpen, setInboxNoteOpen] = useState(false);
  const [quickShopOpen, setQuickShopOpen] = useState<null | { spinnerei: boolean }>(null);

  const today = todayISO();
  const todayZ = todayZurich();
  const greeting = greetingFor(new Date(), OWNER_NAME);
  const dateLine = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Einkauf-Listen (offen)
  const privatItems = shopping.filter((s) => !s.done && !s.spinnerei);
  const spinnereiItems = shopping.filter((s) => !s.done && s.spinnerei);

  // Heute: von Jarvis oder mir für heute geplant, dazu Fälliges
  const open = todos.filter((t) => t.status === "offen");
  const planned = open.filter((t) => t.plannedFor === todayZ).sort(byPrio);
  const dueToday = open.filter((t) => t.plannedFor !== todayZ && t.due === todayZ).sort(byPrio);
  const overdue = open
    .filter((t) => t.plannedFor !== todayZ && t.due && t.due < todayZ)
    .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  const doneToday = todos.filter(
    (t) => t.status === "erledigt" && t.doneAt && todayZurich(new Date(t.doneAt)) === todayZ,
  );
  const todayList = [...planned, ...dueToday];
  const forToday = [...todayList, ...overdue];
  const worldOf = (t: TodoDto) => areaByKey(areas, t.area)?.world ?? null;

  const todayActs = activities
    .filter((a) => a.date === today && a.status !== "erledigt")
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  // Bald-Reise mit Packliste (kommt prominent als „Demnächst auf Reise")
  const upcomingTrip = activities
    .filter((a) => a.packlist.length > 0 && a.status === "geplant" && a.date && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Demnächst: 3 nächste Aktivitäten. Trip rausfiltern, der bekommt
  // schon seine eigene Karte oben.
  const upcomingActs = activities
    .filter((a) => a.status === "geplant" && a.date && a.date > today)
    .filter((a) => !upcomingTrip || a.id !== upcomingTrip.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const topGoal = goals[0];
  const currentOpenGoal = openGoal ? goals.find((g) => g.id === openGoal.id) ?? null : null;
  const heuteEmpty = todayActs.length === 0 && todayList.length === 0;

  return (
    <>
      {/* Header: Begrüssung */}
      <div className="px-4 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
            {dateLine}
          </div>
          <h1 className="serif text-[30px] leading-[1.05] mt-1 break-words" style={{ color: "var(--mens)" }}>
            {greeting}
          </h1>
        </div>
        <div className="shrink-0 pt-1 flex items-center gap-2">
          <HamburgerMenu />
          <QuickAddMenu
            onPick={(key) => {
              if (key === "inbox") setInboxNoteOpen(true);
              if (key === "todo") setAddTodoOpen(true);
              if (key === "activity") setAddActOpen(true);
              if (key === "shopping") setQuickShopOpen({ spinnerei: false });
              if (key === "goal") setAddGoalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Zwei Welten: was heute in Spinnerei und Privat ansteht */}
      <div className="px-4 mb-3 grid grid-cols-2 gap-2.5">
        {WORLDS.map((w) => {
          const todayCount = forToday.filter((t) => worldOf(t) === w.key).length;
          const overdueCount = overdue.filter((t) => worldOf(t) === w.key).length;
          const openCount = open.filter((t) => worldOf(t) === w.key).length;
          return (
            <Link
              key={w.key}
              href={`/todo?welt=${w.key}`}
              className="tap rounded-[22px] p-3.5 flex flex-col gap-2"
              style={{ background: w.bg, color: w.fg, minHeight: 128 }}
            >
              <span className="text-[13px] font-bold">{w.label}</span>
              <span className="serif text-[40px] leading-none">{todayCount}</span>
              <span className="text-[12.5px] leading-snug font-medium">
                heute
                {overdueCount > 0 ? ` · ${overdueCount} überfällig` : ` · ${openCount} offen`}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Notiz von Jarvis für den Tag */}
      {plan?.note && (
        <div className="px-4 mb-3">
          <Card className="p-3.5 flex gap-3 items-start">
            <span
              className="shrink-0 w-[34px] h-[34px] rounded-full inline-flex items-center justify-center"
              style={{ background: "var(--ink)", color: "white" }}
            >
              <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
                Jarvis
              </div>
              <p className="text-[14.5px] leading-relaxed whitespace-pre-line mt-0.5" style={{ color: "var(--ink)" }}>
                {plan.note}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* HEUTE */}
      <section className="px-4 mb-4">
        <SectionTitle label="Heute" actionHref="/todo" actionLabel="Alle Todos" />
        {heuteEmpty ? (
          <Card className="p-4">
            <p className="text-[14px] italic text-center" style={{ color: "var(--ink-soft)" }}>
              {doneToday.length > 0
                ? `${doneToday.length} erledigt, nichts mehr offen für heute.`
                : "Nichts geplant, nichts fällig. Ein leiser Tag."}
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
                  <div className="text-[14.5px] font-medium truncate">{a.title}</div>
                  <div className="text-[12px] mt-0.5 truncate flex items-center gap-1.5" style={{ color: "var(--ink-soft)" }}>
                    {a.place && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} strokeWidth={1.75} />
                        {a.place}
                      </span>
                    )}
                    {(a.tags ?? []).length > 0 && <TagChips tags={a.tags} size="xs" max={2} />}
                  </div>
                </div>
              </Card>
            ))}

            {todayList.length > 0 && (
              <Card className="p-1">
                {todayList.map((t, i) => (
                  <div key={t.id} style={i < todayList.length - 1 ? { borderBottom: "1px solid var(--cream-deep)" } : undefined}>
                    <TodoRow t={t} areas={areas} onToggle={toggleTodo} onOpen={(x) => setOpenTodoId(x.id)} dense hideToday />
                  </div>
                ))}
              </Card>
            )}
            {doneToday.length > 0 && (
              <div className="text-[11.5px] px-1" style={{ color: "var(--muted)" }}>
                {doneToday.length} heute erledigt
              </div>
            )}
          </div>
        )}
      </section>

      {/* Überfällig */}
      {overdue.length > 0 && (
        <section className="px-4 mb-4">
          <SectionTitle label="Überfällig" />
          <Card className="p-1">
            {overdue.slice(0, 6).map((t, i, arr) => (
              <div key={t.id} style={i < arr.length - 1 ? { borderBottom: "1px solid var(--cream-deep)" } : undefined}>
                <TodoRow t={t} areas={areas} onToggle={toggleTodo} onOpen={(x) => setOpenTodoId(x.id)} dense />
              </div>
            ))}
          </Card>
          {overdue.length > 6 && (
            <Link href="/todo" className="block text-[12px] mt-1.5 px-1 font-medium" style={{ color: "var(--terra-deep)" }}>
              und {overdue.length - 6} weitere
            </Link>
          )}
        </section>
      )}

      {/* Inbox */}
      {inbox.length > 0 && (
        <section className="px-4 mb-3">
          <Link href="/inbox">
            <Card className="p-3 flex items-center gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--plum-soft)", color: "var(--plum)" }}
              >
                <InboxIcon size={18} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">
                  {inbox.length === 1 ? "1 Eintrag in der Inbox" : `${inbox.length} Einträge in der Inbox`}
                </div>
                <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                  {inbox[0].text.split("\n")[0]}
                </div>
              </div>
              <ChevronRight size={16} strokeWidth={1.75} color="var(--muted)" />
            </Card>
          </Link>
        </section>
      )}

      {/* Einkauf-Kacheln: Einkauf | Spinnerei */}
      <div className="px-4 mb-3 grid grid-cols-2 gap-2 items-stretch">
        <ShoppingTile
          label="Einkauf"
          accent="var(--sage)"
          icon={<CartIcon size={11} strokeWidth={1.75} />}
          items={privatItems}
          onAdd={(text) => addShopping({ text, scope: "D", spinnerei: false })}
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
          onAdd={(text) => addShopping({ text, scope: "D", spinnerei: true })}
          onOpenItem={setOpenShop}
          onToggle={toggleShopping}
          onRemove={removeShopping}
          onQuickAdd={() => setQuickShopOpen({ spinnerei: true })}
        />
      </div>

      {/* Demnächst auf Reise (Packliste) */}
      {upcomingTrip && (
        <section className="px-4 mb-3">
          <SectionTitle label="Demnächst auf Reise" />
          <Card onClick={() => openAct(upcomingTrip)} className="p-3 flex items-center gap-3">
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--terra-soft)", color: "var(--terra-deep)" }}
            >
              <Backpack size={18} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">{upcomingTrip.title}</div>
              <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {shortDate(upcomingTrip.date)} · Packliste {upcomingTrip.packlist.filter((p) => p.packed).length}/
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

      {/* Im Blick */}
      {topGoal && (
        <section className="px-4 mb-3">
          <SectionTitle label="Im Blick" actionHref="/ziele" actionLabel="Ziele" />
          <Card onClick={() => setOpenGoal(topGoal)} className="p-3.5">
            <div className="text-[14px] font-medium leading-snug min-w-0 mb-2">{topGoal.title}</div>
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
      <TodoSheet todoId={openTodoId} onClose={() => setOpenTodoId(null)} />
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

      {/* Add-Sheets */}
      <ActivityAddSheet
        open={addActOpen}
        onClose={() => setAddActOpen(false)}
        onAdd={addActivity}
        currentUser={currentUser}
      />
      <TodoAddSheet open={addTodoOpen} onClose={() => setAddTodoOpen(false)} onSubmit={addTodo} initialPlannedToday />
      <GoalAddSheet
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        onAdd={addGoal}
        currentUser={currentUser}
      />
      <InboxNoteSheet open={inboxNoteOpen} onClose={() => setInboxNoteOpen(false)} onAdd={addInbox} />
      <QuickShoppingSheet
        open={quickShopOpen !== null}
        initialSpinnerei={quickShopOpen?.spinnerei ?? false}
        onClose={() => setQuickShopOpen(null)}
        onAdd={(text, spinnerei) => addShopping({ text, scope: "D", spinnerei })}
      />
    </>
  );
}

function InboxNoteSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState("");
  if (!open) return null;
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title="In die Inbox">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Kurz notieren, Jarvis sortiert es später ein."
        className="w-full mt-3 rounded-2xl p-3 text-[15px] resize-none"
        style={{ background: "var(--cream-deep)" }}
      />
      <button
        type="button"
        onClick={submit}
        className="w-full mt-4 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: text.trim() ? "var(--terra)" : "var(--terra-soft)" }}
      >
        Ablegen
      </button>
    </Sheet>
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
    <div className="flex items-baseline justify-between mb-2 px-0.5">
      <h2
        className="serif text-[22px] leading-tight"
        style={{ color: "var(--mens)" }}
      >
        {label}
      </h2>
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
        style={{ background: "var(--cream-deep)" }}
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
          {activity.title}
        </div>
        <div
          className="text-[12px] mt-0.5 truncate flex items-center gap-1.5"
          style={{ color: "var(--ink-soft)" }}
        >
          <span style={{ color: "var(--sage)", fontWeight: 500 }}>
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
    </Card>
  );
}

function QuickShoppingSheet({
  open,
  initialSpinnerei,
  onClose,
  onAdd,
}: {
  open: boolean;
  initialSpinnerei: boolean;
  onClose: () => void;
  onAdd: (text: string, spinnerei: boolean) => void;
}) {
  if (!open) return null;
  return <QuickShoppingForm initialSpinnerei={initialSpinnerei} onClose={onClose} onAdd={onAdd} />;
}

function QuickShoppingForm({
  initialSpinnerei,
  onClose,
  onAdd,
}: {
  initialSpinnerei: boolean;
  onClose: () => void;
  onAdd: (text: string, spinnerei: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [spinnerei, setSpinnerei] = useState(initialSpinnerei);
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), spinnerei);
    onClose();
  };
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
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={spinnerei ? "z. B. Plattenspieler" : "z. B. Olivenöl"}
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "var(--cream-deep)" }}
        />
      </div>
      <div className="mt-3 flex gap-1.5 flex-wrap">
        {[
          { v: false, l: "Einkauf" },
          { v: true, l: "✦ Spinnerei" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            onClick={() => setSpinnerei(o.v)}
            className="tap text-[12px] font-medium rounded-full px-3 py-1.5"
            style={
              spinnerei === o.v
                ? { background: o.v ? "var(--terra)" : "var(--ink)", color: "var(--paper)" }
                : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
            }
          >
            {o.l}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={submit}
        className="w-full mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold tap"
        style={{ background: "var(--terra)" }}
      >
        Hinzufügen
      </button>
    </Sheet>
  );
}
