"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkOrderPart } from "@/lib/types/database";

export function useWorkOrderParts(workOrderId: string) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParts = useCallback(async () => {
    if (!workOrderId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("work_order_parts")
      .select("*")
      .eq("work_order_id", workOrderId)
      .order("created_at", { ascending: true });

    setParts((data as WorkOrderPart[]) || []);
    setLoading(false);
  }, [workOrderId]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  return { parts, loading, refetch: fetchParts };
}

export async function addWorkOrderPart(
  workOrderId: string,
  data: {
    part_name: string;
    part_code?: string;
    quantity: number;
    unit: string;
    unit_cost?: number;
    notes?: string;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: part, error } = await supabase
    .from("work_order_parts")
    .insert({
      work_order_id: workOrderId,
      part_name: data.part_name,
      part_code: data.part_code || null,
      quantity: data.quantity,
      unit: data.unit,
      unit_cost: data.unit_cost ?? null,
      notes: data.notes || null,
      added_by: user?.id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return part;
}

export async function updateWorkOrderPart(
  partId: string,
  data: Partial<WorkOrderPart>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_order_parts")
    .update(data)
    .eq("id", partId);

  if (error) throw error;
}

export async function deleteWorkOrderPart(partId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_order_parts")
    .delete()
    .eq("id", partId);

  if (error) throw error;
}
