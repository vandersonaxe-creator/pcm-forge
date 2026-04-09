"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Calibration, Asset } from "@/lib/types/database";

export function useCalibrations(assetId?: string) {
  const [calibrations, setCalibrations] = useState<Calibration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalibrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from("calibrations")
      .select(`
        *,
        asset:assets(*),
        registered_by_user:users(*)
      `)
      .order("calibration_date", { ascending: false });

    if (assetId) {
      query = query.eq("asset_id", assetId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCalibrations((data as Calibration[]) || []);
    }
    setLoading(false);
  }, [assetId]);

  return { calibrations, loading, error, refetch: fetchCalibrations };
}

export function useAssetCalibrations(assetId: string) {
  return useCalibrations(assetId);
}

// Para o Kanban Dashboard, precisaremos de todos os instrumentos
export function useInstrumentsByCalibrationStatus() {
  const [instruments, setInstruments] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("assets")
      .select(`
        *,
        category:asset_categories(*),
        location:asset_locations(*)
      `)
      .eq("asset_type", "instrument")
      .order("next_calibration_date", { ascending: true, nullsFirst: false });

    setInstruments((data as Asset[]) || []);
    setLoading(false);
  }, []);

  return { instruments, loading, refetch: fetchInstruments };
}

export async function createCalibration(calibrationData: Partial<Calibration>, file?: File | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");

  // Generate ID before hand if we need to upload file first
  const calibrationId = crypto.randomUUID();
  let certificateUrl = null;

  if (file) {
    const assetId = calibrationData.asset_id;
    const ext = file.name.split(".").pop();
    const filePath = `${profile.company_id}/${assetId}/${calibrationId}.${ext}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("calibrations")
      .upload(filePath, file);

    if (uploadError) throw new Error("Erro ao enviar certificado: " + uploadError.message);

    const { data: urlData } = supabase.storage.from("calibrations").getPublicUrl(filePath);
    certificateUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("calibrations")
    .insert({
      id: calibrationId, // Insert our generated ID
      ...calibrationData,
      company_id: profile.company_id,
      registered_by: user.id,
      certificate_url: certificateUrl,
      is_locked: true, // Registros de calibração são imutáveis
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
