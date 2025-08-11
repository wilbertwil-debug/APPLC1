-- Primero, crear las tablas si no existen
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar usuario en la tabla users
INSERT INTO users (email, name, role) 
VALUES ('admin@empresa.com', 'Administrador Sistema', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Configurar políticas para permitir acceso
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Crear política que permita todo para usuarios autenticados
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
CREATE POLICY "Allow all for authenticated users" ON users 
FOR ALL USING (true);
