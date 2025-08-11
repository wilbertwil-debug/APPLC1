-- Deshabilitar confirmación de email para desarrollo
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@empresa.com' AND email_confirmed_at IS NULL;
