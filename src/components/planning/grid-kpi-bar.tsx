"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, CheckCircle2, AlertCircle, 
  TrendingUp, TrendingDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanningSummary } from "@/hooks/use-planning";

interface GridKPIBarProps {
  summary: PlanningSummary;
  loading?: boolean;
}

export function GridKPIBar({ summary, loading }: GridKPIBarProps) {
  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return "text-success border-success/30 bg-success/5";
    if (rate >= 60) return "text-warning border-warning/30 bg-warning/5";
    return "text-destructive border-destructive/30 bg-destructive/5";
  };

  const getComplianceIcon = (rate: number) => {
    if (rate >= 80) return <TrendingUp className="h-4 w-4 text-success" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const kpis = [
    {
      label: "Programadas",
      value: summary.total_planned,
      icon: <Calendar className="h-4 w-4 text-primary" />,
      color: "text-primary",
      borderColor: "border-primary/20",
      bgColor: "bg-primary/5",
    },
    {
      label: "Executadas",
      value: summary.completed,
      icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      color: "text-success",
      borderColor: "border-success/20",
      bgColor: "bg-success/5",
    },
    {
      label: "Atrasadas",
      value: summary.overdue,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      color: "text-destructive",
      borderColor: "border-destructive/20",
      bgColor: "bg-destructive/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className={cn("bg-card/40 border-border/40 overflow-hidden", loading && "opacity-50 transition-opacity")}>
          <div className={cn("h-1 w-full", kpi.bgColor.replace("/5", "/40"))} />
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black font-technical tracking-tighter", kpi.color)}>
                  {loading ? "---" : kpi.value}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">OS</span>
              </div>
            </div>
            <div className={cn("p-2 rounded-lg border", kpi.borderColor, kpi.bgColor)}>
              {kpi.icon}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className={cn("bg-card/40 border-border/40 overflow-hidden", loading && "opacity-50 transition-opacity")}>
        <div className={cn("h-1 w-full", summary.compliance_rate >= 80 ? "bg-success/40" : summary.compliance_rate >= 60 ? "bg-warning/40" : "bg-destructive/40")} />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Conformidade
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-2xl font-black font-technical tracking-tighter", summary.compliance_rate >= 80 ? "text-success" : summary.compliance_rate >= 60 ? "text-warning" : "text-destructive")}>
                {loading ? "---" : `${summary.compliance_rate.toFixed(1)}%`}
              </span>
            </div>
          </div>
          <div className={cn("p-2 rounded-lg border", getComplianceColor(summary.compliance_rate))}>
            {getComplianceIcon(summary.compliance_rate)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
