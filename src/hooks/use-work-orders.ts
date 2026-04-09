"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkOrder, WorkOrderItem, OsStatus } from "@/lib/types/database";
import { differenceInMinutes } from "date-fns";

interface WorkOrdersFilter {
  status?: string | string[];
  os_type?: string;
  priority?: string;
  assigned_to?: string;
  asset_id?: string;
  date_start?: string;
  date_end?: string;
  page?: number;
}

export function useWorkOrders(filters: WorkOrdersFilter = {}) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      let query = supabase
        .from("work_orders")
        .select(`
          *,
          asset:assets(tag, name),
          assignee:users(full_name)
        `, { count: "exact" });

      // Status filter (single or array)
      if (filters.status && filters.status !== "all") {
        if (Array.isArray(filters.status)) {
          if (filters.status.length > 0) {
            query = query.in("status", filters.status);
          }
        } else {
          query = query.eq("status", filters.status);
        }
      }

      if (filters.os_type && filters.os_type !== "all") {
        query = query.eq("os_type", filters.os_type);
      }

      if (filters.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      if (filters.assigned_to && filters.assigned_to !== "all") {
        query = query.eq("assigned_to", filters.assigned_to);
      }

      if (filters.asset_id && filters.asset_id !== "all") {
        query = query.eq("asset_id", filters.asset_id);
      }

      if (filters.date_start && filters.date_start.trim() !== "") {
        query = query.gte("scheduled_date", filters.date_start);
      }

      if (filters.date_end && filters.date_end.trim() !== "") {
        query = query.lte("scheduled_date", filters.date_end);
      }

      // Pagination
      const pageSize = 20;
      const page = filters.page || 1;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query
        .order("scheduled_date", { ascending: false })
        .range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      } else {
        setWorkOrders(data as WorkOrder[]);
        setTotalCount(count || 0);
      }
    } catch (err: any) {
      console.error("Error fetching work orders:", err);
      setError(err.message || "Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.os_type,
    filters.priority,
    filters.assigned_to,
    filters.asset_id,
    filters.date_start,
    filters.date_end,
    filters.page
  ]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  return { workOrders, loading, error, totalCount, refetch: fetchWorkOrders };
}

export function useWorkOrder(id: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      
      const { data, error: fetchError } = await supabase
        .from("work_orders")
        .select(`
          *,
          asset:assets(*),
          plan:maintenance_plans(*),
          template:checklist_templates(*),
          assignee:users(*),
          items:work_order_items(
            *,
            photos:photos(*)
          )
        `)
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      } else {
        // Sort items by group and order
        if (data.items) {
          data.items.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
        setWorkOrder(data as WorkOrder);
      }
    } catch (err: any) {
      console.error("Error fetching work order:", err);
      setError(err.message || "Erro ao carregar ordem de serviço");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkOrder();
  }, [fetchWorkOrder]);

  return { workOrder, loading, error, refetch: fetchWorkOrder };
}

export async function createWorkOrder(data: Partial<WorkOrder>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");

  // 1. Insert Work Order
  const { data: wo, error: woError } = await supabase
    .from("work_orders")
    .insert({
      ...data,
      company_id: profile.company_id,
    })
    .select()
    .single();

  if (woError) throw woError;

  // 2. If template_id, copy items
  if (data.template_id) {
    const { data: templateItems, error: itemsError } = await supabase
      .from("checklist_template_items")
      .select("*")
      .eq("template_id", data.template_id);

    if (itemsError) throw itemsError;

    if (templateItems && templateItems.length > 0) {
      const itemsToInsert = templateItems.map((item) => ({
        work_order_id: wo.id,
        template_item_id: item.id,
        sort_order: item.sort_order,
        group_name: item.group_name,
        description: item.description,
        item_type: item.item_type,
        min_value: item.min_value,
        max_value: item.max_value,
        unit: item.unit,
        options: item.options,
      }));

      const { error: insertItemsError } = await supabase
        .from("work_order_items")
        .insert(itemsToInsert);

      if (insertItemsError) throw insertItemsError;
    }
  }

  return wo;
}

