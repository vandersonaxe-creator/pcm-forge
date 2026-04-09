"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Company } from "@/lib/types/database";

export function useCompany() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setLoading(false);
      return;
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (userProfile) {
      setUser(userProfile as User);

      // Fetch company
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", userProfile.company_id)
        .single();

      if (companyData) {
        setCompany(companyData as Company);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { user, company, loading, refetch: fetchData };
}
