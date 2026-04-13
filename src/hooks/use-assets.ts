"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Asset, AssetCategory, AssetLocation } from "@/lib/types/database";

interface UseAssetsOptions {
  assetType?: string;
  status?: string;
  criticality?: string;
  categoryId?: string;
  locationId?: string;
  search?: string;
}

export function useAssets(options: UseAssetsOptions = {}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from("assets")
      .select(`
        *,
        category:asset_categories(*),
        location:asset_locations(*)
      `)
      .order("created_at", { ascending: false });

    if (options.assetType && options.assetType !== "all") {
      query = query.eq("asset_type", options.assetType);
    }
    if (options.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }
    if (options.criticality && options.criticality !== "all") {
      query = query.eq("criticality", options.criticality);
    }
    if (options.categoryId && options.categoryId !== "all") {
      query = query.eq("category_id", options.categoryId);
    }
    if (options.locationId && options.locationId !== "all") {
      query = query.eq("location_id", options.locationId);
    }
    if (options.search) {
      query = query.or(`tag.ilike.%${options.search}%,name.ilike.%${options.search}%`);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAssets((data as Asset[]) || []);
    }
    setLoading(false);
  }, [options.assetType, options.status, options.criticality, options.categoryId, options.locationId, options.search]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}

export function useAsset(id: string) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("assets")
        .select(`
          *,
          category:asset_categories(*),
          location:asset_locations(*)
        `)
        .eq("id", id)
        .single();

      setAsset(data as Asset | null);
      setLoading(false);
    }
    fetch();
  }, [id]);

  return { asset, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("asset_categories")
      .select("*")
      .order("name");

    setCategories((data as AssetCategory[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}

export function useLocations() {
  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("asset_locations")
      .select("*")
      .order("name");

    setLocations((data as AssetLocation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, loading, refetch: fetchLocations };
}

export async function createCategory(name: string, type: 'equipment' | 'instrument') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single();
  
  const { data, error } = await supabase.from("asset_categories").insert({
    company_id: profile!.company_id,
    name,
    asset_type: type
  }).select().single();
  
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, name: string, type: 'equipment' | 'instrument') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("asset_categories")
    .update({ name, asset_type: type })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("asset_categories").delete().eq("id", id);
  if (error) throw error;
}


export async function createLocation(name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase.from("users").select("company_id").eq("id", user.id).single();
  
  const { data, error } = await supabase.from("asset_locations").insert({
    company_id: profile!.company_id,
    name
  }).select().single();
  
  if (error) throw error;
  return data;
}

export async function createAsset(assetData: Partial<Asset>) {
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
    .from("assets")
    .insert({
      ...assetData,
      company_id: profile.company_id,
      qr_code: crypto.randomUUID(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAsset(id: string, assetData: Partial<Asset>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assets")
    .update({
      ...assetData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAsset(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw error;
}
