-- Create internal chat messages table
CREATE TABLE IF NOT EXISTS internal_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internal_chat_sender ON internal_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_chat_receiver ON internal_chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_internal_chat_created_at ON internal_chat_messages(created_at);

-- Enable RLS
ALTER TABLE internal_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view messages they sent or received" ON internal_chat_messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email') OR
    receiver_id IN (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can insert their own messages" ON internal_chat_messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can update their own messages" ON internal_chat_messages
  FOR UPDATE USING (
    sender_id IN (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email')
  );

-- Add comment
COMMENT ON TABLE internal_chat_messages IS 'Internal chat messages between employees';

-- Insert sample data for testing
DO $$
DECLARE
  emp1_id UUID;
  emp2_id UUID;
BEGIN
  -- Get first two employees
  SELECT id INTO emp1_id FROM employees LIMIT 1;
  SELECT id INTO emp2_id FROM employees OFFSET 1 LIMIT 1;
  
  IF emp1_id IS NOT NULL AND emp2_id IS NOT NULL THEN
    INSERT INTO internal_chat_messages (sender_id, receiver_id, message) VALUES
    (emp1_id, emp2_id, 'Hola, ¿cómo estás?'),
    (emp2_id, emp1_id, '¡Hola! Todo bien, gracias. ¿Y tú?'),
    (emp1_id, emp2_id, 'Muy bien también. ¿Necesitas ayuda con algo?');
  END IF;
END $$;

-- Verify table creation
SELECT 'internal_chat_messages table created successfully' AS status;
