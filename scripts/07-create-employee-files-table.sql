-- Crear tabla para expedientes de empleados
CREATE TABLE IF NOT EXISTS employee_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES employees(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_employee_files_employee_id ON employee_files(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_files_upload_date ON employee_files(upload_date);

-- Habilitar RLS
ALTER TABLE employee_files ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver y gestionar expedientes
CREATE POLICY "Users can manage employee files" ON employee_files
  FOR ALL USING (true);

-- Insertar algunos datos de ejemplo
INSERT INTO employee_files (employee_id, file_name, file_type, file_size, description) 
SELECT 
  e.id,
  'CV_' || REPLACE(e.name, ' ', '_') || '.pdf',
  'application/pdf',
  1024000,
  'Curriculum Vitae'
FROM employees e 
WHERE EXISTS (SELECT 1 FROM employees WHERE id = e.id)
LIMIT 3;

-- Verificar que la tabla se creó correctamente
SELECT 'employee_files table created successfully' as status;
