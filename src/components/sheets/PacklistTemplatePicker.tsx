"use client";

import { useState } from "react";
import { Plus, Pencil, ChevronRight, Layers } from "lucide-react";
import { Sheet } from "../Sheet";
import { Empty } from "../Empty";
import { PacklistTemplateEditor } from "./PacklistTemplateEditor";
import { useStore } from "@/lib/store";

type Props = {
  open: boolean;
  activityId: string;
  onClose: () => void;
};

export function PacklistTemplatePicker({ open, activityId, onClose }: Props) {
  const templates = useStore((s) => s.packlistTemplates);
  const currentUser = useStore((s) => s.currentUser);
  const applyTemplate = useStore((s) => s.applyPacklistTemplate);
  const addTemplate = useStore((s) => s.addPacklistTemplate);

  const [editingId, setEditingId] = useState<string | null>(null);

  const visible = templates.filter(
    (t) => t.scope === "geteilt" || t.scope === currentUser,
  );

  if (!open) return null;

  return (
    <>
      <Sheet open onClose={onClose} title="Packlisten-Vorlagen">
        <p className="text-[13px] mb-3" style={{ color: "var(--ink-soft)" }}>
          Wähle eine Vorlage — alle Items werden zur Packliste hinzugefügt. Du
          kannst Vorlagen auch selber erstellen und nach deinem Gusto bearbeiten.
        </p>

        {visible.length === 0 ? (
          <Empty
            icon={<Layers size={22} strokeWidth={1.75} />}
            title="Noch keine Vorlage"
            body={'Erstelle deine erste — z.B. „Strand“, „Wandern“, „Wochenende“.'}
          />
        ) : (
          <div className="space-y-2">
            {visible.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl p-3 flex items-center gap-3"
                style={{ background: "rgba(228,217,191,0.4)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    applyTemplate(activityId, tpl.id);
                    onClose();
                  }}
                  className="tap flex-1 min-w-0 text-left"
                >
                  <div className="text-[14.5px] font-medium truncate">{tpl.name}</div>
                  <div className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                    {tpl.items.length} {tpl.items.length === 1 ? "Item" : "Items"}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(tpl.id)}
                  className="tap w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
                  aria-label="Bearbeiten"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                </button>
                <ChevronRight size={14} strokeWidth={1.75} color="var(--muted)" />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            const id = addTemplate("Neue Vorlage");
            if (id) setEditingId(id);
          }}
          className="w-full mt-4 py-3 rounded-2xl text-[14px] font-semibold tap inline-flex items-center justify-center gap-2"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          <Plus size={16} strokeWidth={2.25} /> Neue Vorlage erstellen
        </button>
      </Sheet>

      <PacklistTemplateEditor
        templateId={editingId}
        onClose={() => setEditingId(null)}
      />
    </>
  );
}
