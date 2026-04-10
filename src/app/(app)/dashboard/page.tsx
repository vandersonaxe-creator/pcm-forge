"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { useCompany } from "@/hooks/use-company";
import { GridKPIBar } from "@/components/dashboard/kpi-cards";
import { OSMonthlyChart } from "@/components/dashboard/os-monthly-chart";
import { ComplianceGauge } from "@/components/dashboard/compliance-gauge";
import { ActivityTimeline, buildTimelineEvents } from "@/components/dashboard/activity-timeline";
import { OverdueAlerts, CalibrationAlerts } from "@/components/dashboard/alerts-panels";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, LayoutDashboard, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { 
    kpis, 
    overdue, 
    calibrations, 
    recentWOs, 
    chartData, 
    loading, 
    error, 
    refetch 
  } = useDashboard();
  
  const { user, company } = useCompany();

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Bom dia";
    if (hour >= 12 && hour < 18) greeting = "Boa tarde";
    if (hour >= 18 || hour < 5) greeting = "Boa noite";

    if (!user?.full_name || user.full_name === "Seu Nome" || user.full_name.trim() === "") {
      return greeting;
    }

    return `${greeting}, ${user.full_name.split(" ")[0]}`;
  };

  const currentDateFormatted = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-6 pb-20 lg:px-10 lg:pt-8 space-y-6">
      
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">
            {getGreeting()}
          </h1>
          <p className="text-[14px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            <span>
               {company?.name || "Empresa"} · Painel de Manutenção
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            className="h-10 w-10 rounded-lg bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-sm hover:bg-[var(--color-bg-muted)] transition-all"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </header>

      {/* Seção 1: KPI Cards */}
      <section>
        <GridKPIBar kpis={kpis} loading={loading} />
      </section>

      {/* Seção 2: Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-12 auto-rows-min">
         <div className="lg:col-span-8">
            <OSMonthlyChart data={chartData} loading={loading} />
         </div>
         <div className="lg:col-span-4 flex flex-col h-full">
            <ComplianceGauge percentage={kpis?.compliance_rate} loading={loading} />
         </div>
      </div>

      {/* Seção 3: Alertas Operacionais + Timeline */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ActivityTimeline
            events={buildTimelineEvents(recentWOs)}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-7 grid gap-6 grid-rows-2">
          <OverdueAlerts items={overdue} />
          <CalibrationAlerts items={calibrations} />
        </div>
      </div>

      <footer className="pt-8 flex flex-col items-center gap-2 border-t border-border/40">
          <p className="text-[11px] text-[var(--color-text-muted)] opacity-60">
             PCM Forge v1.5
          </p>
      </footer>

      {/* Error Toast Fallback */}
      {error && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-destructive text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
           <RefreshCw className="h-4 w-4" />
           <p className="text-xs font-bold uppercase tracking-widest">Erro na Sincronização: {error}</p>
           <Button variant="link" className="text-white p-0 h-6 font-black" onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      )}

    </div>
  );
}
