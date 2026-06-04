-- Criar tabela de configuracao do site
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome TEXT DEFAULT 'Ang Veículos',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir linha padrao
INSERT INTO site_settings (id, nome, logo_url, primary_color)
VALUES (1, 'Ang Veículos', NULL, '#dc2626')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver config" ON site_settings;
CREATE POLICY "Todos podem ver config" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin pode atualizar config" ON site_settings;
CREATE POLICY "Admin pode atualizar config" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
