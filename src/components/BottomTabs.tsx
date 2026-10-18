"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Inbox, ListTodo, Target, LayoutGrid } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLife } from "@/lib/lifeStore";

const TABS = [
  { href: "/", label: "Heute", Icon: Sun, match: ["/"] },
  { href: "/inbox", label: "Inbox", Icon: Inbox, match: ["/inbox"] },
  { href: "/todo", label: "Todo", Icon: ListTodo, match: ["/todo"] },
  { href: "/ziele", label: "Ziele", Icon: Target, match: ["/ziele"] },
  { href: "/mehr", label: "Mehr", Icon: LayoutGrid, match: ["/mehr", "/einkauf", "/aktivitaeten"] },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  const sheetOpen = useStore((s) => s.sheetOpen);
  const inboxCount = useLife((s) => s.inbox.length);
  if (sheetOpen > 0) return null;

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed left-0 right-0 z-40 mx-auto px-2 pointer-events-none"
      style={{
        bottom: 0,
        maxWidth: 480,
        background:
          "linear-gradient(to top, rgba(239,230,211,0.98) 55%, rgba(239,230,211,0))",
      }}
    >
      <div
        className="flex items-stretch justify-between px-1 rounded-t-[22px] backdrop-blur-md shadow-card pointer-events-auto"
        style={{
          background: "rgba(251,246,232,0.92)",
          border: "1px solid rgba(218,201,168,0.5)",
          borderBottom: "none",
          paddingTop: "0.125rem",
          // Sehr knapp am Rand — Inhalt sitzt fast direkt über dem
          // iOS-Home-Indikator. 0.35 × Safe-Area reicht für die
          // Lesbarkeit des Indikators ohne die Pille hoch zu schieben.
          paddingBottom: "calc(env(safe-area-inset-bottom) * 0.35)",
        }}
      >
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
          const badge = href === "/inbox" && inboxCount > 0 ? inboxCount : 0;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className="tap relative flex-1 flex flex-col items-center justify-center gap-[1px] py-1 rounded-2xl"
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(197,99,75,0.16), rgba(75,48,80,0.10))",
                    }
                  : undefined
              }
              aria-current={active ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.6}
                  color={active ? "var(--terra-deep)" : "var(--ink-soft)"}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-[3px] rounded-full text-[8.5px] font-bold text-white inline-flex items-center justify-center"
                    style={{ background: "var(--terra)" }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span
                className="text-[9.5px]"
                style={{
                  color: active ? "var(--terra-deep)" : "var(--ink-soft)",
                  fontWeight: active ? 600 : 500,
                  letterSpacing: 0.1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
