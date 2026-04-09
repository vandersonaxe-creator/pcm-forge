"use client";

import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  Camera,
  MapPin,
  ClipboardCheck,
  CircleCheck
} from "lucide-react";
import { WOSignaturePad } from "./wo-signature-pad";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types/database";
import { uploadSignature, updateWorkOrderStatus } from "@/hooks/use-work-orders";
import { toast } from "sonner";

interface WOFinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder;
  onComplete: () => void;
}

export function WOFinalizeModal({ isOpen, onClose, workOrder, onComplete }: WOFinalizeModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const items = workOrder.items || [];
  
  // Validation checks
  const validation = useMemo(() => {
    const missingValues = items.filter(i => i.value === null);
    const missingPhotos = items.filter(i => i.requires_photo && (!i.photos || i.photos.length === 0));
    const nokItems = items.filter(i => i.value === "NOK");

    return {
      allFilled: missingValues.length === 0,
      missingCount: missingValues.length,
      missingPhotosCount: missingPhotos.length,
      nokCount: nokItems.length,
      isBlocked: missingPhotos.length > 0 || missingValues.length > 0
    };
  }, [items]);

  const handleFinalize = async () => {
    if (!signature) return;
    setLoading(true);
    try {
      // 1. Capture current GPS
      let coords = undefined;
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
             navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch(e) { console.warn("GPS failed", e); }
      }

      // 2. Upload Signature
      await uploadSignature(workOrder.company_id, workOrder.id, signature);

      // 3. Complete WO
      await updateWorkOrderStatus(workOrder.id, "completed", coords);
      
      toast.success(`Ordem de Serviço ${workOrder.wo_number} concluída com sucesso!`);
      onComplete();
    } catch (error: any) {
      toast.error("Erro ao concluir: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1: // Validation
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center space-y-2 mb-6">
               <div className={cn(
                 "h-16 w-16 rounded-full flex items-center justify-center mb-2",
                 validation.isBlocked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
               )}>
                 {validation.isBlocked ? <AlertTriangle className="h-8 w-8" /> : <CircleCheck className="h-8 w-8" />}
               </div>
               <h3 className="text-xl font-bold">Validação de Itens</h3>
               <p className="text-sm text-muted-foreground">Verificando integridade dos dados preenchidos.</p>
            </div>

            <div className="space-y-3">
              <div className={cn(
                "p-4 rounded-xl border flex items-center justify-between",
                validation.allFilled ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
              )}>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className={cn("h-5 w-5", validation.allFilled ? "text-success" : "text-destructive")} />
                  <span className="text-sm font-medium">Preenchimento do Checklist</span>
                </div>
                {validation.allFilled ? (
                  <Badge className="bg-success text-white">OK</Badge>
                ) : (
                  <Badge variant="destructive">{validation.missingCount} Pendentes</Badge>
                )}
              </div>

              <div className={cn(
                "p-4 rounded-xl border flex items-center justify-between",
                validation.missingPhotosCount === 0 ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
              )}>
                <div className="flex items-center gap-3">
                  <Camera className={cn("h-5 w-5", validation.missingPhotosCount === 0 ? "text-success" : "text-destructive")} />
                  <span className="text-sm font-medium">Fotos Obrigatórias</span>
                </div>
                {validation.missingPhotosCount === 0 ? (
                  <Badge className="bg-success text-white">OK</Badge>
                ) : (
                  <Badge variant="destructive">{validation.missingPhotosCount} Faltantes</Badge>
                )}
              </div>

              {validation.nokCount > 0 && (
                <div className="p-4 rounded-xl border border-warning/20 bg-warning/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <span className="text-sm font-medium text-warning-foreground">Não Conformidades Encontradas</span>
                  </div>
                  <Badge className="bg-warning text-white">{validation.nokCount} Itens NOK</Badge>
                </div>
              )}
            </div>

            {validation.isBlocked && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-xs text-destructive text-center">
                 Atenção: Você não pode finalizar a OS antes de preencher todos os itens e capturar todas as fotos obrigatórias.
              </div>
            )}
          </div>
        );

      case 2: // Signature
        return (
          <div className="space-y-6 py-4">
             <div className="space-y-1">
               <h3 className="text-lg font-bold">Assinatura Digital</h3>
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Responsável Técnico</p>
             </div>
             
             <WOSignaturePad 
               onSave={(data) => {
                 setSignature(data);
                 setStep(3);
               }} 
             />
             
             <div className="bg-muted/30 rounded-lg p-4 text-[10px] text-muted-foreground leading-relaxed flex gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Esta assinatura será gravada como evidência técnica irrevocável no relatório final da ordem de serviço.
             </div>
          </div>
        );

      case 3: // Confirmation
        return (
          <div className="space-y-8 py-4">
             <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-2">
                  <Loader2 className={cn("h-8 w-8 animate-spin", !loading && "hidden")} />
                  {!loading && <CheckCircle2 className="h-8 w-8" />}
                </div>
                <h3 className="text-xl font-bold">Resumo Final</h3>
                <span className="text-xs font-technical text-primary uppercase font-bold tracking-[0.2em]">{workOrder.wo_number}</span>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card/60 border border-border/20 text-center">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Itens Verificados</p>
                   <p className="text-lg font-bold">{items.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-card/60 border border-border/20 text-center">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Evidências (Fotos)</p>
                   <p className="text-lg font-bold font-technical">{items.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0)}</p>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/10">
                   <MapPin className="h-4 w-4" />
                   Captura automática de localização final ao concluir.
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setConfirmed(!confirmed)}>
                   <div className={cn(
                     "w-5 h-5 rounded border-2 border-primary flex items-center justify-center transition-colors",
                     confirmed ? "bg-primary" : "bg-transparent"
                   )}>
                     {confirmed && <CircleCheck className="h-4 w-4 text-white" />}
                   </div>
                   <span className="text-xs font-bold uppercase tracking-tight">Confirmo que as informações prestadas são verdadeiras.</span>
                </div>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border/40 shadow-2xl p-6">
        <DialogHeader className="hidden">
           <DialogTitle>Finalizar Ordem de Serviço</DialogTitle>
           <DialogDescription>Fluxo de conclusão técnica</DialogDescription>
        </DialogHeader>

        {renderCurrentStep()}

        <DialogFooter className="flex flex-row justify-between sm:justify-between pt-4 border-t border-border/10">
           {step > 1 && step < 3 && !loading && (
             <Button variant="ghost" className="gap-2" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> Voltar
             </Button>
           )}
           
           <div className="flex-1" />

           {step === 1 && (
             <Button 
               disabled={validation.isBlocked}
               className="bg-primary hover:bg-primary-hover font-bold gap-2 group"
               onClick={() => setStep(2)}
             >
               Prosseguir para Assinatura
               <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </Button>
           )}

           {step === 3 && (
             <Button 
               disabled={!confirmed || loading}
               className="w-full bg-success hover:bg-success/90 text-white font-bold h-12 shadow-[0_4px_20px_rgba(54,179,126,0.3)] transition-all active:scale-[0.98]"
               onClick={handleFinalize}
             >
               {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Concluir Ordem de Serviço"}
             </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

