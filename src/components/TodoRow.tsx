"use client";

import { Sparkles, Sun } from "lucide-react";
import type { AreaDto, TodoDto } from "@/lib/life";
import { todayZurich } from "@/lib/life";
import { areaByKey } from "@/lib/lifeStore";
import { shortDate } from "@/lib/date";
import { PRIO } from "@/lib/todo";
import { RoundCheck } from "./RoundCheck";
import { DeleteAction } from "./DeleteAction";
import { TagChips } from "./TagChips";
import { AreaChip } from "./AreaPicker";

type Props = {
  t: TodoDto;
  areas: AreaDto[];
  onToggle: (id: string) => void;
  onOpen: (t: TodoDto) => void;
  onRemove?: (id: string) => void;
  dense?: boolean;
  /** "Heute"-Marker ausblenden (z.B. in der Heute-Liste selbst). */
  hideToday?: boolean;
};

export function TodoRow({ t, areas, onToggle, onOpen, onRemove, dense = false, hideToday = false }: Props) {
  const p = PRIO[t.prio];
  const today = todayZurich();
  const done = t.status !== "offen";
  const plannedToday = !hideToday && t.plannedFor === today && !done;
  const area = areaByKey(areas, t.area);
  const hasMeta = t.due || t.note || t.tags.length > 0 || area || plannedToday || t.createdBy === "jarvis";

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
        <RoundCheck checked={done} onClick={() => onToggle(t.id)} size={dense ? 20 : 22} color={p.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`${dense ? "text-[13.5px]" : "text-[14px]"} flex items-center gap-1.5`}
          style={done ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
        >
          {p.dot && !done && (
            <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          )}
          <span className="truncate">{t.text}</span>
        </div>
        {hasMeta && (
          <div className="text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--muted)" }}>
            {plannedToday && (
              <span className="inline-flex items-center gap-0.5" style={{ color: "var(--gold)", fontWeight: 600 }}>
                <Sun size={10} strokeWidth={2} /> heute
              </span>
            )}
            {t.due && (
              <span style={t.due < today && !done ? { color: "#B42318", fontWeight: 500 } : undefined}>
                {shortDate(t.due)}
              </span>
            )}
            <AreaChip area={area} />
            {t.tags.length > 0 && <TagChips tags={t.tags} size="xs" max={2} />}
            {t.createdBy === "jarvis" && (
              <span className="inline-flex items-center gap-0.5" style={{ color: "var(--plum)" }} title="von Jarvis">
                <Sparkles size={10} strokeWidth={2} /> Jarvis
              </span>
            )}
            {t.note && <span className="truncate">· {t.note.split("\n")[0]}</span>}
          </div>
        )}
      </div>
      {onRemove && <DeleteAction kind="Aufgabe" label={t.text} onConfirm={() => onRemove(t.id)} size={12} />}
    </div>
  );
}
