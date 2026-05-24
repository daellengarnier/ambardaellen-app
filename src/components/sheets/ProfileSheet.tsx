"use client";

import { useState } from "react";
import { Lock, LogOut, Check, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Sheet } from "../Sheet";
import { Avatar } from "../Avatar";
import { useStore } from "@/lib/store";
import { USERS } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProfileSheet({ open, onClose }: Props) {
  if (!open) return null;
  return <ProfileInner onClose={onClose} />;
}

function ProfileInner({ onClose }: { onClose: () => void }) {
  const account = useStore((s) => s.account);
  const currentUser = useStore((s) => s.currentUser);
  const cloudStatus = useStore((s) => s.cloudStatus);
  const cloudError = useStore((s) => s.cloudError);
  const cloudVersion = useStore((s) => s.cloudVersion);
  const pendingPush = useStore((s) => s.pendingPush);
  const logout = useStore((s) => s.logout);
  const changePassword = useStore((s) => s.changePassword);

  const [showPwChange, setShowPwChange] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  if (!account) {
    return (
      <Sheet open onClose={onClose} title="Profil">
        <p style={{ color: "var(--ink-soft)" }}>Nicht angemeldet.</p>
      </Sheet>
    );
  }

  const submitPw = async () => {
    setPwError(null);
    setPwSuccess(false);
    if (newPw !== newPw2) {
      setPwError("Neue Passwörter stimmen nicht überein.");
      return;
    }
    setPwBusy(true);
    const res = await changePassword(oldPw, newPw);
    setPwBusy(false);
    if (res.ok) {
      setPwSuccess(true);
      setOldPw("");
      setNewPw("");
      setNewPw2("");
      setShowPwChange(false);
    } else {
      setPwError(res.error);
    }
  };

  const statusLabel =
    cloudStatus === "syncing" || pendingPush
      ? "synchronisiert…"
      : cloudStatus === "loading"
        ? "lädt…"
        : cloudStatus === "error"
          ? "Fehler"
          : "synchron";
  const StatusIcon =
    cloudStatus === "error" ? CloudOff : cloudStatus === "syncing" ? RefreshCw : Cloud;
  const statusColor =
    cloudStatus === "error"
      ? "#C5634B"
      : cloudStatus === "syncing" || pendingPush
        ? "var(--terra)"
        : "var(--sage)";

  return (
    <Sheet open onClose={onClose} title="Profil">
      <div className="flex items-center gap-3 mb-4">
        <Avatar id={currentUser} size={56} />
        <div className="min-w-0">
          <div className="serif text-[22px] leading-tight" style={{ color: "var(--mens)" }}>
            {USERS[currentUser].name}
          </div>
          <div className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            {account.email}
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <Row
          label="Sichtbar als"
          value={
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: USERS[currentUser].color }}
              />
              {USERS[currentUser].name}
            </span>
          }
        />
        <Row
          label="Cloud"
          value={
            <span className="inline-flex items-center gap-1.5" style={{ color: statusColor }}>
              <StatusIcon size={12} strokeWidth={1.75} />
              {statusLabel}
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                v{cloudVersion}
              </span>
            </span>
          }
        />
        {cloudError && (
          <div className="text-[11.5px] py-1.5" style={{ color: "#C5634B" }}>
            {cloudError}
          </div>
        )}
      </div>

      {!showPwChange ? (
        <button
          type="button"
          onClick={() => setShowPwChange(true)}
          className="tap w-full py-3 rounded-2xl text-[14px] font-medium inline-flex items-center justify-center gap-2"
          style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
        >
          <Lock size={14} strokeWidth={1.75} /> Passwort ändern
        </button>
      ) : (
        <div className="rounded-2xl p-3" style={{ background: "rgba(228,217,191,0.5)" }}>
          <div className="uplabel text-[10px] mb-2" style={{ color: "var(--muted)" }}>
            Passwort ändern
          </div>
          <input
            type="password"
            placeholder="Aktuelles Passwort"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-[14px] mb-2"
            style={{ background: "var(--paper)" }}
          />
          <input
            type="password"
            placeholder="Neues Passwort (min. 6 Zeichen)"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-[14px] mb-2"
            style={{ background: "var(--paper)" }}
          />
          <input
            type="password"
            placeholder="Neues Passwort bestätigen"
            value={newPw2}
            onChange={(e) => setNewPw2(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-[14px]"
            style={{ background: "var(--paper)" }}
          />
          {pwError && (
            <p className="text-[12px] mt-2" style={{ color: "#C5634B" }}>
              {pwError}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setShowPwChange(false);
                setOldPw("");
                setNewPw("");
                setNewPw2("");
                setPwError(null);
              }}
              className="tap flex-1 py-2.5 rounded-xl text-[13.5px] font-medium"
              style={{ background: "var(--paper)", color: "var(--ink-soft)" }}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={submitPw}
              disabled={pwBusy || !oldPw || !newPw}
              className="tap flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold text-white"
              style={{ background: pwBusy ? "var(--terra-soft)" : "var(--terra)" }}
            >
              {pwBusy ? "…" : "Speichern"}
            </button>
          </div>
        </div>
      )}

      {pwSuccess && (
        <div
          className="mt-3 rounded-xl p-2.5 text-[12.5px] inline-flex items-center gap-2"
          style={{ background: "rgba(126,151,123,0.18)", color: "#4F6B4C" }}
        >
          <Check size={13} strokeWidth={2} /> Passwort geändert.
        </div>
      )}

      <button
        type="button"
        onClick={async () => {
          await logout();
          onClose();
        }}
        className="tap w-full mt-5 py-3 rounded-2xl text-[14px] font-medium inline-flex items-center justify-center gap-2"
        style={{ background: "var(--cream-deep)", color: "var(--terra-deep)" }}
      >
        <LogOut size={14} strokeWidth={1.75} /> Abmelden
      </button>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: "1px solid rgba(218,201,168,0.4)" }}
    >
      <div className="uplabel text-[10px]" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="text-[13.5px]">{value}</div>
    </div>
  );
}
