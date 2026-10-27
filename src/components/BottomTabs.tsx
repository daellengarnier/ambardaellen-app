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
  { href: "/mehr", label: "Mehr", Icon: LayoutGrid, match: ["/mehr", "/einkauf", "/aktivitaeten", "/lernen"] },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  const sheetOpen = useStore((s) => s.sheetOpen);
  const inboxCount = useLife((s) => s.inbox.length);
  if (sheetOpen > 0) return null;

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed left-0 right-0 z-40 mx-auto px-3.5 pointer-events-none"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) * 0.5 + 12px)",
        maxWidth: 480,
      }}
    >
      <div
        className="grid grid-cols-5 gap-1 p-1.5 rounded-full shadow-float pointer-events-auto"
        style={{ background: "var(--ink)" }}
      >
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
          const badge = href === "/inbox" && inboxCount > 0 ? inboxCount : 0;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className="tap relative flex flex-col items-center justify-center gap-[2px] rounded-full"
              style={{
                minHeight: 50,
                background: active ? "var(--paper)" : "transparent",
                color: active ? "var(--ink)" : "#C3C8D2",
              }}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <Icon size={19} strokeWidth={active ? 2.1 : 1.8} />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full text-[9px] font-bold text-white inline-flex items-center justify-center"
                    style={{ background: "var(--privat-text)" }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="text-[10.5px]" style={{ fontWeight: active ? 700 : 600 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
