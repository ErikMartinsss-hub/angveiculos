-- Adicionar colunas de contato e endereço na tabela site_settings
-- Execute este script no SQL Editor do Supabase

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS telefone1 TEXT DEFAULT '11947831797';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nome1 TEXT DEFAULT 'Anizio';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS telefone2 TEXT DEFAULT '11942398993';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nome2 TEXT DEFAULT 'Gabriel';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS endereco TEXT DEFAULT '';
