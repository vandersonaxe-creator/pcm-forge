"use client";

import { cn } from "@/lib/utils";
import { isSameDay, isToday } from "date-fns";
import { WOCalendarChip } from "./wo-calendar-chip";
import type { WorkOrder } from "@/lib/types/database";

interface WOCalendarDayProps {
  date: Date;
  currentMonth: boolean;
  workOrders: WorkOrder[];
  onWOClick: (woId: string) => void;
  onDayClick: (date: Date) => void;
}

export function WOCalendarDay({
  date,
  currentMonth,
  workOrders,
  onWOClick,
  onDayClick,
}: WOCalendarDayProps) {
  const today = isToday(date);
  const dayOrders = workOrders.filter(
    (wo) => wo.scheduled_date && isSameDay(new Date(wo.scheduled_date), date)
  );

  const maxVisible = 3;
  const visibleOrders = dayOrders.slice(0, maxVisible);
  const overflow = dayOrders.length - maxVisible;

  return (
    <div
      className={cn(
        "min-h-[90px] border-r border-b border-border/30 p-1 transition-colors",
        !currentMonth && "bg-muted/20",
        today && "bg-primary/[0.03]",
        dayOrders.length === 0 && currentMonth && "hover:bg-muted/30 cursor-pointer"
      )}
      onClick={() => {
        if (dayOrders.length === 0 && currentMonth) {
          onDayClick(date);
        }
      }}
    >
      <div className="flex items-center justify-between mb-0.5 px-0.5">
        <span
          className={cn(
            "text-[11px] font-semibold leading-none",
            !currentMonth && "text-muted-foreground/40",
            currentMonth && "text-foreground",
            today &&
              "bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-[10px]"
          )}
        >
          {date.getDate()}
        </span>
        {dayOrders.length > 0 && (
          <span className="text-[9px] font-bold text-muted-foreground bg-muted rounded-full px-1.5">
            {dayOrders.length}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        {visibleOrders.map((wo) => (
          <WOCalendarChip
            key={wo.id}
            woNumber={wo.wo_number}
            title={wo.title}
            osType={wo.os_type}
            assetTag={(wo as any).asset?.tag}
            onClick={() => onWOClick(wo.id)}
          />
        ))}
        {overflow > 0 && (
          <p className="text-[9px] text-muted-foreground font-medium px-1">
            +{overflow} mais
          </p>
        )}
      </div>
    </div>
  );
}
