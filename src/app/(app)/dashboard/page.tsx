"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { useCompany } from "@/hooks/use-company";
import { GridKPIBar } from "@/components/dashboard/kpi-cards";
import { OSMonthlyChart } from "@/components/dashboard/os-monthly-chart";
import { ComplianceGauge } from "@/components/dashboard/compliance-gauge";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { OverdueAlerts, CalibrationAlerts } from "@/components/dashboard/alerts-panels";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, LayoutDashboard } from "lucide-react";
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
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const currentDateFormatted = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-6 pb-20 lg:px-10 lg:pt-8 space-y-6">
      
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <LayoutDashboard className="h-5 w-5" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-foreground">
               {getGreeting()}, {user?.full_name ? user.full_name.split(' ')[0] : "Gestor"}
             </h1>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2 pl-1.5 border-l-2 border-primary/20 ml-1">
            <span className="text-primary font-bold uppercase tracking-widest text-[10px]">
               {company?.name || "PCM Forge"}
            </span>
            <span className="opacity-40 select-none">|</span>
            <span>Painel de Manutenção Industrial</span>
          </p>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-5 bg-card py-2 px-4 rounded-xl border border-border shadow-sm">
          <div className="space-y-0 text-right hidden sm:block">
             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Status</p>
             <div className="flex items-center gap-1.5 justify-end">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <p className="text-[11px] font-bold text-foreground">ONLINE</p>
             </div>
          </div>
          
          <div className="w-px h-6 bg-border hidden sm:block" />

          <div className="space-y-0 text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1 justify-end leading-none mb-1">
               <Clock className="h-2.5 w-2.5" />
               Hora Local
            </p>
            <p className="text-xs font-bold font-mono text-primary leading-none uppercase">
               {format(new Date(), "HH:mm")}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-all"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
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

      {/* Seção 3: Alertas Operacionais */}
      <section className="grid gap-6 lg:grid-cols-2">
         <OverdueAlerts items={overdue} />
         <CalibrationAlerts items={calibrations} />
      </section>

      <footer className="pt-8 flex flex-col items-center gap-2 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-40">
             PCM Forge v1.5 · Painel de Gestão Industrial
          </p>
          <p className="text-[10px] text-primary/40 font-semibold mb-2">
             {currentDateFormatted}
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
