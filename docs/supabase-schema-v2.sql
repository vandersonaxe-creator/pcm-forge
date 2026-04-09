-- ============================================================
-- MANTIX PCM v2 — Schema Corrigido
-- Correções baseadas na revisão técnica de 09/04/2026
-- ============================================================
-- CHANGELOG v2:
--   [FIX-1] wo_number agora é sequencial POR EMPRESA (não global)
--   [FIX-2] CHECK constraints para consistência asset_type vs campos metrológicos
--   [FIX-3] Triggers de imutabilidade (OS concluída e calibrações)
--   [FIX-4] Geração automática de OS preventiva via pg_cron
--   [FIX-5] maintenance_plans expandido (responsável, janela, tolerância, centro de custo)
--   [FIX-6] RLS revisada com função helper para performance
--   [FIX-7] Numeração de OS formatada: WO-2026-000123
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. MULTI-TENANCY
-- ============================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'enterprise')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
  -- [FIX-1] Contador de OS por empresa
  wo_counter INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 0. HELPER: Função para obter company_id do usuário atual
--    Criada no schema public (auth não permite via SQL Editor)
--    Chamada depois de users existir para evitar erro de referência
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- 2. ATIVOS
-- ============================================================

CREATE TYPE asset_type AS ENUM ('equipment', 'instrument');
CREATE TYPE criticality_level AS ENUM ('A', 'B', 'C');

CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_type asset_type NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE TABLE asset_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES asset_locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES asset_categories(id),
  location_id UUID REFERENCES asset_locations(id),

  -- Identificação
  tag TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type asset_type NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  photo_url TEXT,

  -- Classificação
  criticality criticality_level DEFAULT 'B',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'disposed')),

  -- Campos metrológicos (instruments only)
  measurement_range TEXT,
  resolution TEXT,
  accuracy TEXT,
  calibration_frequency_days INT,
  last_calibration_date DATE,
  next_calibration_date DATE,
  calibration_provider TEXT,
  calibration_status TEXT DEFAULT 'not_applicable'
    CHECK (calibration_status IN ('valid', 'expiring', 'expired', 'pending', 'not_applicable')),

  -- QR Code
  qr_code TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, tag),

  -- ============================================================
  -- [FIX-2] Consistência entre asset_type e campos metrológicos
  -- ============================================================

  -- Equipamentos NÃO devem ter dados de calibração
  CONSTRAINT chk_equipment_no_calibration CHECK (
    asset_type != 'equipment' OR (
      calibration_frequency_days IS NULL
      AND last_calibration_date IS NULL
      AND next_calibration_date IS NULL
      AND calibration_provider IS NULL
      AND calibration_status = 'not_applicable'
    )
  ),

  -- Instrumentos DEVEM ter frequência de calibração
  CONSTRAINT chk_instrument_requires_calibration CHECK (
    asset_type != 'instrument' OR (
      calibration_frequency_days IS NOT NULL
      AND calibration_frequency_days > 0
    )
  )
);

-- ============================================================
-- 3. CALIBRAÇÕES
-- ============================================================

CREATE TABLE calibrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

  calibration_date DATE NOT NULL,
  next_calibration_date DATE NOT NULL,
  provider TEXT NOT NULL,
  certificate_number TEXT,
  certificate_url TEXT,
  result TEXT DEFAULT 'approved'
    CHECK (result IN ('approved', 'reproved', 'adjusted')),

  cost DECIMAL(10,2),
  notes TEXT,
  registered_by UUID REFERENCES users(id),

  -- [FIX-3] Flag de imutabilidade
  is_locked BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PLANOS DE MANUTENÇÃO PREVENTIVA
-- [FIX-5] Expandido com campos operacionais
-- ============================================================

CREATE TYPE frequency_type AS ENUM (
  'daily', 'weekly', 'biweekly', 'monthly',
  'bimonthly', 'quarterly', 'semiannual', 'annual', 'custom'
);

CREATE TABLE maintenance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  frequency frequency_type NOT NULL,
  frequency_days INT,                 -- Para 'custom': intervalo em dias
  estimated_duration_min INT,

  -- [FIX-5] Campos operacionais adicionais
  default_assignee UUID REFERENCES users(id),   -- Técnico responsável padrão
  execution_window_days INT DEFAULT 3,           -- Janela de execução (dias antes/depois)
  tolerance_days INT DEFAULT 0,                  -- Tolerância de atraso aceitável
  cost_center TEXT,                              -- Centro de custo / setor
  inherits_criticality BOOLEAN DEFAULT true,     -- Herdar criticidade do ativo

  -- Controle
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMPTZ,
  next_due_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Frequência custom exige frequency_days
  CONSTRAINT chk_custom_frequency CHECK (
    frequency != 'custom' OR (frequency_days IS NOT NULL AND frequency_days > 0)
  )
);

