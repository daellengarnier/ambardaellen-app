"use client";

import { useState } from "react";
import { Plus, X, ShoppingCart, Users, Lock, Check } from "lucide-react";
import { Card } from "../Card";
import { useStore } from "@/lib/store";
import { USERS, type Scope } from "@/lib/types";

export function PreTripShoppingSection({ activityId }: { activityId: string }) {
  const activity = useStore((s) => s.activities.find((a) => a.id === activityId));
  const currentUser = useStore((s) => s.currentUser);
  const addItem = useStore((s) => s.addPreTripItem);
  const toggleItem = useStore((s) => s.togglePreTripItem);
  const removeItem = useStore((s) => s.removePreTripItem);
  const pushToShopping = useStore((s) => s.pushPreTripToShopping);

  const [input, setInput] = useState("");
  const [newScope, setNewScope] = useState<Scope>("geteilt");

  if (!activity) return null;

  const visible = activity.preTripShopping.filter(
    (p) => p.scope === "geteilt" || p.scope === currentUser,
  );
  const open = visible.filter((p) => !p.done);
  const done = visible.filter((p) => p.done);

  const submit = () => {
    const t = input.trim();
    if (!t) return;
    addItem(activity.id, t, newScope);
    setInput("");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <h2 className="uplabel text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
          Vorher besorgen{" "}
          {visible.length > 0 && (
            <span style={{ color: "var(--muted)" }}>
              · {done.length}/{visible.length}
            </span>
          )}
        </h2>
      </div>

      {visible.length === 0 ? (
        <Card className="p-4">
          <p className="text-[13px] italic text-center" style={{ color: "var(--ink-soft)" }}>
            Nichts zu besorgen vor Reisestart.
          </p>
        </Card>
      ) : (
        <Card className="p-1">
          {[...open, ...done].map((p, i, arr) => {
            const scopeBg =
              p.scope === "geteilt"
                ? "var(--sage)"
                : p.scope === "A"
                  ? USERS.A.color
                  : USERS.D.color;
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 px-2 py-2"
                style={
                  i < arr.length - 1
                    ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => toggleItem(activity.id, p.id)}
                  className="w-5 h-5 rounded-md tap shrink-0 flex items-center justify-center"
                  style={
                    p.done
                      ? { background: "var(--sage)", color: "white" }
                      : { background: "var(--paper)", border: "1px solid rgba(151,134,117,0.6)" }
                  }
                  aria-label={p.done ? "Wieder offen" : "Besorgt"}
                >
                  {p.done && <Check size={13} strokeWidth={3} />}
                </button>
                <div
                  className="flex-1 text-[13.5px] truncate"
                  style={
                    p.done
                      ? { textDecoration: "line-through", color: "var(--muted)" }
                      : undefined
                  }
                >
                  {p.text}
                </div>
                <span
                  className="inline-flex items-center justify-center rounded-full text-white font-semibold text-[10px]"
                  style={{ width: 18, height: 18, background: scopeBg }}
                  title={p.scope === "geteilt" ? "Gemeinsam" : USERS[p.scope].name}
                >
                  {p.scope === "geteilt" ? "G" : p.scope}
                </span>
                {!p.done && (
                  <button
                    type="button"
                    onClick={() => pushToShopping(activity.id, p.id)}
                    className="tap p-1"
                    style={{ color: "var(--terra)" }}
                    aria-label="Auf Einkaufsliste pushen"
                    title="Auf Haupt-Einkaufsliste pushen"
                  >
                    <ShoppingCart size={12} strokeWidth={1.75} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(activity.id, p.id)}
                  className="tap p-1"
                  style={{ color: "var(--muted)" }}
                  aria-label="Entfernen"
                >
                  <X size={13} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </Card>
      )}

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
              placeholder="Was muss noch besorgt werden?"
              className="flex-1 bg-transparent text-[14px] py-2.5"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <button
            type="button"
            onClick={submit}
            className="px-3 rounded-2xl tap text-white"
            style={{ background: "var(--terra)" }}
            aria-label="Hinzufügen"
          >
            <Plus size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex gap-1.5 mt-2">
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
    </>
  );
}
