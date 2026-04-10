-- ============================================================
-- MANTIX PCM — asset_documents (certificados, laudos, PDFs na ficha do ativo)
-- ============================================================
-- Aplicar no Supabase SQL Editor após revisão.
-- Requer extensão uuid-ossp (já presente no schema v2).

CREATE TABLE IF NOT EXISTS asset_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT DEFAULT 'certificate'
    CHECK (document_type IN ('certificate', 'manual', 'datasheet', 'report', 'other')),
  -- Caminho relativo ao bucket Storage "documents" (ex.: {company_id}/assets/{asset_id}/arquivo.pdf)
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_documents_asset ON asset_documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_documents_company ON asset_documents(company_id);

ALTER TABLE asset_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_docs_sel" ON asset_documents
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "asset_docs_ins" ON asset_documents
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "asset_docs_del" ON asset_documents
  FOR DELETE USING (company_id = public.get_current_company_id());

-- ============================================================
-- Storage: bucket "documents" (privado — acesso via signed URL)
-- ============================================================
-- Criar manualmente no Supabase Dashboard:
--   Storage → New bucket → Name: documents → Public: OFF
-- Políticas de storage (exemplo — ajustar ao projeto):
--
-- INSERT: authenticated users can upload to folder matching their company
-- SELECT: usar signed URLs geradas no servidor/cliente com service role ou policy read
--
-- Exemplo policy de leitura para usuários autenticados na pasta da empresa:
-- (path: documents/{company_id}/...)
--
-- CREATE POLICY "documents_read_own_company"
-- ON storage.objects FOR SELECT TO authenticated
-- USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM users WHERE id = auth.uid()));
--
-- CREATE POLICY "documents_upload_own_company"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM users WHERE id = auth.uid()));
--
-- Exemplo com split_part (caminho: {company_id}/assets/{asset_id}/arquivo):
--
-- CREATE POLICY "documents_insert_company" ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (
--   bucket_id = 'documents'
--   AND split_part(name, '/', 1) = (SELECT company_id::text FROM public.users WHERE id = auth.uid())
-- );
--
-- CREATE POLICY "documents_select_company" ON storage.objects FOR SELECT TO authenticated
-- USING (
--   bucket_id = 'documents'
--   AND split_part(name, '/', 1) = (SELECT company_id::text FROM public.users WHERE id = auth.uid())
-- );
--
-- CREATE POLICY "documents_delete_company" ON storage.objects FOR DELETE TO authenticated
-- USING (
--   bucket_id = 'documents'
--   AND split_part(name, '/', 1) = (SELECT company_id::text FROM public.users WHERE id = auth.uid())
-- );
--
-- ============================================================
