"use client";

import { cn } from "@/lib/utils";
import type { OsType } from "@/lib/types/database";

interface WOCalendarChipProps {
  woNumber: string;
  title: string;
  osType: OsType;
  assetTag?: string;
  onClick: () => void;
}

const TYPE_COLORS: Record<OsType, string> = {
  preventive: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  corrective: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  inspection: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
  calibration: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
};

export function WOCalendarChip({
  woNumber,
  title,
  osType,
  assetTag,
  onClick,
}: WOCalendarChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-1.5 py-0.5 rounded border text-[10px] leading-tight font-medium truncate transition-colors cursor-pointer",
        TYPE_COLORS[osType]
      )}
      title={`${woNumber} — ${title}`}
    >
      {assetTag && (
        <span className="font-bold mr-1">{assetTag}</span>
      )}
      <span className="opacity-80">{title}</span>
    </button>
  );
}
