"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { LoginScreen } from "./auth/LoginScreen";
import { PhoneShell } from "./PhoneShell";
import { ClientOnly } from "./ClientOnly";
import { CloudSyncProvider } from "./CloudSyncProvider";

export function AuthGate({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<div className="min-h-dvh" />}>
      <CloudSyncProvider>
        <Gate>{children}</Gate>
      </CloudSyncProvider>
    </ClientOnly>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const account = useStore((s) => s.account);
  const authReady = useStore((s) => s.authReady);

  if (!authReady) {
    return <div className="min-h-dvh" />;
  }
  if (!account) {
    return <LoginScreen />;
  }
  return <PhoneShell>{children}</PhoneShell>;
}
