"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  MapPin, 
  Tag as TagIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetPlanningData } from "@/hooks/use-planning";

interface MobilePlanningCardProps {
  asset: AssetPlanningData;
  onCellClick: (assetId: string, planId: string, month: number, woId?: string | null) => void;
}

const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function MobilePlanningCard({ asset, onCellClick }: MobilePlanningCardProps) {
  return (
    <Card className="bg-card/40 border-border/40 overflow-hidden mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-technical text-primary tracking-widest">{asset.tag}</span>
              <Badge variant="outline" className={cn(
                "text-[9px] font-black h-5 px-1.5",
                asset.criticality === "A" ? "text-destructive border-destructive/30 bg-destructive/5" :
                asset.criticality === "B" ? "text-warning border-warning/30 bg-warning/5" :
                "text-success border-success/30 bg-success/5"
              )}>
                {asset.criticality}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium line-clamp-1">{asset.name}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
             <MapPin className="h-3 w-3" />
             {asset.location_name}
          </div>
        </div>

        {/* Heatmap per Plan */}
        <div className="space-y-3">
          {asset.plans.map((plan) => (
            <div key={plan.plan_id} className="space-y-1.5">
               <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter text-muted-foreground/60">
                  <span>{plan.plan_name}</span>
                  <span>{plan.frequency}</span>
               </div>
               <div className="flex items-center gap-1 w-full justify-between">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const m = i + 1;
                    const monthData = plan.months[m];
                    const status = monthData.status;

                    return (
                      <button
                        key={m}
                        className={cn(
                          "flex-1 h-6 rounded-sm border transition-all",
                          status === "completed" ? "bg-success border-success/20 shadow-[0_0_5px_rgba(54,179,126,0.3)]" :
                          status === "in_progress" ? "bg-warning border-warning/20 animate-pulse" :
                          status === "planned" ? "bg-primary border-primary/20" :
                          status === "overdue" ? "bg-destructive border-destructive/20 animate-pulse" :
                          status === "due_not_generated" ? "bg-transparent border-border/20 border-dashed" :
                          "bg-muted/10 border-transparent opacity-20"
                        )}
                        onClick={() => onCellClick(asset.id, plan.plan_id, m, monthData.wo_id)}
                      >
                         <span className="text-[8px] font-black text-white/40">{MONTH_INITIALS[i]}</span>
                      </button>
                    );
                  })}
               </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
