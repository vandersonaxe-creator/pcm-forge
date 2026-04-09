"use client";

import { 
  Check, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Hammer 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GridLegend() {
  const items = [
    { label: "Concluída", icon: <Check className="h-3.5 w-3.5" />, color: "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success-icon)]" },
    { label: "Em Andamento", icon: <Hammer className="h-3.5 w-3.5" />, color: "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning-text)]" },
    { label: "Planejada", icon: <Calendar className="h-3.5 w-3.5" />, color: "bg-[var(--color-info-bg)] border-[var(--color-info-border)] text-[var(--color-info-text)]" },
    { label: "Atrasada", icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "bg-[var(--color-danger-bg)] border-[var(--color-danger-border)] text-[var(--color-danger-text)]" },
    { label: "Não Gerada", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-transparent border-[var(--color-border-strong)] border-dashed text-[var(--color-text-muted)]" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 bg-[var(--color-bg-page)] border-t border-[var(--color-border)]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-8 flex items-center justify-center border rounded shadow-sm",
            item.color
          )}>
            {item.icon}
          </div>
          <span className="text-[11px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
