-- Insertar usuarios en la tabla users (sin tocar auth.users por ahora)
INSERT INTO users (email, name, role) 
SELECT 'admin@empresa.com', 'Administrador Sistema', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@empresa.com');

INSERT INTO users (email, name, role) 
SELECT 'manager@empresa.com', 'Gerente IT', 'manager'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@empresa.com');

INSERT INTO users (email, name, role) 
SELECT 'user@empresa.com', 'Usuario Estándar', 'user'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@empresa.com');

-- Configurar políticas básicas para permitir acceso
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permitan todo (para desarrollo)
DO $$ 
BEGIN
    -- Política para users
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON users FOR ALL USING (true);
    END IF;
    
    -- Política para employees
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON employees FOR ALL USING (true);
    END IF;
    
    -- Política para equipment_types
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment_types' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON equipment_types FOR ALL USING (true);
    END IF;
    
    -- Política para service_stations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_stations' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON service_stations FOR ALL USING (true);
    END IF;
    
    -- Política para equipment
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON equipment FOR ALL USING (true);
    END IF;
    
    -- Política para tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON tickets FOR ALL USING (true);
    END IF;
END $$;
