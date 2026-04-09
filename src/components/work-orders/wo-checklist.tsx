"use client";

import { useMemo, useState } from "react";
import type { WorkOrder, WorkOrderItem } from "@/lib/types/database";
import { WOChecklistItem } from "./wo-checklist-item";
import { ChevronDown, ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface WOChecklistProps {
  workOrder: WorkOrder;
  items: WorkOrderItem[];
  onItemUpdate: (itemId: string, data: Partial<WorkOrderItem>) => Promise<void>;
  isReadOnly?: boolean;
}

export function WOChecklist({ workOrder, items, onItemUpdate, isReadOnly }: WOChecklistProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const groupedItems = useMemo(() => {
    const groups: Record<string, WorkOrderItem[]> = {};
    items.forEach((item) => {
      const gName = item.group_name || "Geral";
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(item);
    });
    return groups;
  }, [items]);

  const groupNames = Object.keys(groupedItems);

  // Initialize all groups as expanded
  useMemo(() => {
    const initial: Record<string, boolean> = {};
    groupNames.forEach(name => {
      initial[name] = true;
    });
    setExpandedGroups(prev => ({ ...initial, ...prev }));
  }, [groupNames.length]);

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const getGroupProgress = (groupName: string) => {
    const gItems = groupedItems[groupName];
    const filled = gItems.filter(i => i.value !== null).length;
    return { filled, total: gItems.length };
  };

  return (
    <div className="space-y-8 pb-32">
      {groupNames.map((gName) => {
        const isExpanded = expandedGroups[gName];
        const { filled, total } = getGroupProgress(gName);
        const isCompleted = filled === total && total > 0;

        return (
          <div key={gName} className="space-y-4">
            <button 
              onClick={() => toggleGroup(gName)}
              className="flex items-center gap-4 w-full group transition-all"
            >
              <div className="flex items-center gap-3">
                 <div className={cn(
                   "p-1 rounded transition-colors",
                   isExpanded ? "rotate-0" : "-rotate-90"
                 )}>
                   <ChevronDown className="h-4 w-4 text-muted-foreground" />
                 </div>
                 <h3 className={cn(
                   "text-base font-bold uppercase tracking-widest transition-colors",
                   isCompleted ? "text-success" : "text-primary/80"
                 )}>
                   {gName}
                 </h3>
              </div>
              <div className="flex-1 h-px bg-border/20 group-hover:bg-primary/20 transition-colors" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase">
                   {filled} / {total} itens
                 </span>
                 {isCompleted && <ListChecks className="h-4 w-4 text-success" />}
              </div>
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {groupedItems[gName].map((item) => (
                  <WOChecklistItem
                    key={item.id}
                    item={item}
                    workOrder={workOrder}
                    onUpdate={onItemUpdate}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-20 bg-card/20 border border-dashed border-border/30 rounded-2xl">
          <p className="text-muted-foreground">Nenhum item vinculado a esta Ordem de Serviço.</p>
        </div>
      )}
    </div>
  );
}
