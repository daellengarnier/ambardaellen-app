"use client";

import { useState } from "react";
import { Plus, X, Trash2, Users, Lock } from "lucide-react";
import { Sheet } from "../Sheet";
import { ScopeToggle } from "../ScopeToggle";
import { useStore } from "@/lib/store";
import { USERS, type Scope } from "@/lib/types";

type Props = {
  templateId: string | null;
  onClose: () => void;
};

export function PacklistTemplateEditor({ templateId, onClose }: Props) {
  const templates = useStore((s) => s.packlistTemplates);
  const currentUser = useStore((s) => s.currentUser);
  const updateTemplate = useStore((s) => s.updatePacklistTemplate);
  const removeTemplate = useStore((s) => s.removePacklistTemplate);
  const addItem = useStore((s) => s.addTemplateItem);
  const updateItem = useStore((s) => s.updateTemplateItem);
  const removeItem = useStore((s) => s.removeTemplateItem);

  const [newItem, setNewItem] = useState("");
  const [newScope, setNewScope] = useState<Scope>("geteilt");

  const tpl = templateId ? templates.find((t) => t.id === templateId) ?? null : null;
  if (!tpl) return null;

  const submitItem = () => {
    if (!newItem.trim()) return;
    addItem(tpl.id, newItem, newScope);
    setNewItem("");
  };

  return (
    <Sheet open onClose={onClose} title="Vorlage bearbeiten">
      <div className="mt-2">
        <div className="uplabel text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>
          Name
        </div>
        <input
          value={tpl.name}
          onChange={(e) => updateTemplate(tpl.id, { name: e.target.value })}
          placeholder="z. B. Wochenende"
          className="w-full rounded-2xl px-3.5 py-3 text-[15px]"
          style={{ background: "rgba(228,217,191,0.5)" }}
        />
      </div>

      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="uplabel text-[10.5px]" style={{ color: "var(--muted)" }}>
          Sichtbar für
        </div>
        <ScopeToggle
          value={tpl.scope}
          onChange={(s) => updateTemplate(tpl.id, { scope: s })}
          currentUser={currentUser}
          compact
        />
      </div>

      <div className="uplabel text-[10.5px] mt-4 mb-2" style={{ color: "var(--muted)" }}>
        Items · {tpl.items.length}
      </div>

      {tpl.items.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden mb-2"
          style={{ background: "rgba(228,217,191,0.4)" }}
        >
          {tpl.items.map((it, i) => (
            <div
              key={it.id}
              className="flex items-center gap-2 px-3 py-2"
              style={
                i < tpl.items.length - 1
                  ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                  : undefined
              }
            >
              <input
                value={it.text}
                onChange={(e) =>
                  updateItem(tpl.id, it.id, { text: e.target.value })
                }
                className="flex-1 bg-transparent text-[13.5px] min-w-0"
                style={{ color: "var(--ink)" }}
              />
              <ScopeCycle
                value={it.scope}
                onChange={(s) => updateItem(tpl.id, it.id, { scope: s })}
                currentUser={currentUser}
              />
              <button
                type="button"
                onClick={() => removeItem(tpl.id, it.id)}
                className="tap p-1"
                style={{ color: "var(--muted)" }}
                aria-label="Item entfernen"
              >
                <X size={13} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Item */}
      <div className="flex gap-2 items-stretch">
        <div
          className="flex-1 flex items-center rounded-2xl px-3"
          style={{ background: "rgba(228,217,191,0.5)" }}
        >
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitItem();
            }}
            placeholder="Item hinzufügen…"
            className="flex-1 bg-transparent text-[14px] py-2.5"
            style={{ color: "var(--ink)" }}
          />
        </div>
        <button
          type="button"
          onClick={submitItem}
          className="px-3 rounded-2xl tap text-white"
          style={{ background: "var(--terra)" }}
          aria-label="Hinzufügen"
        >
          <Plus size={16} strokeWidth={2.4} />
        </button>
      </div>
      <div className="flex gap-1.5 mt-1.5">
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
          <Lock size={11} strokeWidth={2} /> für {USERS[currentUser].name}
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm(`Vorlage „${tpl.name}" wirklich löschen?`)) {
            removeTemplate(tpl.id);
            onClose();
          }
        }}
        className="w-full mt-6 py-3 rounded-2xl text-[14px] font-medium tap inline-flex items-center justify-center gap-2"
        style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
      >
        <Trash2 size={14} strokeWidth={1.75} /> Vorlage löschen
      </button>
    </Sheet>
  );
}

/** Kleiner inline-Toggle: rotiert durch geteilt → A → D */
function ScopeCycle({
  value,
  onChange,
  currentUser,
}: {
  value: Scope;
  onChange: (s: Scope) => void;
  currentUser: "A" | "D";
}) {
  const next = (): Scope => {
    if (value === "geteilt") return "A";
    if (value === "A") return "D";
    return "geteilt";
  };
  const label = value === "geteilt" ? "G" : value;
  const bg =
    value === "geteilt"
      ? "var(--sage)"
      : value === "A"
        ? USERS.A.color
        : USERS.D.color;
  void currentUser;
  return (
    <button
      type="button"
      onClick={() => onChange(next())}
      className="tap inline-flex items-center justify-center rounded-full text-white font-semibold text-[10px]"
      style={{ width: 20, height: 20, background: bg }}
      aria-label={`Scope ändern (aktuell: ${value})`}
    >
      {label}
    </button>
  );
}
