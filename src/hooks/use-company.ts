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
      // Auditor Mode Fallback: Use specific company/user IDs provided by the user
      const companyId = "5782213c-5bc5-419b-8b98-01ad9f25beaf"; // IPB-GR Indústria
      
      const { data: auditorCompany } = await supabase.from("companies").select("*").eq("id", companyId).single();
      
      if (auditorCompany) {
        setCompany(auditorCompany as Company);
        setUser({
          id: "dcf49796-569e-4f8e-b6c6-221a2bd47be6", // Vanderson (admin)
          full_name: "Auditor IA (Acesso Vanderson)",
          email: "auditor@pcmforge.local",
          role: "admin",
          company_id: companyId,
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
