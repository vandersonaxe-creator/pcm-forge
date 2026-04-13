-- ============================================================
-- MANTIX PCM — User Logs Migration
-- ============================================================

CREATE TABLE IF NOT EXISTS user_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  action TEXT NOT NULL, -- e.g., 'login', 'access', 'export'
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_logs_company ON user_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_created ON user_logs(created_at DESC);

-- RLS
ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_logs_select" ON user_logs
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "user_logs_insert" ON user_logs
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());
