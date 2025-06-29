-- CRM için durum sistemi ekleme
-- ADIM 7.2: Müşteri kartlarına durum sistemi

-- customer_companies tablosuna status sütunu ekleme
ALTER TABLE customer_companies 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'not_contacted';

-- Status için check constraint ekleme
ALTER TABLE customer_companies 
ADD CONSTRAINT customer_companies_status_check 
CHECK (status IN ('not_contacted', 'in_discussion', 'agreed'));

-- Mevcut kayıtları güncelleme (default olarak 'not_contacted')
UPDATE customer_companies 
SET status = 'not_contacted' 
WHERE status IS NULL;

-- İndeks ekleme (filtreleme performansı için)
CREATE INDEX IF NOT EXISTS idx_customer_companies_status 
ON customer_companies (status);

-- Comments
COMMENT ON COLUMN customer_companies.status IS 'Müşteri ile görüşme durumu: not_contacted, in_discussion, agreed';
