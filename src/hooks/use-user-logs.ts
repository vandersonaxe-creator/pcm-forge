"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserLog } from "@/lib/types/database";

export function useUserLogs() {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("user_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLogs((data as UserLog[]) || []);
    }
    setLoading(false);
  }, []);

  const createLog = useCallback(async (action: string, details?: string) => {
    const supabase = createClient();
    
    // Get current user and profile for metadata
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase
      .from("users")
      .select("company_id, full_name")
      .eq("id", authUser.id)
      .single();

    if (!profile) return;

    await supabase.from("user_logs").insert({
      company_id: profile.company_id,
      user_id: authUser.id,
      user_name: profile.full_name,
      user_email: authUser.email,
      action,
      details,
    });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs, createLog };
}