-- ============================================================
-- 5. TEMPLATES DE CHECKLIST
-- ============================================================

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES maintenance_plans(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_global BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,

  sort_order INT NOT NULL,
  group_name TEXT,
  description TEXT NOT NULL,
  item_type TEXT DEFAULT 'check'
    CHECK (item_type IN ('check', 'measure', 'photo', 'text', 'select')),

  min_value DECIMAL,
  max_value DECIMAL,
  unit TEXT,
  options TEXT,

  requires_photo BOOLEAN DEFAULT false,
  requires_note_on_nok BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. ORDENS DE SERVIÇO
-- [FIX-1] Numeração sequencial por empresa
-- [FIX-7] Formato WO-YYYY-NNNNNN
-- ============================================================

CREATE TYPE os_type AS ENUM ('preventive', 'corrective', 'inspection', 'calibration');
CREATE TYPE os_status AS ENUM ('planned', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE os_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id),
  plan_id UUID REFERENCES maintenance_plans(id),
  template_id UUID REFERENCES checklist_templates(id),

  -- [FIX-1][FIX-7] Numeração por empresa
  wo_number TEXT NOT NULL,           -- Formato: WO-2026-000001
  wo_seq INT NOT NULL,               -- Sequencial numérico para ordenação

  os_type os_type NOT NULL,
  status os_status DEFAULT 'planned',
  priority os_priority DEFAULT 'medium',

  title TEXT NOT NULL,
  description TEXT,
  failure_description TEXT,

  assigned_to UUID REFERENCES users(id),
  requested_by TEXT,

  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date DATE,

  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  technician_notes TEXT,
  ai_summary TEXT,
  signature_url TEXT,
  client_signature_url TEXT,
  actual_duration_min INT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, wo_number)
);

-- [FIX-1] Função para gerar número de OS sequencial por empresa
CREATE OR REPLACE FUNCTION generate_wo_number()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INT;
  year_str TEXT;
BEGIN
  -- Incrementa o contador da empresa atomicamente
  UPDATE companies
  SET wo_counter = wo_counter + 1
  WHERE id = NEW.company_id
  RETURNING wo_counter INTO next_seq;

  year_str := EXTRACT(YEAR FROM COALESCE(NEW.scheduled_date, NOW()))::TEXT;
  NEW.wo_seq := next_seq;
  NEW.wo_number := 'WO-' || year_str || '-' || LPAD(next_seq::TEXT, 6, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_wo_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_wo_number();

-- ============================================================
-- 7. RESPOSTAS DO CHECKLIST
-- ============================================================

CREATE TABLE work_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES checklist_template_items(id),

  sort_order INT NOT NULL,
  group_name TEXT,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL,

  value TEXT,
  is_conforming BOOLEAN,
  measured_value DECIMAL,
  note TEXT,

  ai_validation TEXT,
  ai_validated_at TIMESTAMPTZ,

  filled_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. FOTOS
-- ============================================================

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  work_order_item_id UUID REFERENCES work_order_items(id) ON DELETE CASCADE,
  calibration_id UUID REFERENCES calibrations(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id),

  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT,
  caption TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  taken_at TIMESTAMPTZ DEFAULT NOW(),

  ai_analysis JSONB,
  ai_analyzed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. [FIX-3] TRIGGERS DE IMUTABILIDADE
-- ============================================================

-- OS concluída ou cancelada não pode ser editada
CREATE OR REPLACE FUNCTION prevent_closed_wo_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('completed', 'cancelled') THEN
    -- Permite apenas atualização de ai_summary (processamento assíncrono)
    IF NEW.status = OLD.status
       AND NEW.ai_summary IS DISTINCT FROM OLD.ai_summary
       AND ROW(NEW.title, NEW.description, NEW.assigned_to, NEW.technician_notes,
               NEW.scheduled_date, NEW.started_at, NEW.completed_at) IS NOT DISTINCT FROM
           ROW(OLD.title, OLD.description, OLD.assigned_to, OLD.technician_notes,
               OLD.scheduled_date, OLD.started_at, OLD.completed_at)
    THEN
      RETURN NEW;  -- Permite apenas atualização de ai_summary
    END IF;
    RAISE EXCEPTION 'Ordem de serviço % está % e não pode ser alterada.',
      OLD.wo_number, OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_closed_wo_update
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_closed_wo_update();

-- Impedir DELETE em OS concluída
CREATE OR REPLACE FUNCTION prevent_closed_wo_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Ordem de serviço % está % e não pode ser excluída.',
      OLD.wo_number, OLD.status;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_closed_wo_delete
  BEFORE DELETE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_closed_wo_delete();

-- Calibração não pode ser editada após criação
CREATE OR REPLACE FUNCTION prevent_calibration_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION 'Calibração % não pode ser alterada após registro. Crie um novo registro.',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_calibration_update
  BEFORE UPDATE ON calibrations
  FOR EACH ROW
  EXECUTE FUNCTION prevent_calibration_update();

-- Impedir edição de itens de checklist em OS fechada
CREATE OR REPLACE FUNCTION prevent_closed_wo_items_update()
RETURNS TRIGGER AS $$
DECLARE
  wo_status os_status;
BEGIN
  SELECT status INTO wo_status FROM work_orders WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id);
  IF wo_status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Não é possível alterar itens de uma OS concluída ou cancelada.';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_closed_wo_items_update
  BEFORE UPDATE OR DELETE ON work_order_items
  FOR EACH ROW
  EXECUTE FUNCTION prevent_closed_wo_items_update();

