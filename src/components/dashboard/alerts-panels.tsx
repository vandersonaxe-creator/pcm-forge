"use client";

import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  CheckCircle2,
  Settings,
  Gauge,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverdueMaintenance, CalibrationAlert } from "@/lib/types/database";

// --- Overdue Maintenance Alerts ---
export function OverdueAlerts({ items }: { items: OverdueMaintenance[] }) {
  const hasItems = items.length > 0;

  return (
    <Card className={cn(
      "bg-white border-[var(--color-border)] shadow-card overflow-hidden", 
      hasItems ? "border-l-[3px] border-l-[var(--color-danger-text)]" : "border-l-0"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-6">
        <CardTitle className="text-[14px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
           <AlertTriangle className={cn("h-4 w-4", hasItems ? "text-[var(--color-danger-text)]" : "text-[var(--color-success-icon)]")} />
           Preventivas Atrasadas
        </CardTitle>
        {hasItems && (
          <Link href="/planning" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline no-underline">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      
      <CardContent>
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-center space-y-3">
             <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
             <p className="text-[14px] font-medium text-[#166534]">Todas as preventivas estão em dia</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div key={item.plan_id} className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border group hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-mono font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded leading-none">
                        {item.asset_tag}
                     </span>
                     <Badge variant="outline" className="text-[10px] font-bold border-destructive/20 bg-destructive/5 text-destructive">
                        {item.days_overdue} dias
                     </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{item.plan_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.asset_name}</p>
                </div>
                <Link href="/planning" className="h-8 w-8 rounded-full border border-border/20 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive transition-all">
                   <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Calibration Alerts ---
export function CalibrationAlerts({ items }: { items: CalibrationAlert[] }) {
  const hasItems = items.length > 0;

  return (
    <Card className={cn(
      "bg-white border-[var(--color-border)] shadow-card overflow-hidden", 
      hasItems ? "border-l-[3px] border-l-[var(--color-warning-text)]" : "border-l-0"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-6">
        <CardTitle className="text-[14px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
           <Gauge className={cn("h-4 w-4", hasItems ? "text-[var(--color-warning-text)]" : "text-[var(--color-success-icon)]")} />
           Calibrações Próximas
        </CardTitle>
        {hasItems && (
          <Link href="/calibrations" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      
      <CardContent>
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-center space-y-3">
             <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
             <p className="text-[14px] font-medium text-[#166534]">Todas as calibrações estão em dia</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div key={item.asset_id} className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border group hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
                  <Gauge className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-mono font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded leading-none">
                        {item.asset_tag}
                     </span>
                     <Badge variant="outline" className={cn(
                       "text-[10px] font-bold px-2 py-0",
                       item.alert_level === 'expired' 
                        ? "border-destructive/20 bg-destructive/5 text-destructive" 
                        : "border-warning/20 bg-warning/5 text-warning"
                     )}>
                        {item.alert_level === 'expired' ? `Vencida há ${Math.abs(item.days_remaining)} dias` : `Vence em ${item.days_remaining} dias`}
                     </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{item.asset_name}</p>
                </div>
                <Link href={`/calibrations/new?asset_id=${item.asset_id}`} className="h-8 w-8 rounded-full border border-border/20 flex items-center justify-center text-muted-foreground hover:bg-warning hover:text-white hover:border-warning transition-all" title="Registrar calibração">
                   <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
