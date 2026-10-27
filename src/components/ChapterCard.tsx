"use client";

import { useState } from "react";
import { Check, Flame, Play, RefreshCw } from "lucide-react";
import { useLife } from "@/lib/lifeStore";
import type { ChapterInfo } from "@/lib/life";
import { shortDate } from "@/lib/date";
import { Sheet } from "./Sheet";

const MODE_KEY = "lernen.mode";

/** Richtung, die auf der Lernseite gewählt wurde (Gemischt, VI→DE, DE→VI). */
function modeQuery(): string {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === "vi_de" || m === "de_vi" ? `&mode=${m}` : "";
  } catch {
    return "";
  }
}

/**
 * Kapitel des Tages: jeden Tag eine Lektion ganz durcharbeiten.
 * Auf Heute und auf der Lernseite.
 */
export function ChapterCard() {
  const chapter = useLife((s) => s.chapter);
  const study = useLife((s) => s.study);
  const chooseChapter = useLife((s) => s.chooseChapter);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!chapter) return null;

  const current = chapter.chapter;
  const suggested = chapter.chapters.find((c) => c.id === chapter.suggestion);
  const pct = chapter.total ? Math.round((chapter.done / chapter.total) * 100) : 0;
  const startHref = `/lernen/ueben?chapter=1${modeQuery()}`;

  return (
    <section className="rounded-[24px] p-4 flex flex-col gap-3" style={{ background: "var(--ink)", color: "white" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-bold" style={{ color: "#C3C8D2" }}>
          Vietnamesisch · Kapitel heute
        </span>
        {study && study.streak > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(242,140,40,0.18)", color: "var(--privat)" }}
          >
            <Flame size={13} strokeWidth={2.4} aria-hidden="true" />
            {study.streak}
          </span>
        )}
      </div>

      {current ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <h2 className="serif-i text-[21px] leading-tight" lang="vi">
              {current.title}
            </h2>
            {chapter.completed && (
              <span
                className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center"
                style={{ background: "var(--privat)", color: "var(--ink)" }}
                aria-label="Kapitel geschafft"
              >
                <Check size={18} strokeWidth={3} />
              </span>
            )}
          </div>
          <div>
            <div className="h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.14)" }}>
              <div
                className="h-2.5 rounded-full transition-all"
                style={{ width: `${pct}%`, background: "var(--privat)" }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[12.5px]" style={{ color: "#C3C8D2" }}>
              <span>
                {chapter.done} von {chapter.total} Karten
              </span>
              <span>{chapter.completed ? "geschafft" : `${pct}%`}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!chapter.completed && (
              <a
                href={startHref}
                className="tap flex-1 h-12 rounded-2xl inline-flex items-center justify-center gap-2 text-[15px] font-bold"
                style={{ background: "var(--privat)", color: "var(--ink)" }}
              >
                <Play size={16} strokeWidth={2.4} aria-hidden="true" />
                {chapter.done > 0 ? "Weiterlernen" : "Kapitel starten"}
              </a>
            )}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={`tap h-12 px-4 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold ${chapter.completed ? "flex-1" : ""}`}
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              <RefreshCw size={14} strokeWidth={2.2} aria-hidden="true" />
              {chapter.completed ? "Noch ein Kapitel" : "Wechseln"}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="serif-i text-[21px] leading-tight">Welches Kapitel heute?</h2>
          <div className="flex gap-2">
            {suggested && (
              <button
                type="button"
                onClick={async () => {
                  await chooseChapter(suggested.id);
                  window.location.href = startHref;
                }}
                className="tap flex-1 min-w-0 h-auto min-h-12 py-2.5 px-3 rounded-2xl inline-flex items-center gap-2 text-left"
                style={{ background: "var(--privat)", color: "var(--ink)" }}
              >
                <Play size={16} strokeWidth={2.4} className="shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[11.5px] font-bold">Vorschlag</span>
                  <span className="block text-[14px] font-bold truncate" lang="vi">
                    {suggested.title}
                  </span>
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="tap px-4 rounded-2xl text-[14px] font-semibold"
              style={{ background: "rgba(255,255,255,0.1)", color: "white", minHeight: 48 }}
            >
              Wählen
            </button>
          </div>
        </>
      )}

      <ChapterPicker
        open={pickerOpen}
        chapters={chapter.chapters}
        currentId={current?.id ?? null}
        suggestion={chapter.suggestion}
        onClose={() => setPickerOpen(false)}
        onPick={async (id) => {
          setPickerOpen(false);
          await chooseChapter(id);
        }}
      />
    </section>
  );
}

function ChapterPicker({
  open,
  chapters,
  currentId,
  suggestion,
  onClose,
  onPick,
}: {
  open: boolean;
  chapters: ChapterInfo[];
  currentId: string | null;
  suggestion: string | null;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  if (!open) return null;
  return (
    <Sheet open onClose={onClose} title="Kapitel wählen">
      <ul className="mt-2 flex flex-col gap-1.5">
        {chapters.map((c) => {
          const active = c.id === currentId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className="tap w-full text-left rounded-2xl px-3.5 py-3 flex items-center gap-3"
                style={active ? { background: "var(--ink)", color: "white" } : { background: "var(--paper-2)", color: "var(--ink)" }}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] font-semibold truncate" lang="vi">
                    {c.title}
                  </span>
                  <span className="block text-[12px] mt-0.5" style={{ color: active ? "#C3C8D2" : "var(--muted)" }}>
                    {c.cards} Karten ·{" "}
                    {c.timesCompleted === 0
                      ? "noch nie durchgearbeitet"
                      : `${c.timesCompleted}× durch, zuletzt ${shortDate(c.lastCompleted!)}`}
                  </span>
                </span>
                {c.id === suggestion && !active && (
                  <span
                    className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: "var(--privat-soft)", color: "var(--privat-text)" }}
                  >
                    Vorschlag
                  </span>
                )}
                {active && <Check size={18} strokeWidth={2.6} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
