-- Tabela de veiculos
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  categoria TEXT DEFAULT 'carro' CHECK (categoria IN ('carro', 'moto')),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano_fabricacao INTEGER NOT NULL,
  ano_modelo INTEGER NOT NULL,
  km INTEGER NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  combustivel TEXT,
  cor TEXT,
  portas INTEGER,
  cambio TEXT,
  carroceria TEXT,
  placa TEXT,
  opcionais TEXT[] DEFAULT '{}',
  descricao TEXT,
  fotos TEXT[] DEFAULT '{}',
  destaque BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido', 'reservado'))
);

-- Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  observacao TEXT
);

-- Historico de veiculos visualizados por lead
CREATE TABLE IF NOT EXISTS lead_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info TEXT
);

-- Favoritos dos clientes
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, vehicle_id)
);

-- Agendamento de visitas
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_visita DATE NOT NULL,
  horario TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado'))
);

-- Visualizacoes de usuarios logados
CREATE TABLE IF NOT EXISTS user_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  vehicle_info TEXT NOT NULL
);

-- Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_views ENABLE ROW LEVEL SECURITY;

-- Politicas vehicles
DROP POLICY IF EXISTS "Qualquer um pode ver veiculos" ON vehicles;
CREATE POLICY "Qualquer um pode ver veiculos" ON vehicles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin pode inserir veiculos" ON vehicles;
CREATE POLICY "Admin pode inserir veiculos" ON vehicles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode atualizar veiculos" ON vehicles;
CREATE POLICY "Admin pode atualizar veiculos" ON vehicles
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode deletar veiculos" ON vehicles;
CREATE POLICY "Admin pode deletar veiculos" ON vehicles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politicas leads
DROP POLICY IF EXISTS "Qualquer um pode inserir lead" ON leads;
CREATE POLICY "Qualquer um pode inserir lead" ON leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode ver leads" ON leads;
CREATE POLICY "Admin pode ver leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin pode deletar leads" ON leads;
CREATE POLICY "Admin pode deletar leads" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politicas lead_views
DROP POLICY IF EXISTS "Qualquer um pode inserir lead_view" ON lead_views;
CREATE POLICY "Qualquer um pode inserir lead_view" ON lead_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode ver lead_views" ON lead_views;
CREATE POLICY "Admin pode ver lead_views" ON lead_views
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politicas favorites
DROP POLICY IF EXISTS "Usuario pode ver seus favoritos" ON favorites;
CREATE POLICY "Usuario pode ver seus favoritos" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario pode inserir favorito" ON favorites;
CREATE POLICY "Usuario pode inserir favorito" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario pode deletar favorito" ON favorites;
CREATE POLICY "Usuario pode deletar favorito" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin pode ver favoritos" ON favorites;
CREATE POLICY "Admin pode ver favoritos" ON favorites
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politicas visits
DROP POLICY IF EXISTS "Usuario pode ver suas visitas" ON visits;
CREATE POLICY "Usuario pode ver suas visitas" ON visits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario pode inserir visita" ON visits;
CREATE POLICY "Usuario pode inserir visita" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin pode ver visitas" ON visits;
CREATE POLICY "Admin pode ver visitas" ON visits
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politicas user_views
DROP POLICY IF EXISTS "Inserir propria visualizacao" ON user_views;
CREATE POLICY "Inserir propria visualizacao" ON user_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin ver visualizacoes" ON user_views;
CREATE POLICY "Admin ver visualizacoes" ON user_views
  FOR SELECT USING (auth.role() = 'authenticated');
