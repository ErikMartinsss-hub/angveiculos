-- ============================================
-- CORREÇÃO DE POLÍTICAS DE SEGURANÇA
-- ============================================

-- 1. LEADS: REMOVER política que permite ANON ver leads
DROP POLICY IF EXISTS "Qualquer um pode ver leads" ON leads;
DROP POLICY IF EXISTS "Ver leads" ON leads;

-- 2. FAVORITES: corrigir INSERT para verificar auth.uid() = user_id
DROP POLICY IF EXISTS "Usuario inserir favorito" ON favorites;
DROP POLICY IF EXISTS "Usuario pode inserir favorito" ON favorites;
CREATE POLICY "Usuario inserir favorito" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. USER_VIEWS: corrigir INSERT para verificar auth.uid() = user_id
DROP POLICY IF EXISTS "Inserir propria visualizacao" ON user_views;
CREATE POLICY "Inserir propria visualizacao" ON user_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. VISITS: corrigir INSERT para verificar auth.uid() = user_id
DROP POLICY IF EXISTS "Usuario inserir visita" ON visits;
DROP POLICY IF EXISTS "Usuario pode inserir visita" ON visits;
CREATE POLICY "Usuario inserir visita" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. VEHICLES: corrigir INSERT para verificar authenticated
DROP POLICY IF EXISTS "Admin pode inserir" ON vehicles;
DROP POLICY IF EXISTS "Admin pode inserir veiculos" ON vehicles;
CREATE POLICY "Admin pode inserir veiculos" ON vehicles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. STORAGE: remover política duplicada e sem verificação
DROP POLICY IF EXISTS "Admin pode fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin pode fazer upload de fotos" ON storage.objects;
CREATE POLICY "Admin pode fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'veiculos' AND auth.role() = 'authenticated'
  );

-- 7. Remover policies duplicadas antigas que sobraram
DROP POLICY IF EXISTS "Usuario ver favoritos" ON favorites;
DROP POLICY IF EXISTS "Usuario deletar favorito" ON favorites;
DROP POLICY IF EXISTS "Usuario ver visitas" ON visits;
DROP POLICY IF EXISTS "Admin ver visitas" ON visits;
DROP POLICY IF EXISTS "Admin ver visualizacoes" ON user_views;
DROP POLICY IF EXISTS "Ver lead_views" ON lead_views;
DROP POLICY IF EXISTS "Admin pode atualizar" ON vehicles;
DROP POLICY IF EXISTS "Admin pode deletar" ON vehicles;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename;
