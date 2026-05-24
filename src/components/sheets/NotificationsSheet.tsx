"use client";

import {
  ShoppingCart,
  ListTodo,
  Calendar as CalIcon,
  Backpack,
  AlertTriangle,
  Sun,
  Sparkles,
  Bell,
} from "lucide-react";
import { Sheet } from "../Sheet";
import { Avatar } from "../Avatar";
import { USERS } from "@/lib/types";
import type { FeedEvent, FeedKind, FeedSections } from "@/lib/feed";

type Props = {
  open: boolean;
  onClose: () => void;
  feed?: FeedSections;
};

const ICON_FOR: Record<FeedKind, React.ReactNode> = {
  shopping_added: <ShoppingCart size={14} strokeWidth={1.75} />,
  todo_added: <ListTodo size={14} strokeWidth={1.75} />,
  activity_today: <CalIcon size={14} strokeWidth={1.75} />,
  todo_due_today: <ListTodo size={14} strokeWidth={1.75} />,
  todo_overdue: <AlertTriangle size={14} strokeWidth={1.75} />,
  trip_upcoming: <Backpack size={14} strokeWidth={1.75} />,
};

function formatRelative(at?: number): string {
  if (!at) return "";
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} Std`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} T.`;
  return new Date(at).toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function NotificationsSheet({ open, onClose, feed }: Props) {
  if (!open || !feed) return null;

  const isEmpty =
    feed.neu.length === 0 &&
    feed.heute.length === 0 &&
    feed.ueberfaellig.length === 0 &&
    feed.trips.length === 0;

  return (
    <Sheet open onClose={onClose} title="Was ist los?">
      {isEmpty && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: "rgba(228,217,191,0.5)" }}
        >
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-2xl inline-flex items-center justify-center"
            style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
          >
            <Sparkles size={20} strokeWidth={1.75} />
          </div>
          <div className="text-[14.5px] font-medium mb-1">Nichts Neues.</div>
          <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
            Kein Termin heute, nichts überfällig, keine frischen Einträge.
          </div>
        </div>
      )}

      {feed.neu.length > 0 && (
        <Section
          title="Neu seit du zuletzt da warst"
          icon={<Bell size={11} strokeWidth={2} />}
          accent="var(--mens)"
        >
          {feed.neu.map((e) => (
            <FeedRow key={e.id} event={e} showRelative />
          ))}
        </Section>
      )}

      {feed.heute.length > 0 && (
        <Section
          title="Heute"
          icon={<Sun size={11} strokeWidth={2} />}
          accent="var(--terra)"
        >
          {feed.heute.map((e) => (
            <FeedRow key={e.id} event={e} />
          ))}
        </Section>
      )}

      {feed.ueberfaellig.length > 0 && (
        <Section
          title="Überfällig"
          icon={<AlertTriangle size={11} strokeWidth={2} />}
          accent="#C5634B"
        >
          {feed.ueberfaellig.map((e) => (
            <FeedRow key={e.id} event={e} />
          ))}
        </Section>
      )}

      {feed.trips.length > 0 && (
        <Section
          title="Anstehende Reisen"
          icon={<Backpack size={11} strokeWidth={2} />}
          accent="var(--plum)"
        >
          {feed.trips.map((e) => (
            <FeedRow key={e.id} event={e} />
          ))}
        </Section>
      )}

      <p
        className="text-[11px] mt-5 italic text-center"
        style={{ color: "var(--muted)" }}
      >
        Push-Benachrichtigungen (z. B. Morgen-Erinnerung am Tag des Termins,
        Packlisten-Erinnerung 3 T. vor der Reise) folgen — sobald die App
        als Home-Screen-PWA auf eurem iPhone installiert ist.
      </p>
    </Sheet>
  );
}

function Section({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div
        className="uplabel text-[10.5px] mb-1.5 inline-flex items-center gap-1.5"
        style={{ color: accent }}
      >
        {icon}
        {title}
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--paper)" }}
      >
        {children}
      </div>
    </div>
  );
}

function FeedRow({
  event,
  showRelative,
}: {
  event: FeedEvent;
  showRelative?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2.5"
      style={{ borderBottom: "1px solid rgba(218,201,168,0.4)" }}
    >
      <div
        className="w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
      >
        {ICON_FOR[event.kind]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium leading-tight truncate">
          {event.title}
        </div>
        <div
          className="text-[11.5px] mt-0.5 flex items-center gap-1.5"
          style={{ color: "var(--muted)" }}
        >
          {event.by && (
            <span className="inline-flex items-center gap-1">
              <Avatar id={event.by} size={12} />
              {USERS[event.by].name}
            </span>
          )}
          {event.by && (event.detail || (showRelative && event.at)) && (
            <span>·</span>
          )}
          {event.detail && <span className="truncate">{event.detail}</span>}
          {showRelative && event.at && (
            <span className="ml-auto shrink-0">{formatRelative(event.at)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
