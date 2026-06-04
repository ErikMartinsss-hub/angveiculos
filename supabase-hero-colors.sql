-- Adicionar colunas de personalizacao do hero
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_bg TEXT DEFAULT '#111827',
ADD COLUMN IF NOT EXISTS hero_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS hero_desc_color TEXT DEFAULT '#9ca3af',
ADD COLUMN IF NOT EXISTS hero_highlight_color TEXT DEFAULT '#ef4444';

UPDATE site_settings
SET hero_bg = '#111827',
    hero_text_color = '#ffffff',
    hero_desc_color = '#9ca3af',
    hero_highlight_color = '#ef4444'
WHERE id = 1;
