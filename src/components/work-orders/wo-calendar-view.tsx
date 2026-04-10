"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WOCalendarDay } from "./wo-calendar-day";
import { createClient } from "@/lib/supabase/client";
import type { WorkOrder } from "@/lib/types/database";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WOCalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  const fetchWOs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("work_orders")
      .select("*, asset:assets(tag, name)")
      .gte("scheduled_date", format(calendarStart, "yyyy-MM-dd"))
      .lte("scheduled_date", format(calendarEnd, "yyyy-MM-dd"))
      .order("scheduled_date", { ascending: true });

    setWorkOrders((data as WorkOrder[]) || []);
    setLoading(false);
  }, [calendarStart.getTime(), calendarEnd.getTime()]);

  useEffect(() => {
    fetchWOs();
  }, [fetchWOs]);

  function goToday() {
    setCurrentDate(new Date());
  }

  function handleDayClick(date: Date) {
    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/work-orders/new?date=${dateStr}`);
  }

  return (
    <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-3"
            onClick={goToday}
          >
            <CalendarIcon className="h-3 w-3 mr-1.5" />
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border/20 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span className="text-[10px] font-medium text-muted-foreground">Preventiva</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span className="text-[10px] font-medium text-muted-foreground">Corretiva</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[10px] font-medium text-muted-foreground">Inspeção</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-[10px] font-medium text-muted-foreground">Calibração</span>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border/30">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-bold uppercase text-muted-foreground py-2 border-r border-border/30 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <WOCalendarDay
            key={day.toISOString()}
            date={day}
            currentMonth={isSameMonth(day, currentDate)}
            workOrders={workOrders}
            onWOClick={(id) => router.push(`/work-orders/${id}`)}
            onDayClick={handleDayClick}
          />
        ))}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </Card>
  );
}
