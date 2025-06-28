-- Add multiple email fields to customer_companies table
-- Migration to support 3 email addresses per company

-- Add new email columns
ALTER TABLE customer_companies 
ADD COLUMN IF NOT EXISTS email1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS email2 VARCHAR(255), 
ADD COLUMN IF NOT EXISTS email3 VARCHAR(255);

-- Migrate existing email data to email1 if exists
UPDATE customer_companies 
SET email1 = email 
WHERE email IS NOT NULL AND email1 IS NULL;

-- Drop old email column (optional - comment out if you want to keep for compatibility)
-- ALTER TABLE customer_companies DROP COLUMN IF EXISTS email;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_companies_email1 ON customer_companies(email1);
CREATE INDEX IF NOT EXISTS idx_customer_companies_email2 ON customer_companies(email2);
CREATE INDEX IF NOT EXISTS idx_customer_companies_email3 ON customer_companies(email3);

-- Add comments
COMMENT ON COLUMN customer_companies.email1 IS 'Primary email address (e.g., info@company.com)';
COMMENT ON COLUMN customer_companies.email2 IS 'Secondary email address (e.g., sales@company.com)';
COMMENT ON COLUMN customer_companies.email3 IS 'Tertiary email address (e.g., support@company.com)';
