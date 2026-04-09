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
    if (pct === 0) return "text-[var(--color-danger-text)]";
    if (pct >= 80) return "text-[var(--color-success-icon)]";
    if (pct >= 60) return "text-[var(--color-warning-text)]";
    return "text-[var(--color-danger-text)]";
  };

  if (loading) {
    return (
      <Card className="bg-white border-[var(--color-border)] shadow-card h-full">
        <CardContent className="flex flex-col items-center justify-center p-8 h-full">
           <Skeleton className="h-40 w-40 rounded-full" />
           <Skeleton className="h-4 w-40 mt-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[var(--color-border)] shadow-card h-full flex flex-col items-center overflow-hidden">
      <CardContent className="relative flex-1 flex flex-col items-center justify-center pt-8 pb-6 w-full px-6">
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
              className="text-[#F1F5F9]"
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
              className={cn("transition-all duration-1000", getColor(percentage))}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-[32px] font-bold tracking-tight leading-none", getColor(percentage))}>
                {percentage || 0}<span className="text-xl ml-0.5">%</span>
              </span>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">Conformidade de Manutenção</p>
           <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">
              Planos preventivos executados no prazo
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
