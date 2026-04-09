"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ComplianceGaugeProps {
  percentage: number | undefined;
  loading?: boolean;
}

export function ComplianceGauge({ percentage = 0, loading }: ComplianceGaugeProps) {

  const radius = 88;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 80) return "text-success";
    if (pct >= 60) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card h-full">
        <CardHeader className="pb-2">
           <Skeleton className="h-5 w-32 mx-auto" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
           <Skeleton className="h-44 w-44 rounded-full" />
           <Skeleton className="h-4 w-40 mt-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-card h-full flex flex-col items-center overflow-hidden">
      <CardHeader className="w-full pb-0 pt-6 px-6">
        <CardTitle className="text-[14px] font-bold text-foreground text-center">
          Conformidade de Manutenção
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col items-center justify-center pt-10 pb-6 w-full px-6">
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90 transition-all duration-1000"
          >
            {/* Background circle */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset: 0 }}
              className="text-muted/40"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress circle */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              className={cn("transition-all duration-1000 drop-shadow-[0_0_8px_rgba(var(--primary),0.2)]", getColor(percentage))}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-3xl font-black tracking-tighter leading-none", getColor(percentage))}>
                {percentage.toFixed(0)}<span className="text-lg opacity-80">%</span>
              </span>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">META</p>
          </div>
        </div>

        <div className="mt-10 space-y-1.5 text-center">
           <p className="text-xs font-bold text-foreground uppercase tracking-wide">Plano Preventivo</p>
           <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px] mx-auto opacity-80 italic">
              Percentual de planos executados dentro do prazo regulamentar.
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
