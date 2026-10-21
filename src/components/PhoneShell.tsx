"use client";

import type { ReactNode } from "react";
import { BottomTabs } from "./BottomTabs";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <main className="app-content">{children}</main>
      <BottomTabs />

      <style jsx>{`
        .app-shell {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          background: var(--cream);
          isolation: isolate;
        }
        .app-content {
          position: relative;
          z-index: 10;
          min-height: 100dvh;
          padding-top: max(env(safe-area-inset-top), 0.5rem);
          padding-bottom: calc(env(safe-area-inset-bottom) + 90px);
        }
        @media (min-width: 481px) {
          :global(body) {
            background: var(--cream-deep);
          }
          .app-shell {
            box-shadow:
              0 30px 80px -30px rgba(33, 25, 19, 0.18),
              inset 0 0 0 1px rgba(33, 25, 19, 0.05);
          }
        }
      `}</style>
    </div>
  );
}
