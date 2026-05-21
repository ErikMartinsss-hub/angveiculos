-- Ver todos os usuários cadastrados
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data->>'nome' as nome, raw_user_meta_data->>'telefone' as telefone
FROM auth.users
ORDER BY created_at DESC;

-- Ver quantos usuários existem
SELECT COUNT(*) as total_usuarios FROM auth.users;

-- Ver se o admin está cadastrado
SELECT email, created_at FROM auth.users WHERE email = 'admin@angveiculos.com';
