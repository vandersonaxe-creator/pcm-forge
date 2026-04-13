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
  Loader2
} from "lucide-react";
import { useAssets } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { CALIBRATION_STATUS_LABELS } from "@/lib/constants";
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
        return <Badge className="badge-success">Válido</Badge>;
      case "expiring":
        return <Badge className="badge-warning">Vencendo</Badge>;
      case "expired":
        return <Badge className="badge-danger">Vencido</Badge>;
      default:
        return <Badge className="badge-neutral">Pendente</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Plano Metrológico</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Planejamento e status de calibração de todos os instrumentos industriais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-[#334155] text-white hover:bg-slate-800 gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1E293B] border-[#334155] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Instrumentos</CardTitle>
            <Gauge className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Válidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{stats.valid}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Vencendo (30d)</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{stats.expiring}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* List Card */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por TAG ou Nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0F172A] border-[#334155] text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#0F172A]/50">
              <TableRow className="border-[#334155] hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">TAG / Instrumento</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider text-center">Frequência</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Última Calibração</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Próxima Calibração</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Status</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider text-right">Ver Doc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center border-none">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-primary)]" />
                  </TableCell>
                </TableRow>
              ) : instruments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500 border-none">
                    Nenhum instrumento encontrado para calibração.
                  </TableCell>
                </TableRow>
              ) : (
                instruments.map((item) => (
                  <TableRow key={item.id} className="border-[#334155] hover:bg-slate-800/50 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight">{item.tag}</span>
                        <span className="text-xs text-slate-400">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-xs font-medium text-slate-300">
                        {item.calibration_frequency_days} dias
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {item.last_calibration_date ? format(parseISO(item.last_calibration_date), "dd MMM yyyy", { locale: ptBR }) : "—"}
                    </TableCell>
                    <TableCell>
                       {item.next_calibration_date ? (
                         <div className="flex flex-col">
                           <span className={cn(
                             "text-sm font-medium",
                             item.calibration_status === "expired" ? "text-red-400" : 
                             item.calibration_status === "expiring" ? "text-amber-400" : "text-white"
                           )}>
                             {format(parseISO(item.next_calibration_date), "dd MMM yyyy", { locale: ptBR })}
                           </span>
                           <span className="text-[10px] text-slate-500">
                             {differenceInDays(parseISO(item.next_calibration_date), new Date()) > 0 
                               ? `Em ${differenceInDays(parseISO(item.next_calibration_date), new Date())} dias`
                               : "Vencido"}
                           </span>
                         </div>
                       ) : "—"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.calibration_status)}
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href={`/assets/${item.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
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
    </div>
  );
}
