"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInstrumentsByCalibrationStatus } from "@/hooks/use-calibrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock, CalendarRange, ArrowRight, Gauge } from "lucide-react";
import { formatDate, daysUntil } from "@/lib/utils";
import { ASSET_STATUS_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { Asset } from "@/lib/types/database";

export default function CalibrationsPanelPage() {
  const router = useRouter();
  const { instruments, loading, refetch } = useInstrumentsByCalibrationStatus();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // agrupar instrumentos pelos 3 status
  const valid = instruments.filter(a => a.calibration_status === "valid" || a.calibration_status === "pending" || a.calibration_status === "not_applicable"); // Consider pending/not_app as falling into regular list but actually pending is tricky. We'll group them by logical days.
  const expiring = instruments.filter(a => a.calibration_status === "expiring");
  const expired = instruments.filter(a => a.calibration_status === "expired");

  // Refine grouping based on days if needed, but DB trigger handles calibration_status correctly.

  const renderCard = (asset: Asset) => {
    const days = daysUntil(asset.next_calibration_date);
    const isOverdue = days !== null && days < 0;

    return (
      <Card 
        key={asset.id} 
        className="mb-3 hover:border-primary/50 cursor-pointer transition-colors border-border/40 group bg-card"
        onClick={() => router.push(`/assets/${asset.id}?tab=calibrations`)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-mono text-xs font-semibold text-primary">{asset.tag}</span>
              <p className="font-medium text-sm leading-tight text-foreground">{asset.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-60 mb-0.5">Vencimento</span>
              <span className={`font-bold ${isOverdue ? "text-red-600" : days !== null && days <= 30 ? "text-amber-600" : "text-emerald-600"}`}>
                {formatDate(asset.next_calibration_date)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-60 mb-0.5">Laboratório</span>
              <span className="font-bold text-foreground truncate block" title={asset.calibration_provider || "Não informada"}>
                {asset.calibration_provider || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              {isOverdue ? (
                <span className="text-xs font-medium text-red-500">Atrasado {Math.abs(days || 0)} d</span>
              ) : days !== null ? (
                <span className="text-xs font-medium text-amber-500/90">{days} dias rest.</span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] px-3 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-all font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/calibrations/new?asset_id=${asset.id}`);
              }}
            >
              Registrar <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Gauge className="h-6 w-6 text-primary" />
          Painel Metrológico
        </h1>
        <p className="text-muted-foreground">
          Gerencie o ciclo de vida e vencimentos das calibrações de seus instrumentos.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full" />
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
             </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {/* Coluna 1: Vencidas */}
          <div className="flex flex-col bg-[#FEF2F2]/50 rounded-xl border border-red-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-red-200 bg-[#FEE2E2] flex items-center justify-between text-[#991B1B]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="h-4 w-4" /> Vencidas
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#991B1B] text-white text-[10px] font-bold">{expired.length}</span>
            </div>
            <ScrollArea className="flex-1 p-3 bg-white/40">
              {expired.map(renderCard)}
              {expired.length === 0 && (
                <div className="text-center p-8 text-sm text-red-300 font-medium italic">Nenhum instrumento vencido</div>
              )}
            </ScrollArea>
          </div>

          {/* Coluna 2: Vencendo */}
          <div className="flex flex-col bg-[#FFFBEB]/50 rounded-xl border border-amber-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-amber-200 bg-[#FEF3C7] flex items-center justify-between text-[#92400E]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <Clock className="h-4 w-4" /> Vencendo (30d)
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#92400E] text-white text-[10px] font-bold">{expiring.length}</span>
            </div>
            <ScrollArea className="flex-1 p-3 bg-white/40">
              {expiring.map(renderCard)}
              {expiring.length === 0 && (
                <div className="text-center p-8 text-sm text-amber-300 font-medium italic">Nenhum instrumento vencendo</div>
              )}
            </ScrollArea>
          </div>

          {/* Coluna 3: Válidas */}
          <div className="flex flex-col bg-[#ECFDF5]/50 rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-emerald-200 bg-[#D1FAE5] flex items-center justify-between text-[#065F46]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" /> Válidas
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#065F46] text-white text-[10px] font-bold">{valid.length}</span>
            </div>
            <ScrollArea className="flex-1 p-3 bg-white/40">
              {valid.map(renderCard)}
              {valid.length === 0 && (
                <div className="text-center p-8 text-sm text-emerald-300 font-medium italic">Nenhum instrumento válido</div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
