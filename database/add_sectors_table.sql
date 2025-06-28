-- Add sectors table for company-specific sectors
CREATE TABLE public.sectors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, company_id) -- Same sector name can exist in different companies
);

-- Enable RLS
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- Sectors policies - Users can only see/manage sectors in their company
CREATE POLICY "Users can view sectors in their company" ON public.sectors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.company_id = sectors.company_id
        )
    );

CREATE POLICY "Company admin can manage sectors" ON public.sectors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'company_admin'
            AND profiles.company_id = sectors.company_id
        )
    );

-- Add some default sectors for testing
-- This can be run after creating a company
-- INSERT INTO public.sectors (name, company_id, created_by) VALUES 
-- ('Teknoloji', 'your-company-id', 'your-admin-id'),
-- ('İnşaat', 'your-company-id', 'your-admin-id'),
-- ('Sağlık', 'your-company-id', 'your-admin-id'),
-- ('Eğitim', 'your-company-id', 'your-admin-id'),
-- ('Finans', 'your-company-id', 'your-admin-id');

-- Add sector_id column to customer_companies table
ALTER TABLE public.customer_companies 
ADD COLUMN sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL;
