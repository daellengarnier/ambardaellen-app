"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X, ChevronRight, Users, Lock, ListTodo } from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo } from "@/lib/scope";
import { shortDate, todayISO } from "@/lib/date";
import { BUCKET_LABEL, BUCKET_ORDER, PRIO, dueBucket } from "@/lib/todo";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarWithScope } from "@/components/Avatar";
import { RoundCheck } from "@/components/RoundCheck";
import { DeleteAction } from "@/components/DeleteAction";
import { Empty } from "@/components/Empty";
import { TagChips } from "@/components/TagChips";
import { ClientOnly } from "@/components/ClientOnly";
import { TodoSheet } from "@/components/sheets/TodoSheet";
import { TodoAddSheet } from "@/components/sheets/TodoAddSheet";
import type { Todo } from "@/lib/types";

export default function TodoPage() {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <TodoContent />
    </ClientOnly>
  );
}

function Skeleton() {
  return <ScreenHeader title="Todo" subtitle="—" />;
}

type ScopeFilter = "alle" | "geteilt" | "nur-ich";

function TodoContent() {
  const todos = useStore((s) => s.todos);
  const currentUser = useStore((s) => s.currentUser);
  const addTodo = useStore((s) => s.addTodo);
  const updateTodo = useStore((s) => s.updateTodo);
  const removeTodo = useStore((s) => s.removeTodo);
  const toggleTodo = useStore((s) => s.toggleTodo);

  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("alle");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [openTodo, setOpenTodo] = useState<Todo | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const myTodos = useMemo(() => {
    let arr = visibleTo(todos, currentUser);
    if (scopeFilter === "geteilt") arr = arr.filter((t) => t.scope === "geteilt");
    if (scopeFilter === "nur-ich") arr = arr.filter((t) => t.scope === currentUser);
    if (tagFilter) arr = arr.filter((t) => (t.tags ?? []).includes(tagFilter));
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (t) =>
          t.text.toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag) => tag.includes(q)),
      );
    }
    return arr;
  }, [todos, scopeFilter, tagFilter, query, currentUser]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    visibleTo(todos, currentUser).forEach((t) => (t.tags ?? []).forEach((tg) => set.add(tg)));
    return [...set].sort();
  }, [todos, currentUser]);

  const openItems = myTodos.filter((t) => !t.done);
  const doneItems = myTodos.filter((t) => t.done);

  const buckets = useMemo(() => {
    const m: Record<string, Todo[]> = Object.fromEntries(BUCKET_ORDER.map((k) => [k, []]));
    openItems.forEach((t) => {
      m[dueBucket(t.due)].push(t);
    });
    Object.values(m).forEach((arr) =>
      arr.sort((a, b) => {
        const pr = PRIO[a.prio].rank - PRIO[b.prio].rank;
        if (pr !== 0) return pr;
        if (a.due && b.due) return a.due.localeCompare(b.due);
        return 0;
      }),
    );
    return BUCKET_ORDER.map((k) => [k, m[k]] as const).filter(([, arr]) => arr.length > 0);
  }, [openItems]);

  return (
    <>
      <ScreenHeader
        title="Todo"
        subtitle={`${openItems.length} offen`}
        right={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="tap w-9 h-9 rounded-full text-white shadow-card flex items-center justify-center"
            style={{ background: "var(--terra)" }}
            aria-label="Aufgabe hinzufügen"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        }
      />

      <div className="px-4 pb-1.5">
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-card"
          style={{ background: "var(--paper)" }}
        >
          <Search size={16} strokeWidth={1.75} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            className="flex-1 bg-transparent text-[14px]"
            style={{ color: "var(--ink)" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="tap"
              style={{ color: "var(--muted)" }}
              aria-label="Suche leeren"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-2 flex gap-1.5">
        {([
          { v: "alle", l: "Alle" },
          { v: "geteilt", l: "Gemeinsam", icon: <Users size={11} strokeWidth={1.75} /> },
          { v: "nur-ich", l: "Privat", icon: <Lock size={11} strokeWidth={2} /> },
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

      {allTags.length > 0 && (
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto phone-scroll">
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            className="tap shrink-0 text-[11px] rounded-full px-2.5 py-1 font-medium"
            style={
              tagFilter === null
                ? { background: "var(--ink)", color: "var(--paper)" }
                : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
            }
          >
            alle Bereiche
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
              className="tap shrink-0 text-[11px] rounded-full px-2.5 py-1 font-medium"
              style={
                tagFilter === t
                  ? { background: "var(--terra)", color: "white" }
                  : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
              }
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 space-y-3">
        {buckets.length === 0 && doneItems.length === 0 && (
          <Empty
            icon={<ListTodo size={22} strokeWidth={1.75} />}
            title={query || tagFilter ? "Nichts gefunden" : "Alles erledigt"}
            body={
              query || tagFilter
                ? "Filter anpassen?"
                : "Du bist auf dem Laufenden."
            }
          />
        )}

        {buckets.map(([k, arr]) => (
          <div key={k}>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    k === "ueber" ? "#C5634B" : k === "heute" ? "var(--terra)" : "var(--ink-soft)",
                }}
              />
              <h2 className="uplabel text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
                {BUCKET_LABEL[k]}
              </h2>
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                · {arr.length}
              </span>
            </div>
            <Card className="p-1">
              {arr.map((t, i) => (
                <div
                  key={t.id}
                  style={
                    i < arr.length - 1
                      ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                      : undefined
                  }
                >
                  <TodoRow t={t} onToggle={toggleTodo} onOpen={setOpenTodo} onRemove={removeTodo} />
                </div>
              ))}
            </Card>
          </div>
        ))}

        {doneItems.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowDone(!showDone)}
              className="flex items-center gap-1.5 px-1 py-1 uplabel text-[10.5px] tap"
              style={{ color: "var(--ink-soft)" }}
            >
              Erledigt · {doneItems.length}
              <ChevronRight
                size={12}
                strokeWidth={1.75}
                style={{
                  transition: "transform 200ms",
                  transform: showDone ? "rotate(90deg)" : "none",
                }}
              />
            </button>
            {showDone && (
              <Card className="p-1 mt-1">
                {doneItems.map((t, i) => (
                  <div
                    key={t.id}
                    style={
                      i < doneItems.length - 1
                        ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                        : undefined
                    }
                  >
                    <TodoRow t={t} onToggle={toggleTodo} onOpen={setOpenTodo} onRemove={removeTodo} dense />
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </div>

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

      <TodoAddSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addTodo}
        currentUser={currentUser}
      />
    </>
  );
}

function TodoRow({
  t,
  onToggle,
  onOpen,
  onRemove,
  dense = false,
}: {
  t: Todo;
  onToggle: (id: string) => void;
  onOpen: (t: Todo) => void;
  onRemove: (id: string) => void;
  dense?: boolean;
}) {
  const p = PRIO[t.prio];
  const today = todayISO();
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpen(t);
      }}
      className={`flex items-start gap-2.5 ${dense ? "px-2.5 py-2" : "px-3 py-2.5"} tap cursor-pointer`}
      role="button"
      tabIndex={0}
    >
      <div className="pt-0.5">
        <RoundCheck
          checked={t.done}
          onClick={() => onToggle(t.id)}
          size={dense ? 20 : 22}
          color={p.color}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`${dense ? "text-[13.5px]" : "text-[14px]"} flex items-center gap-1.5`}
          style={t.done ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
        >
          {p.dot && !t.done && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: p.color }}
            />
          )}
          <span className="truncate">{t.text}</span>
        </div>
        {(t.due || t.note || (t.tags ?? []).length > 0) && (
          <div
            className="text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap"
            style={{ color: "var(--muted)" }}
          >
            {t.due && (
              <span
                style={
                  t.due < today && !t.done
                    ? { color: "#C5634B", fontWeight: 500 }
                    : undefined
                }
              >
                {shortDate(t.due)}
              </span>
            )}
            {(t.tags ?? []).length > 0 && (
              <TagChips tags={t.tags} size="xs" max={3} />
            )}
            {t.note && <span className="truncate">· {t.note.split("\n")[0]}</span>}
          </div>
        )}
      </div>
      <AvatarWithScope by={t.by} scope={t.scope} size={dense ? 18 : 20} />
      <DeleteAction
        kind="Aufgabe"
        label={t.text}
        onConfirm={() => onRemove(t.id)}
        size={12}
      />
    </div>
  );
}
