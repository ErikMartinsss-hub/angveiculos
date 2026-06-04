-- ============================================
-- SEGURANÇA - Bucket de armazenamento veiculos
-- ============================================

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('veiculos', 'veiculos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas do bucket veiculos
DROP POLICY IF EXISTS "Publico pode ver fotos" ON storage.objects;
CREATE POLICY "Publico pode ver fotos" ON storage.objects
  FOR SELECT USING (bucket_id = 'veiculos');

DROP POLICY IF EXISTS "Admin pode fazer upload" ON storage.objects;
CREATE POLICY "Admin pode fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'veiculos' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admin pode atualizar fotos" ON storage.objects;
CREATE POLICY "Admin pode atualizar fotos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'veiculos' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admin pode deletar fotos" ON storage.objects;
CREATE POLICY "Admin pode deletar fotos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'veiculos' AND auth.role() = 'authenticated'
  );

-- ============================================
-- CORREÇÕES NAS TABELAS
-- ============================================

-- leads: adicionar UPDATE para admin (caso precise editar)
DROP POLICY IF EXISTS "Admin pode atualizar leads" ON leads;
CREATE POLICY "Admin pode atualizar leads" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- visits: adicionar UPDATE para admin (já usado pelo /api/visits)
DROP POLICY IF EXISTS "Admin pode atualizar visitas" ON visits;
CREATE POLICY "Admin pode atualizar visitas" ON visits
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICAÇÃO: listar todas as políticas ativas
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename;
