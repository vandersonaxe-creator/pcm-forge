"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { startOfYear, endOfYear, format, isBefore, parseISO, getMonth, setMonth } from "date-fns";
import type { WorkOrder, Asset, MaintenancePlan, OsStatus } from "@/lib/types/database";

export type GridStatus = 'completed' | 'in_progress' | 'planned' | 'overdue' | 'due_not_generated' | null;

export interface MonthData {
  status: GridStatus;
  wo_id: string | null;
  wo_number: string | null;
  scheduled_date: string | null;
}

export interface PlanGridData {
  plan_id: string;
  plan_name: string;
  frequency: string;
  months: Record<number, MonthData>;
}

export interface AssetPlanningData {
  id: string;
  tag: string;
  name: string;
  criticality: string;
  location_id: string | null;
  location_name: string;
  plans: PlanGridData[];
}

export interface PlanningSummary {
  total_planned: number;
  completed: number;
  overdue: number;
  compliance_rate: number;
}

interface PlanningFilters {
  location_id?: string;
  criticality?: string[];
  assigned_to?: string;
}

export function usePlanning(year: number, filters: PlanningFilters = {}) {
  const [data, setData] = useState<AssetPlanningData[]>([]);
  const [summary, setSummary] = useState<PlanningSummary>({
    total_planned: 0,
    completed: 0,
    overdue: 0,
    compliance_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanningData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const today = new Date();

    const startDate = startOfYear(new Date(year, 0, 1)).toISOString();
    const endDate = endOfYear(new Date(year, 0, 1)).toISOString();

    try {
      // 1. Fetch Assets with Locations and their Plans
      let assetsQuery = supabase
        .from("assets")
        .select(`
          id, tag, name, criticality, location_id,
          location:asset_locations(name),
          plans:maintenance_plans!inner(*)
        `)
        .eq("status", "active")
        .eq("plans.is_active", true);

      if (filters.location_id && filters.location_id !== "all") {
        assetsQuery = assetsQuery.eq("location_id", filters.location_id);
      }
      if (filters.criticality && filters.criticality.length > 0) {
        assetsQuery = assetsQuery.in("criticality", filters.criticality);
      }
      if (filters.assigned_to && filters.assigned_to !== "all") {
        assetsQuery = assetsQuery.eq("plans.default_assignee", filters.assigned_to);
      }

      const { data: assetsData, error: assetsError } = await assetsQuery;
      if (assetsError) throw assetsError;

      // 2. Fetch all Work Orders for these plans in the year
      const planIds = (assetsData as any[]).flatMap(a => a.plans.map((p: any) => p.id));
      
      const { data: woData, error: woError } = await supabase
        .from("work_orders")
        .select("id, wo_number, status, scheduled_date, plan_id")
        .in("plan_id", planIds)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate);

      if (woError) throw woError;

      const woMap = (woData as WorkOrder[] || []).reduce((acc, wo) => {
        if (!wo.plan_id) return acc;
        const month = getMonth(parseISO(wo.scheduled_date!)) + 1;
        const key = `${wo.plan_id}-${month}`;
        acc[key] = wo;
        return acc;
      }, {} as Record<string, WorkOrder>);

      // 3. Process Grid
      let totalPlanned = 0;
      let totalCompleted = 0;
      let totalOverdue = 0;

      const processed: AssetPlanningData[] = (assetsData as any[]).map(asset => {
        return {
          id: asset.id,
          tag: asset.tag,
          name: asset.name,
          criticality: asset.criticality,
          location_id: asset.location_id,
          location_name: asset.location?.name || "Sem Localização",
          plans: asset.plans.map((plan: MaintenancePlan) => {
            const months: Record<number, MonthData> = {};
            
            // Determine the projection cycle
            const anchorDate = plan.next_due_date ? parseISO(plan.next_due_date) : 
                              plan.last_generated_at ? parseISO(plan.last_generated_at) : 
                              parseISO(plan.created_at);
            const anchorMonth = getMonth(anchorDate) + 1;
            
            const monthGapMap: Record<string, number> = {
              'monthly': 1, 'bimonthly': 2, 'quarterly': 3, 'semiannual': 6, 'annual': 12, 'weekly': 1, 'daily': 1
            };
            const gap = monthGapMap[plan.frequency] || 0;

            for (let m = 1; m <= 12; m++) {
              const wo = woMap[`${plan.id}-${m}`];
              let status: GridStatus = null;
              
              if (wo) {
                if (wo.status === 'completed') {
                  status = 'completed';
                  totalCompleted++;
                } else if (wo.status === 'in_progress') {
                  status = 'in_progress';
                } else if (wo.status === 'open' || wo.status === 'planned') {
                  const sDate = parseISO(wo.scheduled_date!);
                  if (isBefore(sDate, today)) {
                    status = 'overdue';
                    totalOverdue++;
                  } else {
                    status = 'planned';
                  }
                }
                totalPlanned++;
              } else if (gap > 0 && (m - anchorMonth) % gap === 0) {
                status = 'due_not_generated';
                totalPlanned++;
              }

              months[m] = {
                status,
                wo_id: wo?.id || null,
                wo_number: wo?.wo_number || null,
                scheduled_date: wo?.scheduled_date || null
              };
            }

            return {
              plan_id: plan.id,
              plan_name: plan.name,
              frequency: plan.frequency,
              months
            };
          })
        };
      });

      setData(processed);
      setSummary({
        total_planned: totalPlanned,
        completed: totalCompleted,
        overdue: totalOverdue,
        compliance_rate: totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, filters.location_id, JSON.stringify(filters.criticality), filters.assigned_to]);

  useEffect(() => {
    fetchPlanningData();
  }, [fetchPlanningData]);

  return { data, summary, loading, error, refetch: fetchPlanningData };
}
