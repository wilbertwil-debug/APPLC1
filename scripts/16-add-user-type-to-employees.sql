-- Add user_type column to employees table
ALTER TABLE employees 
ADD COLUMN user_type VARCHAR(20) DEFAULT 'user' CHECK (user_type IN ('admin', 'manager', 'user'));

-- Add comment to describe the new column
COMMENT ON COLUMN employees.user_type IS 'Type of user for system access: admin, manager, or user';

-- Update existing employees to have default user type
UPDATE employees SET user_type = 'user' WHERE user_type IS NULL;

-- Verify the column was added successfully
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'user_type';

-- Show sample data
SELECT id, name, email, user_type FROM employees LIMIT 5;
