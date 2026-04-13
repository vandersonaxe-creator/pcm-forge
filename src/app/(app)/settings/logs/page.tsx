"use client";

import { useUserLogs } from "@/hooks/use-user-logs";
import { 
  History, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Activity,
  Loader2,
  Clock
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UserLogsPage() {
  const { logs, loading } = useUserLogs();

  function getActionBadge(action: string) {
    switch (action.toLowerCase()) {
      case "login":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Login</Badge>;
      case "access":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Acesso</Badge>;
      default:
        return <Badge className="badge-neutral">{action}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Logs de Usuários</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Histórico de acessos e atividades realizadas no sistema.
        </p>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] overflow-hidden">
        <CardHeader className="bg-[#0F172A]/30 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--color-primary)]" />
            <CardTitle className="text-base text-white">Últimas Atividades</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#0F172A]/50">
              <TableRow className="border-[#334155] hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Usuário</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">E-mail</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider text-center">Ação</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Data / Hora</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center border-none">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-primary)]" />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500 border-none">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>Nenhum registro de atividade encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-[#334155] hover:bg-slate-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="font-medium text-white">{log.user_name || "Sistema"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {log.user_email || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white text-sm">
                          {format(parseISO(log.created_at), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(log.created_at), "HH:mm:ss")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm max-w-[200px] truncate">
                      {log.details || "—"}
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
