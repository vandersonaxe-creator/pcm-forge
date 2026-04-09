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
  return (
    <Card className="glass-morphism border-border shadow-card hover:shadow-xl transition-all duration-300 group overflow-hidden hover-lift hover-glow animate-in-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[13px] font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2.5 rounded-full", color.replace("text-", "bg-").replace("]", "/15]"))}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <div className={cn("text-2xl font-bold tracking-tight text-foreground")}>
              {value}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1 truncate">
              {subtext}
            </p>
          </>
        )}
        <Link 
          href={href} 
          className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-4 opacity-0 group-hover:opacity-100 transition-all no-underline"
        >
          Ver detalhes <ChevronRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
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
        color="text-primary"
        href="/assets"
        loading={loading}
      />
      
      <KPICard
        title="Ordens de Serviço"
        value={kpis?.open_work_orders}
        subtext={osSubtext}
        icon={ClipboardList}
        color="text-secondary"
        href="/work-orders"
        loading={loading}
      />

      <KPICard
        title="Preventivas Atrasadas"
        value={kpis?.preventives_overdue}
        subtext={kpis?.preventives_overdue ? "Requerem atenção imediata" : "Tudo em dia"}
        icon={AlertTriangle}
        color={prevColor}
        href="/planning"
        loading={loading}
      />

      <KPICard
        title="Calibrações Vencidas"
        value={kpis?.calibrations_expired}
        subtext={`${kpis?.calibrations_expiring_30d || 0} vencem em 30 dias`}
        icon={Gauge}
        color={calibColor}
        href="/calibrations"
        loading={loading}
      />
    </div>
  );
}
