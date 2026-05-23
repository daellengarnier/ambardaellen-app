"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Calendar, ShoppingCart, ListTodo, Target } from "lucide-react";

const TABS = [
  { href: "/", label: "Heute", Icon: Sun },
  { href: "/aktivitaeten", label: "Aktivitäten", Icon: Calendar },
  { href: "/einkauf", label: "Einkauf", Icon: ShoppingCart },
  { href: "/todo", label: "Todo", Icon: ListTodo },
  { href: "/ziele", label: "Ziele", Icon: Target },
] as const;

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="absolute bottom-3 left-3 right-3 z-40"
    >
      <div
        className="flex items-stretch justify-between px-1.5 py-1.5 rounded-[26px] backdrop-blur-md shadow-card"
        style={{ background: "rgba(251,246,232,0.85)" }}
      >
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="tap relative flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl"
              style={
                active
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(197,99,75,0.10), rgba(75,48,80,0.06))",
                    }
                  : undefined
              }
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.75}
                color={active ? "var(--terra-deep)" : "var(--ink-soft)"}
              />
              <span
                className="text-[10px] tracking-wide"
                style={{
                  color: active ? "var(--terra-deep)" : "var(--ink-soft)",
                  fontWeight: active ? 600 : 500,
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
