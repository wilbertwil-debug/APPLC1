-- Add status column to employees table
ALTER TABLE employees 
ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Add comment to describe the new column
COMMENT ON COLUMN employees.status IS 'Employee status: active, inactive, suspended';

-- Update existing employees to have active status
UPDATE employees 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name = 'status';
