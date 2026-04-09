"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  format, 
  parseISO 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { WorkOrder, Asset, DashboardKPIs, OverdueMaintenance, CalibrationAlert } from "@/lib/types/database";

export function useDashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [overdue, setOverdue] = useState<OverdueMaintenance[]>([]);
  const [calibrations, setCalibrations] = useState<CalibrationAlert[]>([]);
  const [recentWOs, setRecentWOs] = useState<WorkOrder[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");
      const companyId = profile.company_id;

      // 1. Parallel Fetching for RPCs and simple queries
      const [kpiRes, overdueRes, calibRes, recentRes] = await Promise.all([
        supabase.rpc("get_dashboard_kpis", { p_company_id: companyId }),
        supabase.rpc("get_overdue_maintenance", { p_company_id: companyId }),
        supabase.rpc("get_calibration_alerts", { p_company_id: companyId, p_days_ahead: 30 }),
        supabase
          .from("work_orders")
          .select("*, asset:assets(tag, name)")
          .eq("company_id", companyId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(10)
      ]);

      if (kpiRes.error) throw kpiRes.error;
      if (overdueRes.error) throw overdueRes.error;
      if (calibRes.error) throw calibRes.error;
      if (recentRes.error) throw recentRes.error;

      setKpis(kpiRes.data as DashboardKPIs);
      setOverdue(overdueRes.data as OverdueMaintenance[]);
      setCalibrations(calibRes.data as any[]);
      setRecentWOs(recentRes.data as WorkOrder[]);

      // 2. Monthly Stats (Last 6 months)
      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5)).toISOString();
      
      const { data: statsData, error: statsError } = await supabase
        .from("work_orders")
        .select("os_type, scheduled_date")
        .eq("company_id", companyId)
        .eq("status", "completed")
        .gte("scheduled_date", sixMonthsAgo);

      if (statsError) throw statsError;

      // Process chart data
      const months = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), 5 - i);
        return {
          month: format(date, "MMM", { locale: ptBR }),
          fullDate: date,
          preventive: 0,
          corrective: 0,
          inspection: 0
        };
      });

      statsData.forEach(wo => {
        const woMonth = startOfMonth(parseISO(wo.scheduled_date!));
        const monthIdx = months.findIndex(m => startOfMonth(m.fullDate).getTime() === woMonth.getTime());
        if (monthIdx !== -1) {
          const type = wo.os_type as keyof typeof months[0];
          if (type in months[monthIdx]) {
            (months[monthIdx] as any)[type]++;
          }
        }
      });

      setChartData(months);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return { kpis, overdue, calibrations, recentWOs, chartData, loading, error, refetch: fetchDashboardData };
}
