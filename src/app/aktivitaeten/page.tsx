"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  Calendar as CalIcon,
  Users,
  Lock,
  Backpack,
  CalendarPlus,
  X as XIcon,
  Check,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo } from "@/lib/scope";
import { USERS } from "@/lib/types";
import { formatDate, shortDate, todayISO, diffDays } from "@/lib/date";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarWithScope } from "@/components/Avatar";
import { ActivityIcon } from "@/components/ActivityIcon";
import { Segmented } from "@/components/Segmented";
import { Empty } from "@/components/Empty";
import { TagChips } from "@/components/TagChips";
import { DeleteAction } from "@/components/DeleteAction";
import { ClientOnly } from "@/components/ClientOnly";
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
  return <ScreenHeader title="Aktivitäten" subtitle="Gemeinsam unterwegs" />;
}

type ScopeFilter = "alle" | "geteilt" | "nur-ich";
type TagFilter = string | null;

type Bucket =
  | "verpasst"
  | "heute"
  | "morgen"
  | "woche"
  | "spaeter"
  | "kein";

const BUCKET_LABEL: Record<Bucket, string> = {
  verpasst: "Verpasst",
  heute: "Heute",
  morgen: "Morgen",
  woche: "Diese Woche",
  spaeter: "Später",
  kein: "Ohne Datum",
};
const BUCKET_ORDER: Bucket[] = ["verpasst", "heute", "morgen", "woche", "spaeter", "kein"];

function activityBucket(a: Activity, today: string): Bucket {
  if (!a.date) return "kein";
  const d = diffDays(a.date, today);
  if (d < 0) return "verpasst";
  if (d === 0) return "heute";
  if (d === 1) return "morgen";
  if (d <= 7) return "woche";
  return "spaeter";
}

