-- Adicionar colunas de personalizacao dos botoes do hero
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_btn_outline TEXT DEFAULT '#9ca3af',
ADD COLUMN IF NOT EXISTS hero_btn_outline_hover TEXT DEFAULT '#ef4444';

UPDATE site_settings
SET hero_btn_outline = '#9ca3af',
    hero_btn_outline_hover = '#ef4444'
WHERE id = 1;
