"use client";

import { useMemo, useState } from "react";
import { Plus, Layers, RotateCcw, X, Users, Lock, Check } from "lucide-react";
import { Card } from "../Card";
import { CategoryPicker } from "./CategoryPicker";
import { PacklistTemplatePicker } from "../sheets/PacklistTemplatePicker";
import { useStore } from "@/lib/store";
import { USERS, PACK_CATEGORIES_DEFAULT, type Scope, type PacklistItem, type UserId } from "@/lib/types";

type Props = {
  activityId: string;
};

export function PacklistSection({ activityId }: Props) {
  const activity = useStore((s) => s.activities.find((a) => a.id === activityId));
  const currentUser = useStore((s) => s.currentUser);
  const addItem = useStore((s) => s.addPacklistItem);
  const toggleItem = useStore((s) => s.togglePacklistItem);
  const removeItem = useStore((s) => s.removePacklistItem);
  const updateItem = useStore((s) => s.updatePacklistItem);
  const resetPack = useStore((s) => s.resetPacklist);

  const [input, setInput] = useState("");
  const [newScope, setNewScope] = useState<Scope>("geteilt");
  const [newCategory, setNewCategory] = useState<string>("Sonstiges");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Sichtbare Items: gemeinsam + eigene
  const visible = useMemo(() => {
    if (!activity) return [];
    return activity.packlist.filter(
      (p) => p.scope === "geteilt" || p.scope === currentUser,
    );
  }, [activity, currentUser]);

  const knownCategories = useMemo(
    () => Array.from(new Set([...PACK_CATEGORIES_DEFAULT, ...visible.map((p) => p.category)])),
    [visible],
  );

  // Gruppieren nach Kategorie (Default-Reihenfolge zuerst, dann custom alphabetisch)
  const grouped = useMemo(() => {
    const map = new Map<string, PacklistItem[]>();
    visible.forEach((p) => {
      const cat = p.category || "Sonstiges";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    const cats = Array.from(map.keys());
    cats.sort((a, b) => {
      const da = (PACK_CATEGORIES_DEFAULT as readonly string[]).indexOf(a);
      const db = (PACK_CATEGORIES_DEFAULT as readonly string[]).indexOf(b);
      if (da !== -1 && db !== -1) return da - db;
      if (da !== -1) return -1;
      if (db !== -1) return 1;
      return a.localeCompare(b);
    });
    return cats.map((c) => ({ cat: c, items: map.get(c)! }));
  }, [visible]);

  // Progress pro Bereich
  const stats = useMemo(() => {
    const calc = (items: PacklistItem[]) => ({
      packed: items.filter((p) => p.packed).length,
      total: items.length,
    });
    return {
      all: calc(visible),
      gemeinsam: calc(visible.filter((p) => p.scope === "geteilt")),
      A: calc(visible.filter((p) => p.scope === "A")),
      D: calc(visible.filter((p) => p.scope === "D")),
    };
  }, [visible]);

  if (!activity) return null;

  const submit = () => {
    const t = input.trim();
    if (!t) return;
    addItem(activity.id, t, newScope, newCategory);
    setInput("");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <h2 className="uplabel text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
          Packliste{" "}
          {stats.all.total > 0 && (
            <span style={{ color: "var(--muted)" }}>
              · {stats.all.packed}/{stats.all.total}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTemplatePickerOpen(true)}
            className="tap inline-flex items-center gap-1 normal-case tracking-normal text-[11px] font-medium"
            style={{ color: "var(--terra)" }}
          >
            <Layers size={11} strokeWidth={2} /> Vorlage
          </button>
          {stats.all.total > 0 && (
            <button
              type="button"
              onClick={() => resetPack(activity.id)}
              className="tap inline-flex items-center gap-1 normal-case tracking-normal text-[11px] font-medium"
              style={{ color: "var(--ink-soft)" }}
            >
              <RotateCcw size={11} strokeWidth={2} /> reset
            </button>
          )}
        </div>
      </div>

      {/* Wer-packt-was Header */}
      {stats.all.total > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <ProgressMini
            label="Gemeinsam"
            packed={stats.gemeinsam.packed}
            total={stats.gemeinsam.total}
            color="var(--sage)"
          />
          <ProgressMini
            label={USERS.A.name}
            packed={stats.A.packed}
            total={stats.A.total}
            color={USERS.A.color}
          />
          <ProgressMini
            label={USERS.D.name}
            packed={stats.D.packed}
            total={stats.D.total}
            color={USERS.D.color}
          />
        </div>
      )}

      {/* Items gruppiert nach Kategorie */}
      <div className="space-y-2.5">
        {grouped.length === 0 && (
          <Card className="p-4">
            <p className="text-[13px] italic text-center" style={{ color: "var(--ink-soft)" }}>
              Noch nichts zu packen. Tippe unten ein Item oder wähle eine Vorlage.
            </p>
          </Card>
        )}
        {grouped.map(({ cat, items }) => {
          const packed = items.filter((p) => p.packed).length;
          const done = packed === items.length;
          return (
            <div key={cat}>
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span
                  className="uplabel text-[10px]"
                  style={{ color: done ? "var(--sage)" : "var(--ink-soft)" }}
                >
                  {cat}
                </span>
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                  · {packed}/{items.length}
                </span>
                {done && <Check size={11} strokeWidth={2.25} color="var(--sage)" />}
              </div>
              <Card className="p-1">
                {items.map((p, i) => (
                  <PackRow
                    key={p.id}
                    item={p}
                    last={i === items.length - 1}
                    currentUser={currentUser}
                    onToggle={() => toggleItem(activity.id, p.id)}
                    onRemove={() => removeItem(activity.id, p.id)}
                    onCategoryChange={(c) =>
                      updateItem(activity.id, p.id, { category: c })
                    }
                    onScopeCycle={() => {
                      const next: Scope =
                        p.scope === "geteilt" ? "A" : p.scope === "A" ? "D" : "geteilt";
                      updateItem(activity.id, p.id, { scope: next });
                    }}
                    knownCategories={knownCategories}
                  />
                ))}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Add-Row */}
      <div className="mt-3">
        <div className="flex gap-2 items-stretch">
          <div
            className="flex-1 flex items-center rounded-2xl px-3"
            style={{ background: "rgba(228,217,191,0.5)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Was muss noch mit?"
              className="flex-1 bg-transparent text-[14px] py-2.5"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <button
            type="button"
            onClick={submit}
            className="px-3 rounded-2xl tap text-white"
            style={{ background: "var(--terra)" }}
            aria-label="Item hinzufügen"
          >
            <Plus size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 items-center">
          <CategoryPicker
            value={newCategory}
            onChange={setNewCategory}
            knownCategories={knownCategories}
          />
          <button
            type="button"
            onClick={() => setNewScope("geteilt")}
            className="tap text-[11px] rounded-full px-2.5 py-1 font-medium inline-flex items-center gap-1"
            style={
              newScope === "geteilt"
                ? { background: "var(--paper)", color: "var(--ink)" }
                : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
            }
          >
            <Users size={11} strokeWidth={1.75} /> gemeinsam
          </button>
          <button
            type="button"
            onClick={() => setNewScope(currentUser)}
            className="tap text-[11px] rounded-full px-2.5 py-1 font-medium inline-flex items-center gap-1"
            style={
              newScope === currentUser
                ? { background: "var(--paper)", color: "var(--ink)" }
                : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
            }
          >
            <Lock size={11} strokeWidth={2} /> nur ich
          </button>
        </div>
      </div>

      <PacklistTemplatePicker
        open={templatePickerOpen}
        activityId={activity.id}
        onClose={() => setTemplatePickerOpen(false)}
      />
    </>
  );
}

function ProgressMini({
  label,
  packed,
  total,
  color,
}: {
  label: string;
  packed: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;
  return (
    <Card className="px-2.5 py-2">
      <div className="uplabel text-[9px]" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="text-[13px] font-semibold mono mt-0.5">
        {packed}/{total}
      </div>
      <div
        className="mt-1 h-1 rounded-full overflow-hidden"
        style={{ background: "var(--cream-deep)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </Card>
  );
}

function PackRow({
  item,
  last,
  currentUser,
  onToggle,
  onRemove,
  onCategoryChange,
  onScopeCycle,
  knownCategories,
}: {
  item: PacklistItem;
  last: boolean;
  currentUser: UserId;
  onToggle: () => void;
  onRemove: () => void;
  onCategoryChange: (c: string) => void;
  onScopeCycle: () => void;
  knownCategories: string[];
}) {
  void currentUser;
  const scopeBg =
    item.scope === "geteilt"
      ? "var(--sage)"
      : item.scope === "A"
        ? USERS.A.color
        : USERS.D.color;
  const scopeLabel = item.scope === "geteilt" ? "G" : item.scope;

  return (
    <div
      className="flex items-center gap-2 px-2 py-2"
      style={last ? undefined : { borderBottom: "1px solid rgba(218,201,168,0.4)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-5 h-5 rounded-md tap shrink-0 flex items-center justify-center"
        style={
          item.packed
            ? { background: "var(--sage)", color: "white" }
            : { background: "var(--paper)", border: "1px solid rgba(151,134,117,0.6)" }
        }
        aria-label={item.packed ? "Nicht gepackt" : "Eingepackt"}
      >
        {item.packed && <Check size={13} strokeWidth={3} />}
      </button>
      <div
        className="flex-1 text-[13.5px] truncate"
        style={
          item.packed
            ? { textDecoration: "line-through", color: "var(--muted)" }
            : undefined
        }
      >
        {item.text}
      </div>
      <div className="hidden sm:block">
        <CategoryPicker
          value={item.category}
          onChange={onCategoryChange}
          knownCategories={knownCategories}
        />
      </div>
      <button
        type="button"
        onClick={onScopeCycle}
        className="tap inline-flex items-center justify-center rounded-full text-white font-semibold text-[10px]"
        style={{ width: 20, height: 20, background: scopeBg }}
        aria-label={`Scope: ${item.scope}`}
      >
        {scopeLabel}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="tap p-1"
        style={{ color: "var(--muted)" }}
        aria-label="Entfernen"
      >
        <X size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
}
