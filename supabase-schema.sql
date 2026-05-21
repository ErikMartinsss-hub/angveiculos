-- Tabela de veículos
CREATE TABLE vehicles (
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

-- Tabela de leads (clientes interessados)
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  observacao TEXT
);

-- Histórico de veículos visualizados por lead
CREATE TABLE lead_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info TEXT
);

-- Favoritos dos clientes
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, vehicle_id)
);

-- Agendamento de visitas
CREATE TABLE visits (
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

-- Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Políticas vehicles
CREATE POLICY "Qualquer um pode ver veiculos" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Admin pode inserir veiculos" ON vehicles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar veiculos" ON vehicles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar veiculos" ON vehicles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas leads
CREATE POLICY "Qualquer um pode inserir lead" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin pode ver leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar leads" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas lead_views
CREATE POLICY "Qualquer um pode inserir lead_view" ON lead_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin pode ver lead_views" ON lead_views
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas favorites (usuário só vê e gerencia seus próprios favoritos)
CREATE POLICY "Usuario pode ver seus favoritos" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuario pode inserir favorito" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario pode deletar favorito" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas visits
CREATE POLICY "Usuario pode ver suas visitas" ON visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuario pode inserir visita" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode ver visitas" ON visits
  FOR SELECT USING (auth.role() = 'authenticated');

-- Bucket de fotos
-- CREATE POLICY "Fotos publicas" ON storage.objects
--   FOR SELECT USING (bucket_id = 'veiculos');
--
-- CREATE POLICY "Admin upload fotos" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'veiculos' AND auth.role() = 'authenticated');
