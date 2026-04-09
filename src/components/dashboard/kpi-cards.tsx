"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, 
  ClipboardList, 
  AlertTriangle, 
  Gauge, 
  ChevronRight,
  TrendingUp,
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
  // Determine if this is an "alert/danger" card
  const isAlert = (color === "text-[var(--color-danger-text)]" || color === "text-destructive") && Number(value) > 0;
  
  // Icon bg parsing (quick helper)
  const getBgClass = () => {
    if (color.includes("danger") || color.includes("destructive")) return "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";
    if (color.includes("warning")) return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    if (color.includes("success")) return "bg-[var(--color-success-bg)] text-[var(--color-success-icon)]";
    if (color.includes("primary")) return "bg-[var(--color-brand-light)] text-[var(--color-brand)]";
    if (color.includes("secondary")) return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    return "bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]";
  };

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-xl bg-white p-5 border shadow-card transition-all duration-200 hover:-translate-y-[2px]",
      isAlert ? "border-l-[3px] border-l-[var(--color-danger-text)] border-y-[var(--color-border)] border-r-[var(--color-border)]" : "border-[var(--color-border)]"
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
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", getBgClass(), isAlert && "animate-status-pulse")}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-[13px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.05em] leading-tight">
              {title}
            </h3>
          </div>
          
          <div className="flex flex-col">
            <span className={cn(
              "text-[28px] font-bold leading-none mb-1",
              isAlert ? "text-[var(--color-danger-text)]" : "text-[var(--color-text-primary)]"
            )}>
              {value}
            </span>
            <span className="text-[13px] font-medium text-[var(--color-text-tertiary)] truncate">
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
