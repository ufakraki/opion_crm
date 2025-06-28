-- Fairs tablosu RLS policy'sini düzelt
DROP POLICY IF EXISTS "Company fairs only" ON fairs;

CREATE POLICY "Company fairs only" ON fairs
    FOR ALL USING (
        company_id = (
            SELECT company_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- customer_companies_fairs tablosu RLS policy'sini de kontrol et
DROP POLICY IF EXISTS "Company fairs relation only" ON customer_companies_fairs;

CREATE POLICY "Company fairs relation only" ON customer_companies_fairs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customer_companies cc
            JOIN profiles p ON p.company_id = cc.company_id
            WHERE cc.id = customer_companies_fairs.customer_company_id
            AND p.id = auth.uid()
        )
    );
