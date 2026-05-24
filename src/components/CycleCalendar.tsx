"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Cycle } from "@/lib/types";
import { PHASE_COLOR_MAP, phaseForDay } from "@/lib/cycle";
import { todayISO } from "@/lib/date";

type Props = {
  cycle: Cycle;
  onTapDay?: (iso: string) => void;
  selectedDay?: string | null;
};

export function CycleCalendar({ cycle, onTapDay, selectedDay }: Props) {
  const now = new Date();
  const [view, setView] = useState<{ year: number; month: number }>({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const { year, month } = view;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7; // Mon-first
  const daysInMonth = last.getDate();
  const today = todayISO();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const lastPeriodStart =
    cycle.periodStarts.length > 0
      ? cycle.periodStarts[cycle.periodStarts.length - 1]
      : today;
  const lastPSDate = new Date(lastPeriodStart + "T00:00:00");

  const cellInfo = (d: number) => {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const tDate = new Date(iso + "T00:00:00");
    let baseStart: Date | null = null;
    let diff = Infinity;
    cycle.periodStarts.forEach((ps) => {
      const psDate = new Date(ps + "T00:00:00");
      const dd = Math.floor((tDate.getTime() - psDate.getTime()) / 86400000);
      if (dd >= 0 && dd < diff) {
        diff = dd;
        baseStart = psDate;
      }
    });
    let dayInCycle: number;
    if (baseStart !== null) {
      const start = baseStart as Date;
      dayInCycle = Math.floor((tDate.getTime() - start.getTime()) / 86400000) + 1;
      if (dayInCycle > cycle.avgCycle) {
        dayInCycle = ((dayInCycle - 1) % cycle.avgCycle) + 1;
      }
    } else {
      const dd = Math.floor((tDate.getTime() - lastPSDate.getTime()) / 86400000);
      dayInCycle = (((dd % cycle.avgCycle) + cycle.avgCycle) % cycle.avgCycle) + 1;
    }
    const phase = phaseForDay(cycle, dayInCycle);
    return {
      iso,
      dayInCycle,
      phase,
      isToday: iso === today,
      isSelected: iso === selectedDay,
      isPeriodStart: cycle.periodStarts.includes(iso),
      entry: cycle.entries[iso],
    };
  };

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthLabel = first.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div
        className="text-[12px] font-semibold mb-1.5 flex items-center justify-between"
        style={{ color: "var(--ink-soft)" }}
      >
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="tap w-6 h-6 inline-flex items-center justify-center rounded-full"
            style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={13} strokeWidth={2} />
          </button>
          <span className="px-1">{monthLabel}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="tap w-6 h-6 inline-flex items-center justify-center rounded-full"
            style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
            aria-label="Nächster Monat"
          >
            <ChevronRight size={13} strokeWidth={2} />
          </button>
        </div>
        <span
          className="text-[10px] font-normal uppercase tracking-wider"
          style={{ color: "var(--muted)" }}
        >
          Prognose
        </span>
      </div>
      <div
        className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1"
        style={{ color: "var(--muted)" }}
      >
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const info = cellInfo(d);
          const phaseCol = PHASE_COLOR_MAP[info.phase];
          const isOvulation = info.dayInCycle === cycle.avgCycle - 14;
          const boxShadow = info.isSelected
            ? `0 0 0 2px var(--paper) inset, 0 0 0 2.5px var(--ink)`
            : info.isToday
              ? `0 0 0 1.5px var(--paper) inset, 0 0 0 2px ${phaseCol}`
              : "none";
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTapDay?.(info.iso)}
              className="aspect-square rounded-lg flex items-center justify-center text-[12px] font-medium relative tap"
              style={{
                background: info.isToday ? phaseCol : `${phaseCol}22`,
                color: info.isToday ? "white" : "var(--ink)",
                boxShadow,
              }}
            >
              <span className="relative z-10">{d}</span>
              {info.isPeriodStart && !info.isToday && (
                <span
                  className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: PHASE_COLOR_MAP.menstruation }}
                />
              )}
              {isOvulation && !info.isToday && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: PHASE_COLOR_MAP.fertil }}
                />
              )}
              {info.entry && !info.isPeriodStart && !info.isToday && (
                <span
                  className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full"
                  style={{ background: "var(--ink-soft)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
