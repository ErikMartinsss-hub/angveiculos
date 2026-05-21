CREATE TABLE user_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  vehicle_info TEXT NOT NULL
);

ALTER TABLE user_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inserir propria visualizacao" ON user_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin ver visualizacoes" ON user_views
  FOR SELECT USING (auth.role() = 'authenticated');
