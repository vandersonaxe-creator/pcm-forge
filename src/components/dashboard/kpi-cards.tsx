"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, 
  ClipboardList, 
  AlertTriangle, 
  Gauge, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardKPIs } from "@/lib/types/database";

interface KPICardProps {
  title: string;
  value: number | string | undefined;
  subtext: string;
  icon: LucideIcon;
  color: string;
  href: string;
  loading?: boolean;
}

function KPICard({ title, value, subtext, icon: Icon, color, href, loading }: KPICardProps) {
  const isNumeric = typeof value === 'number';
  const numericValue = Number(value);
  
  // Special alert logic for alert categories (danger/destructive)
  const isAlertCategory = color === "danger" || color === "destructive";
  const hasActiveAlert = isAlertCategory && numericValue > 0;
  
  // Icon bg parsing (quick helper)
  const getBgClass = () => {
    if (isAlertCategory) {
      return hasActiveAlert 
        ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]" 
        : "bg-[var(--color-success-bg)] text-[var(--color-success-icon)]";
    }
    if (color.includes("warning")) return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    if (color.includes("success")) return "bg-[var(--color-success-bg)] text-[var(--color-success-icon)]";
    if (color.includes("primary")) return "bg-[var(--color-brand-light)] text-[var(--color-brand)]";
    if (color.includes("secondary")) return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    return "bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]";
  };

  const DisplayIcon = (isAlertCategory && !hasActiveAlert) ? CheckCircle2 : Icon;

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-xl bg-white p-5 border shadow-card transition-all duration-200 hover:-translate-y-[2px]",
      hasActiveAlert ? "border-l-[3px] border-l-[var(--color-danger-text)] border-y-[var(--color-border)] border-r-[var(--color-border)]" : "border-[var(--color-border)]"
    )}>
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-10 w-16" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", getBgClass(), hasActiveAlert && "animate-status-pulse")}>
              <DisplayIcon className={cn("h-5 w-5", isAlertCategory && !hasActiveAlert && "text-[var(--color-success-icon)]")} />
            </div>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] capitalize leading-tight">
              {title.toLowerCase()}
            </h3>
          </div>
          
          <div className="flex flex-col">
            <span className={cn(
              "text-[28px] font-bold leading-none mb-1",
              hasActiveAlert ? "text-[var(--color-danger-text)]" : "text-[var(--color-text-primary)]"
            )}>
              {value}
            </span>
            <span className={cn(
              "text-[13px] font-medium truncate",
              isAlertCategory && !hasActiveAlert ? "text-[var(--color-success-icon)]" : "text-[var(--color-text-tertiary)]"
            )}>
              {subtext}
            </span>
          </div>

          <Link 
            href={href} 
            className="absolute right-5 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[12px] font-semibold text-[var(--color-brand)] no-underline"
          >
            Detalhes <ChevronRight className="h-3 w-3" />
          </Link>
        </>
      )}
    </div>
  );
}

export function GridKPIBar({ kpis, loading }: { kpis: DashboardKPIs | null, loading?: boolean }) {
  const osSubtext = kpis 
    ? `abertas · ${kpis.completed_this_month} concluídas este mês` 
    : "...";

  const prevColor = (kpis?.preventives_overdue || 0) > 0 ? "text-destructive" : "text-success";
  const calibColor = (kpis?.calibrations_expired || 0) > 0 
    ? "text-destructive" 
    : (kpis?.calibrations_expiring_30d || 0) > 0 ? "text-warning" : "text-success";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Ativos Operacionais"
        value={kpis?.total_assets}
        subtext={`${kpis?.total_instruments || 0} instrumentos`}
        icon={Settings}
        color="primary"
        href="/assets"
        loading={loading}
      />
      
      <KPICard
        title="Ordens de Serviço"
        value={kpis?.open_work_orders}
        subtext={osSubtext}
        icon={ClipboardList}
        color="secondary"
        href="/work-orders"
        loading={loading}
      />

      <KPICard
        title="Preventivas Atrasadas"
        value={kpis?.preventives_overdue}
        subtext={kpis?.preventives_overdue ? "Requerem atenção imediata" : "Tudo em dia"}
        icon={AlertTriangle}
        color={(kpis?.preventives_overdue || 0) > 0 ? "danger" : "success"}
        href="/planning"
        loading={loading}
      />

      <KPICard
        title="Calibrações Vencidas"
        value={kpis?.calibrations_expired}
        subtext={`${kpis?.calibrations_expiring_30d || 0} vencem em 30 dias`}
        icon={Gauge}
        color={(kpis?.calibrations_expired || 0) > 0 ? "danger" : (kpis?.calibrations_expiring_30d || 0) > 0 ? "warning" : "success"}
        href="/calibrations"
        loading={loading}
      />
    </div>
  );
}
