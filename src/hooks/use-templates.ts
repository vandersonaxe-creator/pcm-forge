"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistTemplate, ChecklistTemplateItem } from "@/lib/types/database";

interface UseTemplatesOptions {
  category?: string;
  search?: string;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from("checklist_templates")
      .select(`
        *,
        items_count:checklist_template_items(count)
      `)
      .order("created_at", { ascending: false });

    if (options.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }

    if (options.search) {
      query = query.ilike("name", `%${options.search}%`);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      // Flatten the count from the join
      const processedData = (data as any[]).map((t) => ({
        ...t,
        items_count: t.items_count?.[0]?.count || 0,
      }));
      setTemplates(processedData as ChecklistTemplate[]);
    }
    setLoading(false);
  }, [options.category, options.search]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}

export function useTemplate(id: string) {
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const supabase = createClient();
    
    const { data, error: fetchError } = await supabase
      .from("checklist_templates")
      .select(`
        *,
        items:checklist_template_items(*)
      `)
      .eq("id", id)
      .single();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      // Sort items by sort_order
      if (data.items) {
        data.items.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
      setTemplate(data as ChecklistTemplate);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  return { template, loading, error, refetch: fetchTemplate };
}

export async function createTemplate(
  templateData: Partial<ChecklistTemplate>,
  items: Partial<ChecklistTemplateItem>[]
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");

  // Start with template
  const { data: template, error: tError } = await supabase
    .from("checklist_templates")
    .insert({
      ...templateData,
      company_id: profile.company_id,
      is_global: false,
    })
    .select()
    .single();

  if (tError) throw tError;

  // Insert items
  if (items.length > 0) {
    const itemsWithTemplate = items.map((item, index) => ({
      ...item,
      template_id: template.id,
      sort_order: item.sort_order ?? index,
    }));

    const { error: iError } = await supabase
      .from("checklist_template_items")
      .insert(itemsWithTemplate);

    if (iError) throw iError;
  }

  return template;
}

export async function updateTemplate(
  id: string,
  templateData: Partial<ChecklistTemplate>,
  items: Partial<ChecklistTemplateItem>[]
) {
  const supabase = createClient();

  const { error: tError } = await supabase
    .from("checklist_templates")
    .update(templateData)
    .eq("id", id);

  if (tError) throw tError;

  // For items, the simplest way is to delete existing and re-insert 
  // if you don't care about item IDs, OR do a smart merge.
  // Given the complexity of DND and re-ordering, full replacement is often safer in checklists.
  
  const { error: dError } = await supabase
    .from("checklist_template_items")
    .delete()
    .eq("template_id", id);
    
  if (dError) throw dError;

  if (items.length > 0) {
    const itemsWithTemplate = items.map((item, index) => ({
      ...item,
      template_id: id,
      sort_order: index,
    }));

    const { error: iError } = await supabase
      .from("checklist_template_items")
      .insert(itemsWithTemplate);

    if (iError) throw iError;
  }
}

export async function duplicateTemplate(id: string) {
  const supabase = createClient();
  
  // Get original
  const { data: original, error: fError } = await supabase
    .from("checklist_templates")
    .select(`
      *,
      items:checklist_template_items(*)
    `)
    .eq("id", id)
    .single();

  if (fError) throw fError;

  // Create copy
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("company_id").eq("id", user!.id).single();

  const { data: copy, error: cError } = await supabase
    .from("checklist_templates")
    .insert({
      name: `Cópia de ${original.name}`,
      description: original.description,
      category: original.category,
      company_id: profile!.company_id,
      is_global: false,
    })
    .select()
    .single();

  if (cError) throw cError;

  // Copy items
  if (original.items && original.items.length > 0) {
    const newItems = original.items.map((item: any) => {
      const { id, created_at, template_id, ...rest } = item;
      return {
        ...rest,
        template_id: copy.id,
      };
    });

    const { error: iError } = await supabase
      .from("checklist_template_items")
      .insert(newItems);

    if (iError) throw iError;
  }

  return copy;
}

export async function deleteTemplate(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
  if (error) throw error;
}
