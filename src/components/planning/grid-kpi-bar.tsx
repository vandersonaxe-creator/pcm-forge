"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  const hasOverdue = summary.overdue > 0;
  const complianceRate = summary.compliance_rate;

  const kpis = [
    {
      label: "Programadas",
      value: summary.total_planned,
      icon: <Calendar className="h-5 w-5 text-[#2563EB]" />,
      iconBg: "bg-[#EFF6FF]",
      valueColor: "text-[#0F172A]",
      borderClass: "border-[#E2E8F0]",
    },
    {
      label: "Executadas",
      value: summary.completed,
      icon: <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />,
      iconBg: "bg-[#F0FDF4]",
      valueColor: "text-[#0F172A]",
      borderClass: "border-[#E2E8F0]",
    },
    {
      label: "Atrasadas",
      value: summary.overdue,
      icon: <AlertCircle className="h-5 w-5 text-[#EF4444]" />,
      iconBg: "bg-[#FEF2F2]",
      valueColor: hasOverdue ? "text-[#EF4444]" : "text-[#0F172A]",
      borderClass: hasOverdue
        ? "border-[#E2E8F0] border-l-[3px] border-l-[#EF4444]"
        : "border-[#E2E8F0]",
    },
  ];

  const complianceColor = complianceRate >= 80
    ? "text-[#22C55E]"
    : complianceRate >= 60
      ? "text-[#F59E0B]"
      : "text-[#EF4444]";

  const complianceIconBg = complianceRate >= 80
    ? "bg-[#F0FDF4]"
    : complianceRate >= 60
      ? "bg-[#FFFBEB]"
      : "bg-[#FEF2F2]";

  const complianceIcon = complianceRate >= 80
    ? <TrendingUp className="h-5 w-5 text-[#22C55E]" />
    : <TrendingDown className="h-5 w-5 text-[#EF4444]" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className={cn(
            "overflow-hidden bg-white",
            kpi.borderClass,
            loading && "opacity-50 transition-opacity"
          )}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black tracking-tighter", kpi.valueColor)}>
                  {loading ? "---" : kpi.value}
                </span>
                <span className="text-[11px] text-[#475569] font-medium">OS</span>
              </div>
            </div>
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", kpi.iconBg)}>
              {kpi.icon}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Conformidade */}
      <Card className={cn(
        "overflow-hidden bg-white border-[#E2E8F0]",
        loading && "opacity-50 transition-opacity"
      )}>
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
              Conformidade
            </p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-black tracking-tighter", complianceColor)}>
                {loading ? "---" : `${complianceRate.toFixed(1)}%`}
              </span>
            </div>
          </div>
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", complianceIconBg)}>
            {complianceIcon}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
