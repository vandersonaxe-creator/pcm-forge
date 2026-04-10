"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  PlayCircle,
  PlusCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/lib/types/database";

export interface TimelineEvent {
  id: string;
  wo_id: string;
  wo_number: string;
  title: string;
  os_type: string;
  event_type: "created" | "started" | "completed";
  timestamp: string;
  asset_tag: string;
  asset_name: string;
  assignee_name: string | null;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

const EVENT_CONFIG = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    ring: "ring-emerald-200",
    label: "concluída",
  },
  started: {
    icon: PlayCircle,
    color: "text-blue-600",
    bg: "bg-blue-100",
    ring: "ring-blue-200",
    label: "iniciada",
  },
  created: {
    icon: PlusCircle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    ring: "ring-amber-200",
    label: "criada",
  },
};

export function buildTimelineEvents(workOrders: WorkOrder[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const wo of workOrders) {
    const assetTag = (wo as any).asset?.tag || "---";
    const assetName = (wo as any).asset?.name || "Ativo";
    const assigneeName = (wo as any).assignee?.full_name || null;

    if (wo.completed_at) {
      events.push({
        id: `${wo.id}-completed`,
        wo_id: wo.id,
        wo_number: wo.wo_number,
        title: wo.title,
        os_type: wo.os_type,
        event_type: "completed",
        timestamp: wo.completed_at,
        asset_tag: assetTag,
        asset_name: assetName,
        assignee_name: assigneeName,
      });
    }

    if (wo.started_at) {
      events.push({
        id: `${wo.id}-started`,
        wo_id: wo.id,
        wo_number: wo.wo_number,
        title: wo.title,
        os_type: wo.os_type,
        event_type: "started",
        timestamp: wo.started_at,
        asset_tag: assetTag,
        asset_name: assetName,
        assignee_name: assigneeName,
      });
    }

    events.push({
      id: `${wo.id}-created`,
      wo_id: wo.id,
      wo_number: wo.wo_number,
      title: wo.title,
      os_type: wo.os_type,
      event_type: "created",
      timestamp: wo.created_at,
      asset_tag: assetTag,
      asset_name: assetName,
      assignee_name: assigneeName,
    });
  }

  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return events.slice(0, 10);
}

export function ActivityTimeline({ events, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
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

      <CardContent className="flex-1 overflow-hidden px-6 pb-6">
        {events.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center opacity-40 italic">
            <p className="text-xs">Nenhuma atividade registrada</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[18px] top-5 bottom-5 w-px bg-border/60" />

            <div className="space-y-0">
              {events.map((event, idx) => {
                const config = EVENT_CONFIG[event.event_type];
                const Icon = config.icon;
                const isCorretiva = event.os_type === "corrective";
                const date = parseISO(event.timestamp);

                return (
                  <Link
                    key={event.id}
                    href={`/work-orders/${event.wo_id}`}
                    className="relative flex items-start gap-4 p-3 rounded-xl transition-all hover:bg-muted group no-underline"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-background shadow-sm",
                        config.bg
                      )}
                    >
                      {isCorretiva && event.event_type === "created" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Icon className={cn("h-4 w-4", config.color)} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">
                          OS {event.wo_number}{" "}
                          <span className="font-normal text-muted-foreground">
                            {config.label}
                          </span>
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDistanceToNow(date, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.asset_tag} {event.asset_name}
                        {event.assignee_name &&
                          ` — por ${event.assignee_name}`}
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-2.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
