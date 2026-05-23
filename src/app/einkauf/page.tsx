"use client";

import { useMemo, useState } from "react";
import { Plus, Users, Lock, ChevronRight, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";
import { visibleTo } from "@/lib/scope";
import { USERS } from "@/lib/types";
import { relativeWhen } from "@/lib/date";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AvatarWithScope } from "@/components/Avatar";
import { RoundCheck } from "@/components/RoundCheck";
import { Empty } from "@/components/Empty";
import { ClientOnly } from "@/components/ClientOnly";
import { ShoppingSheet } from "@/components/sheets/ShoppingSheet";
import type { Scope, ShoppingItem } from "@/lib/types";

export default function EinkaufPage() {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <ShopContent />
    </ClientOnly>
  );
}

function Skeleton() {
  return (
    <div className="pt-2 pb-3">
      <ScreenHeader title="Einkauf" subtitle="—" />
    </div>
  );
}

function ShopContent() {
  const shopping = useStore((s) => s.shopping);
  const currentUser = useStore((s) => s.currentUser);
  const addShopping = useStore((s) => s.addShopping);
  const toggleShopping = useStore((s) => s.toggleShopping);
  const updateShopping = useStore((s) => s.updateShopping);
  const removeShopping = useStore((s) => s.removeShopping);

  const [input, setInput] = useState("");
  const [spinnerei, setSpinnerei] = useState(false);
  const [scopeForNew, setScopeForNew] = useState<Scope>("geteilt");
  const [showDone, setShowDone] = useState(false);
  const [openItem, setOpenItem] = useState<ShoppingItem | null>(null);

  const visibleShopping = useMemo(() => visibleTo(shopping, currentUser), [shopping, currentUser]);

  const openItems = visibleShopping.filter((s) => !s.done);
  const gemeinsam = openItems.filter((s) => !s.spinnerei && s.scope === "geteilt");
  const privat = openItems.filter((s) => !s.spinnerei && s.scope === currentUser);
  const spinnereiArr = openItems.filter((s) => s.spinnerei);
  const doneItems = visibleShopping.filter((s) => s.done);

  const sections: Array<{
    key: string;
    label: string;
    items: ShoppingItem[];
    accent: string;
    icon: React.ReactNode;
    hint?: string;
  }> = [
    {
      key: "gemeinsam",
      label: "Gemeinsam",
      items: gemeinsam,
      accent: "var(--sage)",
      icon: <Users size={11} strokeWidth={1.75} />,
    },
    {
      key: "privat",
      label: `Privat · ${USERS[currentUser].name}`,
      items: privat,
      accent: USERS[currentUser].color,
      icon: <Lock size={11} strokeWidth={2} />,
    },
    {
      key: "spinnerei",
      label: "Spinnerei",
      items: spinnereiArr,
      accent: "var(--terra)",
      icon: <span style={{ color: "var(--terra)" }}>✦</span>,
      hint: "Wünsche & Nice-to-haves",
    },
  ];

  const add = () => {
    if (!input.trim()) return;
    addShopping({ text: input, scope: spinnerei ? scopeForNew : scopeForNew, spinnerei });
    setInput("");
  };

  return (
    <>
      <ScreenHeader title="Einkauf" subtitle={`${openItems.length} offen`} />

      <div className="px-4 pb-2.5">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--cream-deep)", color: "var(--terra)" }}
            >
              <Plus size={16} strokeWidth={2} />
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              placeholder="Was fehlt?"
              className="flex-1 bg-transparent text-[14.5px] py-1 min-w-0"
              style={{ color: "var(--ink)" }}
            />
            <button
              type="button"
              onClick={add}
              className="tap text-[13px] font-medium px-3 py-1.5 rounded-full text-white"
              style={{ background: input.trim() ? "var(--terra)" : "var(--terra-soft)" }}
            >
              Hinzu
            </button>
          </div>
          <div className="mt-2 pl-1 flex items-center justify-between gap-2">
            <div
              className="inline-flex p-0.5 rounded-full"
              style={{ background: "var(--cream-deep)" }}
            >
              <button
                type="button"
                onClick={() => {
                  setScopeForNew("geteilt");
                  setSpinnerei(false);
                }}
                className="px-2.5 py-0.5 text-[11.5px] rounded-full tap font-medium inline-flex items-center gap-1"
                style={
                  scopeForNew === "geteilt" && !spinnerei
                    ? { background: "var(--paper)", color: "var(--ink)" }
                    : { color: "var(--ink-soft)" }
                }
              >
                <Users size={11} strokeWidth={1.75} /> Gemeinsam
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopeForNew(currentUser);
                  setSpinnerei(false);
                }}
                className="px-2.5 py-0.5 text-[11.5px] rounded-full tap font-medium inline-flex items-center gap-1"
                style={
                  scopeForNew === currentUser && !spinnerei
                    ? { background: "var(--paper)", color: "var(--ink)" }
                    : { color: "var(--ink-soft)" }
                }
              >
                <Lock size={11} strokeWidth={2} /> Privat
              </button>
              <button
                type="button"
                onClick={() => setSpinnerei(true)}
                className="px-2.5 py-0.5 text-[11.5px] rounded-full tap font-medium inline-flex items-center gap-1"
                style={
                  spinnerei
                    ? { background: "var(--paper)", color: "var(--terra)" }
                    : { color: "var(--ink-soft)" }
                }
              >
                <span>✦</span> Spinnerei
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 space-y-3">
        {sections.map(
          (sec) =>
            sec.items.length > 0 && (
              <div key={sec.key}>
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: sec.accent }}
                  />
                  <h2
                    className="uplabel text-[10.5px] inline-flex items-center gap-1"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {sec.icon} {sec.label}
                  </h2>
                  <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                    · {sec.items.length}
                  </span>
                  {sec.hint && (
                    <span
                      className="text-[10.5px] italic ml-auto"
                      style={{ color: "var(--muted)" }}
                    >
                      {sec.hint}
                    </span>
                  )}
                </div>
                <Card className="p-1">
                  {sec.items.map((s, i) => (
                    <div
                      key={s.id}
                      style={
                        i < sec.items.length - 1
                          ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                          : undefined
                      }
                    >
                      <ShoppingRow item={s} onToggle={toggleShopping} onOpen={setOpenItem} />
                    </div>
                  ))}
                </Card>
              </div>
            ),
        )}

        {doneItems.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowDone(!showDone)}
              className="flex items-center gap-1.5 px-1 py-1 uplabel text-[10.5px] tap"
              style={{ color: "var(--ink-soft)" }}
            >
              Erledigt · {doneItems.length}
              <ChevronRight
                size={12}
                strokeWidth={1.75}
                style={{
                  transition: "transform 200ms",
                  transform: showDone ? "rotate(90deg)" : "none",
                }}
              />
            </button>
            {showDone && (
              <Card className="p-1 mt-1">
                {doneItems.map((s, i) => (
                  <div
                    key={s.id}
                    style={
                      i < doneItems.length - 1
                        ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                        : undefined
                    }
                  >
                    <ShoppingRow
                      item={s}
                      onToggle={toggleShopping}
                      onOpen={setOpenItem}
                      dense
                    />
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {visibleShopping.length === 0 && (
          <Empty
            icon={<ShoppingCart size={22} strokeWidth={1.75} />}
            title="Liste ist leer"
            body="Tippe oben ein, was als nächstes mit muss."
          />
        )}
      </div>

      <ShoppingSheet
        item={openItem}
        onClose={() => setOpenItem(null)}
        onToggle={toggleShopping}
        onChange={(id, patch) => {
          updateShopping(id, patch);
          if (openItem && openItem.id === id) setOpenItem({ ...openItem, ...patch });
        }}
        onDelete={removeShopping}
        currentUser={currentUser}
      />
    </>
  );
}

function ShoppingRow({
  item,
  onToggle,
  onOpen,
  dense = false,
}: {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onOpen: (it: ShoppingItem) => void;
  dense?: boolean;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpen(item);
      }}
      className={`flex items-center gap-2.5 ${dense ? "px-2.5 py-2" : "px-3 py-2.5"} tap cursor-pointer`}
      role="button"
      tabIndex={0}
    >
      <RoundCheck
        checked={item.done}
        onClick={() => onToggle(item.id)}
        size={dense ? 20 : 22}
        color={item.spinnerei ? "var(--terra)" : "var(--sage)"}
        ariaLabel={item.done ? "Wieder offen" : "Gekauft"}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`${dense ? "text-[13.5px]" : "text-[14px]"} flex items-center gap-1.5`}
          style={item.done ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
        >
          {item.spinnerei && !item.done && <span style={{ color: "var(--terra)" }}>✦</span>}
          <span className="truncate">{item.text}</span>
        </div>
        {(item.qty || item.addedAt) && (
          <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted)" }}>
            {item.qty && <span>{item.qty}{item.addedAt ? " · " : ""}</span>}
            {item.addedAt ? relativeWhen(item.addedAt) : ""}
          </div>
        )}
      </div>
      <AvatarWithScope by={item.by} scope={item.scope} size={dense ? 18 : 20} />
    </div>
  );
}
