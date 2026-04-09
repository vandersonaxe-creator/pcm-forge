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
import { Badge } from "@/components/ui/badge";
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
          { label: "Planejadas", value: counters?.planned || 0, color: "text-zinc-500", icon: Calendar },
          { label: "Abertas", value: counters?.open || 0, color: "text-blue-600", icon: CircleDot },
          { label: "Em Andamento", value: counters?.inProgress || 0, color: "text-amber-600", icon: Loader2 },
          { label: "Concluídas (Mês)", value: counters?.completedMonth || 0, color: "text-emerald-600", icon: ClipboardList },
        ].map((card) => (
          <Card key={card.label} className="bg-card border-border shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("p-2 rounded-lg", card.color.replace("text-", "bg-").replace("]", "/10]"))}>
                <card.icon className={cn("h-5 w-5", card.color, card.label === "Em Andamento" && "animate-spin-slow")} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mt-1">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "all")}>
              <SelectTrigger className="w-[150px] bg-background border-border text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {Object.entries(OS_STATUS_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
              <SelectTrigger className="w-[150px] bg-background border-border text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                {Object.entries(OS_TYPE_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || "all")}>
              <SelectTrigger className="w-[150px] bg-background border-border text-sm">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                {Object.entries(OS_PRIORITY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={(val) => setFilterAssignee(val || "all")}>
              <SelectTrigger className="w-[190px] bg-background border-border text-sm">
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Técnicos</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAsset} onValueChange={(val) => setFilterAsset(val || "all")}>
              <SelectTrigger className="w-[190px] bg-background border-border text-sm">
                <SelectValue placeholder="Ativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Ativos</SelectItem>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.tag} - {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
               <Input 
                type="date" 
                className="w-[145px] bg-background border-border h-9 text-sm" 
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
              />
               <ArrowRight className="h-4 w-4 text-muted-foreground" />
               <Input 
                type="date" 
                className="w-[140px] bg-background border-border h-9 text-xs" 
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
              />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 text-muted-foreground hover:bg-muted"
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
          <Card className="bg-card border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-[#F8FAFC]">
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">OS Nº</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Título</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Tipo</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Ativo</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Técnico</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Prioridade</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Agenda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => {
                  const Icon = IconMap[OS_TYPE_ICONS[wo.os_type]] || Wrench;
                  return (
                    <TableRow
                      key={wo.id}
                      className="border-border cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                      onClick={() => router.push(`/work-orders/${wo.id}`)}
                    >
                      <TableCell className="font-mono font-bold text-primary">
                        {wo.wo_number}
                      </TableCell>
                      <TableCell className="font-semibold">{wo.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{OS_TYPE_LABELS[wo.os_type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                           {(wo as any).asset?.tag}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {(wo as any).assignee?.full_name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px] py-0", OS_PRIORITY_COLORS[wo.priority])}>
                           {OS_PRIORITY_LABELS[wo.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[10px] py-0", 
                          OS_STATUS_COLORS[wo.status],
                          wo.status === "in_progress" && "animate-pulse",
                          wo.status === "cancelled" && "line-through opacity-50"
                        )}>
                           {OS_STATUS_LABELS[wo.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
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
