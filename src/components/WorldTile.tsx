"use client";

import Link from "next/link";
import { Sun, ChevronRight } from "lucide-react";
import type { TodoDto } from "@/lib/life";
import { todayZurich } from "@/lib/life";
import { shortDate } from "@/lib/date";

type Props = {
  label: string;
  href: string;
  /** Hintergrund, Schrift, Rand der Kästchen, gedämpfte Schrift. */
  colors: { bg: string; fg: string; ring: string; soft: string; danger: string };
  todos: TodoDto[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
};

/**
 * Kachel einer Welt (Spinnerei, Privat) mit allen offenen Todos,
 * chronologisch: Überfälliges zuerst, dann nach Frist, ohne Frist zuletzt.
 * Die Liste scrollt innerhalb der Kachel.
 */
export function WorldTile({ label, href, colors, todos, onToggle, onOpen }: Props) {
  const today = todayZurich();
  return (
    <section
      className="rounded-[22px] pt-3 pb-2 flex flex-col min-w-0"
      style={{ background: colors.bg, color: colors.fg, height: 300 }}
      aria-label={label}
    >
      <Link href={href} className="tap px-3.5 pb-2 flex items-center justify-between gap-1">
        <span className="text-[14px] font-bold">{label}</span>
        <span className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold" style={{ color: colors.soft }}>
          {todos.length}
          <ChevronRight size={14} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </Link>

      {todos.length === 0 ? (
        <p className="px-3.5 text-[13px]" style={{ color: colors.soft }}>
          Nichts offen.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto phone-scroll px-2 flex flex-col gap-0.5" style={{ overscrollBehavior: "contain" }}>
          {todos.map((t) => {
            const overdue = !!t.due && t.due < today;
            const planned = t.plannedFor === today;
            return (
              <li key={t.id} className="flex items-start gap-2 rounded-xl px-1.5 py-1.5">
                <button
                  type="button"
                  onClick={() => onToggle(t.id)}
                  aria-label={`Erledigt: ${t.text}`}
                  className="tap shrink-0 mt-[1px] rounded-full"
                  style={{ width: 20, height: 20, border: `1.8px solid ${colors.ring}` }}
                />
                <button type="button" onClick={() => onOpen(t.id)} className="tap flex-1 min-w-0 text-left">
                  <span
                    className="block text-[13.5px] leading-snug font-medium"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {t.text}
                  </span>
                  {(t.due || planned) && (
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold mt-0.5" style={{ color: overdue ? colors.danger : colors.soft }}>
                      {planned && <Sun size={11} strokeWidth={2.4} aria-label="heute geplant" />}
                      {t.due && (overdue ? `seit ${shortDate(t.due)}` : t.due === today ? "heute" : shortDate(t.due))}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Chronologisch: mit Frist aufsteigend (Überfälliges zuerst), dann ohne Frist nach Erfassung. */
export function chronological(a: TodoDto, b: TodoDto): number {
  if (a.due && b.due) return a.due.localeCompare(b.due);
  if (a.due) return -1;
  if (b.due) return 1;
  return a.createdAt.localeCompare(b.createdAt);
}
