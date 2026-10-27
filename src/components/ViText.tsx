"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2 } from "lucide-react";
import { speakVi } from "@/lib/speak";

// Vietnamesischer Text mit antippbaren Wörtern: tippen zeigt die
// Übersetzung. Wortgruppen ("sáng nay", "mọi người") werden zusammen
// erkannt, längste bekannte Gruppe zuerst.

export type Gloss = Map<string, { de: string; source: "karte" | "glossar" }>;

let cache: Promise<Gloss> | null = null;

function loadGlossary(): Promise<Gloss> {
  cache ??= fetch("/api/v1/study/glossary", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((b: { entries: { vi: string; de: string; source: "karte" | "glossar" }[] }) => {
      const m: Gloss = new Map();
      for (const e of b.entries) m.set(e.vi, { de: e.de, source: e.source });
      return m;
    })
    .catch((e) => {
      cache = null;
      throw e;
    });
  return cache;
}

export function useGlossary(): Gloss | null {
  const [gloss, setGloss] = useState<Gloss | null>(null);
  useEffect(() => {
    let alive = true;
    loadGlossary()
      .then((g) => alive && setGloss(g))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return gloss;
}

const MAX_GROUP = 5;

type Piece = { kind: "text"; text: string } | { kind: "word"; text: string; key: string };

/** Zerlegt den Text in Wortgruppen (längste bekannte zuerst) und Zwischenraum. */
export function segmentVi(text: string, gloss: Gloss): Piece[] {
  // Gerade Indizes: Zwischenraum und Satzzeichen, ungerade: Silben.
  const parts = text.split(/([\p{L}\p{M}\p{N}]+)/u);
  const out: Piece[] = [];
  let i = 1;
  if (parts[0]) out.push({ kind: "text", text: parts[0] });
  while (i < parts.length) {
    let n = 1;
    for (let len = MAX_GROUP; len > 1; len--) {
      const last = i + 2 * (len - 1);
      if (last >= parts.length) continue;
      let joinable = true;
      for (let j = i + 1; j < last; j += 2) if (!/^\s+$/.test(parts[j])) joinable = false;
      if (!joinable) continue;
      const key = parts.slice(i, last + 1).filter((_, k) => k % 2 === 0).join(" ").toLowerCase();
      if (gloss.has(key)) {
        n = len;
        break;
      }
    }
    const last = i + 2 * (n - 1);
    const slice = parts.slice(i, last + 1).join("");
    const key = parts.slice(i, last + 1).filter((_, k) => k % 2 === 0).join(" ").toLowerCase();
    if (/^\d+$/.test(slice)) out.push({ kind: "text", text: slice });
    else out.push({ kind: "word", text: slice, key });
    if (parts[last + 1]) out.push({ kind: "text", text: parts[last + 1] });
    i = last + 2;
  }
  return out;
}

type Open = { key: string; text: string; rect: DOMRect };

export function ViText({ text, gloss, className }: { text: string; gloss: Gloss | null; className?: string }) {
  const [open, setOpen] = useState<Open | null>(null);
  if (!gloss) {
    return (
      <span className={className} lang="vi">
        {text}
      </span>
    );
  }
  const pieces = segmentVi(text, gloss);
  return (
    <span className={className} lang="vi">
      {pieces.map((p, idx) =>
        p.kind === "text" ? (
          <Fragment key={idx}>{p.text}</Fragment>
        ) : (
          <span
            key={idx}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setOpen({ key: p.key, text: p.text, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() });
            }}
            className="cursor-pointer rounded-md"
            style={{
              textDecoration: "underline dotted",
              textDecorationColor: "color-mix(in srgb, currentColor 35%, transparent)",
              textDecorationThickness: "2px",
              textUnderlineOffset: "0.18em",
              background: open?.key === p.key ? "var(--privat-soft)" : undefined,
            }}
          >
            {p.text}
          </span>
        ),
      )}
      {open && createPortal(<WordPopover open={open} gloss={gloss} onClose={() => setOpen(null)} />, document.body)}
    </span>
  );
}

function WordPopover({ open, gloss, onClose }: { open: Open; gloss: Gloss; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const entry = gloss.get(open.key);
  const syllables = open.key.split(" ");
  const parts = syllables.length > 1 ? syllables.map((s) => ({ s, de: gloss.get(s)?.de })) : [];

  // Unter dem Wort, bei wenig Platz darüber; seitlich im Bildschirm halten.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = Math.min(Math.max(12, open.rect.left + open.rect.width / 2 - w / 2), window.innerWidth - w - 12);
    const below = open.rect.bottom + 8;
    const top = below + h > window.innerHeight - 12 ? Math.max(12, open.rect.top - h - 8) : below;
    setPos({ top, left });
  }, [open]);

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-label={`Übersetzung: ${open.text}`}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-50 w-[min(300px,calc(100vw-24px))] rounded-2xl p-3.5 flex flex-col gap-2 text-left"
        style={{
          top: pos?.top ?? -9999,
          left: pos?.left ?? 0,
          background: "var(--ink)",
          color: "white",
          boxShadow: "0 16px 40px -12px rgba(20,22,28,0.45)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          letterSpacing: "normal",
          lineHeight: 1.35,
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-bold" lang="vi">
              {open.text}
            </div>
            <div className="text-[15px] mt-0.5" style={{ color: entry ? "white" : "#C3C8D2" }}>
              {entry ? entry.de : "Noch nicht im Glossar."}
            </div>
          </div>
          <button
            type="button"
            onClick={() => speakVi(open.text)}
            className="tap shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
            aria-label={`Anhören: ${open.text}`}
          >
            <Volume2 size={16} strokeWidth={2} />
          </button>
        </div>
        {parts.some((p) => p.de) && (
          <ul className="flex flex-col gap-0.5 text-[13px]" style={{ color: "#C3C8D2" }}>
            {parts.map((p, i) => (
              <li key={i}>
                <span className="font-bold" style={{ color: "white" }} lang="vi">
                  {p.s}
                </span>{" "}
                {p.de ?? "(nicht im Glossar)"}
              </li>
            ))}
          </ul>
        )}
        {entry && (
          <div className="text-[11.5px] font-semibold" style={{ color: "#8E95A3" }}>
            {entry.source === "karte" ? "aus deinen Vokabelkarten" : "aus dem Glossar"}
          </div>
        )}
      </div>
    </>
  );
}
