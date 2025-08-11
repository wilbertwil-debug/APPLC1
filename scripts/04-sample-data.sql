-- Insertar más empleados de ejemplo
INSERT INTO employees (name, email, phone, department, position) VALUES 
('Pedro Rodríguez', 'pedro.rodriguez@empresa.com', '+1234567894', 'IT', 'Desarrollador Senior'),
('Laura Fernández', 'laura.fernandez@empresa.com', '+1234567895', 'Marketing', 'Coordinadora de Marketing'),
('Miguel Torres', 'miguel.torres@empresa.com', '+1234567896', 'Finanzas', 'Analista Financiero'),
('Sofia Herrera', 'sofia.herrera@empresa.com', '+1234567897', 'IT', 'Administradora de Base de Datos'),
('Diego Morales', 'diego.morales@empresa.com', '+1234567898', 'Operaciones', 'Supervisor de Operaciones')
ON CONFLICT (email) DO NOTHING;

-- Insertar más tipos de equipos
INSERT INTO equipment_types (name, description) VALUES 
('Servidor', 'Servidores físicos y virtuales'),
('Switch', 'Equipos de conmutación de red'),
('Firewall', 'Equipos de seguridad de red'),
('UPS', 'Sistemas de alimentación ininterrumpida'),
('Proyector', 'Proyectores y equipos de presentación'),
('Tablet', 'Tabletas y dispositivos móviles')
ON CONFLICT (name) DO NOTHING;

-- Insertar más estaciones de servicio
INSERT INTO service_stations (name, location, description) VALUES 
('Mesa de Ayuda Central', 'Piso 2 - Oficina 201', 'Centro principal de atención a usuarios'),
('Soporte Remoto', 'Virtual', 'Equipo de soporte técnico remoto'),
('Laboratorio IT', 'Piso 4 - Lab A', 'Laboratorio para pruebas y desarrollo')
ON CONFLICT (name) DO NOTHING;

-- Insertar equipos de ejemplo
INSERT INTO equipment (name, model, brand, serial_number, equipment_type_id, assigned_to, service_station_id, status, purchase_date, warranty_expiry) 
SELECT 
    'Laptop Dell Latitude 7420',
    'Latitude 7420',
    'Dell',
    'DL7420001',
    et.id,
    emp.id,
    ss.id,
    'assigned',
    '2023-01-15',
    '2026-01-15'
FROM equipment_types et, employees emp, service_stations ss
WHERE et.name = 'Laptop' 
  AND emp.name = 'Juan Pérez' 
  AND ss.name = 'Oficina Principal'
LIMIT 1;

INSERT INTO equipment (name, model, brand, serial_number, equipment_type_id, service_station_id, status, purchase_date, warranty_expiry) 
SELECT 
    'Monitor LG UltraWide 34"',
    '34WN80C-B',
    'LG',
    'LG34001',
    et.id,
    ss.id,
    'available',
    '2023-02-20',
    '2026-02-20'
FROM equipment_types et, service_stations ss
WHERE et.name = 'Monitor' 
  AND ss.name = 'Oficina Principal'
LIMIT 1;

INSERT INTO equipment (name, model, brand, serial_number, equipment_type_id, service_station_id, status, purchase_date, warranty_expiry) 
SELECT 
    'Impresora HP LaserJet Pro',
    'M404dn',
    'HP',
    'HP404001',
    et.id,
    ss.id,
    'available',
    '2023-03-10',
    '2025-03-10'
FROM equipment_types et, service_stations ss
WHERE et.name = 'Impresora' 
  AND ss.name = 'Oficina Principal'
LIMIT 1;

INSERT INTO equipment (name, model, brand, serial_number, equipment_type_id, assigned_to, service_station_id, status, purchase_date, warranty_expiry) 
SELECT 
    'Desktop HP EliteDesk 800',
    'EliteDesk 800 G6',
    'HP',
    'HP800001',
    et.id,
    emp.id,
    ss.id,
    'assigned',
    '2023-04-05',
    '2026-04-05'
FROM equipment_types et, employees emp, service_stations ss
WHERE et.name = 'Desktop' 
  AND emp.name = 'María García' 
  AND ss.name = 'Sucursal Norte'
LIMIT 1;

-- Insertar tickets de ejemplo
INSERT INTO tickets (title, description, priority, status, created_by, assigned_to, equipment_id, service_station_id, observations)
SELECT 
    'Laptop no enciende',
    'La laptop Dell Latitude no responde al presionar el botón de encendido. Se verificó el cargador y está funcionando correctamente.',
    'high',
    'open',
    emp1.id,
    emp2.id,
    eq.id,
    ss.id,
    'Usuario reporta que el problema comenzó después de una actualización de Windows.'
FROM employees emp1, employees emp2, equipment eq, service_stations ss
WHERE emp1.name = 'Carlos López'
  AND emp2.name = 'Juan Pérez'
  AND eq.name = 'Laptop Dell Latitude 7420'
  AND ss.name = 'Oficina Principal'
LIMIT 1;

INSERT INTO tickets (title, description, priority, status, created_by, assigned_to, service_station_id, observations)
SELECT 
    'Solicitud de nuevo monitor',
    'Necesito un segundo monitor para mejorar la productividad en tareas de análisis de datos.',
    'medium',
    'in_progress',
    emp1.id,
    emp2.id,
    ss.id,
    'Aprobado por el supervisor. Verificar disponibilidad en inventario.'
FROM employees emp1, employees emp2, service_stations ss
WHERE emp1.name = 'Ana Martínez'
  AND emp2.name = 'María García'
  AND ss.name = 'Oficina Principal'
LIMIT 1;

INSERT INTO tickets (title, description, priority, status, created_by, assigned_to, service_station_id, closed_at, observations)
SELECT 
    'Problema con impresora de red',
    'La impresora HP LaserJet no responde a los trabajos de impresión desde las computadoras de la oficina.',
    'medium',
    'closed',
    emp1.id,
    emp2.id,
    ss.id,
    NOW() - INTERVAL '2 days',
    'Problema resuelto. Se reinició el servicio de impresión y se actualizaron los drivers en las computadoras afectadas.'
FROM employees emp1, employees emp2, service_stations ss
WHERE emp1.name = 'Pedro Rodríguez'
  AND emp2.name = 'Juan Pérez'
  AND ss.name = 'Oficina Principal'
LIMIT 1;
