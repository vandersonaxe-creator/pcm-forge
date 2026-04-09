"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/types/database";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setLoading(false);
      return;
    }

    // Get current user company
    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("company_id", profile.company_id)
      .eq("is_active", true)
      .order("full_name");

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setUsers(data as User[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
