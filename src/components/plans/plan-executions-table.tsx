"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OsStatusBadge, OsPriorityBadge } from "@/components/shared/badges";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ExternalLink, Calendar, User } from "lucide-react";
import type { WorkOrder } from "@/lib/types/database";

interface PlanExecutionsTableProps {
  workOrders: WorkOrder[];
}

export function PlanExecutionsTable({ workOrders }: PlanExecutionsTableProps) {
  const router = useRouter();

  if (workOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-lg border border-dashed border-border/50">
        <Calendar className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço gerada para este plano ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">OS Nº</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Título</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-center">Status</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-center">Prioridade</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Programada</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Técnico</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo) => (
            <TableRow 
              key={wo.id} 
              className="border-border/20 group hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-mono text-xs font-bold text-primary">
                {wo.wo_number}
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {wo.title}
              </TableCell>
              <TableCell className="text-center">
                <OsStatusBadge status={wo.status} />
              </TableCell>
              <TableCell className="text-center">
                <OsPriorityBadge priority={wo.priority} />
              </TableCell>
              <TableCell className="text-sm">
                {wo.scheduled_date ? format(new Date(wo.scheduled_date), "dd/MM/yyyy") : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {wo.assignee?.full_name || "—"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push(`/work-orders/${wo.id}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
