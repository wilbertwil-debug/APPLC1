-- Insertar más empleados
INSERT INTO employees (name, email, phone, department, position) 
SELECT 'Pedro Rodríguez', 'pedro.rodriguez@empresa.com', '+1234567894', 'IT', 'Desarrollador Senior'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'pedro.rodriguez@empresa.com');

INSERT INTO employees (name, email, phone, department, position) 
SELECT 'Laura Fernández', 'laura.fernandez@empresa.com', '+1234567895', 'Marketing', 'Coordinadora de Marketing'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'laura.fernandez@empresa.com');

INSERT INTO employees (name, email, phone, department, position) 
SELECT 'Miguel Torres', 'miguel.torres@empresa.com', '+1234567896', 'Finanzas', 'Analista Financiero'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'miguel.torres@empresa.com');

-- Insertar más tipos de equipos
INSERT INTO equipment_types (name, description) 
SELECT 'Servidor', 'Servidores físicos y virtuales'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Servidor');

INSERT INTO equipment_types (name, description) 
SELECT 'Switch', 'Equipos de conmutación de red'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Switch');

INSERT INTO equipment_types (name, description) 
SELECT 'Tablet', 'Tabletas y dispositivos móviles'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Tablet');

-- Insertar más estaciones de servicio
INSERT INTO service_stations (name, location, description) 
SELECT 'Mesa de Ayuda Central', 'Piso 2 - Oficina 201', 'Centro principal de atención a usuarios'
WHERE NOT EXISTS (SELECT 1 FROM service_stations WHERE name = 'Mesa de Ayuda Central');

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
  AND emp.email = 'juan.perez@empresa.com' 
  AND ss.name = 'Oficina Principal'
  AND NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'DL7420001')
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
  AND NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'LG34001')
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
  AND NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'HP404001')
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
WHERE emp1.email = 'carlos.lopez@empresa.com'
  AND emp2.email = 'juan.perez@empresa.com'
  AND eq.serial_number = 'DL7420001'
  AND ss.name = 'Oficina Principal'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE title = 'Laptop no enciende')
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
WHERE emp1.email = 'ana.martinez@empresa.com'
  AND emp2.email = 'maria.garcia@empresa.com'
  AND ss.name = 'Oficina Principal'
  AND NOT EXISTS (SELECT 1 FROM tickets WHERE title = 'Solicitud de nuevo monitor')
LIMIT 1;
