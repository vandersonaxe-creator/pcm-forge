"use client";

import { memo } from "react";
import { 
  Check, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Hammer,
  HelpCircle
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MonthData } from "@/hooks/use-planning";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GridCellProps {
  data: MonthData;
  assetName: string;
  planName: string;
  monthName: string;
  onClick: () => void;
}

export const GridCell = memo(function GridCell({ 
  data, 
  assetName, 
  planName, 
  monthName, 
  onClick 
}: GridCellProps) {
  const { status, wo_number, scheduled_date } = data;

  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]";
      case "in_progress":
        return "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]";
      case "planned":
        return "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]";
      case "overdue":
        return "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]";
      case "due_not_generated":
        return "bg-transparent border-[#D1D5DB] border-dashed text-[#6B7280]";
      default:
        return "bg-transparent border-transparent opacity-10 cursor-default";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="h-3.5 w-3.5" />;
      case "in_progress":
        return <Hammer className="h-3.5 w-3.5" />;
      case "planned":
        return <Calendar className="h-3.5 w-3.5" />;
      case "overdue":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case "due_not_generated":
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getTooltipContent = () => {
    if (!status) return null;

    const formattedDate = scheduled_date 
      ? format(parseISO(scheduled_date), "dd 'de' MMMM", { locale: ptBR })
      : "---";

    return (
      <div className="space-y-1.5 p-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {assetName}
        </p>
        <p className="text-xs font-semibold text-foreground leading-none">{planName}</p>
        <div className="h-px bg-border my-2" />
        
        {status === "completed" && (
           <p className="text-xs text-[#065F46] font-medium">Concluída em <span className="font-bold">{formattedDate}</span></p>
        )}
        {status === "in_progress" && (
           <p className="text-xs text-[#92400E] font-medium">Atendimento em andamento</p>
        )}
        {status === "planned" && (
           <p className="text-xs text-[#1E40AF] font-medium">Programada para <span className="font-bold">{formattedDate}</span></p>
        )}
        {status === "overdue" && (
           <p className="text-xs text-[#991B1B] font-bold uppercase">Atrasada — Prevista para {formattedDate}</p>
        )}
        {status === "due_not_generated" && (
           <p className="text-xs text-muted-foreground">Previsão automática — OS ainda não gerada</p>
        )}

        {wo_number && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">Ref: {wo_number}</p>
        )}
      </div>
    );
  };

  if (!status) return <div className="w-12 h-10 border border-border/5" />;

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger>
          <button
            onClick={status !== 'due_not_generated' || status === 'due_not_generated' ? onClick : undefined}
            className={cn(
              "w-12 h-10 flex items-center justify-center border transition-all hover:scale-105 hover:z-10 focus:outline-none focus:ring-1 focus:ring-primary/50",
              getStatusStyles()
            )}
          >
            {getIcon()}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-white border-border shadow-md">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
