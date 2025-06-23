-- ADIM 3: customer_companies tablosuna yeni alanlar ekleme
-- Bu SQL dosyası Supabase SQL Editor'da çalıştırılacak

-- Yeni alanları ekle
ALTER TABLE public.customer_companies 
ADD COLUMN contact_person TEXT, -- İletişim kişisi
ADD COLUMN website TEXT, -- Website URL'i  
ADD COLUMN attending_fair BOOLEAN DEFAULT TRUE; -- Fuara katılıyor mu (varsayılan: true)

-- Güncelleme zamanını ayarla
UPDATE public.customer_companies SET updated_at = NOW();

-- Yeni alanları kontrol et (Bu sorgu test amaçlıdır)
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable, 
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'customer_companies' 
-- AND column_name IN ('contact_person', 'website', 'attending_fair')
-- ORDER BY ordinal_position;

-- Test verisi ekleme (isteğe bağlı - test için)
-- INSERT INTO public.customer_companies (
--   name, 
--   sector, 
--   phone, 
--   email, 
--   contact_person, 
--   website, 
--   attending_fair,
--   company_id, 
--   created_by
-- ) VALUES (
--   'Test Firma A.Ş.', 
--   'Teknoloji', 
--   '+90 212 555 0101', 
--   'info@testfirma.com',
--   'Ahmet Yılmaz',
--   'https://www.testfirma.com',
--   true,
--   '79ad2114-46e1-4a86-afc6-a5ed25a9bd62', -- Test company ID
--   '79ad2114-46e1-4a86-afc6-a5ed25a9bd62'  -- Test user ID
-- );

COMMENT ON COLUMN public.customer_companies.contact_person IS 'İletişim kişisinin adı soyadı';
COMMENT ON COLUMN public.customer_companies.website IS 'Firmanın website URL adresi';
COMMENT ON COLUMN public.customer_companies.attending_fair IS 'Firma fuara katılacak mı? (true=katılacak, false=katılmayacak)';

-- İşlem tamamlandı mesajı
SELECT 'ADIM 3: Database alanları başarıyla eklendi!' as result;
