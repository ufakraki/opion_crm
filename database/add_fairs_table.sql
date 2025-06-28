-- fairs tablosu
CREATE TABLE IF NOT EXISTS fairs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE (company_id, name)
);

-- customer_companies_fairs: çoklu ilişki tablosu
CREATE TABLE IF NOT EXISTS customer_companies_fairs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_company_id uuid NOT NULL REFERENCES customer_companies(id) ON DELETE CASCADE,
    fair_id uuid NOT NULL REFERENCES fairs(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE (customer_company_id, fair_id)
);

-- RLS: Sadece şirket verisine erişim
ALTER TABLE fairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company fairs only" ON fairs
    USING (company_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = fairs.company_id));

ALTER TABLE customer_companies_fairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company fairs relation only" ON customer_companies_fairs
    USING (EXISTS (
        SELECT 1 FROM customer_companies cc
        WHERE cc.id = customer_companies_fairs.customer_company_id
        AND cc.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    ));
