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

-- Habilitar RLS (Row Level Security)
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Crear política permisiva para desarrollo
DO $$ 
BEGIN
    -- Eliminar política existente si existe
    DROP POLICY IF EXISTS "Allow all for authenticated" ON ticket_comments;
    
    -- Crear nueva política
    CREATE POLICY "Allow all for authenticated" ON ticket_comments FOR ALL USING (true);
END $$;

-- Insertar comentarios de ejemplo mejorados
DO $$
DECLARE
    ticket_laptop_id UUID;
    ticket_monitor_id UUID;
    ticket_impresora_id UUID;
    employee_juan_id UUID;
    employee_maria_id UUID;
    employee_carlos_id UUID;
BEGIN
    -- Buscar IDs de tickets
    SELECT id INTO ticket_laptop_id FROM tickets WHERE title ILIKE '%laptop%enciende%' LIMIT 1;
    SELECT id INTO ticket_monitor_id FROM tickets WHERE title ILIKE '%monitor%' LIMIT 1;
    SELECT id INTO ticket_impresora_id FROM tickets WHERE title ILIKE '%impresora%' LIMIT 1;
    
    -- Buscar IDs de empleados
    SELECT id INTO employee_juan_id FROM employees WHERE name ILIKE '%juan%' LIMIT 1;
    SELECT id INTO employee_maria_id FROM employees WHERE name ILIKE '%maría%' OR name ILIKE '%maria%' LIMIT 1;
    SELECT id INTO employee_carlos_id FROM employees WHERE name ILIKE '%carlos%' LIMIT 1;

    -- Comentarios para ticket de laptop
    IF ticket_laptop_id IS NOT NULL AND employee_juan_id IS NOT NULL THEN
        INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal, created_at)
        VALUES 
        (ticket_laptop_id, employee_juan_id, 'Ticket recibido y asignado. Iniciando diagnóstico del equipo.', 'assignment', false, NOW() - INTERVAL '2 hours'),
        (ticket_laptop_id, employee_juan_id, 'Se verificó el cargador y funciona correctamente. El problema parece ser de la placa madre.', 'comment', true, NOW() - INTERVAL '1 hour 30 minutes'),
        (ticket_laptop_id, employee_juan_id, 'Contactando al usuario para coordinar reemplazo temporal mientras se gestiona la reparación.', 'comment', false, NOW() - INTERVAL '1 hour')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Comentarios para ticket de monitor
    IF ticket_monitor_id IS NOT NULL AND employee_maria_id IS NOT NULL THEN
        INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal, created_at)
        VALUES 
        (ticket_monitor_id, employee_maria_id, 'Solicitud recibida y revisada. Verificando justificación con el supervisor.', 'comment', false, NOW() - INTERVAL '3 hours'),
        (ticket_monitor_id, employee_maria_id, 'Aprobación confirmada por el supervisor. Verificando disponibilidad en inventario.', 'status_change', false, NOW() - INTERVAL '2 hours'),
        (ticket_monitor_id, employee_maria_id, 'Monitor LG UltraWide 34" disponible en almacén. Programando instalación.', 'comment', true, NOW() - INTERVAL '30 minutes')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Comentarios para ticket de impresora (si existe)
    IF ticket_impresora_id IS NOT NULL AND employee_juan_id IS NOT NULL THEN
        INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal, created_at)
        VALUES 
        (ticket_impresora_id, employee_juan_id, 'Problema identificado: driver desactualizado y cola de impresión bloqueada.', 'comment', false, NOW() - INTERVAL '1 day'),
        (ticket_impresora_id, employee_juan_id, 'Se actualizaron los drivers y se reinició el servicio de impresión en todas las estaciones.', 'resolution', false, NOW() - INTERVAL '23 hours'),
        (ticket_impresora_id, employee_juan_id, 'Problema resuelto. Impresora funcionando correctamente en todas las estaciones.', 'resolution', false, NOW() - INTERVAL '22 hours')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Crear algunos comentarios adicionales si tenemos más empleados
    IF employee_carlos_id IS NOT NULL AND ticket_laptop_id IS NOT NULL THEN
        INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal, created_at)
        VALUES 
        (ticket_laptop_id, employee_carlos_id, 'Como usuario afectado, confirmo que el problema comenzó después de la actualización de Windows del viernes pasado.', 'comment', false, NOW() - INTERVAL '2 hours 15 minutes')
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Tabla ticket_comments creada exitosamente con comentarios de ejemplo mejorados';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al insertar comentarios de ejemplo: %', SQLERRM;
END $$;

-- Verificar que los comentarios se insertaron correctamente
DO $$
DECLARE
    comment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO comment_count FROM ticket_comments;
    RAISE NOTICE 'Total de comentarios insertados: %', comment_count;
END $$;
