"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  AlertCircle, 
  Wrench, 
  Loader2 
} from "lucide-react";
import { format, setMonth, setDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createWorkOrder } from "@/hooks/use-work-orders";
import { toast } from "sonner";
import type { AssetPlanningData } from "@/hooks/use-planning";

interface CreateOSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selection: {
    assetId: string;
    planId: string;
    month: number;
    year: number;
  } | null;
  assets: AssetPlanningData[];
  onSuccess: () => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function CreateOSDialog({ isOpen, onClose, selection, assets, onSuccess }: CreateOSDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!selection) return null;

  const asset = assets.find(a => a.id === selection.assetId);
  const plan = asset?.plans.find(p => p.plan_id === selection.planId);
  const monthName = MONTH_NAMES[selection.month - 1];

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Create a date for the 15th of the selected month by default
      const scheduledDate = setDate(setMonth(new Date(selection.year, 0, 1), selection.month - 1), 15);
      
      await createWorkOrder({
        asset_id: selection.assetId,
        plan_id: selection.planId,
        title: `Manutenção Preventiva - ${asset?.tag}`,
        os_type: "preventive",
        priority: "medium",
        status: "planned",
        scheduled_date: format(scheduledDate, "yyyy-MM-dd"),
        template_id: null, // Basic preventive WO
      });

      toast.success(`Ordem de Serviço gerada para ${monthName}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Erro ao gerar O.S: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border/40 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
             </div>
             <DialogTitle className="text-xl">Gerar Ordem de Serviço</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Você está prestes a gerar uma O.S. preventiva para o ativo <span className="text-white font-bold">{asset?.tag}</span> referente ao planejamento de <span className="text-white font-bold">{monthName} / {selection.year}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
           <div className="p-4 rounded-xl bg-muted/20 border border-border/20 space-y-2">
             <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Ativo</span>
                <span className="font-bold">{asset?.name}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Plano</span>
                <span className="font-bold underline decoration-primary/30 decoration-2">{plan?.plan_name}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Freq.</span>
                <span className="font-bold uppercase tracking-widest text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">{plan?.frequency}</span>
             </div>
           </div>

           <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10 text-[10px] text-warning font-medium leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Esta ação criará uma Ordem de Serviço com status 'Planejada'. Você poderá editá-la posteriormente no módulo de Ordens de Serviço.
           </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 sm:flex-none border border-border/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
            Confirmar e Gerar O.S.
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
