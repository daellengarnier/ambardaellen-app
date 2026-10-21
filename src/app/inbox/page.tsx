"use client";

import { useState } from "react";
import { ArrowUp, Inbox as InboxIcon, MessageCircle, Sparkles } from "lucide-react";
import { useLife } from "@/lib/lifeStore";
import type { InboxDto } from "@/lib/life";
import { relativeWhen } from "@/lib/date";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Empty } from "@/components/Empty";
import { ClientOnly } from "@/components/ClientOnly";
import { TodoAddSheet } from "@/components/sheets/TodoAddSheet";

export default function InboxPage() {
  return (
    <ClientOnly fallback={<ScreenHeader title="Inbox" subtitle="—" />}>
      <InboxContent />
    </ClientOnly>
  );
}

const SOURCE_ICON: Record<string, typeof InboxIcon> = {
  telegram: MessageCircle,
  jarvis: Sparkles,
};

function InboxContent() {
  const inbox = useLife((s) => s.inbox);
  const loaded = useLife((s) => s.loaded);
  const addInbox = useLife((s) => s.addInbox);
  const processInbox = useLife((s) => s.processInbox);
  const dismissInbox = useLife((s) => s.dismissInbox);
  const removeInbox = useLife((s) => s.removeInbox);

  const [input, setInput] = useState("");
  const [open, setOpen] = useState<InboxDto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const submit = () => {
    if (!input.trim()) return;
    addInbox(input);
    setInput("");
  };

  const close = () => {
    setOpen(null);
    setConfirmDelete(false);
  };

  return (
    <>
      <ScreenHeader title="Inbox" subtitle={inbox.length === 1 ? "1 unsortiert" : `${inbox.length} unsortiert`} />

      <div className="px-4 pb-3">
        <Card className="p-2">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={2}
              placeholder="Was geht dir durch den Kopf? Jarvis sortiert es ein."
              className="flex-1 bg-transparent text-[14.5px] px-1.5 py-1 resize-none min-w-0"
              style={{ color: "var(--ink)" }}
            />
            <button
              type="button"
              onClick={submit}
              className="tap w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{ background: input.trim() ? "var(--terra)" : "var(--terra-soft)" }}
              aria-label="In die Inbox"
            >
              <ArrowUp size={17} strokeWidth={2.25} />
            </button>
          </div>
        </Card>
      </div>

      <div className="px-4">
        {loaded && inbox.length === 0 ? (
          <Empty
            icon={<InboxIcon size={22} strokeWidth={1.75} />}
            title="Inbox leer"
            body="Alles einsortiert. Neues landet hier, auch was du @daellen_bot schreibst."
          />
        ) : (
          <Card className="p-1">
            {inbox.map((it, i) => {
              const Icon = SOURCE_ICON[it.source] ?? InboxIcon;
              return (
                <div
                  key={it.id}
                  onClick={() => setOpen(it)}
                  role="button"
                  tabIndex={0}
                  className="flex items-start gap-2.5 px-3 py-2.5 tap cursor-pointer"
                  style={i < inbox.length - 1 ? { borderBottom: "1px solid var(--cream-deep)" } : undefined}
                >
                  <Icon size={15} strokeWidth={1.75} color="var(--muted)" className="mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] whitespace-pre-line break-words">{it.text}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                      {relativeWhen(Date.parse(it.createdAt))}
                      {it.source !== "app" && ` · ${it.source}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      <TodoAddSheet
        open={open !== null}
        onClose={close}
        title="Einsortieren"
        submitLabel="Als Aufgabe übernehmen"
        initialText={open?.text.split("\n")[0].slice(0, 500) ?? ""}
        onSubmit={(input) => {
          if (!open) return;
          const firstLine = open.text.split("\n")[0];
          // Mehrzeilige Notizen: der Rest wandert in die Notiz.
          const rest = open.text.slice(firstLine.length).trim();
          processInbox(open.id, { ...input, note: [input.note, rest].filter(Boolean).join("\n\n") });
        }}
        footer={
          open && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  dismissInbox(open.id);
                  close();
                }}
                className="tap flex-1 py-2.5 rounded-2xl text-[13.5px] font-medium"
                style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
              >
                Erledigt, keine Aufgabe
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  removeInbox(open.id);
                  close();
                }}
                className="tap px-4 py-2.5 rounded-2xl text-[13.5px] font-medium"
                style={
                  confirmDelete
                    ? { background: "var(--terra)", color: "white" }
                    : { background: "var(--cream-deep)", color: "var(--ink-soft)" }
                }
              >
                {confirmDelete ? "Wirklich löschen?" : "Löschen"}
              </button>
            </div>
          )
        }
      />
    </>
  );
}
