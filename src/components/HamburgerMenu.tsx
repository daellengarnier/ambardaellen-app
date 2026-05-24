"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, UserCircle2, Bell, Layers, LogOut, ArrowLeftRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { USERS, type UserId } from "@/lib/types";
import { Avatar } from "./Avatar";
import { ProfileSheet } from "./sheets/ProfileSheet";
import { NotificationsSheet } from "./sheets/NotificationsSheet";
import { PacklistTemplatesManagerSheet } from "./sheets/PacklistTemplatesManagerSheet";

type Open = "profile" | "notifications" | "templates" | null;

export function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<Open>(null);
  const ref = useRef<HTMLDivElement>(null);

  const loggedInEmail = useStore((s) => s.loggedInEmail);
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const logout = useStore((s) => s.logout);

  const otherUser: UserId = currentUser === "A" ? "D" : "A";

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="tap inline-flex items-center gap-1 rounded-full px-2 py-1 shadow-card"
        style={{ background: "var(--paper)" }}
        aria-label={menuOpen ? "Menü schliessen" : "Menü öffnen"}
        aria-expanded={menuOpen}
      >
        <Avatar id={currentUser} size={26} />
        {menuOpen ? (
          <X size={16} strokeWidth={2} color="var(--ink-soft)" />
        ) : (
          <Menu size={16} strokeWidth={2} color="var(--ink-soft)" />
        )}
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[70]"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 rounded-2xl shadow-float p-1.5 z-[71]"
            style={{ background: "var(--paper)", minWidth: 240 }}
          >
            {/* Aktueller User */}
            <div
              className="px-3 py-2 rounded-xl mb-1 flex items-center gap-2 w-full"
              style={{ background: "var(--cream-deep)" }}
            >
              <Avatar id={currentUser} size={28} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold leading-tight">
                  {USERS[currentUser].name}
                </div>
                <div className="text-[10.5px] truncate" style={{ color: "var(--muted)" }}>
                  {loggedInEmail}
                </div>
              </div>
            </div>

            {/* Profil-Switch */}
            <button
              type="button"
              onClick={() => {
                setCurrentUser(otherUser);
                setMenuOpen(false);
              }}
              className="tap w-full inline-flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px]"
              style={{ color: "var(--ink-soft)" }}
            >
              <Avatar id={otherUser} size={22} dim />
              <span className="flex-1 text-left">
                Als <span className="font-semibold" style={{ color: "var(--ink)" }}>{USERS[otherUser].name}</span> ansehen
              </span>
              <ArrowLeftRight size={13} strokeWidth={1.75} color="var(--muted)" />
            </button>

            <div className="border-t my-1" style={{ borderColor: "var(--line)" }} />

            <MenuItem
              icon={<UserCircle2 size={16} strokeWidth={1.75} />}
              label="Profil verwalten"
              onClick={() => {
                setSheet("profile");
                setMenuOpen(false);
              }}
            />
            <MenuItem
              icon={<Bell size={16} strokeWidth={1.75} />}
              label="Benachrichtigungen"
              onClick={() => {
                setSheet("notifications");
                setMenuOpen(false);
              }}
            />
            <MenuItem
              icon={<Layers size={16} strokeWidth={1.75} />}
              label="Packlisten-Vorlagen"
              onClick={() => {
                setSheet("templates");
                setMenuOpen(false);
              }}
            />

            <div className="border-t my-1" style={{ borderColor: "var(--line)" }} />

            <MenuItem
              icon={<LogOut size={16} strokeWidth={1.75} />}
              label="Abmelden"
              color="var(--terra-deep)"
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            />
          </div>
        </>
      )}

      <ProfileSheet open={sheet === "profile"} onClose={() => setSheet(null)} />
      <NotificationsSheet open={sheet === "notifications"} onClose={() => setSheet(null)} />
      <PacklistTemplatesManagerSheet
        open={sheet === "templates"}
        onClose={() => setSheet(null)}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap w-full inline-flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium"
      style={{ color: color ?? "var(--ink)" }}
    >
      <span style={{ color: color ?? "var(--ink-soft)" }}>{icon}</span>
      {label}
    </button>
  );
}
