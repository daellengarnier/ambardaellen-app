"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Calendar, ShoppingCart, ListTodo, Target } from "lucide-react";
import { useStore } from "@/lib/store";

const TABS = [
  { href: "/", label: "Home", Icon: Sun },
  { href: "/aktivitaeten", label: "Aktivitäten", Icon: Calendar },
  { href: "/einkauf", label: "Einkauf", Icon: ShoppingCart },
  { href: "/todo", label: "Todo", Icon: ListTodo },
  { href: "/ziele", label: "Ziele", Icon: Target },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  const sheetOpen = useStore((s) => s.sheetOpen);
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
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
              <Icon
                size={18}
                strokeWidth={active ? 2 : 1.6}
                color={active ? "var(--terra-deep)" : "var(--ink-soft)"}
              />
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
