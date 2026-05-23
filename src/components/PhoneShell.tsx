"use client";

import type { ReactNode } from "react";
import { Atmosphere } from "./Atmosphere";
import { BottomTabs } from "./BottomTabs";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-atmos" aria-hidden="true">
        <Atmosphere />
      </div>
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
        .app-atmos {
          position: fixed;
          inset: 0;
          left: 50%;
          transform: translateX(-50%);
          max-width: 480px;
          width: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .app-content {
          position: relative;
          z-index: 10;
          min-height: 100dvh;
          padding-top: max(env(safe-area-inset-top), 0.5rem);
          padding-bottom: calc(env(safe-area-inset-bottom) + 110px);
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
