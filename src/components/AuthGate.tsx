"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { LoginScreen } from "./auth/LoginScreen";
import { PhoneShell } from "./PhoneShell";
import { ClientOnly } from "./ClientOnly";

export function AuthGate({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<div className="min-h-dvh" />}>
      <Gate>{children}</Gate>
    </ClientOnly>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const loggedInEmail = useStore((s) => s.loggedInEmail);
  if (!loggedInEmail) {
    return <LoginScreen />;
  }
  return <PhoneShell>{children}</PhoneShell>;
}
