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
      // Auditor Mode Fallback: Fetch first company if no user is logged in
      const { data: firstCompany } = await supabase.from("companies").select("*").limit(1).single();
      if (firstCompany) {
        setCompany(firstCompany as Company);
        // Provide a guest user with the company_id so UI doesn't break
        setUser({
          id: "00000000-0000-0000-0000-000000000000",
          full_name: "Auditor IA",
          email: "auditor@pcmforge.local",
          role: "auditor",
          company_id: (firstCompany as any).id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);
      }
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
