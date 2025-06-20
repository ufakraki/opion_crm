-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'company_admin', 'company_user');

-- Companies table (şirketler)
CREATE TABLE public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id), -- Super admin who created this company
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'company_user',
    company_id UUID REFERENCES public.companies(id), -- NULL for super_admin
    created_by UUID REFERENCES auth.users(id), -- Who created this user
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer companies table (müşteri firmalar - CRM için)
CREATE TABLE public.customer_companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    sales_made BOOLEAN DEFAULT FALSE,
    not_attending_fair BOOLEAN DEFAULT FALSE,
    assigned_user_id UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    company_id UUID REFERENCES public.companies(id), -- Which company this customer belongs to
    last_contact_date TIMESTAMPTZ,
    next_reminder_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company interactions/notes
CREATE TABLE public.customer_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_company_id UUID REFERENCES public.customer_companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    interaction_type TEXT DEFAULT 'note', -- 'call', 'email', 'note', 'meeting'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

-- Companies policies (only super_admin can manage)
CREATE POLICY "Super admin can manage companies" ON public.companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Company admin can view company users" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles admin
            WHERE admin.id = auth.uid() 
            AND admin.role = 'company_admin'
            AND admin.company_id = profiles.company_id
        )
    );

-- Customer companies policies
CREATE POLICY "Users can view customer companies in their company" ON public.customer_companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (
                profiles.role = 'super_admin' OR 
                profiles.company_id = customer_companies.company_id
            )
        )
    );

CREATE POLICY "Users can create customer companies in their company" ON public.customer_companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid()
            AND profiles.company_id = customer_companies.company_id
        )
    );

CREATE POLICY "Users can update assigned customer companies" ON public.customer_companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (
                profiles.role IN ('company_admin') OR 
                profiles.id = customer_companies.assigned_user_id
            )
            AND profiles.company_id = customer_companies.company_id
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER customer_companies_updated_at
    BEFORE UPDATE ON public.customer_companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert first super admin (Bu kısmı manuel olarak ekleyeceğiz)
-- İlk super admin'i kayıt olduktan sonra manuel olarak role'ünü değiştireceğiz