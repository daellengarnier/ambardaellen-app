"use client";

import { useState } from "react";
import { ChevronLeft, Lock, Mail, Heart, LogIn, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "../Avatar";
import { Atmosphere } from "../Atmosphere";
import { ALLOWED_EMAILS, userIdForEmail } from "@/lib/auth";
import { USERS } from "@/lib/types";

type Mode =
  | { kind: "select" }
  | { kind: "login"; email: string }
  | { kind: "register"; email: string };

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>({ kind: "select" });

  return (
    <div className="login-shell">
      <div className="login-atmos" aria-hidden="true">
        <Atmosphere />
      </div>

      <div className="login-content">
        <div className="px-6 pt-10 pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart size={18} strokeWidth={1.75} color="var(--terra)" />
            <span className="serif-i text-[20px]">Ambar &amp; Dällen</span>
          </div>
          <p
            className="text-center text-[13px]"
            style={{ color: "var(--ink-soft)" }}
          >
            unser gemeinsamer Küchentisch — digital
          </p>
        </div>

        {mode.kind === "select" && (
          <SelectScreen
            onLogin={(email) => setMode({ kind: "login", email })}
            onRegister={(email) => setMode({ kind: "register", email })}
          />
        )}

        {mode.kind === "login" && (
          <LoginForm
            email={mode.email}
            onBack={() => setMode({ kind: "select" })}
            onSwitchToRegister={() =>
              setMode({ kind: "register", email: mode.email })
            }
          />
        )}

        {mode.kind === "register" && (
          <RegisterForm
            email={mode.email}
            onBack={() => setMode({ kind: "select" })}
            onSwitchToLogin={() => setMode({ kind: "login", email: mode.email })}
          />
        )}
      </div>

      <style jsx>{`
        .login-shell {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          background: var(--cream);
          isolation: isolate;
          overflow: hidden;
        }
        .login-atmos {
          position: fixed;
          inset: 0;
          left: 50%;
          transform: translateX(-50%);
          max-width: 480px;
          width: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .login-content {
          position: relative;
          z-index: 10;
          min-height: 100dvh;
          padding-top: max(env(safe-area-inset-top), 1rem);
          padding-bottom: max(env(safe-area-inset-bottom), 1rem);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 481px) {
          :global(body) {
            background: var(--cream-deep);
          }
          .login-shell {
            box-shadow:
              0 30px 80px -30px rgba(33, 25, 19, 0.18),
              inset 0 0 0 1px rgba(33, 25, 19, 0.05);
          }
        }
      `}</style>
    </div>
  );
}

function SelectScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string) => void;
  onRegister: (email: string) => void;
}) {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="px-6 flex-1 flex flex-col">
      <div
        className="flex p-1 rounded-2xl mb-4"
        style={{ background: "var(--cream-deep)" }}
      >
        <TabBtn label="Anmelden" active={tab === "login"} onClick={() => setTab("login")} />
        <TabBtn
          label="Neu registrieren"
          active={tab === "register"}
          onClick={() => setTab("register")}
        />
      </div>

      <p
        className="text-[13px] mb-4 text-center"
        style={{ color: "var(--ink-soft)" }}
      >
        {tab === "login"
          ? "Wer bist du?"
          : "Erstelle deinen Account — er liegt sicher im Cloud-Konto."}
      </p>

      <div className="space-y-2">
        {ALLOWED_EMAILS.map((email) => {
          const uid = userIdForEmail(email)!;
          return (
            <button
              key={email}
              type="button"
              onClick={() => (tab === "login" ? onLogin(email) : onRegister(email))}
              className="tap w-full rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card"
              style={{ background: "var(--paper)" }}
            >
              <Avatar id={uid} size={36} />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[15px] font-semibold">{USERS[uid].name}</div>
                <div className="text-[12px]" style={{ color: "var(--muted)" }}>
                  {email}
                </div>
              </div>
              {tab === "login" ? (
                <LogIn size={16} strokeWidth={1.75} color="var(--terra)" />
              ) : (
                <UserPlus size={16} strokeWidth={1.75} color="var(--terra)" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors"
      style={
        active
          ? { background: "var(--paper)", color: "var(--ink)" }
          : { background: "transparent", color: "var(--ink-soft)" }
      }
    >
      {label}
    </button>
  );
}

function LoginForm({
  email,
  onBack,
  onSwitchToRegister,
}: {
  email: string;
  onBack: () => void;
  onSwitchToRegister: () => void;
}) {
  const login = useStore((s) => s.login);
  const userId = userIdForEmail(email)!;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="px-6 flex-1 flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="tap inline-flex items-center gap-1 text-[12.5px] mb-4 self-start"
        style={{ color: "var(--ink-soft)" }}
      >
        <ChevronLeft size={14} strokeWidth={1.75} /> zurück
      </button>

      <div className="flex items-center gap-3 mb-5">
        <Avatar id={userId} size={48} />
        <div className="min-w-0">
          <div className="serif text-[22px] leading-tight" style={{ color: "var(--mens)" }}>
            Hallo, {USERS[userId].name}
          </div>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            {email}
          </div>
        </div>
      </div>

      <label
        className="uplabel text-[10px] mb-1.5"
        style={{ color: "var(--muted)" }}
      >
        Passwort
      </label>
      <div
        className="flex items-center gap-2 rounded-2xl px-3.5 py-3"
        style={{ background: "var(--paper)" }}
      >
        <Lock size={16} strokeWidth={1.75} color="var(--muted)" />
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Dein Passwort"
          className="flex-1 bg-transparent text-[15px]"
          style={{ color: "var(--ink)" }}
        />
      </div>

      {error && (
        <p className="text-[12.5px] mt-2" style={{ color: "#C5634B" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy || !password}
        className="tap mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold"
        style={{
          background: busy || !password ? "var(--terra-soft)" : "var(--terra)",
        }}
      >
        {busy ? "Einen Moment…" : "Anmelden"}
      </button>

      <button
        type="button"
        onClick={onSwitchToRegister}
        className="tap mt-3 text-[12.5px] self-center"
        style={{ color: "var(--ink-soft)" }}
      >
        Noch kein Konto? <span style={{ color: "var(--terra)" }}>Registrieren</span>
      </button>
    </div>
  );
}

function RegisterForm({
  email,
  onBack,
  onSwitchToLogin,
}: {
  email: string;
  onBack: () => void;
  onSwitchToLogin: () => void;
}) {
  const register = useStore((s) => s.register);
  const userId = userIdForEmail(email)!;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await register(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="px-6 flex-1 flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="tap inline-flex items-center gap-1 text-[12.5px] mb-4 self-start"
        style={{ color: "var(--ink-soft)" }}
      >
        <ChevronLeft size={14} strokeWidth={1.75} /> zurück
      </button>

      <div className="flex items-center gap-3 mb-5">
        <Avatar id={userId} size={48} />
        <div className="min-w-0">
          <div className="serif text-[22px] leading-tight" style={{ color: "var(--mens)" }}>
            Willkommen, {USERS[userId].name}
          </div>
          <div
            className="text-[12px] inline-flex items-center gap-1"
            style={{ color: "var(--muted)" }}
          >
            <Mail size={11} strokeWidth={1.75} /> {email}
          </div>
        </div>
      </div>

      <label
        className="uplabel text-[10px] mb-1.5"
        style={{ color: "var(--muted)" }}
      >
        Passwort wählen
      </label>
      <div
        className="flex items-center gap-2 rounded-2xl px-3.5 py-3 mb-2"
        style={{ background: "var(--paper)" }}
      >
        <Lock size={16} strokeWidth={1.75} color="var(--muted)" />
        <input
          type="password"
          autoFocus
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mindestens 6 Zeichen"
          className="flex-1 bg-transparent text-[15px]"
          style={{ color: "var(--ink)" }}
        />
      </div>
      <div
        className="flex items-center gap-2 rounded-2xl px-3.5 py-3"
        style={{ background: "var(--paper)" }}
      >
        <Lock size={16} strokeWidth={1.75} color="var(--muted)" />
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Passwort bestätigen"
          className="flex-1 bg-transparent text-[15px]"
          style={{ color: "var(--ink)" }}
        />
      </div>

      {error && (
        <p className="text-[12.5px] mt-2" style={{ color: "#C5634B" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy || !password || !confirm}
        className="tap mt-5 py-3.5 rounded-2xl text-white text-[15.5px] font-semibold"
        style={{
          background: busy || !password ? "var(--terra-soft)" : "var(--terra)",
        }}
      >
        {busy ? "Einen Moment…" : "Account erstellen"}
      </button>

      <button
        type="button"
        onClick={onSwitchToLogin}
        className="tap mt-3 text-[12.5px] self-center"
        style={{ color: "var(--ink-soft)" }}
      >
        Schon registriert? <span style={{ color: "var(--terra)" }}>Anmelden</span>
      </button>
    </div>
  );
}
