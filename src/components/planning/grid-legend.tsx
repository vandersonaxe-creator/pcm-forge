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
    { label: "Concluída", icon: <Check className="h-3.5 w-3.5" />, color: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]" },
    { label: "Em Andamento", icon: <Hammer className="h-3.5 w-3.5" />, color: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]" },
    { label: "Planejada", icon: <Calendar className="h-3.5 w-3.5" />, color: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]" },
    { label: "Atrasada", icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]" },
    { label: "Não Gerada", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-transparent border-[#D1D5DB] border-dashed text-[#6B7280]" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 bg-[#F8FAFC] border-t border-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-8 flex items-center justify-center border rounded shadow-sm",
            item.color
          )}>
            {item.icon}
          </div>
          <span className="text-[11px] font-bold text-[#374151] uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