-- ============================================================
-- 10. [FIX-4] GERAÇÃO AUTOMÁTICA DE OS PREVENTIVA
-- Função chamada por pg_cron ou Edge Function (diariamente)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_preventive_work_orders()
RETURNS INT AS $$
DECLARE
  plan RECORD;
  generated INT := 0;
  existing_count INT;
BEGIN
  FOR plan IN
    SELECT mp.*, a.name as asset_name, a.tag as asset_tag
    FROM maintenance_plans mp
    JOIN assets a ON a.id = mp.asset_id
    WHERE mp.is_active = true
      AND mp.next_due_date IS NOT NULL
      AND mp.next_due_date <= CURRENT_DATE + COALESCE(mp.execution_window_days, 3)
      AND a.status = 'active'
  LOOP
    -- Verificar se já existe OS planned/open para este plano nesta data
    SELECT COUNT(*) INTO existing_count
    FROM work_orders
    WHERE plan_id = plan.id
      AND status IN ('planned', 'open', 'in_progress')
      AND scheduled_date = plan.next_due_date;

    IF existing_count = 0 THEN
      INSERT INTO work_orders (
        company_id, asset_id, plan_id,
        os_type, status, priority,
        title, scheduled_date, due_date, assigned_to
      ) VALUES (
        plan.company_id,
        plan.asset_id,
        plan.id,
        'preventive',
        'planned',
        CASE plan.inherits_criticality
          WHEN true THEN (
            SELECT CASE a2.criticality
              WHEN 'A' THEN 'high'::os_priority
              WHEN 'B' THEN 'medium'::os_priority
              WHEN 'C' THEN 'low'::os_priority
            END FROM assets a2 WHERE a2.id = plan.asset_id
          )
          ELSE 'medium'::os_priority
        END,
        plan.name || ' — ' || plan.asset_tag,
        plan.next_due_date,
        plan.next_due_date + COALESCE(plan.tolerance_days, 0),
        plan.default_assignee
      );

      -- Atualizar next_due_date do plano
      UPDATE maintenance_plans
      SET
        last_generated_at = NOW(),
        next_due_date = plan.next_due_date + (
          CASE plan.frequency
            WHEN 'daily' THEN 1
            WHEN 'weekly' THEN 7
            WHEN 'biweekly' THEN 14
            WHEN 'monthly' THEN 30
            WHEN 'bimonthly' THEN 60
            WHEN 'quarterly' THEN 90
            WHEN 'semiannual' THEN 180
            WHEN 'annual' THEN 365
            WHEN 'custom' THEN COALESCE(plan.frequency_days, 30)
          END
        )
      WHERE id = plan.id;

      generated := generated + 1;
    END IF;
  END LOOP;

  RETURN generated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Para ativar com pg_cron (rodar diariamente às 06:00 BRT):
-- SELECT cron.schedule('generate-preventive-os', '0 9 * * *', 'SELECT generate_preventive_work_orders()');
-- Nota: 09:00 UTC = 06:00 BRT

-- ============================================================
-- 11. TRIGGER: Atualizar calibration_status do ativo automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_asset_calibration_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma nova calibração é inserida, atualiza o ativo
  UPDATE assets SET
    last_calibration_date = NEW.calibration_date,
    next_calibration_date = NEW.next_calibration_date,
    calibration_status = CASE
      WHEN NEW.next_calibration_date < CURRENT_DATE THEN 'expired'
      WHEN NEW.next_calibration_date <= CURRENT_DATE + 30 THEN 'expiring'
      ELSE 'valid'
    END,
    calibration_provider = NEW.provider,
    updated_at = NOW()
  WHERE id = NEW.asset_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_asset_on_calibration
  AFTER INSERT ON calibrations
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_calibration_status();

