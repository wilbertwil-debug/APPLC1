-- Create drive_links table to store Google Drive folder links
CREATE TABLE IF NOT EXISTS drive_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  drive_url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE drive_links ENABLE ROW LEVEL SECURITY;

-- Policy for viewing drive links (all authenticated users)
CREATE POLICY "Users can view active drive links" ON drive_links
  FOR SELECT USING (is_active = true);

-- Policy for managing drive links (admin only)
CREATE POLICY "Admins can manage drive links" ON drive_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN users u ON e.email = u.email
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_drive_links_category ON drive_links(category);
CREATE INDEX idx_drive_links_active ON drive_links(is_active);
CREATE INDEX idx_drive_links_created_by ON drive_links(created_by);

-- Insert sample data
INSERT INTO drive_links (title, description, drive_url, category) VALUES
('Documentos Corporativos', 'Políticas, procedimientos y documentos oficiales de la empresa', 'https://drive.google.com/drive/folders/1ABC123DEF456', 'documentos'),
('Manuales de Equipos', 'Manuales de usuario y especificaciones técnicas de equipos', 'https://drive.google.com/drive/folders/1GHI789JKL012', 'manuales'),
('Formatos y Plantillas', 'Formatos oficiales y plantillas para uso interno', 'https://drive.google.com/drive/folders/1MNO345PQR678', 'formatos'),
('Capacitación', 'Material de capacitación y recursos de aprendizaje', 'https://drive.google.com/drive/folders/1STU901VWX234', 'capacitacion');

-- Add comment to describe the table
COMMENT ON TABLE drive_links IS 'Stores Google Drive folder links for easy access to shared resources';
COMMENT ON COLUMN drive_links.drive_url IS 'Google Drive folder URL for sharing';
COMMENT ON COLUMN drive_links.category IS 'Category to organize drive links (documentos, manuales, formatos, etc.)';

-- Verify table creation
SELECT 'drive_links table created successfully' as status;
