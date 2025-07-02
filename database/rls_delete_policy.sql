-- RLS DELETE Policy Ekleme - Güvenli Versiyon
-- customer_companies tablosu için DELETE policy'si

-- SADECE company_admin silebilir (company_user silemez)
CREATE POLICY "Company admin can delete customer companies" ON public.customer_companies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'company_admin'
            AND profiles.company_id = customer_companies.company_id
        )
    );

-- Bu script'i Supabase SQL Editor'da çalıştır
-- Test için:
-- 1. Company admin ile firma sil - çalışmalı
-- 2. Company user ile firma sil - çalışmamalı
