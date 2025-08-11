-- Crear tabla para comentarios/seguimiento de tickets
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'resolution')),
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author_id ON ticket_comments(author_id);

-- Habilitar RLS (Row Level Security) si está habilitado en otras tablas
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Crear política permisiva para desarrollo (ajustar según necesidades de producción)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_comments' AND policyname = 'Allow all for authenticated') THEN
        CREATE POLICY "Allow all for authenticated" ON ticket_comments FOR ALL USING (true);
    END IF;
END $$;

-- Insertar algunos comentarios de ejemplo solo si existen los tickets
DO $$
DECLARE
    ticket_laptop_id UUID;
    ticket_monitor_id UUID;
    employee_juan_id UUID;
    employee_maria_id UUID;
BEGIN
    -- Buscar IDs de tickets y empleados
    SELECT id INTO ticket_laptop_id FROM tickets WHERE title ILIKE '%laptop%enciende%' LIMIT 1;
    SELECT id INTO ticket_monitor_id FROM tickets WHERE title ILIKE '%monitor%' LIMIT 1;
    SELECT id INTO employee_juan_id FROM employees WHERE name ILIKE '%juan%pérez%' LIMIT 1;
    SELECT id INTO employee_maria_id FROM employees WHERE name ILIKE '%maría%garcía%' LIMIT 1;

    -- Insertar comentarios solo si encontramos los datos
    IF ticket_laptop_id IS NOT NULL AND employee_juan_id IS NOT NULL THEN
        INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal)
        VALUES 
        (ticket_laptop_id, employee_juan_id, 'Ticket recibido. Iniciando diagnóstico del equipo.', 'comment', false),
        (ticket_laptop_id, employee_juan_id, 'Se verificó el cargador y funciona correctamente. El problema parece ser de hardware.', 'comment', true)
        ON CONFLICT DO NOTHING;
    END IF;

    IF ticket_monitor_id IS NOT NULL AND employee_maria_id IS NOT NULL THEN
        INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal)
        VALUES 
        (ticket_monitor_id, employee_maria_id, 'Monitor adicional aprobado por el supervisor. Verificando disponibilidad en inventario.', 'comment', false)
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Tabla ticket_comments creada exitosamente con datos de ejemplo';
END $$;
