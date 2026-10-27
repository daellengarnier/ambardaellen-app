"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X, ChevronRight, ListTodo } from "lucide-react";
import { useLife, areaByKey, isOpen } from "@/lib/lifeStore";
import { BUCKET_LABEL, BUCKET_ORDER, PRIO, dueBucket } from "@/lib/todo";
import type { TodoDto, World } from "@/lib/life";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Empty } from "@/components/Empty";
import { ClientOnly } from "@/components/ClientOnly";
import { TodoRow } from "@/components/TodoRow";
import { WORLD_COLOR } from "@/components/AreaPicker";
import { TodoSheet } from "@/components/sheets/TodoSheet";
import { TodoAddSheet } from "@/components/sheets/TodoAddSheet";

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

type WorldFilter = "alle" | World | "ohne";

const WORLD_FILTERS: Array<{ v: WorldFilter; l: string }> = [
  { v: "alle", l: "Alle" },
  { v: "spinnerei", l: "Spinnerei" },
  { v: "privat", l: "Privat" },
  { v: "ohne", l: "Ohne Bereich" },
];

function TodoContent() {
  const todos = useLife((s) => s.todos);
  const areas = useLife((s) => s.areas);
  const loaded = useLife((s) => s.loaded);
  const error = useLife((s) => s.error);
  const addTodo = useLife((s) => s.addTodo);
  const toggleTodo = useLife((s) => s.toggleTodo);
  const removeTodo = useLife((s) => s.removeTodo);

  const [query, setQuery] = useState("");
  // Startfilter aus ?welt=spinnerei|privat (Kacheln auf Heute).
  const [world, setWorld] = useState<WorldFilter>(() => {
    const w = new URLSearchParams(window.location.search).get("welt");
    return w === "spinnerei" || w === "privat" ? w : "alle";
  });
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = todos.filter((t) => t.status !== "verworfen");
    if (world === "ohne") arr = arr.filter((t) => !t.area);
    // Ohne Bereich zählt als Privat, wie auf Heute.
    else if (world !== "alle") arr = arr.filter((t) => (areaByKey(areas, t.area)?.world ?? "privat") === world);
    if (areaFilter) arr = arr.filter((t) => t.area === areaFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (t) =>
          t.text.toLowerCase().includes(q) ||
          t.note.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q)),
      );
    }
    return arr;
  }, [todos, areas, world, areaFilter, query]);

  const openItems = filtered.filter(isOpen);
  const doneItems = filtered
    .filter((t) => t.status === "erledigt")
    .sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""));

  const buckets = useMemo(() => {
    const m: Record<string, TodoDto[]> = Object.fromEntries(BUCKET_ORDER.map((k) => [k, []]));
    openItems.forEach((t) => m[dueBucket(t.due ?? "")].push(t));
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

  const worldAreas = world === "spinnerei" || world === "privat" ? areas.filter((a) => a.world === world) : [];

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
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-card" style={{ background: "var(--paper)" }}>
          <Search size={16} strokeWidth={1.75} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            className="flex-1 bg-transparent text-[14px]"
            style={{ color: "var(--ink)" }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="tap" style={{ color: "var(--muted)" }} aria-label="Suche leeren">
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto phone-scroll">
        {WORLD_FILTERS.map((o) => {
          const active = world === o.v;
          const color = o.v === "spinnerei" || o.v === "privat" ? WORLD_COLOR[o.v] : "var(--ink)";
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => {
                setWorld(o.v);
                setAreaFilter(null);
              }}
              className="shrink-0 px-2.5 py-1 text-[11.5px] rounded-full font-medium tap"
              style={
                active
                  ? { background: color, color: "var(--paper)" }
                  : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
              }
            >
              {o.l}
            </button>
          );
        })}
      </div>

      {worldAreas.length > 0 && (
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto phone-scroll">
          {worldAreas.map((a) => {
            const active = areaFilter === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setAreaFilter(active ? null : a.key)}
                className="tap shrink-0 text-[11px] rounded-full px-2.5 py-1 font-medium"
                style={
                  active
                    ? { background: WORLD_COLOR[a.world], color: "white" }
                    : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
                }
              >
                {a.name}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="px-4 pb-2 text-[12px]" style={{ color: "#B42318" }}>
          Sync-Fehler: {error}
        </div>
      )}

      <div className="px-4 space-y-3">
        {loaded && buckets.length === 0 && doneItems.length === 0 && (
          <Empty
            icon={<ListTodo size={22} strokeWidth={1.75} />}
            title={query || world !== "alle" ? "Nichts gefunden" : "Alles erledigt"}
            body={query || world !== "alle" ? "Filter anpassen?" : "Du bist auf dem Laufenden."}
          />
        )}

        {buckets.map(([k, arr]) => (
          <div key={k}>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: k === "ueber" ? "#B42318" : k === "heute" ? "var(--terra)" : "var(--ink-soft)" }}
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
                <div key={t.id} style={i < arr.length - 1 ? { borderBottom: "1px solid var(--cream-deep)" } : undefined}>
                  <TodoRow t={t} areas={areas} onToggle={toggleTodo} onOpen={(x) => setOpenId(x.id)} onRemove={removeTodo} />
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
                style={{ transition: "transform 200ms", transform: showDone ? "rotate(90deg)" : "none" }}
              />
            </button>
            {showDone && (
              <Card className="p-1 mt-1">
                {doneItems.map((t, i) => (
                  <div key={t.id} style={i < doneItems.length - 1 ? { borderBottom: "1px solid var(--cream-deep)" } : undefined}>
                    <TodoRow t={t} areas={areas} onToggle={toggleTodo} onOpen={(x) => setOpenId(x.id)} onRemove={removeTodo} dense />
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </div>

      <TodoSheet todoId={openId} onClose={() => setOpenId(null)} />
      <TodoAddSheet open={addOpen} onClose={() => setAddOpen(false)} onSubmit={addTodo} />
    </>
  );
}
