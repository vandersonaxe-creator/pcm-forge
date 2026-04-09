"use client";

import { useState, useEffect } from "react";

const SIZES = {
  sm: { icon: 28, font: 14, badge: 8, gap: 8 },
  md: { icon: 36, font: 17, badge: 9, gap: 10 },
  lg: { icon: 48, font: 22, badge: 10, gap: 12 },
};

function AtomIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="pcm-coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
          <stop offset="40%" stopColor="#3B82F6" stopOpacity="1" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.8" />
        </radialGradient>

        <filter id="pcm-neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="pcm-coreGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <radialGradient id="pcm-electronGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
      </defs>

      {[0, 60, 120].map((rotation, i) => (
        <g key={i} transform={`rotate(${rotation} 50 50)`}>
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="16"
            fill="none"
            stroke="url(#pcm-coreGlow)"
            strokeWidth="1.2"
            opacity="0.35"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 50;360 50 50"
              dur={`${8 + i * 3}s`}
              repeatCount="indefinite"
            />
          </ellipse>

          <circle r="3" fill="url(#pcm-electronGrad)" filter="url(#pcm-neonGlow)">
            <animateMotion dur={`${3 + i * 1.2}s`} repeatCount="indefinite">
              <mpath>
                <ellipse cx="50" cy="50" rx="42" ry="16" />
              </mpath>
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur={`${1.5 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>

          <circle r="2" fill="#93C5FD" opacity="0.5" filter="url(#pcm-neonGlow)">
            <animateMotion
              dur={`${3 + i * 1.2}s`}
              repeatCount="indefinite"
              keyPoints="0.5;1;0.5"
              keyTimes="0;0.5;1"
              calcMode="linear"
            >
              <mpath>
                <ellipse cx="50" cy="50" rx="42" ry="16" />
              </mpath>
            </animateMotion>
          </circle>
        </g>
      ))}

      <circle
        cx="50"
        cy="50"
        r="8"
        fill="url(#pcm-coreGlow)"
        filter="url(#pcm-coreGlowFilter)"
      >
        <animate
          attributeName="r"
          values="7.5;9;7.5"
          dur="2.5s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
        />
      </circle>

      <circle cx="47" cy="47" r="3" fill="white" opacity="0.3">
        <animate
          attributeName="opacity"
          values="0.2;0.4;0.2"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

interface PCMForgeLogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PCMForgeLogo({ collapsed = false, size = "md" }: PCMForgeLogoProps) {
  const s = SIZES[size] || SIZES.md;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-4">
        <AtomIcon size={s.icon} />
      </div>
    );
  }

  return (
    <div
      className="flex items-center px-4 pt-5 pb-4"
      style={{
        gap: s.gap,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-8px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="shrink-0 relative">
        <AtomIcon size={s.icon} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <div
          style={{
            fontSize: s.font,
            fontWeight: 800,
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "#F8FAFC",
            textShadow:
              "0 0 20px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          <span>
            PCM
            <span style={{ color: "#60A5FA", marginLeft: 4 }}>Forge</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div
            className="h-px"
            style={{
              width: 16,
              background: "linear-gradient(90deg, #3B82F6, transparent)",
            }}
          />
          <span
            style={{
              fontSize: s.badge,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.12em",
              color: "#60A5FA",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(96, 165, 250, 0.3)",
            }}
          >
            INDUSTRIAL
          </span>
          <div
            className="h-px"
            style={{
              width: 16,
              background: "linear-gradient(90deg, transparent, #3B82F6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
