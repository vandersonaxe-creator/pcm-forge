"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  MoreVertical,
  Ban,
  Printer,
  ChevronLeft,
  User
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { WorkOrder, OsStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { OS_STATUS_LABELS, OS_STATUS_COLORS, OS_TYPE_LABELS, OS_TYPE_ICONS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateWorkOrderStatus } from "@/hooks/use-work-orders";

interface WOExecutionHeaderProps {
  workOrder: WorkOrder;
  onStatusChange: (status: OsStatus) => void;
  onFinalize: () => void;
}

export function WOExecutionHeader({ workOrder, onStatusChange, onFinalize }: WOExecutionHeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const status = workOrder.status;
  const osType = workOrder.os_type;
  const OS_Icon = OS_TYPE_ICONS[osType as keyof typeof OS_TYPE_ICONS] || Calendar;

  const handleAction = async (newStatus: OsStatus) => {
    setLoading(true);
    try {
      let coords = undefined;
      
      // Capture GPS if transitioning to in_progress or starting
      if (newStatus === "in_progress" || newStatus === "open") {
        if ("geolocation" in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
          } catch (e) {
            console.warn("Geolocation failed", e);
            toast.error("Não foi possível capturar a localização GPS.");
          }
        }
      }

      await updateWorkOrderStatus(workOrder.id, newStatus, coords);
      onStatusChange(newStatus);
      toast.success(`Ordem de Serviço ${OS_STATUS_LABELS[newStatus as keyof typeof OS_STATUS_LABELS]}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/30 border-b border-border/40 px-6 py-6 lg:py-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-2 text-muted-foreground hover:text-primary gap-1"
            onClick={() => router.push("/work-orders")}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para lista
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold font-technical tracking-tighter text-foreground">
              {workOrder.wo_number}
            </span>
            <Badge className={cn("px-2.5 py-0.5 border shadow-sm", OS_STATUS_COLORS[status as keyof typeof OS_STATUS_COLORS])}>
              {OS_STATUS_LABELS[status as keyof typeof OS_STATUS_LABELS]}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-tight">
                  Técnico: {workOrder.assignee?.full_name || "Não atribuído"}
                </span>
             </div>
             
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/20">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="font-bold opacity-90 uppercase tracking-tighter italic">Prioridade {workOrder.priority}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {status === "planned" && (
            <Button 
              disabled={loading}
              className="bg-primary hover:bg-primary-hover font-bold px-6"
              onClick={() => handleAction("open")}
            >
              Abrir OS
            </Button>
          )}

          {status === "open" && (
            <Button 
              disabled={loading}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-6 gap-2"
              onClick={() => handleAction("in_progress")}
            >
              <Play className="h-4 w-4 fill-current" />
              Iniciar Atendimento
            </Button>
          )}

          {status === "in_progress" && (
            <div className="flex items-center gap-2">
               <Button 
                className="bg-success hover:bg-success/90 text-white font-bold px-6 gap-2"
                onClick={onFinalize}
              >
                <CheckCircle2 className="h-4 w-4" />
                Finalizar OS
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                   <Button variant="outline" size="icon" className="border-border/40">
                      <MoreVertical className="h-4 w-4" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border/40">
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                    onClick={() => handleAction("cancelled")}
                  >
                    <Ban className="h-4 w-4" />
                    Cancelar OS
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {(status === "completed" || status === "cancelled") && (
            <Button 
              variant="outline" 
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => router.push(`/work-orders/${workOrder.id}/report`)}
            >
              <Printer className="h-4 w-4" />
              Ver Relatório
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
