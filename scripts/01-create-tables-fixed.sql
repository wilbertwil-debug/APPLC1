-- Eliminar tablas existentes si hay problemas (opcional)
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS equipment CASCADE;
-- DROP TABLE IF EXISTS service_stations CASCADE;
-- DROP TABLE IF EXISTS equipment_types CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de tipos de equipos
CREATE TABLE IF NOT EXISTS equipment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de estaciones de servicio
CREATE TABLE IF NOT EXISTS service_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de equipos
CREATE TABLE IF NOT EXISTS equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    brand VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE,
    equipment_type_id UUID REFERENCES equipment_types(id),
    assigned_to UUID REFERENCES employees(id),
    service_station_id UUID REFERENCES service_stations(id),
    status VARCHAR(50) DEFAULT 'available',
    purchase_date DATE,
    warranty_expiry DATE,
    specifications JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    created_by UUID REFERENCES employees(id),
    assigned_to UUID REFERENCES employees(id),
    equipment_id UUID REFERENCES equipment(id),
    service_station_id UUID REFERENCES service_stations(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    observations TEXT
);

-- Insertar datos iniciales (usando INSERT ... WHERE NOT EXISTS para evitar duplicados)
INSERT INTO equipment_types (name, description) 
SELECT 'Laptop', 'Computadoras portátiles'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Laptop');

INSERT INTO equipment_types (name, description) 
SELECT 'Desktop', 'Computadoras de escritorio'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Desktop');

INSERT INTO equipment_types (name, description) 
SELECT 'Monitor', 'Monitores y pantallas'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Monitor');

INSERT INTO equipment_types (name, description) 
SELECT 'Impresora', 'Impresoras y multifuncionales'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Impresora');

INSERT INTO equipment_types (name, description) 
SELECT 'Router', 'Equipos de red'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Router');

INSERT INTO equipment_types (name, description) 
SELECT 'Teléfono', 'Teléfonos IP y móviles'
WHERE NOT EXISTS (SELECT 1 FROM equipment_types WHERE name = 'Teléfono');

-- Insertar estaciones de servicio
INSERT INTO service_stations (name, location, description) 
SELECT 'Oficina Principal', 'Piso 1', 'Estación principal de soporte técnico'
WHERE NOT EXISTS (SELECT 1 FROM service_stations WHERE name = 'Oficina Principal');

INSERT INTO service_stations (name, location, description) 
SELECT 'Sucursal Norte', 'Edificio Norte', 'Soporte para sucursal norte'
WHERE NOT EXISTS (SELECT 1 FROM service_stations WHERE name = 'Sucursal Norte');

INSERT INTO service_stations (name, location, description) 
SELECT 'Área de Desarrollo', 'Piso 3', 'Soporte especializado para desarrollo'
WHERE NOT EXISTS (SELECT 1 FROM service_stations WHERE name = 'Área de Desarrollo');

-- Insertar empleados
INSERT INTO employees (name, email, phone, department, position) 
SELECT 'Juan Pérez', 'juan.perez@empresa.com', '+1234567890', 'IT', 'Técnico de Soporte'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'juan.perez@empresa.com');

INSERT INTO employees (name, email, phone, department, position) 
SELECT 'María García', 'maria.garcia@empresa.com', '+1234567891', 'IT', 'Administrador de Sistemas'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'maria.garcia@empresa.com');

INSERT INTO employees (name, email, phone, department, position) 
SELECT 'Carlos López', 'carlos.lopez@empresa.com', '+1234567892', 'Ventas', 'Ejecutivo de Ventas'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'carlos.lopez@empresa.com');

INSERT INTO employees (name, email, phone, department, position) 
SELECT 'Ana Martínez', 'ana.martinez@empresa.com', '+1234567893', 'RRHH', 'Coordinadora de RRHH'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'ana.martinez@empresa.com');
