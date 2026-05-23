"use client";

import type { ReactNode } from "react";
import { Atmosphere } from "./Atmosphere";
import { BottomTabs } from "./BottomTabs";
import { UserSwitcher } from "./UserSwitcher";

/**
 * PhoneShell — renders a 390×844 iPhone frame for desktop preview, and goes
 * full-bleed on actual mobile screens (PWA). The frame is the dev/preview
 * affordance; on iOS standalone the OS provides the chrome.
 */
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-2 frame-bg sm:py-12">
      <div className="phone-frame relative">
        <div
          className="screen relative w-full h-full overflow-hidden"
          style={{ background: "var(--cream)" }}
        >
          <Atmosphere />
          <div className="notch" aria-hidden="true" />
          <div className="status-bar" aria-hidden="true">
            <span className="time">9:41</span>
            <span className="indicators">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
          </div>
          <div className="relative z-10 h-full">{children}</div>
          <BottomTabs />
        </div>
      </div>
      <div className="hidden sm:block mt-6 w-full max-w-[390px]">
        <UserSwitcher />
      </div>

      <style jsx>{`
        .frame-bg {
          background: rgb(203, 164, 76);
        }
        .phone-frame {
          width: 100%;
          max-width: 390px;
          aspect-ratio: 390 / 844;
          border-radius: 52px;
          background: linear-gradient(155deg, #0f0b0e 0%, #1e1518 100%);
          padding: 12px;
          box-shadow:
            0 60px 120px -40px rgba(33, 25, 19, 0.55),
            inset 0 0 0 1px rgba(255, 255, 255, 0.04);
        }
        .screen {
          border-radius: 40px;
          isolation: isolate;
        }
        .notch {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 32px;
          border-radius: 20px;
          background: #1a1612;
          z-index: 60;
        }
        .status-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 48px;
          padding: 14px 28px 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          z-index: 50;
          pointer-events: none;
          color: var(--ink);
        }
        .status-bar .time {
          font-size: 14px;
          font-weight: 600;
        }
        .status-bar .indicators {
          display: inline-flex;
          gap: 4px;
        }
        .status-bar .dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--ink);
          opacity: 0.85;
        }

        /* On real mobile (PWA / small viewport): no frame, full-bleed */
        @media (max-width: 640px) {
          :global(body) {
            background: var(--cream);
          }
          .frame-bg {
            background: var(--cream);
            padding: 0;
            min-height: 100dvh;
          }
          .phone-frame {
            max-width: 100%;
            width: 100%;
            aspect-ratio: auto;
            min-height: 100dvh;
            border-radius: 0;
            background: var(--cream);
            padding: 0;
            box-shadow: none;
          }
          .screen {
            border-radius: 0;
            min-height: 100dvh;
          }
          .notch {
            display: none;
          }
          .status-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
