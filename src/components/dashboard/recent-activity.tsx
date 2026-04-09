"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CheckCircle2, 
  Settings, 
  AlertTriangle, 
  Search,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkOrder } from "@/lib/types/database";

interface RecentActivityProps {
  workOrders: WorkOrder[];
  loading?: boolean;
}

export function RecentActivity({ workOrders, loading }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "preventive": return <Settings className="h-4 w-4 text-primary" />;
      case "corrective": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "inspection": return <Search className="h-4 w-4 text-info" />;
      default: return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
           <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
           {[1, 2, 3, 4, 5].map((i) => (
             <Skeleton key={i} className="h-12 w-full" />
           ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
        <CardTitle className="text-[15px] font-semibold text-foreground flex items-center gap-2">
           <TrendingUp className="h-4 w-4 text-primary" />
           Atividade Recente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        {workOrders.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center opacity-40 italic">
            <p className="text-xs">Nenhuma OS concluída recentemente</p>
          </div>
        ) : (
          <div className="space-y-1">
            {workOrders.slice(0, 5).map((wo) => {
              const date = wo.completed_at ? parseISO(wo.completed_at) : new Date();
              const assetTag = (wo as any).asset?.tag || "---";

              return (
                <Link 
                  key={wo.id} 
                  href={`/work-orders/${wo.id}`}
                  className="flex items-center gap-4 p-3 px-6 rounded-none transition-all hover:bg-muted group border-b border-border/50 no-underline"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted shadow-inner group-hover:bg-background transition-colors">
                     {getIcon(wo.os_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-mono font-bold tracking-wider text-primary">
                          {wo.wo_number}
                       </span>
                       <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}
                       </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate leading-tight mt-0.5">
                       {wo.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate italic">
                       {assetTag} — Ativo Monitorado
                    </p>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
