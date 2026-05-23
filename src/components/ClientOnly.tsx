"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after client-side hydration, to avoid SSR mismatches
 * for parts of the UI that read persisted client state (zustand/localStorage)
 * or time-dependent values.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
