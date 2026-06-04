-- Adicionar colunas de personalizacao do header/footer
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS header_bg TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS header_text_color TEXT DEFAULT '#111827',
ADD COLUMN IF NOT EXISTS footer_bg TEXT DEFAULT '#111827',
ADD COLUMN IF NOT EXISTS footer_text_color TEXT DEFAULT '#9ca3af';

-- Atualizar linha padrao com os novos valores
UPDATE site_settings
SET header_bg = '#ffffff',
    header_text_color = '#111827',
    footer_bg = '#111827',
    footer_text_color = '#9ca3af'
WHERE id = 1;
