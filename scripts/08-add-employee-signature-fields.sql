-- Add signature and policy fields to employees table
ALTER TABLE employees 
ADD COLUMN signature TEXT,
ADD COLUMN email_policy_usage BOOLEAN DEFAULT false,
ADD COLUMN technology_usage BOOLEAN DEFAULT false;

-- Add comment to describe the new columns
COMMENT ON COLUMN employees.signature IS 'Base64 encoded signature image';
COMMENT ON COLUMN employees.email_policy_usage IS 'Indicates if employee has email policy usage';
COMMENT ON COLUMN employees.technology_usage IS 'Indicates if employee has technology usage';
