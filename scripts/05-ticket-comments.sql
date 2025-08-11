-- Crear tabla para comentarios/seguimiento de tickets
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES employees(id),
    comment TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'comment', -- 'comment', 'status_change', 'assignment', 'resolution'
    is_internal BOOLEAN DEFAULT false, -- true para notas internas, false para comentarios visibles al usuario
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at);

-- Insertar algunos comentarios de ejemplo
INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal)
SELECT 
    t.id,
    e.id,
    'Ticket recibido. Iniciando diagnóstico del equipo.',
    'comment',
    false
FROM tickets t, employees e
WHERE t.title = 'Laptop no enciende' 
  AND e.name = 'Juan Pérez'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_comments tc 
    WHERE tc.ticket_id = t.id AND tc.comment LIKE 'Ticket recibido%'
  )
LIMIT 1;

INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal)
SELECT 
    t.id,
    e.id,
    'Se verificó el cargador y funciona correctamente. El problema parece ser de hardware.',
    'comment',
    true
FROM tickets t, employees e
WHERE t.title = 'Laptop no enciende' 
  AND e.name = 'Juan Pérez'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_comments tc 
    WHERE tc.ticket_id = t.id AND tc.comment LIKE 'Se verificó el cargador%'
  )
LIMIT 1;

INSERT INTO ticket_comments (ticket_id, author_id, comment, comment_type, is_internal)
SELECT 
    t.id,
    e.id,
    'Monitor adicional aprobado por el supervisor. Verificando disponibilidad en inventario.',
    'comment',
    false
FROM tickets t, employees e
WHERE t.title = 'Solicitud de nuevo monitor' 
  AND e.name = 'María García'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_comments tc 
    WHERE tc.ticket_id = t.id AND tc.comment LIKE 'Monitor adicional aprobado%'
  )
LIMIT 1;
