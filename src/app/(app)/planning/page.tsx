"use client";

import { useState, useMemo } from "react";
import { usePlanning, AssetPlanningData } from "@/hooks/use-planning";
import { GridFilters } from "@/components/planning/grid-filters";
import { GridKPIBar } from "@/components/planning/grid-kpi-bar";
import { AnnualGrid } from "@/components/planning/annual-grid";
import { GridLegend } from "@/components/planning/grid-legend";
import { MobilePlanningCard } from "@/components/planning/mobile-planning-card";
import { CreateOSDialog } from "@/components/planning/create-os-dialog";
import { Button } from "@/components/ui/button";
import { 
  CalendarRange, 
  Settings2, 
  HelpCircle,
  LayoutGrid,
  ListFilter
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

export default function PlanningPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [filters, setFilters] = useState({
    location_id: "all",
    criticality: ["A", "B", "C"],
    assigned_to: "all"
  });
  
  const { data, summary, loading, error, refetch } = usePlanning(year, filters);
  const [selection, setSelection] = useState<{
    assetId: string;
    planId: string;
    month: number;
    year: number;
  } | null>(null);

  const handleCellClick = (assetId: string, planId: string, month: number, woId?: string | null) => {
    if (woId) {
      router.push(`/work-orders/${woId}`);
    } else {
      setSelection({ assetId, planId, month, year });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const totalAssetsWithPlans = data.length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <header className="px-6 py-6 lg:py-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tighter text-foreground flex items-center gap-3">
              <CalendarRange className="h-8 w-8 text-primary" />
              Planejamento Anual
            </h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              Ano <span className="text-primary font-bold">{year}</span> — 
              <span className="text-foreground font-semibold">{totalAssetsWithPlans}</span> ativos com planos preventivos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
             <TooltipProvider>
                <Tooltip>
                   <TooltipTrigger render={<span tabIndex={0} className="cursor-pointer" />}>
                      <Button variant="outline" size="icon" className="h-10 w-10 border-border/40 hover:bg-muted transition-colors" tabIndex={-1} aria-hidden>
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      </Button>
                   </TooltipTrigger>
                   <TooltipContent className="bg-popover border-border/40 max-w-xs p-4">
                      <p className="text-xs leading-relaxed">
                        A grade anual exibe a projeção de manutenções preventivas baseada nos planos vinculados aos ativos. 
                        Clique em uma célula para acessar a O.S. ou gerar uma nova.
                      </p>
                   </TooltipContent>
                </Tooltip>
             </TooltipProvider>
             <Button variant="outline" className="gap-2 border-border/40 hover:bg-white/5 transition-colors">
                <Settings2 className="h-4 w-4" />
                Configurações do Ciclo
             </Button>
          </div>
        </div>

        {/* Filters */}
        <GridFilters 
          year={year} 
          onYearChange={setYear} 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />

        {/* KPIs */}
        <GridKPIBar summary={summary} loading={loading} />
      </header>

      {/* Grid Content */}
      <main className="flex-1 px-6 pb-24">
         {/* Desktop View */}
         <div className="hidden lg:block">
            <AnnualGrid 
              data={data} 
              onCellClick={handleCellClick} 
              loading={loading} 
            />
         </div>

         {/* Mobile/Tablet View */}
         <div className="lg:hidden space-y-4">
            <div className="flex items-center justify-between items-center px-2">
               <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <ListFilter className="h-3 w-3" />
                  Lista de Ativos ({data.length})
               </div>
               <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            {loading ? (
               <div className="py-20 flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground italic">Carregando visualização mobile...</p>
               </div>
            ) : (
               data.map((asset) => (
                 <MobilePlanningCard 
                    key={asset.id} 
                    asset={asset} 
                    onCellClick={handleCellClick} 
                 />
               ))
            )}
            {!loading && data.length === 0 && (
              <div className="py-20 text-center text-muted-foreground/30 italic text-sm">
                Nenhum ativo encontrado.
              </div>
            )}
         </div>
      </main>

      {/* Legend Footer */}
      <footer className="sticky bottom-0 left-0 right-0 z-30 p-0 m-0 print:hidden">
         <GridLegend />
      </footer>

      {/* Dialogs */}
      <CreateOSDialog 
        isOpen={!!selection} 
        onClose={() => setSelection(null)} 
        selection={selection}
        assets={data}
        onSuccess={refetch}
      />
    </div>
  );
}
