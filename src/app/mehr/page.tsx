"use client";

import Link from "next/link";
import { ShoppingCart, Calendar, ChevronRight, Languages } from "lucide-react";
import { useLife } from "@/lib/lifeStore";
import { useStore } from "@/lib/store";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { ClientOnly } from "@/components/ClientOnly";

export default function MehrPage() {
  return (
    <ClientOnly fallback={<ScreenHeader title="Mehr" />}>
      <MehrContent />
    </ClientOnly>
  );
}

function MehrContent() {
  const shoppingOpen = useStore((s) => s.shopping.filter((i) => !i.done).length);
  const plannedActs = useStore((s) => s.activities.filter((a) => a.status === "geplant").length);

  const study = useLife((s) => s.study);
  const items = [
    {
      href: "/lernen",
      label: "Lernen: Vietnamesisch",
      detail: study ? `${study.due + study.newToday} Karten heute` : "Lernkarten",
      Icon: Languages,
      color: "var(--privat-text)",
    },
    { href: "/einkauf", label: "Einkauf", detail: `${shoppingOpen} offen`, Icon: ShoppingCart, color: "var(--sage)" },
    { href: "/aktivitaeten", label: "Aktivitäten & Reisen", detail: `${plannedActs} geplant`, Icon: Calendar, color: "var(--terra)" },
  ];

  return (
    <>
      <ScreenHeader title="Mehr" />
      <div className="px-4 space-y-2">
        {items.map(({ href, label, detail, Icon, color }) => (
          <Link key={href} href={href} className="block">
            <Card className="p-3 flex items-center gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: color }}
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-semibold">{label}</div>
                <div className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                  {detail}
                </div>
              </div>
              <ChevronRight size={16} strokeWidth={1.75} color="var(--muted)" />
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
