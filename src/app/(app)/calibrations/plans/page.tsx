"use client";

import { useState } from "react";
import { 
  Gauge, 
  Search, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Filter,
  Download,
  ExternalLink,
  Loader2,
  FileCheck
} from "lucide-react";
import { useAssets } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MetrologyPlansPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { assets, loading } = useAssets({ 
    assetType: "instrument",
    search: searchTerm
  });

  const instruments = assets || [];

  const stats = {
    total: instruments.length,
    valid: instruments.filter(i => i.calibration_status === "valid").length,
    expired: instruments.filter(i => i.calibration_status === "expired").length,
    expiring: instruments.filter(i => i.calibration_status === "expiring").length,
  };

  function getStatusBadge(status: string) {
    switch (status) {
      case "valid":
        return <Badge className="badge-success border shadow-none px-2 py-0.5">Válido</Badge>;
      case "expiring":
        return <Badge className="badge-warning border shadow-none px-2 py-0.5">Vencendo</Badge>;
      case "expired":
        return <Badge className="badge-danger border shadow-none px-2 py-0.5">Vencido</Badge>;
      default:
        return <Badge className="badge-neutral border shadow-none px-2 py-0.5">Pendente</Badge>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-6 pb-20 lg:px-10 lg:pt-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Plano Metrológico
          </h1>
          <p className="text-[14px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
            <FileCheck className="h-4 w-4" />
            <span>Planejamento e status de calibração de todos os instrumentos industriais</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-sm hover:bg-[var(--color-bg-muted)] transition-all gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards (Dashboard Style) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Card */}
        <div className="flex flex-col justify-between rounded-xl bg-white p-5 border border-[var(--color-border)] shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <Gauge className="h-5 w-5" />
            </div>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-tight">Total Geral</h3>
          </div>
          <div className="text-[28px] font-bold text-[var(--color-text-primary)]">{stats.total}</div>
          <div className="text-[13px] font-medium text-[var(--color-text-tertiary)]">Instrumentos cadastrados</div>
        </div>

        {/* Valid Card */}
        <div className="flex flex-col justify-between rounded-xl bg-white p-5 border border-[var(--color-border)] shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-icon)]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-tight">Válidos</h3>
          </div>
          <div className="text-[28px] font-bold text-[var(--color-success-text)]">{stats.valid}</div>
          <div className="text-[13px] font-medium text-[var(--color-success-text)]">Conforme ao plano</div>
        </div>

        {/* Expiring Card */}
        <div className="flex flex-col justify-between rounded-xl bg-white p-5 border border-[var(--color-border)] shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning-icon)]">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-tight">Vencendo (30d)</h3>
          </div>
          <div className="text-[28px] font-bold text-[var(--color-warning-text)]">{stats.expiring}</div>
          <div className="text-[13px] font-medium text-[var(--color-warning-text)]">Requerem agendamento</div>
        </div>

        {/* Expired Card */}
        <div className={`flex flex-col justify-between rounded-xl bg-white p-5 border shadow-card ${stats.expired > 0 ? 'border-l-[3px] border-l-[var(--color-danger-text)] border-y-[var(--color-border)] border-r-[var(--color-border)]' : 'border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", stats.expired > 0 ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] animate-status-pulse" : "bg-[var(--color-success-bg)] text-[var(--color-success-icon)]")}>
              {stats.expired > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-tight">Vencidos</h3>
          </div>
          <div className={cn("text-[28px] font-bold", stats.expired > 0 ? "text-[var(--color-danger-text)]" : "text-[var(--color-text-primary)]")}>{stats.expired}</div>
          <div className={cn("text-[13px] font-medium", stats.expired > 0 ? "text-[var(--color-danger-text)]" : "text-[var(--color-success-icon)]")}>{stats.expired > 0 ? "Ação imediata necessária" : "Sem pendências"}</div>
        </div>
      </div>

      {/* Main List Table */}
      <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden rounded-xl">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Buscar por TAG ou Instrumento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-[var(--color-border)] text-[var(--color-text-primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[var(--color-bg-page)]/50">
              <TableRow className="border-[var(--color-border)] hover:bg-transparent">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] pl-6">TAG / Instrumento</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] text-center">Frequência</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Última Calibração</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Próxima Calibração</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] text-right pr-6">Ver Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center border-none">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-brand)]" />
                  </TableCell>
                </TableRow>
              ) : instruments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-[var(--color-text-muted)] border-none">
                    Nenhum instrumento encontrado para calibração.
                  </TableCell>
                </TableRow>
              ) : (
                instruments.map((item) => (
                  <TableRow key={item.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors group">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--color-text-primary)] tracking-tight">{item.tag}</span>
                        <span className="text-[12px] text-[var(--color-text-tertiary)]">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--color-bg-muted)] text-[11px] font-semibold text-[var(--color-text-secondary)]">
                        {item.calibration_frequency_days} dias
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)] text-[13px]">
                      {item.last_calibration_date ? format(parseISO(item.last_calibration_date), "dd MMM yyyy", { locale: ptBR }) : "—"}
                    </TableCell>
                    <TableCell>
                       {item.next_calibration_date ? (
                         <div className="flex flex-col">
                           <span className={cn(
                             "text-[13px] font-bold",
                             item.calibration_status === "expired" ? "text-[var(--color-danger-text)]" : 
                             item.calibration_status === "expiring" ? "text-[var(--color-warning-text)]" : "text-[var(--color-text-primary)]"
                           )}>
                             {format(parseISO(item.next_calibration_date), "dd MMM yyyy", { locale: ptBR })}
                           </span>
                           <span className="text-[10px] text-[var(--color-text-muted)]">
                             {differenceInDays(parseISO(item.next_calibration_date), new Date()) > 0 
                               ? `Em ${differenceInDays(parseISO(item.next_calibration_date), new Date())} dias`
                               : "Expirado"}
                           </span>
                         </div>
                       ) : "—"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.calibration_status)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <Link href={`/assets/${item.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors">
                         <ExternalLink className="h-4 w-4" />
                       </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <footer className="pt-4 flex justify-center border-t border-border/40">
        <p className="text-[11px] text-[var(--color-text-muted)] opacity-60">
          PCM Forge · Intelligent Metrology Planning v2.0
        </p>
      </footer>
    </div>
  );
}
