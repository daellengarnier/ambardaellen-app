"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Volume2, X, Flame } from "lucide-react";
import type { StudyItem, StudyStats } from "@/lib/life";
import { RATING_LABEL, intervalLabel, schedule, type Rating } from "@/lib/srs";
import { speakVi, useViVoice } from "@/lib/speak";
import { useStore } from "@/lib/store";
import { useLife } from "@/lib/lifeStore";
import { ClientOnly } from "@/components/ClientOnly";

export default function UebenPage() {
  return (
    <ClientOnly fallback={<div className="min-h-dvh" />}>
      <Session />
    </ClientOnly>
  );
}

const POS_LABEL: Record<string, string> = {
  noun: "Nomen",
  verb: "Verb",
  adjective: "Adjektiv",
  adverb: "Adverb",
  phrase: "Wendung",
};

const TYPE_LABEL: Record<string, string> = {
  vocab: "Vokabel",
  grammar: "Grammatik",
  phrase: "Satz",
  sentence: "Satz",
};

const RATING_STYLE: Record<Rating, { bg: string; fg: string }> = {
  1: { bg: "#FDE4E1", fg: "#B42318" },
  2: { bg: "var(--privat-soft)", fg: "var(--privat-text)" },
  3: { bg: "var(--spinnerei-soft)", fg: "var(--spinnerei-text)" },
  4: { bg: "var(--sage-soft)", fg: "#1E6B47" },
};

type Side = { text: string; vi: boolean; hint?: string };
type View = { question: string; dir: string; prompt: Side; answer: Side; explain?: string };

// Buchstaben, die es nur im Vietnamesischen gibt (Sonderzeichen und Töne).
const VI_CHARS =
  /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;

/**
 * Klammern mit vietnamesischem Inhalt verraten beim Abfragen DE → VI die
 * Lösung ("bitte (giùm: locker, làm ơn: höflicher)"). Sie wandern auf die
 * Rückseite.
 */
function splitDe(text: string): { text: string; aside: string } {
  const asides: string[] = [];
  const rest = text.replace(/\s*\(([^)]*)\)/g, (m, inner: string) => {
    if (!VI_CHARS.test(inner)) return m;
    asides.push(inner);
    return "";
  });
  return { text: rest.trim(), aside: asides.join(" · ") };
}

const ASK_DE = "Was heisst das?";
const ASK_VI = "Wie sagst du das auf Vietnamesisch?";

/** Was gefragt und was aufgedeckt wird, je nach Kartentyp und Richtung. */
function sides(item: StudyItem): View {
  const c = item.card;
  const toDe = item.direction === "vi_de";
  if (c.type === "grammar") {
    // Grammatik übt man am Satz: deutsches Beispiel, Struktur als Hilfe,
    // gesucht ist der vietnamesische Satz. Ohne Beispiel: Bedeutung erklären.
    if (c.exampleVi && c.exampleDe) {
      return {
        question: "Bilde den Satz mit dieser Struktur",
        dir: "DE → VI",
        prompt: { text: c.exampleDe, vi: false, hint: c.front },
        answer: { text: c.exampleVi, vi: true },
        explain: c.backDe,
      };
    }
    return {
      question: "Was drückt diese Struktur aus?",
      dir: "VI → DE",
      prompt: { text: c.front, vi: true },
      answer: { text: c.backDe, vi: false },
    };
  }
  if (c.type === "phrase") {
    const de = splitDe(c.backDe);
    return toDe
      ? { question: ASK_DE, dir: "VI → DE", prompt: { text: c.backVi, vi: true }, answer: { text: c.backDe, vi: false, hint: c.front } }
      : {
          question: ASK_VI,
          dir: "DE → VI",
          prompt: { text: de.text, vi: false, hint: c.front },
          answer: { text: c.backVi, vi: true, hint: de.aside },
        };
  }
  if (c.type === "sentence") {
    return toDe
      ? { question: ASK_DE, dir: "VI → DE", prompt: { text: c.front, vi: true }, answer: { text: c.backDe, vi: false } }
      : { question: ASK_VI, dir: "DE → VI", prompt: { text: c.backDe, vi: false }, answer: { text: c.front, vi: true } };
  }
  const de = splitDe(c.backDe);
  return toDe
    ? { question: ASK_DE, dir: "VI → DE", prompt: { text: c.front, vi: true }, answer: { text: c.backDe, vi: false } }
    : {
        question: ASK_VI,
        dir: "DE → VI",
        prompt: { text: de.text, vi: false },
        answer: { text: c.front, vi: true, hint: de.aside },
      };
}

