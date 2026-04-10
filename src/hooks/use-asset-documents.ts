"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AssetDocument, AssetDocumentType } from "@/lib/types/database";

const DOCUMENTS_BUCKET = "documents";
const MAX_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "document";
}

export function buildDocumentStoragePath(
  companyId: string,
  assetId: string,
  fileName: string
): string {
  const safe = sanitizeFileName(fileName);
  const stamp = Date.now();
  return `${companyId}/assets/${assetId}/${stamp}_${safe}`;
}

export function useAssetDocuments(assetId: string) {
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("asset_documents")
      .select("*")
      .eq("asset_id", assetId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setDocuments([]);
    } else {
      setDocuments((data as AssetDocument[]) || []);
    }
    setLoading(false);
  }, [assetId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, refetch: fetchDocuments };
}

export async function getDocumentSignedUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Não foi possível gerar link do documento.");
  }
  return data.signedUrl;
}

export async function uploadAssetDocument(params: {
  assetId: string;
  companyId: string;
  name: string;
  description?: string | null;
  documentType: AssetDocumentType;
  file: File;
}): Promise<AssetDocument> {
  if (params.file.size > MAX_BYTES) {
    throw new Error("Arquivo excede o limite de 10 MB.");
  }

  const allowed =
    params.file.type === "application/pdf" ||
    params.file.type === "image/jpeg" ||
    params.file.type === "image/png" ||
    /\.(pdf|jpe?g|png)$/i.test(params.file.name);

  if (!allowed) {
    throw new Error("Formato não permitido. Use PDF, JPG ou PNG.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const path = buildDocumentStoragePath(
    params.companyId,
    params.assetId,
    params.file.name
  );

  const { error: upError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, params.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (upError) throw new Error(upError.message);

  const { data: row, error: insError } = await supabase
    .from("asset_documents")
    .insert({
      company_id: params.companyId,
      asset_id: params.assetId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      document_type: params.documentType,
      file_url: path,
      file_name: params.file.name,
      file_size: params.file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (insError) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
    throw insError;
  }

  return row as AssetDocument;
}

export async function deleteAssetDocument(doc: AssetDocument): Promise<void> {
  const supabase = createClient();
  const path = doc.file_url;

  const { error: rmError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([path]);

  if (rmError) {
    console.warn("Storage remove:", rmError.message);
  }

  const { error } = await supabase
    .from("asset_documents")
    .delete()
    .eq("id", doc.id);

  if (error) throw error;
}

/**
 * Após registrar calibração com PDF, copia o arquivo para o bucket `documents`
 * e cria registro em asset_documents (certificado visível na ficha do ativo).
 */
export async function syncCalibrationFileToAssetDocuments(params: {
  companyId: string;
  assetId: string;
  calibrationId: string;
  certificateNumber: string | null;
  file: File;
  uploadedBy: string;
}): Promise<void> {
  const supabase = createClient();
  const ext = params.file.name.split(".").pop() || "pdf";
  const path = `${params.companyId}/assets/${params.assetId}/cal_${params.calibrationId}.${ext}`;

  const { error: upError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, params.file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (upError) {
    console.warn("syncCalibrationFileToAssetDocuments upload:", upError.message);
    throw upError;
  }

  const certLabel = params.certificateNumber?.trim();
  const name = certLabel
    ? `Certificado Calibração ${certLabel}`
    : `Certificado Calibração ${params.calibrationId.slice(0, 8)}`;

  const { error: insError } = await supabase.from("asset_documents").insert({
    company_id: params.companyId,
    asset_id: params.assetId,
    name,
    description: "Enviado junto ao registro de calibração",
    document_type: "certificate",
    file_url: path,
    file_name: params.file.name,
    file_size: params.file.size,
    uploaded_by: params.uploadedBy,
  });

  if (insError) {
    console.warn("syncCalibrationFileToAssetDocuments insert:", insError.message);
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
    throw insError;
  }
}
