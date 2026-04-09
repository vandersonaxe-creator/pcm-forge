"use client";

import { cn } from "@/lib/utils";

interface WOProgressBarProps {
  current: number;
  total: number;
}

export function WOProgressBar({ current, total }: WOProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const getColor = () => {
    if (percentage < 50) return "bg-zinc-500";
    if (percentage < 100) return "bg-secondary";
    return "bg-success";
  };

  const getTextColor = () => {
    if (percentage < 50) return "text-zinc-400";
    if (percentage < 100) return "text-secondary";
    return "text-success";
  };

  return (
    <div className="sticky top-14 z-20 w-full bg-background/95 backdrop-blur-md border-b border-border/40 px-6 py-3 transition-all duration-300 shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold font-technical", getTextColor())}>
              {percentage}%
            </span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Item Progress
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {current} de {total} itens preenchidos
          </p>
        </div>
        
        <div className="flex-1 max-w-lg w-full bg-muted/30 h-2.5 rounded-full overflow-hidden border border-border/20">
          <div 
            className={cn("h-full transition-all duration-500 ease-out", getColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
