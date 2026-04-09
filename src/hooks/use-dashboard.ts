"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  format, 
  parseISO,
  differenceInDays
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { WorkOrder, Asset, DashboardKPIs, OverdueMaintenance, CalibrationAlert } from "@/lib/types/database";

async function fetchKPIsViaRPC(supabase: ReturnType<typeof createClient>, companyId: string): Promise<DashboardKPIs | null> {
  const { data, error } = await supabase.rpc("get_dashboard_kpis", { p_company_id: companyId });
  if (error || !data) return null;
  return data as DashboardKPIs;
}

async function fetchKPIsFallback(supabase: ReturnType<typeof createClient>, companyId: string): Promise<DashboardKPIs> {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = startOfMonth(new Date()).toISOString();

  const [
    assetsRes,
    instrumentsRes,
    openWORes,
    completedMonthRes,
    overdueRes,
    calibExpiredRes,
    calibExpiring30dRes,
  ] = await Promise.all([
    supabase.from("assets").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("status", "active"),
    supabase.from("assets").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("status", "active").eq("asset_type", "instrument"),
    supabase.from("work_orders").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).in("status", ["open", "in_progress"]),
    supabase.from("work_orders").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("status", "completed").gte("completed_at", monthStart),
    supabase.from("maintenance_plans").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("is_active", true).lt("next_due_date", today),
    supabase.from("assets").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("asset_type", "instrument").eq("status", "active")
      .lt("next_calibration_date", today),
    supabase.from("assets").select("*", { count: "exact", head: true })
      .eq("company_id", companyId).eq("asset_type", "instrument").eq("status", "active")
      .gte("next_calibration_date", today)
      .lte("next_calibration_date", new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]),
  ]);

  const totalAssets = assetsRes.count ?? 0;
  const totalInstruments = instrumentsRes.count ?? 0;
  const openWO = openWORes.count ?? 0;
  const completedMonth = completedMonthRes.count ?? 0;
  const preventivesOverdue = overdueRes.count ?? 0;
  const calibExpired = calibExpiredRes.count ?? 0;
  const calibExpiring30d = calibExpiring30dRes.count ?? 0;

  const totalPlanned = preventivesOverdue + completedMonth;
  const complianceRate = totalPlanned > 0 ? (completedMonth / totalPlanned) * 100 : 100;

  return {
    total_assets: totalAssets,
    total_instruments: totalInstruments,
    open_work_orders: openWO,
    completed_this_month: completedMonth,
    preventives_overdue: preventivesOverdue,
    calibrations_expired: calibExpired,
    calibrations_expiring_30d: calibExpiring30d,
    compliance_rate: complianceRate,
  };
}

async function fetchOverdueViaRPC(supabase: ReturnType<typeof createClient>, companyId: string): Promise<OverdueMaintenance[] | null> {
  const { data, error } = await supabase.rpc("get_overdue_maintenance", { p_company_id: companyId });
  if (error || !data) return null;
  return data as OverdueMaintenance[];
}

async function fetchOverdueFallback(supabase: ReturnType<typeof createClient>, companyId: string): Promise<OverdueMaintenance[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("maintenance_plans")
    .select("id, name, next_due_date, asset:assets(tag, name)")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .lt("next_due_date", today)
    .order("next_due_date", { ascending: true })
    .limit(20);

  if (error || !data) return [];

  return (data as any[]).map((plan) => ({
    plan_id: plan.id,
    plan_name: plan.name,
    asset_tag: plan.asset?.tag || "---",
    asset_name: plan.asset?.name || "Ativo",
    due_date: plan.next_due_date,
    days_overdue: differenceInDays(new Date(), parseISO(plan.next_due_date)),
  }));
}

async function fetchCalibrationViaRPC(supabase: ReturnType<typeof createClient>, companyId: string): Promise<CalibrationAlert[] | null> {
  const { data, error } = await supabase.rpc("get_calibration_alerts", { p_company_id: companyId, p_days_ahead: 30 });
  if (error || !data) return null;
  return data as CalibrationAlert[];
}

async function fetchCalibrationFallback(supabase: ReturnType<typeof createClient>, companyId: string): Promise<CalibrationAlert[]> {
  const today = new Date();
  const future30d = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("assets")
    .select("id, tag, name, next_calibration_date")
    .eq("company_id", companyId)
    .eq("asset_type", "instrument")
    .eq("status", "active")
    .not("next_calibration_date", "is", null)
    .lte("next_calibration_date", future30d)
    .order("next_calibration_date", { ascending: true })
    .limit(20);

  if (error || !data) return [];

  return (data as any[]).map((asset) => {
    const daysRemaining = differenceInDays(parseISO(asset.next_calibration_date), today);
    return {
      asset_id: asset.id,
      asset_tag: asset.tag,
      asset_name: asset.name,
      next_calibration: asset.next_calibration_date,
      days_remaining: daysRemaining,
      alert_level: daysRemaining < 0 ? "expired" as const : "expiring" as const,
    };
  });
}

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
      const { data: { session } } = await supabase.auth.getSession();
      
      let companyId: string | null = null;

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", session.user.id)
          .single();
        
        if (profile) companyId = profile.company_id;
      }

      if (!companyId) throw new Error("Empresa não encontrada");

      // Fetch all data with RPC-first, fallback to direct queries
      const [kpiData, overdueData, calibData, recentRes] = await Promise.all([
        fetchKPIsViaRPC(supabase, companyId).then(
          (data) => data ?? fetchKPIsFallback(supabase, companyId!)
        ),
        fetchOverdueViaRPC(supabase, companyId).then(
          (data) => data ?? fetchOverdueFallback(supabase, companyId!)
        ),
        fetchCalibrationViaRPC(supabase, companyId).then(
          (data) => data ?? fetchCalibrationFallback(supabase, companyId!)
        ),
        supabase
          .from("work_orders")
          .select("*, asset:assets(tag, name)")
          .eq("company_id", companyId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(10),
      ]);

      if (recentRes.error) throw recentRes.error;

      setKpis(kpiData);
      setOverdue(overdueData);
      setCalibrations(calibData);
      setRecentWOs(recentRes.data as WorkOrder[]);

      // Monthly Stats (Last 6 months)
      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5)).toISOString();
      
      const { data: statsData, error: statsError } = await supabase
        .from("work_orders")
        .select("os_type, scheduled_date")
        .eq("company_id", companyId)
        .eq("status", "completed")
        .gte("scheduled_date", sixMonthsAgo);

      if (statsError) throw statsError;

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
    
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return { kpis, overdue, calibrations, recentWOs, chartData, loading, error, refetch: fetchDashboardData };
}
