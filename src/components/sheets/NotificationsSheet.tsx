"use client";

import { BellOff, Bell } from "lucide-react";
import { Sheet } from "../Sheet";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NotificationsSheet({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <Sheet open onClose={onClose} title="Benachrichtigungen">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-2xl inline-flex items-center justify-center"
          style={{ background: "var(--cream-deep)", color: "var(--ink-soft)" }}
        >
          <BellOff size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="serif-i text-[20px] leading-tight">Bald verfügbar</div>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            sanfte Erinnerungen, ohne Druck
          </div>
        </div>
      </div>

      <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
        Push-Benachrichtigungen für die PWA setzen wir bewusst zurückhaltend ein.
        Geplant für später (in dieser Reihenfolge):
      </p>

      <ul
        className="rounded-2xl overflow-hidden text-[13.5px]"
        style={{ background: "var(--paper)" }}
      >
        {[
          ["Termine am Tag selbst", "Eine sanfte Erinnerung am Morgen für die heutigen Aktivitäten."],
          ["Überfällige Aufgaben", "Wenn etwas zu lange offen liegt — höchstens einmal pro Tag."],
          ["Trip-Countdown", "3 Tage vor einer Reise: Packliste-Erinnerung."],
          ["Zyklus-Hinweise (Ambar)", "Periode/Eisprung — nur für Ambar, nur wenn aktiviert."],
        ].map(([t, sub], i, arr) => (
          <li
            key={t}
            className="px-3.5 py-2.5"
            style={
              i < arr.length - 1
                ? { borderBottom: "1px solid rgba(218,201,168,0.4)" }
                : undefined
            }
          >
            <div className="flex items-start gap-2.5">
              <Bell size={13} strokeWidth={1.75} color="var(--muted)" className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium">{t}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>
                  {sub}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[11.5px] mt-3 italic" style={{ color: "var(--muted)" }}>
        iOS verlangt für Push-Notifications dass die App als Home-Screen-PWA
        installiert wurde.
      </p>
    </Sheet>
  );
}
