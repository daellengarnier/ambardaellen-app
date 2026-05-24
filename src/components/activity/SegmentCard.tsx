"use client";

import { Plane, TrainFront, Bus, Car, Ship, Route, ArrowRight, Pencil } from "lucide-react";
import { Card } from "../Card";
import type { TripSegment, TripSegmentKind } from "@/lib/types";

const KIND_META: Record<TripSegmentKind, { label: string; Icon: typeof Plane; color: string }> = {
  flight: { label: "Flug", Icon: Plane, color: "var(--plum)" },
  train: { label: "Zug", Icon: TrainFront, color: "var(--terra)" },
  bus: { label: "Bus", Icon: Bus, color: "var(--sage)" },
  car: { label: "Auto", Icon: Car, color: "var(--ink-soft)" },
  ferry: { label: "Fähre", Icon: Ship, color: "var(--gold)" },
  other: { label: "Strecke", Icon: Route, color: "var(--muted)" },
};

const WD_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return { date: "", time: "" };
  const wd = WD_SHORT[dt.getDay()];
  const d = dt.getDate();
  const m = dt.toLocaleDateString("de-DE", { month: "short" });
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return { date: `${wd} ${d}. ${m}`, time: `${hh}:${mm}` };
}

export function SegmentCard({
  segment,
  onEdit,
}: {
  segment: TripSegment;
  onEdit: () => void;
}) {
  const meta = KIND_META[segment.kind];
  const dep = formatDateTime(segment.depart);
  const arr = formatDateTime(segment.arrive);
  const sameDay = dep.date && dep.date === arr.date;

  return (
    <Card className="p-3 relative">
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${meta.color}22`, color: meta.color }}
        >
          <meta.Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[14px] font-medium">
            <span className="truncate">{segment.from || "—"}</span>
            <ArrowRight size={13} strokeWidth={1.75} color="var(--muted)" />
            <span className="truncate">{segment.to || "—"}</span>
          </div>
          {(dep.date || arr.date) && (
            <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
              <span>{dep.date}</span>
              {dep.time && <span> · {dep.time}</span>}
              {arr.time && (
                <>
                  {" → "}
                  {!sameDay && arr.date && <span>{arr.date} · </span>}
                  <span>{arr.time}</span>
                </>
              )}
            </div>
          )}
          {segment.ref && (
            <div
              className="text-[11.5px] mt-0.5 mono"
              style={{ color: "var(--terra-deep)" }}
            >
              {segment.ref}
            </div>
          )}
          {segment.note && (
            <div className="text-[11.5px] mt-0.5 italic" style={{ color: "var(--muted)" }}>
              {segment.note}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="tap w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
          aria-label="Bearbeiten"
        >
          <Pencil size={13} strokeWidth={1.75} />
        </button>
      </div>
    </Card>
  );
}
