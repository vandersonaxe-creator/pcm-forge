"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  User as UserIcon,
  ShieldAlert,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocations } from "@/hooks/use-assets";
import { useUsers } from "@/hooks/use-users";

interface GridFiltersProps {
  year: number;
  onYearChange: (year: number) => void;
  filters: {
    location_id: string;
    criticality: string[];
    assigned_to: string;
  };
  onFilterChange: (key: string, value: any) => void;
}

export function GridFilters({ year, onYearChange, filters, onFilterChange }: GridFiltersProps) {
  const { locations } = useLocations();
  const { users } = useUsers();

  const toggleCriticality = (level: string) => {
    const next = filters.criticality.includes(level)
      ? filters.criticality.filter((c) => c !== level)
      : [...filters.criticality, level];
    
    onFilterChange("criticality", next);
  };

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Year Selector */}
        <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border w-fit shadow-inner">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-muted transition-colors"
            onClick={() => onYearChange(year - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 py-1 flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {year}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-muted transition-colors"
            onClick={() => onYearChange(year + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <Select 
              value={filters.location_id} 
              onValueChange={(val) => onFilterChange("location_id", val)}
            >
              <SelectTrigger className="w-[180px] h-9 bg-background border-border text-xs">
                <SelectValue placeholder="Localização">
                  {filters.location_id === "all"
                    ? "Todas as Áreas"
                    : locations.find(l => l.id === filters.location_id)?.name ?? filters.location_id}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todas as Áreas</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-6 bg-border/20 mx-1 hidden sm:block" />

          {/* Criticality Toggles */}
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              {["A", "B", "C"].map((level) => (
                <button
                  key={level}
                  onClick={() => toggleCriticality(level)}
                  className={cn(
                    "flex items-center justify-center w-8 h-7 text-[10px] font-bold rounded transition-all",
                    filters.criticality.includes(level)
                      ? level === "A" ? "bg-[#DC2626] text-white shadow-sm" :
                        level === "B" ? "bg-[#D97706] text-white shadow-sm" :
                        "bg-[#2563EB] text-white shadow-sm"
                      : "text-muted-foreground hover:bg-background"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-border/20 mx-1 hidden sm:block" />

          {/* Technician */}
          <div className="flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <Select 
              value={filters.assigned_to} 
              onValueChange={(val) => onFilterChange("assigned_to", val)}
            >
              <SelectTrigger className="w-[180px] h-9 bg-background border-border text-xs">
                <SelectValue placeholder="Técnico">
                  {filters.assigned_to === "all"
                    ? "Todos os Técnicos"
                    : users.find(u => u.id === filters.assigned_to)?.full_name ?? filters.assigned_to}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos os Técnicos</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 gap-2 text-muted-foreground hover:bg-muted"
            onClick={() => {
              onFilterChange("location_id", "all");
              onFilterChange("criticality", ["A", "B", "C"]);
              onFilterChange("assigned_to", "all");
            }}
          >
            <span className="text-[11px] font-semibold text-primary">Limpar filtros</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
