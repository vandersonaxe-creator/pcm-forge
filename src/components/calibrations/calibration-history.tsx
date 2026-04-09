"use client";

import { useEffect } from "react";
import { useAssetCalibrations } from "@/hooks/use-calibrations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Activity, Download, CheckCircle2, XCircle, Wrench } from "lucide-react";

export function CalibrationHistory({ assetId }: { assetId: string }) {
  const { calibrations, loading, refetch } = useAssetCalibrations(assetId);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (calibrations.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="h-8 w-8" />}
        title="Nenhuma calibração registrada"
        description="Este instrumento ainda não possui laudos metrológicos atrelados."
      />
    );
  }

  const getResultBadge = (result: string) => {
    switch(result) {
      case "approved":
        return <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3 mr-1"/> Aprovado</span>;
      case "reproved":
        return <span className="flex items-center text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3 mr-1"/> Reprovado</span>;
      case "adjusted":
        return <span className="flex items-center text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"><Wrench className="h-3 w-3 mr-1"/> Ajustado e Aprov.</span>;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      {calibrations.map((cal) => (
        <div key={cal.id} className="relative pl-6 pb-6 border-l border-border/50 last:border-0 last:pb-0">
          <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
          
          <div className="bg-muted/20 border border-border/40 rounded-xl p-4 transition-colors hover:bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    {format(new Date(cal.calibration_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  {getResultBadge(cal.result)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs mb-0.5">Láboratorio / Provedora</span>
                    <span className="font-medium text-foreground">{cal.provider}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-0.5">Certificado</span>
                    <span className="font-mono text-xs">{cal.certificate_number || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-0.5">Válido até</span>
                    <span className="font-medium">{format(new Date(cal.next_calibration_date), "dd/MM/yyyy")}</span>
                  </div>
                </div>

                {cal.notes && (
                  <div className="mt-3 text-sm text-muted-foreground bg-background rounded p-2 border border-border/30">
                    <span className="block text-xs font-medium mb-1 opacity-70">Notas / Parecer:</span>
                    {cal.notes}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground pt-2 opacity-60">
                   Registrado por: {cal.registered_by_user?.full_name || "Usuário não identificado"}
                </div>
              </div>

              {cal.certificate_url && (
                <div className="shrink-0">
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-background shadow-sm hover:bg-primary/10 hover:text-primary transition-colors hover:border-primary/20"
                    onClick={() => window.open(cal.certificate_url!, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                    Baixar Laudo (PDF)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
