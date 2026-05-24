"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLastSeen } from "@/lib/useLastSeen";
import { buildFeed } from "@/lib/feed";
import { NotificationsSheet } from "./sheets/NotificationsSheet";

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [lastSeen, markSeen] = useLastSeen();
  const activities = useStore((s) => s.activities);
  const shopping = useStore((s) => s.shopping);
  const todos = useStore((s) => s.todos);
  const currentUser = useStore((s) => s.currentUser);

  const feed = useMemo(
    () => buildFeed({ activities, shopping, todos, currentUser, lastSeen }),
    [activities, shopping, todos, currentUser, lastSeen],
  );

  const newCount = feed.neu.length;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          markSeen();
        }}
        className="tap relative w-9 h-9 rounded-full inline-flex items-center justify-center shadow-card"
        style={{ background: "var(--paper)" }}
        aria-label={
          newCount > 0
            ? `Benachrichtigungen — ${newCount} neue`
            : "Benachrichtigungen"
        }
      >
        <Bell size={16} strokeWidth={1.75} color="var(--ink-soft)" />
        {newCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9.5px] font-bold text-white inline-flex items-center justify-center"
            style={{ background: "var(--mens)" }}
          >
            {newCount > 9 ? "9+" : newCount}
          </span>
        )}
      </button>

      <NotificationsSheet
        open={open}
        onClose={() => setOpen(false)}
        feed={feed}
      />
    </>
  );
}
