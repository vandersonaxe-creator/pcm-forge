"use client";

import { use, useState, useEffect } from "react";
import { useWorkOrder, updateWorkOrderItem, updateWorkOrderNotes } from "@/hooks/use-work-orders";
import { WOExecutionHeader } from "@/components/work-orders/wo-execution-header";
import { WOContextSidebar } from "@/components/work-orders/wo-context-sidebar";
import { WOChecklist } from "@/components/work-orders/wo-checklist";
import { WOProgressBar } from "@/components/work-orders/wo-progress-bar";
import { WOFinalizeModal } from "@/components/work-orders/wo-finalize-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardEdit, Loader2, AlertCircle, CheckCircle2 as CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { WorkOrderItem } from "@/lib/types/database";

interface WOPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkOrderExecutionPage({ params }: WOPageProps) {
  const { id } = use(params);
  const { workOrder, loading, error, refetch } = useWorkOrder(id);
  const [showFinalize, setShowFinalize] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (workOrder) {
      setNotes(workOrder.technician_notes || "");
    }
  }, [workOrder?.id]);

  const handleItemUpdate = async (itemId: string, data: Partial<WorkOrderItem>) => {
    try {
      await updateWorkOrderItem(itemId, data);
      await refetch();
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    }
  };

  const handleNotesBlur = async () => {
    if (!workOrder || notes === workOrder.technician_notes) return;
    try {
      await updateWorkOrderNotes(workOrder.id, notes);
    } catch (err: any) {
      toast.error("Erro ao salvar observações");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4 opacity-20" />
        <h2 className="text-xl font-bold mb-2">Ops! Ocorreu um erro</h2>
        <p className="text-muted-foreground">{error || "Ordem de Serviço não encontrada."}</p>
      </div>
    );
  }

  const items = workOrder.items || [];
  const filledCount = items.filter(i => i.value !== null).length;
  const isReadOnly = workOrder.status === "completed" || workOrder.status === "cancelled";
  const canFinalize = items.length === 0 || filledCount > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Scroll-aware Progress Hook would go here */}
      <WOExecutionHeader 
        workOrder={workOrder} 
        onStatusChange={refetch}
        onFinalize={() => {
          if (!canFinalize) {
            toast.error("Preencha ao menos um item do checklist antes de finalizar.");
            return;
          }
          setShowFinalize(true);
        }}
      />

      {workOrder.status === "in_progress" && (
        <WOProgressBar current={filledCount} total={items.length} />
      )}

      {workOrder.status === "completed" && (
        <div className="bg-success/10 border-b border-success/20 px-6 py-3 flex items-center justify-center gap-2 text-success text-sm font-bold animate-in fade-in">
           <CheckCircle2Icon className="h-4 w-4" />
           ESTA ORDEM DE SERVIÇO FOI CONCLUÍDA E NÃO PODE SER EDITADA.
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Execution Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* failure_description highlight for corrective */}
            {workOrder.os_type === "corrective" && workOrder.failure_description && (
              <Card className="border-l-4 border-l-destructive bg-destructive/5 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                     <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-destructive">Descrição da Falha</h4>
                        <p className="text-sm leading-relaxed">{workOrder.failure_description}</p>
                     </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            {(workOrder.status === "in_progress" || isReadOnly) ? (
               <WOChecklist 
                 workOrder={workOrder} 
                 items={items} 
                 onItemUpdate={handleItemUpdate}
                 isReadOnly={isReadOnly}
               />
            ) : (
               <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/10 border border-dashed border-border/20 rounded-3xl">
                  <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/30">
                    <ClipboardEdit className="h-8 w-8" />
                  </div>
                  <div className="max-w-xs space-y-2">
                    <h3 className="font-bold text-lg">Pronto para começar?</h3>
                    <p className="text-sm text-muted-foreground">Inicie o atendimento para habilitar o preenchimento do checklist técnico.</p>
                  </div>
               </div>
            )}

            {/* General Notes */}
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <h3 className="text-base font-bold uppercase tracking-widest text-primary/80">Observações Gerais</h3>
                  <div className="flex-1 h-px bg-border/20" />
               </div>
               <Textarea
                 disabled={isReadOnly || workOrder.status !== "in_progress"}
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 onBlur={handleNotesBlur}
                 placeholder="Digite observações adicionais sobre o serviço realizado..."
                 className="min-h-[120px] bg-card/40 border-border/30 rounded-xl"
               />
               <p className="text-[10px] text-muted-foreground uppercase text-right">Salvamento automático habilitado</p>
            </div>
          </div>

          {/* Context Sidebar */}
          <aside className="lg:col-span-1">
             <div className="sticky top-32">
                <WOContextSidebar workOrder={workOrder} />
             </div>
          </aside>
        </div>
      </main>

      <WOFinalizeModal 
        isOpen={showFinalize} 
        onClose={() => setShowFinalize(false)} 
        workOrder={workOrder}
        onComplete={() => {
          setShowFinalize(false);
          refetch();
        }}
      />
    </div>
  );
}

