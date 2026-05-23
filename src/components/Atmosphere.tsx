"use client";

import { memo } from "react";

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <filter id="g">
      <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0.30  0 0 0 0 0.26  0 0 0 0 0.20  0 0 0 0.85 0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#g)" opacity="0.55"/>
  </svg>`,
);

function AtmosphereImpl() {
  return (
    <div className="atmos-layer" aria-hidden="true">
      <svg viewBox="0 0 366 820" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="b-terra" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C5634B" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#C5634B" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#C5634B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="b-sage" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7E977B" stopOpacity="0.62" />
            <stop offset="55%" stopColor="#7E977B" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#7E977B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="b-rose" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C77F77" stopOpacity="0.68" />
            <stop offset="55%" stopColor="#C77F77" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#C77F77" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="b-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8973F" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#C8973F" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#C8973F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="b-plum" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4B3050" stopOpacity="0.52" />
            <stop offset="55%" stopColor="#4B3050" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4B3050" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="blob-group">
          <circle className="blob blob-a" cx="60" cy="120" r="220" fill="url(#b-terra)" />
          <circle className="blob blob-b" cx="320" cy="220" r="250" fill="url(#b-sage)" />
          <circle className="blob blob-c" cx="280" cy="560" r="240" fill="url(#b-rose)" />
          <circle className="blob blob-d" cx="40" cy="640" r="260" fill="url(#b-gold)" />
          <circle className="blob blob-e" cx="200" cy="400" r="200" fill="url(#b-plum)" />
        </g>

        <g className="atmos-spin" opacity="0.16">
          {[100, 150, 210, 290, 380, 480].map((r, i) => (
            <circle
              key={i}
              cx="183"
              cy="410"
              r={r}
              fill="none"
              stroke="#5B3D5C"
              strokeWidth="0.7"
              strokeDasharray={i % 2 ? "2 6" : "1 12"}
            />
          ))}
          {Array.from({ length: 18 }).map((_, i) => {
            const ang = (i / 18) * Math.PI * 2;
            const x = (183 + Math.cos(ang) * 480).toFixed(2);
            const y = (410 + Math.sin(ang) * 480).toFixed(2);
            return (
              <line
                key={`s-${i}`}
                x1="183"
                y1="410"
                x2={x}
                y2={y}
                stroke="#5B3D5C"
                strokeWidth="0.4"
                strokeDasharray="1 14"
                opacity="0.6"
              />
            );
          })}
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,${GRAIN_SVG}")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "multiply",
          opacity: 0.42,
        }}
      />
    </div>
  );
}

export const Atmosphere = memo(AtmosphereImpl);
