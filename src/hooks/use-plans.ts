"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MaintenancePlan, WorkOrder } from "@/lib/types/database";

interface UsePlansOptions {
  status?: string;
  frequency?: string;
  search?: string;
  assetId?: string;
}

export function usePlans(options: UsePlansOptions = {}) {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from("maintenance_plans")
      .select(`
        *,
        asset:assets(tag, name, criticality, status)
      `)
      .order("created_at", { ascending: false });

    if (options.frequency && options.frequency !== "all") {
      query = query.eq("frequency", options.frequency);
    }
    
    if (options.assetId) {
      query = query.eq("asset_id", options.assetId);
    }

    if (options.search) {
      query = query.ilike("name", `%${options.search}%`);
      // Note: searching across relationships (asset.tag or name) directly with typical syntax 
      // isn't straightforward without an inner join or a specific view in Supabase.
      // So we keep it simple or expand later if needed.
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      let result = data as unknown as MaintenancePlan[];
      // Client side post-filtering for operational status if requested
      if (options.status && options.status !== "all") {
        const { getPlanOperationalStatus } = await import("@/lib/plans");
        result = result.filter(
          (p) => getPlanOperationalStatus(p) === options.status
        );
      }
      setPlans(result);
    }
    setLoading(false);
  }, [options.status, options.frequency, options.search, options.assetId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}

export function usePlan(id: string) {
  const [plan, setPlan] = useState<MaintenancePlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("maintenance_plans")
      .select(`
        *,
        asset:assets(*, location:asset_locations(*)),
        assignee:users(id, full_name, role)
      `)
      .eq("id", id)
      .single();

    setPlan((data as unknown) as MaintenancePlan | null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, refetch: fetchPlan };
}

export function usePlanWorkOrders(planId: string) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("work_orders")
      .select(`
        *,
        assignee:users(full_name)
      `)
      .eq("plan_id", planId)
      .order("created_at", { ascending: false });

    setWorkOrders((data as unknown) as WorkOrder[] || []);
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  return { workOrders, loading, refetch: fetchWorkOrders };
}

export async function createPlan(planData: Partial<MaintenancePlan>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");

  const { data, error } = await supabase
    .from("maintenance_plans")
    .insert({
      ...planData,
      company_id: profile.company_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlan(id: string, planData: Partial<MaintenancePlan>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("maintenance_plans")
    .update({
      ...planData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function generatePlanWorkOrders() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("generate_preventive_work_orders");
  
  if (error) throw error;
  return data;
}

export async function deletePlan(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("maintenance_plans").delete().eq("id", id);
  if (error) throw error;
}
