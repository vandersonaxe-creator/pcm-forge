"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlans, generatePlanWorkOrders } from "@/hooks/use-plans";
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
import { PlanStatusBadge } from "@/components/shared/badges"; // Check where to export PlanStatusBadge
import { EmptyState } from "@/components/shared/empty-state";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { getPlanOperationalStatus, formatDuration } from "@/lib/plans";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  CalendarClock,
  Loader2,
  Filter,
  PlaySquare,
  AlertCircle,
  CalendarCheck2,
  CalendarRange
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is the toast library
import { cn } from "@/lib/utils";

export default function PlansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFrequency, setFilterFrequency] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const { plans, loading, refetch } = usePlans({
    status: filterStatus,
    frequency: filterFrequency,
    search: debouncedSearch,
  });

  // Debounce search
  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generatePlanWorkOrders();
      toast.success("Geração automática executada com sucesso!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar OS");
    } finally {
      setIsGenerating(false);
    }
  };

  // Counters
  const activePlans = plans.filter(p => p.is_active);
  const overduePlans = activePlans.filter(p => getPlanOperationalStatus(p) === "overdue");
  const dueSoonPlans = activePlans.filter(p => getPlanOperationalStatus(p) === "due_soon");
  const inactivePlans = plans.filter(p => !p.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Planos Preventivos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe o cronograma de manutenção preventiva industrial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/5 font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlaySquare className="mr-2 h-4 w-4" />
            )}
            Executar Geração
          </Button>
          <Button
            onClick={() => router.push("/plans/new")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Planos Ativos", value: activePlans.length, bgClass: "bg-[var(--color-success-bg)]", textClass: "text-[var(--color-success-icon)]", icon: CalendarCheck2 },
          { label: "Em Atraso", value: overduePlans.length, bgClass: "bg-[var(--color-danger-bg)]", textClass: "text-[var(--color-danger-text)]", icon: AlertCircle },
          { label: "A Vencer (7d)", value: dueSoonPlans.length, bgClass: "bg-[var(--color-warning-bg)]", textClass: "text-[var(--color-warning-text)]", icon: CalendarClock },
          { label: "Inativos", value: inactivePlans.length, bgClass: "bg-[var(--color-bg-muted)]", textClass: "text-[var(--color-text-secondary)]", icon: CalendarRange },
        ].map((counter) => (
          <Card key={counter.label} className="bg-white border-[var(--color-border)] shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("p-2.5 rounded-full", counter.bgClass)}>
                <counter.icon className={cn("h-5 w-5", counter.textClass)} />
              </div>
              <div>
                <p className="text-[24px] font-bold tracking-tight leading-none text-[var(--color-text-primary)]">{counter.value}</p>
                <p className="text-[12px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-[0.05em] leading-none mt-2">{counter.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Buscar por nome do plano..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] w-full block"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Status Operacional</label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
                  <SelectTrigger className="w-[180px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="on_track">Em dia</SelectItem>
                    <SelectItem value="due_soon">A vencer (7d)</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="no_date">Sem data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Frequência</label>
                <Select value={filterFrequency} onValueChange={(v) => setFilterFrequency(v ?? "all")}>
                  <SelectTrigger className="w-[160px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-8 w-8" />}
          title="Nenhum plano encontrado"
          description={
            debouncedSearch || filterFrequency !== "all" || filterStatus !== "all"
              ? "Tente ajustar os filtros ou buscar por outro termo."
              : "Comece criando o seu primeiro plano de manutenção preventiva."
          }
          action={
            !debouncedSearch && filterFrequency === "all" && filterStatus === "all" ? (
              <Button
                onClick={() => router.push("/plans/new")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="hidden md:table-cell">Frequência</TableHead>
                <TableHead>Próxima Execução</TableHead>
                <TableHead className="hidden lg:table-cell">Duração Est.</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/plans/${plan.id}`)}
                >
                  <TableCell>
                    <div className="font-semibold text-[14px] text-[var(--color-text-primary)]">{plan.name}</div>
                    {plan.description && (
                      <div className="text-[13px] text-[var(--color-text-secondary)] line-clamp-1 max-w-[200px]">
                        {plan.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-[13px] font-semibold text-[var(--color-brand)]">{plan.asset?.tag}</span>
                      <span className="text-[13px] truncate max-w-[150px] text-[var(--color-text-primary)]">{plan.asset?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-[13px] text-[var(--color-text-secondary)]">
                    {FREQUENCY_LABELS[plan.frequency]}
                    {plan.frequency === "custom" && plan.frequency_days && ` (${plan.frequency_days}d)`}
                  </TableCell>
                  <TableCell>
                    {plan.next_due_date ? (
                      <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                        {format(new Date(plan.next_due_date), "dd/MM/yyyy")}
                      </div>
                    ) : (
                      <div className="text-[13px] text-[var(--color-text-muted)]">—</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-[13px] text-[var(--color-text-secondary)]">
                    {formatDuration(plan.estimated_duration_min)}
                  </TableCell>
                  <TableCell className="text-center">
                    <PlanStatusBadge plan={plan} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
