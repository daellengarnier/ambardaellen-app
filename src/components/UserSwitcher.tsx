"use client";

import { useStore } from "@/lib/store";
import { USERS } from "@/lib/types";
import { Avatar } from "./Avatar";

export function UserSwitcher() {
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  return (
    <div className="w-full flex flex-col items-center gap-2 pb-6">
      <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--ink-soft)]/70">
        Du bist gerade
      </div>
      <div
        className="inline-flex items-center gap-1 p-1 rounded-full shadow-card"
        style={{ background: "rgba(251,246,232,0.85)" }}
      >
        {(Object.keys(USERS) as Array<"A" | "D">).map((id) => {
          const u = USERS[id];
          const active = currentUser === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setCurrentUser(id)}
              className="tap inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1"
              style={
                active
                  ? { background: "var(--paper)", boxShadow: "0 1px 2px rgba(33,25,19,0.04)" }
                  : undefined
              }
            >
              <Avatar id={id} size={22} />
              <span
                className="text-[13px]"
                style={{
                  color: active ? "var(--ink)" : "var(--ink-soft)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {u.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