function AktContent() {
  const router = useRouter();
  const activities = useStore((s) => s.activities);
  const currentUser = useStore((s) => s.currentUser);
  const addActivity = useStore((s) => s.addActivity);
  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);

  const [filter, setFilter] = useState<ActivityStatus>("geplant");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("alle");
  const [tagFilter, setTagFilter] = useState<TagFilter>(null);
  const [addOpen, setAddOpen] = useState(false);
  // Ideen-Tab: pro Idee inline ein Datum eintragen → automatisch zu "Geplant".
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [planDate, setPlanDate] = useState("");

  const startPlanning = (a: Activity) => {
    setPlanningId(a.id);
    setPlanDate(a.date || today);
  };
  const confirmPlanning = (a: Activity) => {
    if (!planDate) return;
    updateActivity(a.id, { date: planDate, status: "geplant" });
    setPlanningId(null);
    setPlanDate("");
  };
  const cancelPlanning = () => {
    setPlanningId(null);
    setPlanDate("");
  };

  const openActivity = (a: Activity) => router.push(`/aktivitaeten/${a.id}`);

  const today = todayISO();

  const filtered = useMemo(() => {
    let arr = visibleTo(activities, currentUser);
    arr = arr.filter((a) => a.status === filter);
    if (scopeFilter === "geteilt") arr = arr.filter((a) => a.scope === "geteilt");
    if (scopeFilter === "nur-ich") arr = arr.filter((a) => a.scope === currentUser);
    if (tagFilter) arr = arr.filter((a) => (a.tags ?? []).includes(tagFilter));
    return arr;
  }, [activities, filter, scopeFilter, tagFilter, currentUser]);

  // Alle Tags die in den sichtbaren Aktivitäten vorkommen (für Filter-Chips)
  const allTags = useMemo(() => {
    const set = new Set<string>();
    visibleTo(activities, currentUser).forEach((a) =>
      (a.tags ?? []).forEach((t) => set.add(t)),
    );
    return [...set].sort();
  }, [activities, currentUser]);

  // Bei Geplant: nach Bucket gruppieren. Sonst nach Datum gruppieren wie vorher.
  const sections = useMemo(() => {
    if (filter === "geplant") {
      const map = new Map<Bucket, Activity[]>();
      BUCKET_ORDER.forEach((b) => map.set(b, []));
      filtered.forEach((a) => map.get(activityBucket(a, today))!.push(a));
      // Sortieren innerhalb Bucket: nach Datum, dann Uhrzeit
      map.forEach((arr) =>
        arr.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return (a.time || "99:99").localeCompare(b.time || "99:99");
        }),
      );
      return BUCKET_ORDER.map((b) => ({ key: b, label: BUCKET_LABEL[b], items: map.get(b)! })).filter(
        (s) => s.items.length > 0,
      );
    }
    // Ideen + Erledigt: Datum-Gruppen (oder Ohne Datum)
    const map = new Map<string, Activity[]>();
    [...filtered]
      .sort((a, b) => {
        if (filter === "erledigt") {
          // erledigt: neueste zuerst
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.localeCompare(a.date);
        }
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      })
      .forEach((a) => {
        const key = a.date || "ohne-datum";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(a);
      });
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: key === "ohne-datum" ? "Ohne Datum" : formatDate(key),
      items,
    }));
  }, [filtered, filter, today]);

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

      <ScopeFilterRow
        value={scopeFilter}
        onChange={setScopeFilter}
        currentUserName={USERS[currentUser].name}
      />

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

      <div className="px-4 mt-1.5 space-y-3.5">
        {sections.length === 0 && (
          <Empty
            icon={<CalIcon size={22} strokeWidth={1.75} />}
            title="Noch nichts hier"
            body={
              filter === "idee"
                ? "Sammle Ideen für Dates, Trips und Spinnereien — ohne Druck."
                : filter === "erledigt"
                  ? "Hier landet alles Vergangene."
                  : "Plant euer nächstes Abenteuer."
            }
          />
        )}
        {sections.map((sec) => (
          <div key={sec.key}>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              {filter === "geplant" && sec.key === "verpasst" && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#C5634B" }}
                />
              )}
              <h2
                className="uplabel text-[10.5px]"
                style={{
                  color: sec.key === "verpasst" ? "#C5634B" : "var(--ink-soft)",
                }}
              >
                {sec.label}
              </h2>
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                · {sec.items.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {sec.items.map((a) => {
                const isPlanning = planningId === a.id;
                return (
                  <Card key={a.id} className="p-3">
                    <div
                      className="flex items-center gap-3"
                      onClick={(e) => {
                        if (isPlanning) return;
                        // Click auf Buttons soll Card-Klick nicht auslösen.
                        if ((e.target as HTMLElement).closest("button")) return;
                        openActivity(a);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isPlanning) openActivity(a);
                      }}
                    >
                      <ActivityIcon kind={a.icon} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14.5px] font-medium truncate">{a.title}</div>
                        <div
                          className="text-[12px] mt-0.5 flex items-center gap-2 flex-wrap"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          {filter !== "geplant" && a.date && (
                            <span>{shortDate(a.date)}</span>
                          )}
                          {a.time && (
                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} strokeWidth={1.75} />
                              {a.time}
                            </span>
                          )}
                          {a.place && <span className="truncate">· {a.place}</span>}
                          {a.packlist.length > 0 && (
                            <span
                              className="inline-flex items-center gap-1 text-[10.5px] font-medium"
                              style={{ color: "var(--terra)" }}
                            >
                              <Backpack size={10} strokeWidth={1.75} />
                              {a.packlist.filter((p) => p.packed).length}/
                              {a.packlist.length}
                            </span>
                          )}
                        </div>
                        {(a.tags ?? []).length > 0 && (
                          <div className="mt-1">
                            <TagChips tags={a.tags} size="xs" max={4} />
                          </div>
                        )}
                      </div>
                      <AvatarWithScope by={a.by} scope={a.scope} size={20} />
                      {filter === "idee" && !isPlanning && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startPlanning(a);
                          }}
                          className="tap w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0"
                          style={{ background: "var(--terra-soft)", color: "var(--terra-deep)" }}
                          aria-label="Idee planen"
                          title="Datum setzen & planen"
                        >
                          <CalendarPlus size={13} strokeWidth={2} />
                        </button>
                      )}
                      <DeleteAction
                        kind="Aktivität"
                        label={a.title}
                        onConfirm={() => removeActivity(a.id)}
                      />
                    </div>

                    {isPlanning && (
                      <div
                        className="mt-3 pt-3 flex items-center gap-2"
                        style={{ borderTop: "1px solid rgba(218,201,168,0.4)" }}
                      >
                        <CalendarPlus
                          size={14}
                          strokeWidth={1.75}
                          color="var(--terra-deep)"
                        />
                        <input
                          type="date"
                          value={planDate}
                          onChange={(e) => setPlanDate(e.target.value)}
                          autoFocus
                          className="flex-1 rounded-xl px-2.5 py-1.5 text-[13.5px]"
                          style={{ background: "rgba(228,217,191,0.55)" }}
                        />
                        <button
                          type="button"
                          onClick={() => confirmPlanning(a)}
                          disabled={!planDate}
                          className="tap w-8 h-8 rounded-full inline-flex items-center justify-center text-white"
                          style={{
                            background: planDate ? "var(--terra)" : "var(--terra-soft)",
                          }}
                          aria-label="Planen bestätigen"
                        >
                          <Check size={14} strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelPlanning}
                          className="tap w-8 h-8 rounded-full inline-flex items-center justify-center"
                          style={{
                            background: "var(--cream-deep)",
                            color: "var(--ink-soft)",
                          }}
                          aria-label="Abbrechen"
                        >
                          <XIcon size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

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