/**
 * Stufenweise Tipps, wenn Vietnamesisch gesucht ist: erst die Struktur
 * (bei Sätzen) oder Englisch (bei Wörtern), dann der Anfang.
 */
function tipsFor(item: StudyItem, answer: Side): string[] {
  if (!answer.vi) return [];
  const c = item.card;
  const words = answer.text.replace(/[.!?,]/g, "").split(/\s+/).filter(Boolean);
  const tips: string[] = [];
  if ((c.type === "sentence" || c.type === "phrase") && c.note) tips.push(c.note);
  if (c.type === "vocab" && c.backEn) tips.push(`Englisch: ${c.backEn}`);
  if (c.type === "vocab") {
    tips.push(`${words.length} ${words.length === 1 ? "Silbe" : "Silben"}, beginnt mit „${answer.text.slice(0, 2)}…“`);
  } else if (words.length > 2) {
    tips.push(`Anfang: „${words.slice(0, 2).join(" ")} …“`);
  }
  return tips;
}

function Session() {
  const incSheetOpen = useStore((s) => s.incSheetOpen);
  const decSheetOpen = useStore((s) => s.decSheetOpen);
  const refreshLife = useLife((s) => s.refresh);
  const hasVoice = useViVoice();

  const [queue, setQueue] = useState<StudyItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipLevel, setTipLevel] = useState(0);

  // Vollbild: Navigation ausblenden, solange geübt wird.
  useEffect(() => {
    incSheetOpen();
    return () => decSheetOpen();
  }, [incSheetOpen, decSheetOpen]);

  useEffect(() => {
    // deck, mode und extra kommen unverändert von der Lernseite.
    const q = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    for (const k of ["deck", "mode", "extra", "chapter", "review"]) {
      const v = q.get(k);
      if (v) params.set(k, v);
    }
    let alive = true;
    fetch(`/api/v1/study/queue${params.size ? `?${params}` : ""}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ items: StudyItem[] }>) : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((b) => alive && setQueue(b.items))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const finished = queue !== null && index >= queue.length;

  useEffect(() => {
    if (!finished) return;
    let alive = true;
    fetch("/api/v1/study/stats", { cache: "no-store" })
      .then((r) => r.json() as Promise<StudyStats>)
      .then((s) => alive && setStats(s))
      .catch(() => {});
    refreshLife();
    return () => {
      alive = false;
    };
  }, [finished, refreshLife]);

  const item = queue && !finished ? queue[index] : null;
  const view = item ? sides(item) : null;

  const rate = (rating: Rating) => {
    if (!item || !queue) return;
    const next = schedule(item.state, rating);
    fetch("/api/v1/study/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardId: item.card.id, direction: item.direction, rating }),
    }).catch(() => setError("Bewertung nicht gespeichert. Verbindung prüfen."));
    // "Nochmal": am Ende dieser Runde wieder zeigen.
    if (next.intervalDays === 0) {
      setQueue([...queue, { ...item, state: { ...next, isNew: false } }]);
    } else {
      setDone((d) => d + 1);
    }
    setIndex(index + 1);
    setRevealed(false);
    setTipLevel(0);
  };

  const reveal = () => {
    setRevealed(true);
    if (view?.answer.vi && hasVoice) speakVi(view.answer.text);
  };

  const total = queue ? queue.length : 0;
  const urlParams = new URLSearchParams(window.location.search);
  const isChapter = urlParams.get("chapter") === "1";
  const tips = item && view ? tipsFor(item, view.answer) : [];

  return (
    <div
      className="fixed inset-0 z-40 mx-auto max-w-[480px] flex flex-col px-4 overflow-y-auto"
      style={{
        background: "var(--cream)",
        // Eigene Vollbildansicht: die App-Hülle hält unten Platz für die
        // Navigation frei, die beim Üben ausgeblendet ist.
        paddingTop: "max(env(safe-area-inset-top), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          href={isChapter ? "/" : "/lernen"}
          className="tap w-11 h-11 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: "var(--paper)" }}
          aria-label="Üben beenden"
        >
          <X size={18} strokeWidth={2} />
        </Link>
        <div className="flex-1 h-2 rounded-full" style={{ background: "var(--cream-deep)" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${total ? Math.round((index / total) * 100) : 0}%`, background: "var(--ink)" }}
          />
        </div>
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--ink-soft)" }}>
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>

      {error && (
        <p className="text-[13px] mt-3 font-semibold" style={{ color: "#B42318" }}>
          {error}
        </p>
      )}

      {queue === null && !error && (
        <p className="mt-10 text-center text-[14px]" style={{ color: "var(--muted)" }}>
          Lade Karten…
        </p>
      )}

      {finished && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="serif text-[34px] leading-tight">
            {total === 0 ? (isChapter ? "Kapitel schon fertig" : "Nichts fällig") : isChapter ? "Kapitel geschafft" : "Geschafft"}
          </div>
          <p className="text-[15px]" style={{ color: "var(--ink-soft)" }}>
            {total === 0
              ? isChapter
                ? "Heute ist dieses Kapitel durch. Auf Heute kannst du ein weiteres wählen."
                : "Gerade ist nichts zum Auffrischen dran."
              : `${done} Karten gelernt.`}
          </p>
          {stats && stats.streak > 0 && (
            <p className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: "var(--privat-text)" }}>
              <Flame size={17} strokeWidth={2.2} aria-hidden="true" />
              {stats.streak === 1 ? "1 Tag in Folge" : `${stats.streak} Tage in Folge`}
            </p>
          )}
          <div className="flex flex-col gap-2 mt-4 w-full max-w-[280px]">
            <Link
              href={isChapter ? "/" : "/lernen"}
              className="tap h-12 rounded-2xl inline-flex items-center justify-center text-[15px] font-bold"
              style={{ background: "var(--ink)", color: "white" }}
            >
              Zurück
            </Link>
          </div>
        </div>
      )}

      {item && view && (
        <>
          <div className="flex-1 flex flex-col justify-center py-6">
            <div className="rounded-[26px] p-5 flex flex-col gap-4" style={{ background: "var(--paper)" }}>
              <div className="flex items-center justify-between gap-2 text-[11.5px] font-bold" style={{ color: "var(--muted)" }}>
                <span>
                  {TYPE_LABEL[item.card.type]} · {view.dir}
                </span>
                {item.state.isNew && (
                  <span className="px-2 py-0.5 rounded-lg" style={{ background: "var(--spinnerei-soft)", color: "var(--spinnerei-text)" }}>
                    neu
                  </span>
                )}
              </div>

              <div className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
                {view.question}
              </div>
              {view.prompt.hint && (
                <div
                  className="self-start text-[14px] font-bold rounded-xl px-3 py-1.5"
                  style={{ background: "var(--paper-2)", color: "var(--ink)" }}
                  lang="vi"
                >
                  {view.prompt.hint}
                </div>
              )}
              <div className="flex items-start gap-3">
                <p
                  className={view.prompt.vi ? "serif text-[30px] leading-tight flex-1" : "text-[21px] font-semibold leading-snug flex-1"}
                  lang={view.prompt.vi ? "vi" : "de"}
                >
                  {view.prompt.text}
                </p>
                {view.prompt.vi && hasVoice && <SpeakButton text={view.prompt.text} />}
              </div>

              {!revealed && tipLevel > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {tips.slice(0, tipLevel).map((t) => (
                    <li
                      key={t}
                      className="text-[13.5px] rounded-xl px-3 py-2"
                      style={{ background: "var(--spinnerei-soft)", color: "var(--spinnerei-text)" }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              {revealed && (
                <div className="pt-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--cream-deep)" }}>
                  <div className="flex items-start gap-3">
                    <p
                      className={view.answer.vi ? "serif text-[28px] leading-tight flex-1" : "text-[19px] font-semibold leading-snug flex-1"}
                      lang={view.answer.vi ? "vi" : "de"}
                    >
                      {view.answer.text}
                    </p>
                    {view.answer.vi && hasVoice && <SpeakButton text={view.answer.text} />}
                  </div>
                  {view.answer.hint && (
                    <p className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
                      {view.answer.hint}
                    </p>
                  )}
                  {item.card.type === "vocab" && (
                    <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                      {[item.card.backEn && `EN: ${item.card.backEn}`, POS_LABEL[item.card.pos] ?? item.card.pos, item.card.category]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {view.explain && (
                    <p className="text-[13.5px]" style={{ color: "var(--ink-soft)" }}>
                      {view.explain}
                    </p>
                  )}
                  {item.card.exampleVi && item.card.exampleVi !== view.answer.text && (
                    <div className="rounded-2xl p-3 mt-1" style={{ background: "var(--paper-2)" }}>
                      <div className="flex items-start gap-2">
                        <p className="text-[15px] font-semibold flex-1" lang="vi">
                          {item.card.exampleVi}
                        </p>
                        {hasVoice && <SpeakButton text={item.card.exampleVi} small />}
                      </div>
                      {item.card.exampleDe && (
                        <p className="text-[13px] mt-1" style={{ color: "var(--ink-soft)" }}>
                          {item.card.exampleDe}
                        </p>
                      )}
                    </div>
                  )}
                  {item.card.note && item.card.note !== view.answer.hint && (
                    <p className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
                      {item.card.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {revealed ? (
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as Rating[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => rate(r)}
                  className="tap rounded-2xl py-2.5 flex flex-col items-center gap-0.5"
                  style={{ background: RATING_STYLE[r].bg, color: RATING_STYLE[r].fg, minHeight: 58 }}
                >
                  <span className="text-[14px] font-bold">{RATING_LABEL[r]}</span>
                  <span className="text-[11.5px] font-semibold">{intervalLabel(schedule(item.state, r).intervalDays)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {tipLevel < tips.length && (
                <button
                  type="button"
                  onClick={() => setTipLevel(tipLevel + 1)}
                  className="tap h-14 px-5 rounded-2xl text-[15px] font-bold"
                  style={{ background: "var(--paper)", color: "var(--ink)" }}
                >
                  Tipp
                </button>
              )}
              <button
                type="button"
                onClick={reveal}
                className="tap flex-1 h-14 rounded-2xl text-[16px] font-bold"
                style={{ background: "var(--ink)", color: "white" }}
              >
                Aufdecken
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SpeakButton({ text, small = false }: { text: string; small?: boolean }) {
  const size = small ? 36 : 44;
  return (
    <button
      type="button"
      onClick={() => speakVi(text)}
      className="tap shrink-0 rounded-full inline-flex items-center justify-center"
      style={{ width: size, height: size, background: "var(--cream-deep)", color: "var(--ink)" }}
      aria-label={`Anhören: ${text}`}
    >
      <Volume2 size={small ? 16 : 19} strokeWidth={2} />
    </button>
  );
}
