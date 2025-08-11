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
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de estaciones de servicio
CREATE TABLE IF NOT EXISTS service_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
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

-- Insertar datos iniciales
INSERT INTO equipment_types (name, description) VALUES 
('Laptop', 'Computadoras portátiles'),
('Desktop', 'Computadoras de escritorio'),
('Monitor', 'Monitores y pantallas'),
('Impresora', 'Impresoras y multifuncionales'),
('Router', 'Equipos de red'),
('Teléfono', 'Teléfonos IP y móviles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO service_stations (name, location, description) VALUES 
('Oficina Principal', 'Piso 1', 'Estación principal de soporte técnico'),
('Sucursal Norte', 'Edificio Norte', 'Soporte para sucursal norte'),
('Área de Desarrollo', 'Piso 3', 'Soporte especializado para desarrollo')
ON CONFLICT (name) DO NOTHING;

INSERT INTO employees (name, email, phone, department, position) VALUES 
('Juan Pérez', 'juan.perez@empresa.com', '+1234567890', 'IT', 'Técnico de Soporte'),
('María García', 'maria.garcia@empresa.com', '+1234567891', 'IT', 'Administrador de Sistemas'),
('Carlos López', 'carlos.lopez@empresa.com', '+1234567892', 'Ventas', 'Ejecutivo de Ventas'),
('Ana Martínez', 'ana.martinez@empresa.com', '+1234567893', 'RRHH', 'Coordinadora de RRHH')
ON CONFLICT (email) DO NOTHING;