export async function updateWorkOrderStatus(
  id: string, 
  newStatus: OsStatus, 
  coords?: { latitude: number; longitude: number }
) {
  const supabase = createClient();
  
  const { data: currentWo } = await supabase
    .from("work_orders")
    .select("started_at, company_id")
    .eq("id", id)
    .single();

  const updates: Partial<WorkOrder> = { status: newStatus };
  const now = new Date().toISOString();

  if (coords) {
    updates.latitude = coords.latitude;
    updates.longitude = coords.longitude;
  }

  if (newStatus === "in_progress") {
    updates.started_at = now;
  } else if (newStatus === "completed") {
    updates.completed_at = now;
    if (currentWo?.started_at) {
      updates.actual_duration_min = differenceInMinutes(
        new Date(now),
        new Date(currentWo.started_at)
      );
    }
  }

  const { error } = await supabase
    .from("work_orders")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function updateWorkOrderItem(itemId: string, data: Partial<WorkOrderItem>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_order_items")
    .update({
      ...data,
      filled_at: new Date().toISOString()
    })
    .eq("id", itemId);

  if (error) throw error;
}

export async function deleteWorkOrder(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_orders")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getWorkOrderCounters() {
  try {
    const supabase = createClient();
    // Use getSession() instead of getUser() to avoid acquiring the WebLocks API
    // lock, which causes contention when multiple components call this simultaneously.
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

    // Fallback for Auditor Mode
    if (!companyId) {
      const { data: firstCompany } = await supabase.from("companies").select("id").limit(1).single();
      if (firstCompany) companyId = firstCompany.id;
    }

    if (!companyId) return null;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [planned, open, inProgress, completedMonth] = await Promise.all([
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id).eq("status", "planned"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id).eq("status", "open"),
      supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id).eq("status", "in_progress"),
      supabase.from("work_orders").select("*", { count: "exact", head: true })
        .eq("company_id", profile.company_id)
        .eq("status", "completed")
        .gte("completed_at", startOfMonth.toISOString())
    ]);

    return {
      planned: planned.count || 0,
      open: open.count || 0,
      inProgress: inProgress.count || 0,
      completedMonth: completedMonth.count || 0,
    };
  } catch (err) {
    console.error("Error fetching work order counters:", err);
    return null;
  }
}

export async function uploadWorkOrderPhoto(
  companyId: string,
  woId: string,
  itemId: string | null,
  file: File,
  caption?: string
) {
  const supabase = createClient();
  const timestamp = new Date().getTime();
  const fileExt = file.name.split('.').pop();
  const path = itemId 
    ? `${companyId}/wo/${woId}/${itemId}_${timestamp}.${fileExt}`
    : `${companyId}/wo/${woId}/general_${timestamp}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("photos")
    .getPublicUrl(path);

  // Register in photos table
  const { data: photoRec, error: dbError } = await supabase
    .from("photos")
    .insert({
      company_id: companyId,
      work_order_id: woId,
      work_order_item_id: itemId,
      storage_path: path,
      original_filename: file.name,
      caption: caption
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return photoRec;
}

export async function uploadSignature(
  companyId: string,
  woId: string,
  base64Image: string
) {
  const supabase = createClient();
  const path = `${companyId}/${woId}_signature.png`;
  
  // Convert base64 to Blob
  const res = await fetch(base64Image);
  const blob = await res.blob();

  const { error: uploadError } = await supabase.storage
    .from("signatures")
    .upload(path, blob, { contentType: 'image/png', upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("signatures")
    .getPublicUrl(path);

  // Update work order
  const { error: updateError } = await supabase
    .from("work_orders")
    .update({ signature_url: publicUrl })
    .eq("id", woId);

  if (updateError) throw updateError;
  return publicUrl;
}

export async function updateWorkOrderNotes(id: string, notes: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_orders")
    .update({ technician_notes: notes })
    .eq("id", id);
  if (error) throw error;
}
