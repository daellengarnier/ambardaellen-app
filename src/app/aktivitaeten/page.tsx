"use client";

import { useMemo, useState } from "react";
import { Plus, Clock, Calendar as CalIcon, Users, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo } from "@/lib/scope";
import { USERS } from "@/lib/types";
import { formatDate } from "@/lib/date";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarWithScope } from "@/components/Avatar";
import { ActivityIcon } from "@/components/ActivityIcon";
import { Segmented } from "@/components/Segmented";
import { Empty } from "@/components/Empty";
import { ClientOnly } from "@/components/ClientOnly";
import { ActivitySheet } from "@/components/sheets/ActivitySheet";
import { ActivityAddSheet } from "@/components/sheets/ActivityAddSheet";
import type { Activity, ActivityStatus } from "@/lib/types";

export default function AktivitaetenPage() {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <AktContent />
    </ClientOnly>
  );
}

function Skeleton() {
  return (
    <div className="pt-2 pb-3 h-32">
      <ScreenHeader title="Aktivitäten" subtitle="Gemeinsam unterwegs" />
    </div>
  );
}

type ScopeFilter = "alle" | "geteilt" | "nur-ich";

function AktContent() {
  const activities = useStore((s) => s.activities);
  const currentUser = useStore((s) => s.currentUser);
  const addActivity = useStore((s) => s.addActivity);
  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);

  const [filter, setFilter] = useState<ActivityStatus>("geplant");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("alle");
  const [openAct, setOpenAct] = useState<Activity | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = visibleTo(activities, currentUser);
    arr = arr.filter((a) => a.status === filter);
    if (scopeFilter === "geteilt") arr = arr.filter((a) => a.scope === "geteilt");
    if (scopeFilter === "nur-ich") arr = arr.filter((a) => a.scope === currentUser);
    return [...arr].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [activities, filter, scopeFilter, currentUser]);

  const grouped = useMemo(() => {
    const map = new Map<string, Activity[]>();
    filtered.forEach((a) => {
      const key = a.date ? a.date : "ohne-datum";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <ScreenHeader
        title="Aktivitäten"
        subtitle="Gemeinsam unterwegs"
        right={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="tap w-9 h-9 rounded-full text-white shadow-card flex items-center justify-center"
            style={{ background: "var(--terra)" }}
            aria-label="Aktivität hinzufügen"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        }
      />

      <div className="px-4 pb-1.5">
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as ActivityStatus)}
          options={[
            { value: "geplant", label: "Geplant" },
            { value: "idee", label: "Ideen" },
            { value: "erledigt", label: "Erledigt" },
          ]}
        />
      </div>

      <ScopeFilterRow value={scopeFilter} onChange={setScopeFilter} currentUserName={USERS[currentUser].name} />

      <div className="px-4 mt-1.5 space-y-3.5">
        {grouped.length === 0 && (
          <Empty
            icon={<CalIcon size={22} strokeWidth={1.75} />}
            title="Noch nichts hier"
            body={
              filter === "idee"
                ? "Sammle Ideen für Dates und Ausflüge — ohne Druck."
                : "Plant euer nächstes Abenteuer."
            }
          />
        )}
        {grouped.map(([date, items]) => (
          <div key={date}>
            <div
              className="text-[11px] uppercase tracking-[0.14em] mb-1.5 px-1"
              style={{ color: "var(--muted)" }}
            >
              {date === "ohne-datum" ? "Ohne Datum" : formatDate(date)}
            </div>
            <div className="space-y-1.5">
              {items.map((a) => (
                <Card
                  key={a.id}
                  onClick={() => setOpenAct(a)}
                  className="p-3 flex items-center gap-3"
                >
                  <ActivityIcon kind={a.icon} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-medium truncate">{a.title}</div>
                    <div
                      className="text-[12px] mt-0.5 flex items-center gap-2"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {a.time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} strokeWidth={1.75} />
                          {a.time}
                        </span>
                      )}
                      {a.place && <span className="truncate">· {a.place}</span>}
                    </div>
                  </div>
                  <AvatarWithScope by={a.by} scope={a.scope} size={20} />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

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

      <ActivityAddSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addActivity}
        currentUser={currentUser}
      />
    </>
  );
}

function ScopeFilterRow({
  value,
  onChange,
  currentUserName,
}: {
  value: ScopeFilter;
  onChange: (v: ScopeFilter) => void;
  currentUserName: string;
}) {
  const items: Array<{ v: ScopeFilter; l: string; icon?: React.ReactNode }> = [
    { v: "alle", l: "Alle" },
    { v: "geteilt", l: "Gemeinsam", icon: <Users size={11} strokeWidth={1.75} /> },
    {
      v: "nur-ich",
      l: `Nur ${currentUserName}`,
      icon: <Lock size={11} strokeWidth={2} />,
    },
  ];
  return (
    <div className="px-4 pb-2 flex gap-1.5">
      {items.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
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
  );
}
