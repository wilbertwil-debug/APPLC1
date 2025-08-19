-- Diagnóstico del Chat Interno
-- Ejecuta este script para verificar el estado del chat

-- 1. Verificar si la tabla existe
SELECT 'Tabla internal_chat_messages existe' as status
FROM information_schema.tables 
WHERE table_name = 'internal_chat_messages';

-- 2. Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'internal_chat_messages'
ORDER BY ordinal_position;

-- 3. Verificar empleados existentes
SELECT id, name, email, created_at
FROM employees
ORDER BY name;

-- 4. Verificar mensajes existentes
SELECT 
  id,
  sender_id,
  receiver_id,
  message,
  created_at,
  (SELECT name FROM employees WHERE id = sender_id) as sender_name,
  (SELECT name FROM employees WHERE id = receiver_id) as receiver_name
FROM internal_chat_messages
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'internal_chat_messages';

-- 6. Intentar insertar un mensaje de prueba (reemplaza los IDs con IDs reales de empleados)
-- INSERT INTO internal_chat_messages (sender_id, receiver_id, message)
-- SELECT 
--   (SELECT id FROM employees LIMIT 1),
--   (SELECT id FROM employees OFFSET 1 LIMIT 1),
--   'Mensaje de prueba - ' || NOW()
-- WHERE (SELECT COUNT(*) FROM employees) >= 2;

-- 7. Verificar el mensaje de prueba
-- SELECT * FROM internal_chat_messages WHERE message LIKE 'Mensaje de prueba%';