-- ============================================================
-- 12. TRIGGER: Atualizar status de calibração diariamente
-- (pode ser pg_cron também)
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_calibration_statuses()
RETURNS VOID AS $$
BEGIN
  UPDATE assets SET
    calibration_status = CASE
      WHEN next_calibration_date < CURRENT_DATE THEN 'expired'
      WHEN next_calibration_date <= CURRENT_DATE + 30 THEN 'expiring'
      ELSE 'valid'
    END
  WHERE asset_type = 'instrument'
    AND status = 'active'
    AND calibration_status != 'not_applicable';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron: SELECT cron.schedule('refresh-calibrations', '0 8 * * *', 'SELECT refresh_calibration_statuses()');

-- ============================================================
-- 13. ÍNDICES
-- ============================================================

CREATE INDEX idx_assets_company ON assets(company_id);
CREATE INDEX idx_assets_type ON assets(company_id, asset_type);
CREATE INDEX idx_assets_status ON assets(company_id, status);
CREATE INDEX idx_assets_calibration ON assets(next_calibration_date)
  WHERE asset_type = 'instrument';

CREATE INDEX idx_calibrations_asset ON calibrations(asset_id);
CREATE INDEX idx_calibrations_next ON calibrations(next_calibration_date);

CREATE INDEX idx_work_orders_company ON work_orders(company_id);
CREATE INDEX idx_work_orders_asset ON work_orders(asset_id);
CREATE INDEX idx_work_orders_status ON work_orders(company_id, status);
CREATE INDEX idx_work_orders_scheduled ON work_orders(company_id, scheduled_date);
CREATE INDEX idx_work_orders_assigned ON work_orders(assigned_to, status);
CREATE INDEX idx_work_orders_plan ON work_orders(plan_id, status);

CREATE INDEX idx_work_order_items_wo ON work_order_items(work_order_id);
CREATE INDEX idx_photos_wo ON photos(work_order_id);
CREATE INDEX idx_photos_asset ON photos(asset_id);

CREATE INDEX idx_maintenance_plans_next ON maintenance_plans(company_id, next_due_date)
  WHERE is_active = true;

-- ============================================================
-- 14. [FIX-6] ROW LEVEL SECURITY (revisada)
-- Usa public.get_current_company_id() para performance
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Companies: admin vê e edita a própria, demais só leitura
CREATE POLICY "companies_select" ON companies
  FOR SELECT USING (id = public.get_current_company_id());
CREATE POLICY "companies_update" ON companies
  FOR UPDATE USING (
    id = public.get_current_company_id()
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Users
CREATE POLICY "users_select" ON users
  FOR SELECT USING (company_id = public.get_current_company_id());
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());
CREATE POLICY "users_update" ON users
  FOR UPDATE USING (company_id = public.get_current_company_id());

-- Tabelas com isolamento padrão por company_id
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'assets', 'asset_categories', 'asset_locations',
    'calibrations', 'maintenance_plans', 'work_orders', 'photos'
  ])
  LOOP
    EXECUTE format('
      CREATE POLICY %I ON %I FOR SELECT USING (company_id = public.get_current_company_id());
      CREATE POLICY %I ON %I FOR INSERT WITH CHECK (company_id = public.get_current_company_id());
      CREATE POLICY %I ON %I FOR UPDATE USING (company_id = public.get_current_company_id());
      CREATE POLICY %I ON %I FOR DELETE USING (company_id = public.get_current_company_id());
    ',
      tbl || '_sel', tbl,
      tbl || '_ins', tbl,
      tbl || '_upd', tbl,
      tbl || '_del', tbl
    );
  END LOOP;
END $$;

-- Checklist templates: inclui templates globais
CREATE POLICY "templates_select" ON checklist_templates
  FOR SELECT USING (company_id = public.get_current_company_id() OR is_global = true);
CREATE POLICY "templates_insert" ON checklist_templates
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());
CREATE POLICY "templates_update" ON checklist_templates
  FOR UPDATE USING (company_id = public.get_current_company_id());
CREATE POLICY "templates_delete" ON checklist_templates
  FOR DELETE USING (company_id = public.get_current_company_id());

-- Template items: via template
CREATE POLICY "template_items_select" ON checklist_template_items
  FOR SELECT USING (
    template_id IN (SELECT id FROM checklist_templates WHERE company_id = public.get_current_company_id() OR is_global = true)
  );
