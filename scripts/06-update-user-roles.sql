-- Script para actualizar roles de usuarios y verificar permisos

-- Verificar usuarios existentes
SELECT email, name, role, created_at 
FROM users 
ORDER BY role, name;

-- Actualizar roles específicos si es necesario
-- Ejemplo: hacer que admin@empresa.com sea administrador
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@empresa.com';

-- Ejemplo: hacer que manager@empresa.com sea gerente
UPDATE users 
SET role = 'manager' 
WHERE email = 'manager@empresa.com';

-- Ejemplo: hacer que user@empresa.com sea usuario básico
UPDATE users 
SET role = 'user' 
WHERE email = 'user@empresa.com';

-- Verificar que los cambios se aplicaron correctamente
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN role = 'admin' THEN 'Administrador - Acceso completo'
        WHEN role = 'manager' THEN 'Gerente - Gestión sin eliminación'
        WHEN role = 'user' THEN 'Usuario - Solo tickets y comentarios'
        ELSE 'Rol desconocido'
    END as descripcion_permisos
FROM users 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'manager' THEN 2 
        WHEN 'user' THEN 3 
        ELSE 4 
    END,
    name;

-- Mostrar estadísticas de roles
SELECT 
    role,
    COUNT(*) as cantidad_usuarios,
    STRING_AGG(name, ', ') as usuarios
FROM users 
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'manager' THEN 2 
        WHEN 'user' THEN 3 
        ELSE 4 
    END;
