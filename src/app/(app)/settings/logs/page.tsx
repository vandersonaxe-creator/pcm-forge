"use client";

import { useUserLogs } from "@/hooks/use-user-logs";
import { 
  History, 
  User as UserIcon, 
  Activity,
  Loader2,
  Clock,
  ArrowRight
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UserLogsPage() {
  const { logs, loading } = useUserLogs();

  function getActionBadge(action: string) {
    switch (action.toLowerCase()) {
      case "login":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none">Login</Badge>;
      case "acesso":
      case "access":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-100 shadow-none">Acesso</Badge>;
      default:
        return <Badge className="badge-neutral border shadow-none">{action}</Badge>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-6 pb-20 lg:px-10 lg:pt-8 space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">
          Logs de Usuários
        </h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
          <History className="h-4 w-4" />
          <span>Histórico de rastreabilidade e acessos ao sistema industrial</span>
        </p>
      </div>

      <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden rounded-xl">
        <CardHeader className="bg-[var(--color-bg-page)]/30 border-b border-[var(--color-border)] py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--color-brand)]" />
              <CardTitle className="text-[14px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Trilha de Auditoria</CardTitle>
            </div>
            <span className="text-[11px] font-medium text-[var(--color-text-muted)] italic">Exibindo os últimos 100 registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[var(--color-bg-page)]/50">
              <TableRow className="border-[var(--color-border)] hover:bg-transparent">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] pl-6">Usuário Responsável</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">E-mail</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] text-center">Ação</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Data e Hora</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] pr-6">Evento / Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center border-none">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-brand)]" />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-[var(--color-text-muted)] border-none">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[14px]">Nenhum registro de atividade encontrado na trilha.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center border border-[var(--color-border-light)]">
                          <UserIcon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        </div>
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {log.user_name || "Sistema"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-text-tertiary)] text-[13px]">
                      {log.user_email || "Notified Service"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[var(--color-text-primary)] font-medium text-[13px]">
                          {format(parseISO(log.created_at), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(log.created_at), "HH:mm:ss")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)] text-[13px] pr-6 italic">
                      {log.details ? (
                        <div className="flex items-center gap-2">
                           <ArrowRight className="h-3 w-3 text-[var(--color-text-muted)]" />
                           {log.details}
                        </div>
                      ) : "Nenhum detalhe adicional"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <footer className="pt-8 flex flex-col items-center gap-2 border-t border-border/40">
        <p className="text-[11px] text-[var(--color-text-muted)] opacity-60">
          PCM Forge Audit Engine v3.2
        </p>
      </footer>
    </div>
  );
}
