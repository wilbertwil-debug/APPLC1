-- Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS habilitado, crear políticas permisivas
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);

-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON employees FOR ALL USING (true);

-- ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON equipment_types FOR ALL USING (true);

-- ALTER TABLE service_stations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON service_stations FOR ALL USING (true);

-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON equipment FOR ALL USING (true);

-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON tickets FOR ALL USING (true);
