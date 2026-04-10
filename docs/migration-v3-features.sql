-- ============================================================
-- MANTIX PCM v3 — Feature Migrations
-- Features: QR público, Peças/materiais na OS
-- ============================================================

-- ============================================================
-- FEATURE 1: Campo public_token para QR Code público
-- O campo qr_code já existe e é preenchido com UUID no create.
-- Vamos usá-lo como o token público. Garantir index + backfill.
-- ============================================================

-- Backfill: gerar qr_code para ativos que não possuem
UPDATE assets SET qr_code = uuid_generate_v4()::TEXT
WHERE qr_code IS NULL;

-- Index para busca rápida por qr_code (rota pública)
CREATE INDEX IF NOT EXISTS idx_assets_qr_code ON assets(qr_code)
WHERE qr_code IS NOT NULL;

-- Política RLS para leitura pública de ativos via qr_code
-- Necessário para que o service role key funcione, mas
-- como usamos service role, RLS é bypassado automaticamente.

-- ============================================================
-- FEATURE 3: Peças e materiais usados na OS
-- ============================================================

CREATE TABLE IF NOT EXISTS work_order_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  part_code TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'un',
  unit_cost DECIMAL(10,2),
  notes TEXT,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_order_parts_wo ON work_order_parts(work_order_id);

-- RLS
ALTER TABLE work_order_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wo_parts_select" ON work_order_parts
  FOR SELECT USING (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );

CREATE POLICY "wo_parts_insert" ON work_order_parts
  FOR INSERT WITH CHECK (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );

CREATE POLICY "wo_parts_update" ON work_order_parts
  FOR UPDATE USING (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );

CREATE POLICY "wo_parts_delete" ON work_order_parts
  FOR DELETE USING (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );

-- ============================================================
-- FIM DA MIGRAÇÃO v3
-- ============================================================