CREATE POLICY "template_items_insert" ON checklist_template_items
  FOR INSERT WITH CHECK (
    template_id IN (SELECT id FROM checklist_templates WHERE company_id = public.get_current_company_id())
  );
CREATE POLICY "template_items_update" ON checklist_template_items
  FOR UPDATE USING (
    template_id IN (SELECT id FROM checklist_templates WHERE company_id = public.get_current_company_id())
  );

-- Work order items: via work_order
CREATE POLICY "wo_items_select" ON work_order_items
  FOR SELECT USING (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );
CREATE POLICY "wo_items_insert" ON work_order_items
  FOR INSERT WITH CHECK (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );
CREATE POLICY "wo_items_update" ON work_order_items
  FOR UPDATE USING (
    work_order_id IN (SELECT id FROM work_orders WHERE company_id = public.get_current_company_id())
  );

-- ============================================================
-- 15. FUNÇÕES DE DASHBOARD (mantidas da v1, ajustadas)
-- ============================================================

CREATE OR REPLACE FUNCTION get_calibration_alerts(p_company_id UUID, p_days_ahead INT DEFAULT 30)
RETURNS TABLE (
  asset_id UUID, asset_tag TEXT, asset_name TEXT,
  next_calibration DATE, days_remaining INT, alert_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.tag, a.name, a.next_calibration_date,
    (a.next_calibration_date - CURRENT_DATE)::INT,
    CASE
      WHEN a.next_calibration_date < CURRENT_DATE THEN 'expired'
      WHEN a.next_calibration_date <= CURRENT_DATE + p_days_ahead THEN 'expiring'
      ELSE 'valid'
    END
  FROM assets a
  WHERE a.company_id = p_company_id
    AND a.asset_type = 'instrument' AND a.status = 'active'
    AND a.next_calibration_date <= CURRENT_DATE + p_days_ahead
  ORDER BY a.next_calibration_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_overdue_maintenance(p_company_id UUID)
RETURNS TABLE (
  plan_id UUID, plan_name TEXT, asset_tag TEXT, asset_name TEXT,
  due_date DATE, days_overdue INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT mp.id, mp.name, a.tag, a.name, mp.next_due_date,
    (CURRENT_DATE - mp.next_due_date)::INT
  FROM maintenance_plans mp
  JOIN assets a ON a.id = mp.asset_id
  WHERE mp.company_id = p_company_id AND mp.is_active = true
    AND mp.next_due_date < CURRENT_DATE
  ORDER BY mp.next_due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_company_id UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_assets', (SELECT COUNT(*) FROM assets WHERE company_id = p_company_id AND status = 'active'),
    'total_instruments', (SELECT COUNT(*) FROM assets WHERE company_id = p_company_id AND asset_type = 'instrument' AND status = 'active'),
    'calibrations_expired', (SELECT COUNT(*) FROM assets WHERE company_id = p_company_id AND asset_type = 'instrument' AND next_calibration_date < CURRENT_DATE AND status = 'active'),
    'calibrations_expiring_30d', (SELECT COUNT(*) FROM assets WHERE company_id = p_company_id AND asset_type = 'instrument' AND next_calibration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 AND status = 'active'),
    'preventives_overdue', (SELECT COUNT(*) FROM maintenance_plans WHERE company_id = p_company_id AND is_active = true AND next_due_date < CURRENT_DATE),
    'open_work_orders', (SELECT COUNT(*) FROM work_orders WHERE company_id = p_company_id AND status IN ('open', 'in_progress')),
    'completed_this_month', (SELECT COUNT(*) FROM work_orders WHERE company_id = p_company_id AND status = 'completed' AND completed_at >= DATE_TRUNC('month', CURRENT_DATE)),
    'compliance_rate', (
      SELECT ROUND(COALESCE(
        (SELECT COUNT(*)::DECIMAL FROM maintenance_plans WHERE company_id = p_company_id AND is_active = true AND (next_due_date >= CURRENT_DATE OR next_due_date IS NULL))
        / NULLIF((SELECT COUNT(*) FROM maintenance_plans WHERE company_id = p_company_id AND is_active = true), 0) * 100
      , 0), 1)
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIM DO SCHEMA v2
-- Para ativar pg_cron (requer extensão no Supabase):
--   SELECT cron.schedule('generate-preventive-os', '0 9 * * *', 'SELECT generate_preventive_work_orders()');
--   SELECT cron.schedule('refresh-calibrations', '0 8 * * *', 'SELECT refresh_calibration_statuses()');
-- ============================================================
