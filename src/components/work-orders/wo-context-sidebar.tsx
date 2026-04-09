"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tag, MapPin, Calendar, Clock, User, 
  History, Info, ExternalLink 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { WorkOrder } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface WOContextSidebarProps {
  workOrder: WorkOrder;
}

export function WOContextSidebar({ workOrder }: WOContextSidebarProps) {
  const asset = workOrder.asset;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "---";
    return format(new Date(dateStr), "dd MMM, HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Ativo Card */}
      <Card className="bg-card/50 border-border/30 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-info" />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Ativo
            </h3>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
              {asset?.criticality || "B"}
            </Badge>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold font-technical">{asset?.tag}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{asset?.name}</span>
                </div>
             </div>
             
             <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                   <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Localização</span>
                   <span className="text-sm">Área de Processo A</span>
                </div>
             </div>
          </div>

          <Separator className="bg-border/20" />
          
          <button className="w-full flex items-center justify-between text-xs font-bold text-primary hover:text-primary-hover transition-colors group">
            Ver ficha completa
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </CardContent>
      </Card>

      {/* Detalhes Card */}
      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Detalhes
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Solicitante</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-info" />
                  {workOrder.requested_by || "Automático"}
                </div>
             </div>

             <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Responsável</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {workOrder.assignee?.full_name || "Não atribuído"}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                   <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Programado</span>
                   <div className="flex items-center gap-1.5 text-xs">
                     <Calendar className="h-3 w-3 text-primary" />
                     {workOrder.scheduled_date || "---"}
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Limite</span>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                     <Clock className="h-3 w-3" />
                     {workOrder.due_date || "---"}
                   </div>
                </div>
             </div>
             
             {workOrder.actual_duration_min && (
                <div className="pt-2">
                   <Badge className="w-full justify-center bg-success/10 text-success border-success/20 py-1.5">
                     Duração: {Math.floor(workOrder.actual_duration_min / 60)}h {workOrder.actual_duration_min % 60}min
                   </Badge>
                </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Cronologia Card */}
      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-5 space-y-4">
             <h3 className="font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Cronologia
             </h3>
             
             <div className="space-y-4 relative pl-4 border-l border-border/30 ml-2">
                <div className="space-y-1">
                   <div className="absolute w-2.5 h-2.5 rounded-full bg-primary -left-[5.5px] top-1 shadow-[0_0_8px_rgba(0,112,242,0.4)]" />
                   <span className="text-[10px] text-muted-foreground uppercase font-bold">Criada</span>
                   <p className="text-xs font-medium">{formatDate(workOrder.created_at)}</p>
                </div>

                {workOrder.started_at && (
                  <div className="space-y-1">
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-secondary -left-[5.5px] top-1 shadow-[0_0_8px_rgba(232,164,0,0.4)]" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Iniciada</span>
                    <p className="text-xs font-medium">{formatDate(workOrder.started_at)}</p>
                  </div>
                )}

                {workOrder.completed_at && (
                  <div className="space-y-1">
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-success -left-[5.5px] top-1 shadow-[0_0_8px_rgba(54,179,126,0.4)]" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Concluída</span>
                    <p className="text-xs font-medium">{formatDate(workOrder.completed_at)}</p>
                  </div>
                )}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Minimal icons for internal usage
function ClipboardList({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/>
      <path d="M12 16h4"/>
      <path d="M8 11h.01"/>
      <path d="M8 16h.01"/>
    </svg>
  );
}
