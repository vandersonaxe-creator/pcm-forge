"use client";

import { memo, useMemo } from "react";
import { GridHeader } from "./grid-header";
import { GridCell } from "./grid-cell";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetPlanningData } from "@/hooks/use-planning";

interface AnnualGridProps {
  data: AssetPlanningData[];
  onCellClick: (assetId: string, planId: string, month: number, woId?: string | null) => void;
  loading?: boolean;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function AnnualGrid({ data, onCellClick, loading }: AnnualGridProps) {
  const groupedData = useMemo(() => {
    const groups: Record<string, AssetPlanningData[]> = {};
    data.forEach((asset) => {
      const locName = asset.location_name || "Sem Localização";
      if (!groups[locName]) groups[locName] = [];
      groups[locName].push(asset);
    });
    return groups;
  }, [data]);

  const locations = Object.keys(groupedData);

  if (loading) {
     return (
       <div className="w-full h-96 flex items-center justify-center bg-card rounded-xl border border-border shadow-sm">
          <div className="flex flex-col items-center gap-4">
             <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <p className="text-sm font-semibold text-muted-foreground">Processando Grade Anual...</p>
          </div>
       </div>
     );
  }

  return (
    <div className="relative overflow-x-auto border border-border rounded-xl bg-card shadow-sm">
      <table className="w-full border-collapse table-fixed min-w-[1200px]">
        <GridHeader />
        <tbody>
          {locations.map((loc) => (
            <LocationGroup 
              key={loc} 
              locationName={loc} 
              assets={groupedData[loc]} 
              onCellClick={onCellClick}
            />
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="py-20 text-center text-muted-foreground/40 italic">
          Nenhum ativo com plano preventivo encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  );
}

function LocationGroup({ locationName, assets, onCellClick }: { 
  locationName: string; 
  assets: AssetPlanningData[]; 
  onCellClick: any 
}) {
  return (
    <>
      <tr className="bg-muted group">
        <td colSpan={14} className="px-5 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4 text-primary" />
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-[12px] font-bold text-foreground">
              {locationName}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">({assets.length} ativos)</span>
          </div>
        </td>
      </tr>
      {assets.map((asset) => (
        <AssetRows 
          key={asset.id} 
          asset={asset} 
          onCellClick={onCellClick} 
        />
      ))}
    </>
  );
}

function AssetRows({ asset, onCellClick }: { 
  asset: AssetPlanningData; 
  onCellClick: any 
}) {
  return (
    <>
      {asset.plans.map((plan, pIdx) => (
        <tr key={plan.plan_id} className="hover:bg-muted/30 transition-colors border-b border-border group">
          {/* Asset Info Column - Only show asset name on first plan, otherwise indent */}
          <td className="sticky left-0 z-10 bg-card px-4 py-2.5 border-r border-border w-[280px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col min-w-0">
               {pIdx === 0 ? (
                 <>
                   <span className="text-sm font-bold text-primary tracking-tight leading-none mb-1">
                     {asset.tag}
                   </span>
                   <span className="text-[11px] text-muted-foreground font-medium truncate" title={asset.name}>
                     {asset.name}
                   </span>
                 </>
               ) : (
                 <span className="text-[9px] text-muted-foreground italic pl-3 border-l border-border/20">
                   Plan: {plan.plan_name}
                 </span>
               )}
            </div>
          </td>

          {/* Criticality Badge */}
          <td className="px-3 py-2 text-center border-r border-[var(--color-border)]">
             {pIdx === 0 && (
               <div className={cn(
                 "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold mx-auto",
                 asset.criticality === "A" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]" :
                 asset.criticality === "B" ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]" :
                 "bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]"
               )}>
                 {asset.criticality}
               </div>
             )}
          </td>

          {/* Month Cells */}
          {Array.from({ length: 12 }).map((_, i) => {
            const m = i + 1;
            const monthData = plan.months[m];
            return (
              <td key={m} className="p-0 text-center border-r border-border/50 h-14">
                <GridCell 
                  data={monthData} 
                  assetName={asset.tag} 
                  planName={plan.plan_name}
                  monthName={MONTHS[i]}
                  onClick={() => onCellClick(asset.id, plan.plan_id, m, monthData.wo_id)}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
