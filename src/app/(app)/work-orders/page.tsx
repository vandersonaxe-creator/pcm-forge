"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkOrders, getWorkOrderCounters } from "@/hooks/use-work-orders";
import { useUsers } from "@/hooks/use-users";
import { useAssets } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { OsStatusBadge, OsPriorityBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { 
  OS_STATUS_LABELS, 
  OS_STATUS_COLORS, 
  OS_TYPE_LABELS, 
  OS_TYPE_COLORS,
  OS_TYPE_ICONS,
  OS_PRIORITY_LABELS,
  OS_PRIORITY_COLORS
} from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  Calendar,
  X,
  ClipboardList,
  Wrench,
  AlertTriangle,
  Gauge,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IconMap: any = {
  Wrench,
  AlertTriangle,
  Search,
  Gauge,
};

export default function WorkOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterAsset, setFilterAsset] = useState("all");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  
  const [counters, setCounters] = useState<any>(null);

  const filters = useMemo(() => ({
    status: filterStatus,
    os_type: filterType,
    priority: filterPriority,
    assigned_to: filterAssignee,
    asset_id: filterAsset,
    date_start: filterDateStart,
    date_end: filterDateEnd,
    page,
  }), [
    filterStatus,
    filterType,
    filterPriority,
    filterAssignee,
    filterAsset,
    filterDateStart,
    filterDateEnd,
    page
  ]);

  const { workOrders, loading, error, totalCount, refetch } = useWorkOrders(filters);

  const { users } = useUsers();
  const { assets } = useAssets();

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getWorkOrderCounters();
        setCounters(stats);
      } catch (err) {
        console.error("Failed to fetch work order counters:", err);
      }
    }
    fetchStats();
  }, [workOrders]);

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterType("all");
    setFilterPriority("all");
    setFilterAssignee("all");
    setFilterAsset("all");
    setFilterDateStart("");
    setFilterDateEnd("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe e gerencie a execução das atividades de manutenção industrial
          </p>
        </div>
        <Button
          onClick={() => router.push("/work-orders/new")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova OS
        </Button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Planejadas", value: counters?.planned || 0, bgClass: "bg-[var(--color-bg-muted)]", textClass: "text-[var(--color-text-secondary)]", icon: Calendar },
          { label: "Abertas", value: counters?.open || 0, bgClass: "bg-[var(--color-brand-light)]", textClass: "text-[var(--color-brand)]", icon: CircleDot },
          { label: "Em Andamento", value: counters?.inProgress || 0, bgClass: "bg-[var(--color-warning-bg)]", textClass: "text-[var(--color-warning-text)]", icon: Loader2 },
          { label: "Concluídas (Mês)", value: counters?.completedMonth || 0, bgClass: "bg-[var(--color-success-bg)]", textClass: "text-[var(--color-success-icon)]", icon: ClipboardList },
        ].map((card) => (
          <Card key={card.label} className="bg-white border-[var(--color-border)] shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("p-2.5 rounded-full", card.bgClass)}>
                <card.icon className={cn("h-5 w-5", card.textClass, card.label === "Em Andamento" && "animate-spin-slow")} />
              </div>
              <div>
                <p className="text-[24px] font-bold tracking-tight leading-none text-[var(--color-text-primary)]">{card.value}</p>
                <p className="text-[12px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-[0.05em] leading-none mt-2">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Status</label>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "all")}>
                <SelectTrigger className="w-[150px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(OS_STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Tipo</label>
              <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
                <SelectTrigger className="w-[150px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(OS_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Prioridade</label>
              <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || "all")}>
                <SelectTrigger className="w-[150px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  {Object.entries(OS_PRIORITY_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Técnico</label>
              <Select value={filterAssignee} onValueChange={(val) => setFilterAssignee(val || "all")}>
                <SelectTrigger className="w-[190px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os técnicos</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Ativo</label>
              <Select value={filterAsset} onValueChange={(val) => setFilterAsset(val || "all")}>
                <SelectTrigger className="w-[190px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os ativos</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.tag} - {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mb-[2px]">
               <Input 
                type="date" 
                className="w-[145px] bg-white border-[var(--color-border-strong)] h-[36px] text-[13px] rounded-lg" 
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
              />
               <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
               <Input 
                type="date" 
                className="w-[145px] bg-white border-[var(--color-border-strong)] h-[36px] text-[13px] rounded-lg" 
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
              />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-[36px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] mb-[2px]"
              onClick={clearFilters}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
          title="Erro ao carregar dados"
          description={error}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        />
      ) : workOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="Nenhuma OS encontrada"
          description="Ajuste os filtros ou crie uma nova ordem de serviço."
        />
      ) : (
        <div className="space-y-4">
          <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OS Nº</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agenda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => {
                  const Icon = IconMap[OS_TYPE_ICONS[wo.os_type]] || Wrench;
                  return (
                    <TableRow
                      key={wo.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/work-orders/${wo.id}`)}
                    >
                      <TableCell className="font-mono font-semibold text-[var(--color-text-primary)]">
                        {wo.wo_number}
                      </TableCell>
                      <TableCell className="font-semibold text-[14px] text-[var(--color-text-primary)]">{wo.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 align-middle">
                          <Icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                          <span className="text-[13px] text-[var(--color-text-secondary)]">{OS_TYPE_LABELS[wo.os_type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[13px] font-semibold text-[var(--color-text-primary)]">
                           {(wo as any).asset?.tag}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-[var(--color-text-secondary)]">
                        {(wo as any).assignee?.full_name || "—"}
                      </TableCell>
                      <TableCell>
                        <OsPriorityBadge priority={wo.priority} />
                      </TableCell>
                      <TableCell>
                        <OsStatusBadge status={wo.status} />
                      </TableCell>
                      <TableCell className="text-[13px] text-[var(--color-text-secondary)]">
                        {wo.scheduled_date ? format(new Date(wo.scheduled_date), "dd/MM/yy") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-xs text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{workOrders.length}</span> de <span className="font-medium text-foreground">{totalCount}</span> ordens
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-8 border-border/30"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 20 >= totalCount}
                onClick={() => setPage(page + 1)}
                className="h-8 border-border/30"
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
