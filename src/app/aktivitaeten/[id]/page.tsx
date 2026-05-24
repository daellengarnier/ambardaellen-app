"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Calendar as CalIcon,
  Plus,
  X,
  Heart,
  Clock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { USERS } from "@/lib/types";
import { formatDate } from "@/lib/date";
import { downloadICS } from "@/lib/ical";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { ActivityIcon } from "@/components/ActivityIcon";
import { ScopeToggle } from "@/components/ScopeToggle";
import { TagInput } from "@/components/TagInput";
import { DetailRow } from "@/components/DetailRow";
import { ClientOnly } from "@/components/ClientOnly";
import { SegmentCard } from "@/components/activity/SegmentCard";
import { SegmentEditor } from "@/components/activity/SegmentEditor";
import { PacklistSection } from "@/components/activity/PacklistSection";
import { PreTripShoppingSection } from "@/components/activity/PreTripShoppingSection";

type PageProps = { params: Promise<{ id: string }> };

export default function ActivityDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <ClientOnly fallback={<div className="px-4 pt-4" />}>
      <Detail id={id} />
    </ClientOnly>
  );
}

function Detail({ id }: { id: string }) {
  const router = useRouter();
  const activity = useStore((s) => s.activities.find((a) => a.id === id));
  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);
  const currentUser = useStore((s) => s.currentUser);
  const activities = useStore((s) => s.activities);

  const [segmentEditor, setSegmentEditor] = useState<
    { mode: "new" } | { mode: "edit"; segmentId: string } | null
  >(null);

  if (!activity) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-[14px]" style={{ color: "var(--ink-soft)" }}>
          Aktivität nicht gefunden.
        </p>
        <button
          type="button"
          onClick={() => router.push("/aktivitaeten")}
          className="tap mt-4 px-4 py-2 rounded-2xl text-white"
          style={{ background: "var(--terra)" }}
        >
          Zur Übersicht
        </button>
      </div>
    );
  }

  const a = activity;
  const knownTags = Array.from(new Set(activities.flatMap((x) => x.tags ?? []))).filter(
    (t) => !(a.tags ?? []).includes(t),
  );

  const sortedSegments = [...a.segments].sort((x, y) => (x.depart || "").localeCompare(y.depart || ""));

  const dateDisplay = a.date
    ? a.dateEnd && a.dateEnd !== a.date
      ? `${formatDate(a.date)} – ${formatDate(a.dateEnd)}`
      : formatDate(a.date)
    : "Ohne Datum";

  return (
    <>
      {/* Top-Bar mit Zurück */}
      <header className="px-3 pt-1 pb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="tap w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
          aria-label="Zurück"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <div className="flex-1 min-w-0">
          <div
            className="uplabel text-[10px]"
            style={{ color: "var(--muted)" }}
          >
            Aktivität
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="px-4 mb-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <ActivityIcon kind={a.icon} size={48} />
            <div className="flex-1 min-w-0">
              <h1 className="serif text-[26px] leading-tight" style={{ color: "var(--mens)" }}>{a.title}</h1>
              <div
                className="text-[12.5px] mt-1 flex items-center gap-1.5"
                style={{ color: "var(--ink-soft)" }}
              >
                <CalIcon size={11} strokeWidth={1.75} />
                {dateDisplay}
                {a.time && (
                  <>
                    <Clock size={11} strokeWidth={1.75} className="ml-1" />
                    {a.time}
                  </>
                )}
              </div>
              {a.place && (
                <div
                  className="text-[12.5px] mt-0.5 flex items-center gap-1.5"
                  style={{ color: "var(--ink-soft)" }}
                >
                  <MapPin size={11} strokeWidth={1.75} />
                  {a.place}
                </div>
              )}
            </div>
          </div>

          {a.note && (
            <div
              className="rounded-2xl p-3 mt-3"
              style={{ background: "rgba(228,217,191,0.5)" }}
            >
              <div
                className="uplabel text-[10px]"
                style={{ color: "var(--muted)" }}
              >
                Notiz
              </div>
              <div className="text-[14px] mt-1 whitespace-pre-line leading-relaxed">
                {a.note}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Datum + Zeit Edit */}
      <div className="px-4 mb-3 grid grid-cols-3 gap-2">
        <DateInput
          label="Datum"
          value={a.date}
          onChange={(v) => updateActivity(a.id, { date: v })}
          type="date"
        />
        <DateInput
          label="Bis"
          value={a.dateEnd}
          onChange={(v) => updateActivity(a.id, { dateEnd: v })}
          type="date"
        />
        <DateInput
          label="Zeit"
          value={a.time}
          onChange={(v) => updateActivity(a.id, { time: v })}
          type="time"
        />
      </div>

      {/* Tags */}
      <div className="px-4 mb-3">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Bereiche / Tags
        </div>
        <TagInput
          value={a.tags ?? []}
          onChange={(next) => updateActivity(a.id, { tags: next })}
          knownTags={knownTags}
        />
      </div>

      {/* Sichtbar + Hinzugefügt */}
      <div className="px-4 mb-4 space-y-1">
        <DetailRow
          label="Hinzugefügt von"
          value={
            <span className="inline-flex items-center gap-2">
              <Avatar id={a.by} size={20} />
              {USERS[a.by].name}
            </span>
          }
          icon={<Heart size={16} />}
        />
        <div className="flex items-center justify-between pt-2">
          <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
            Sichtbar für
          </div>
          <ScopeToggle
            value={a.scope || "geteilt"}
            onChange={(s) => updateActivity(a.id, { scope: s })}
            currentUser={currentUser}
            compact
          />
        </div>
      </div>

      {/* Reise / Verbindungen */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="uplabel text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
            Reise / Verbindungen{" "}
            {sortedSegments.length > 0 && (
              <span style={{ color: "var(--muted)" }}>· {sortedSegments.length}</span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setSegmentEditor({ mode: "new" })}
            className="tap inline-flex items-center gap-1 text-[11px] font-medium"
            style={{ color: "var(--terra)" }}
          >
            <Plus size={11} strokeWidth={2.25} /> Strecke
          </button>
        </div>
        {sortedSegments.length === 0 ? (
          <Card className="p-4">
            <p className="text-[13px] italic text-center" style={{ color: "var(--ink-soft)" }}>
              Noch keine Flüge oder Verbindungen erfasst.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedSegments.map((seg) => (
              <SegmentCard
                key={seg.id}
                segment={seg}
                onEdit={() => setSegmentEditor({ mode: "edit", segmentId: seg.id })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Packliste */}
      <section className="px-4 mb-4">
        <PacklistSection activityId={a.id} />
      </section>

      {/* Vorher besorgen */}
      <section className="px-4 mb-4">
        <PreTripShoppingSection activityId={a.id} />
      </section>

      {/* Actions */}
      <section className="px-4 mb-4">
        <div className="flex gap-2">
          {a.status !== "erledigt" ? (
            <button
              type="button"
              onClick={() => updateActivity(a.id, { status: "erledigt" })}
              className="flex-1 py-3 rounded-2xl text-white text-[15px] font-semibold tap"
              style={{ background: "var(--sage)" }}
            >
              Erledigt ✓
            </button>
          ) : (
            <button
              type="button"
              onClick={() => updateActivity(a.id, { status: "geplant" })}
              className="flex-1 py-3 rounded-2xl text-[15px] font-semibold tap"
              style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
            >
              Wieder planen
            </button>
          )}
          {a.status === "idee" && (
            <button
              type="button"
              onClick={() => updateActivity(a.id, { status: "geplant" })}
              className="flex-1 py-3 rounded-2xl text-white text-[15px] font-semibold tap"
              style={{ background: "var(--terra)" }}
            >
              Einplanen
            </button>
          )}
        </div>

        {a.date && a.status !== "erledigt" && (
          <button
            type="button"
            onClick={() => downloadICS(a)}
            className="w-full mt-2 py-3 rounded-2xl text-[14px] font-semibold tap inline-flex items-center justify-center gap-2"
            style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
          >
            <CalIcon size={16} strokeWidth={1.75} /> Zum iPhone Kalender hinzufügen
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (confirm(`Aktivität „${a.title}" wirklich löschen?`)) {
              removeActivity(a.id);
              router.push("/aktivitaeten");
            }
          }}
          className="w-full mt-2 py-2.5 rounded-2xl text-[13.5px] font-medium tap inline-flex items-center justify-center gap-2"
          style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
        >
          <X size={14} strokeWidth={1.75} /> Aktivität löschen
        </button>
      </section>

      <SegmentEditor
        activityId={a.id}
        state={segmentEditor}
        onClose={() => setSegmentEditor(null)}
      />
    </>
  );
}

function DateInput({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: "date" | "time";
}) {
  return (
    <div>
      <div className="uplabel text-[10px] mb-1.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl px-2.5 py-2 text-[13px]"
        style={{ background: "rgba(228,217,191,0.5)" }}
      />
    </div>
  );
}
