"use client";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className, collapsed, size = "md" }: BrandLogoProps) {
  const sizeMap = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className={cn("relative shrink-0", sizeMap[size])}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]"
        >
          <defs>
            <linearGradient id="gearGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="innerGrad" x1="40" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="50" y1="44" x2="70" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <radialGradient id="coreGlow" cx="60" cy="60" r="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer rotating gear ring */}
          <g className="animate-gear-spin">
            {/* Gear teeth */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45) * Math.PI / 180;
              const x = 60 + 46 * Math.cos(angle);
              const y = 60 + 46 * Math.sin(angle);
              return (
                <rect
                  key={i}
                  x={x - 5}
                  y={y - 3}
                  width="10"
                  height="6"
                  rx="1.5"
                  fill="url(#gearGrad)"
                  transform={`rotate(${i * 45}, ${x}, ${y})`}
                  opacity="0.9"
                />
              );
            })}
            {/* Main gear ring */}
            <circle cx="60" cy="60" r="40" stroke="url(#gearGrad)" strokeWidth="4" fill="none" opacity="0.3" />
            <circle cx="60" cy="60" r="40" stroke="url(#gearGrad)" strokeWidth="2" fill="none" strokeDasharray="12 8" opacity="0.7" />
          </g>

          {/* Inner counter-rotating ring */}
          <g className="animate-gear-spin-reverse">
            <circle cx="60" cy="60" r="30" stroke="#60A5FA" strokeWidth="1.5" fill="none" strokeDasharray="6 10" opacity="0.4" />
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60) * Math.PI / 180;
              const x = 60 + 30 * Math.cos(angle);
              const y = 60 + 30 * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#60A5FA"
                  opacity="0.6"
                />
              );
            })}
          </g>

          {/* Core glow */}
          <circle cx="60" cy="60" r="28" fill="url(#coreGlow)" />

          {/* Central rotor / anvil hybrid */}
          <g filter="url(#glow)">
            {/* Rotor blades */}
            <path
              d="M60 38 L68 52 L60 48 L52 52 Z"
              fill="url(#innerGrad)"
              opacity="0.9"
            />
            <path
              d="M82 60 L68 68 L72 60 L68 52 Z"
              fill="url(#innerGrad)"
              opacity="0.85"
            />
            <path
              d="M60 82 L52 68 L60 72 L68 68 Z"
              fill="url(#innerGrad)"
              opacity="0.8"
            />
            <path
              d="M38 60 L52 52 L48 60 L52 68 Z"
              fill="url(#innerGrad)"
              opacity="0.75"
            />
          </g>

          {/* Inner hexagonal core */}
          <polygon
            points="60,48 70,54 70,66 60,72 50,66 50,54"
            fill="#0F172A"
            stroke="url(#gearGrad)"
            strokeWidth="1.5"
          />

          {/* Energy center */}
          <circle cx="60" cy="60" r="6" fill="url(#amberGrad)" filter="url(#softGlow)" />
          <circle cx="60" cy="60" r="3" fill="#FCD34D" opacity="0.9" />

          {/* Precision crosshair marks */}
          <line x1="60" y1="50" x2="60" y2="54" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
          <line x1="60" y1="66" x2="60" y2="70" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
          <line x1="50" y1="60" x2="54" y2="60" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
          <line x1="66" y1="60" x2="70" y2="60" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />

          {/* Arc energy traces */}
          <path
            d="M 35 35 A 35 35 0 0 1 85 35"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
          <path
            d="M 85 85 A 35 35 0 0 1 35 85"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col items-start">
          <span className="text-[16px] font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/80">
            PCM Forge
          </span>
          <div className="mt-1.5 flex items-center">
            <div className="h-px w-2 bg-amber-500/60" />
            <span className="mx-1.5 px-2 py-[2px] rounded-sm bg-[#0C1829] border border-[#1E3A5F]/60 text-[9px] font-black tracking-[0.2em] uppercase text-[#60A5FA]/80 leading-none">
              Industrial
            </span>
            <div className="h-px w-2 bg-amber-500/60" />
          </div>
        </div>
      )}
    </div>
  );
}
