"use client";

import { usePlan, usePlanWorkOrders, updatePlan, generatePlanWorkOrders } from "@/hooks/use-plans";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanStatusBadge, StatusBadge, CriticalityBadge } from "@/components/shared/badges";
import { PlanExecutionsTable } from "@/components/plans/plan-executions-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Edit, 
  PlaySquare, 
  Power, 
  PowerOff, 
  ChevronLeft, 
  Calendar, 
  User, 
  Clock, 
  History,
  LayoutDashboard,
  Wrench,
  Gauge,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Loader2
} from "lucide-react";
import { formatDuration } from "@/lib/plans";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";

export default function PlanDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { plan, loading, refetch } = usePlan(id);
  const { workOrders, loading: ordersLoading, refetch: refetchOrders } = usePlanWorkOrders(id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Plano não encontrado</h2>
        <Button onClick={() => router.push("/plans")} className="mt-4">
          Voltar para listagem
        </Button>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await updatePlan(id, { is_active: !plan.is_active });
      toast.success(plan.is_active ? "Plano desativado!" : "Plano reativado!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleGenerateManual = async () => {
    setIsGenerating(true);
    try {
      await generatePlanWorkOrders();
      toast.success("Geração automática disparada com sucesso!");
      refetch();
      refetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar OS");
    } finally {
      setIsGenerating(false);
    }
  };

  const completedOrders = workOrders.filter(wo => wo.status === "completed");
  const completionRate = workOrders.length > 0 
    ? Math.round((completedOrders.length / workOrders.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Planos Preventivos", href: "/plans" },
            { label: plan.name, href: `/plans/${id}` },
          ]}
        />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
              <PlanStatusBadge plan={plan} className="h-6 px-3 text-xs" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                {plan.asset?.tag}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-sm font-medium">{plan.asset?.name}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/plans/${id}/edit`)}
              className="bg-card/50 border-border/30 hover:bg-muted/50"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`border-border/30 ${plan.is_active ? "text-red-400 hover:text-red-300 hover:bg-red-400/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"}`}
            >
              {isToggling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : plan.is_active ? (
                <PowerOff className="mr-2 h-4 w-4" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}
              {plan.is_active ? "Desativar" : "Ativar"}
            </Button>

            <Button
              onClick={handleGenerateManual}
              disabled={isGenerating || !plan.is_active}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlaySquare className="mr-2 h-4 w-4" />
              )}
              Gerar OS Agora
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => router.push("/plans")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Próxima Data</p>
              <p className="text-lg font-bold">
                {plan.next_due_date ? format(new Date(plan.next_due_date), "dd/MM/yyyy") : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/15 text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Responsável</p>
              <p className="text-lg font-bold truncate max-w-[150px]">
                {plan.assignee?.full_name || "Não definido"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/15 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Janela / Tol.</p>
              <p className="text-lg font-bold">{plan.execution_window_days}d / {plan.tolerance_days}d</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/15 text-purple-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total OS</p>
              <p className="text-lg font-bold">{workOrders.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Main Details & Executions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/30 overflow-hidden">
            <CardHeader className="border-b border-border/30 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Execuções
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PlanExecutionsTable workOrders={workOrders} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/30">
            <CardHeader className="border-b border-border/30 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Indicadores de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1 text-center">
                  <div className="text-2xl font-bold">{workOrders.length}</div>
                  <div className="text-xs text-muted-foreground">OS Geradas</div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{completedOrders.length}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
                <div className="space-y-1 text-center border-x border-border/30 px-4">
                  <div className="text-2xl font-bold text-amber-400">{completionRate}%</div>
                  <div className="text-xs text-muted-foreground">Taxa Conclusão</div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-2xl font-bold">100%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Disponibilidade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Asset Detail & Plan Info */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/30 overflow-hidden">
            <CardHeader className="border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Ativo Vinculado
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-muted/50 border border-border/30">
                  {plan.asset?.asset_type === "equipment" ? (
                    <Wrench className="h-6 w-6 text-primary" />
                  ) : (
                    <Gauge className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-sm font-bold text-primary">{plan.asset?.tag}</div>
                  <div className="font-semibold leading-none">{plan.asset?.name}</div>
                  {plan.asset?.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {plan.asset.location.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Criticidade</div>
                  <CriticalityBadge level={plan.asset?.criticality || 'C'} />
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                  <StatusBadge status={plan.asset?.status || 'active'} />
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => router.push(`/assets/${plan.asset_id}`)}
              >
                Ver Detalhes do Ativo
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/30">
            <CardHeader className="border-b border-border/30 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Regras do Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center group">
                  <span className="text-muted-foreground">Frequência</span>
                  <span className="font-medium bg-muted/50 px-2 py-0.5 rounded">
                    {FREQUENCY_LABELS[plan.frequency]}
                    {plan.frequency === 'custom' && ` (${plan.frequency_days}d)`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duração Estimada</span>
                  <span className="font-medium">{formatDuration(plan.estimated_duration_min)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Herda Criticidade</span>
                  <span className="font-medium text-emerald-400">{plan.inherits_criticality ? "Sim" : "Não"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Centro de Custo</span>
                  <span className="font-medium">{plan.cost_center || "—"}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">Criado em</span>
                  <span className="text-xs font-medium">
                    {format(new Date(plan.created_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Última Geração</span>
                  <span className="text-xs font-medium">
                    {plan.last_generated_at ? format(new Date(plan.last_generated_at), "dd/MM/yyyy HH:mm") : "Nunca"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
