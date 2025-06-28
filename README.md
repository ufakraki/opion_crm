# Opion CRM

Opion CRM, Altaion Interactive tarafından geliştirilen müşteri ilişkileri yönetimi (CRM) yazılımıdır. Bu uygulama, şirketlerin müşteri etkileşimlerini yönetmelerine, satışları takip etmelerine ve şirket bilgilerini verimli bir şekilde korumasına yardımcı olmak için tasarlanmıştır.

## Özellikler

- **Gelişmiş Kullanıcı Rolleri**: 
  - **Süper Admin**: Şirketler oluşturabilir, şirket yöneticileri atayabilir ve sistem geneli yönetimi yapabilir.
  - **Şirket Yöneticisi (Company Admin)**: Şirket kullanıcıları oluşturabilir, firma kartlarını yönetebilir, sektör yönetimi yapabilir ve kullanıcı atamalarını kontrol edebilir.
  - **Şirket Kullanıcısı (Company User)**: Firma kartları oluşturup yönetebilir, kendisine atanan kartları görüntüleyebilir.

- **Kapsamlı Firma Kartı Yönetimi**: 
  - ✅ **Temel Bilgiler**: Firma adı, sektör, telefon, e-posta, website, adres, iletişim kişisi
  - ✅ **Sektör Sistemi**: Dinamik sektör yönetimi ve atama
  - ✅ **Fuar Takibi**: Fuara katılım durumu (Katılacak, Katılmayacak, Görüşülüyor)
  - ✅ **Kullanıcı Atama**: Company admin tarafından kullanıcılara firma kartı atama
  - ✅ **Notlar ve Takip**: Detaylı notlar ve son iletişim tarihi takibi
  - ✅ **İstatistikler**: Canlı fuar katılım ve firma sayısı istatistikleri

- **Sektör Yönetimi**: 
  - ✅ Company adminler sektör oluşturabilir, düzenleyebilir ve silebilir
  - ✅ Firma kartları sektörlere atanabilir
  - ✅ Sektör bazında filtreleme ve kategorizasyon

- **Kullanıcı Atama Sistemi**: 
  - ✅ Company adminler firma kartlarını kullanıcılara atayabilir
  - ✅ Company userlar otomatik olarak kendi kartlarını yönetir
  - ✅ Atanan kullanıcı bilgisi firma kartında görüntülenir

- **Modern Arayüz ve UX**: 
  - ✅ **Responsive Tasarım**: Mobil, tablet ve desktop cihazlarda mükemmel görüntüleme
  - ✅ **Kart Tabanlı Görünüm**: Modern, kullanıcı dostu kart arayüzü
  - ✅ **Modal Sistemleri**: Detay görüntüleme ve oluşturma için gelişmiş modaller
  - ✅ **Canlı İstatistikler**: Anlık veri güncellemeleri ve görselleştirme
  - ✅ **Dokunmatik Ekran Desteği**: Mobil-first yaklaşım

- **Güvenlik ve Veri İzolasyonu**: 
  - ✅ **RLS (Row Level Security)**: Supabase Row Level Security ile veri izolasyonu
  - ✅ **Role-based Access Control**: Rol tabanlı erişim kontrolü
  - ✅ **Şirket Veri İzolasyonu**: Her şirketin verisi tamamen izole

- **Dashboard ve Navigasyon**: 
  - ✅ **Ana Dashboard**: Kullanıcı dostu kontrol paneli
  - ✅ **Breadcrumb Navigasyon**: Kolay navigasyon sistemi
  - ✅ **Hızlı Erişim Kartları**: Firma kartları ve sektör yönetimine hızlı erişim

## Teknoloji Yığını

- **Frontend**: 
  - **Next.js 15.3.4**: React tabanlı full-stack framework
  - **React 19.1.0**: Modern UI kütüphanesi
  - **TypeScript 5.x**: Type-safe JavaScript geliştirme
  - **Tailwind CSS 3.4.17**: Utility-first CSS framework
  
- **Backend**: 
  - **Supabase**: PostgreSQL tabanlı Backend-as-a-Service
  - **Row Level Security (RLS)**: Veri güvenliği ve izolasyon
  - **Supabase Auth**: Kullanıcı kimlik doğrulama sistemi
  
- **Veritabanı Yapısı**:
  - `profiles`: Kullanıcı profilleri ve rol yönetimi
  - `companies`: Şirket bilgileri ve hiyerarşi
  - `customer_companies`: Firma kartları (müşteri firmaları)
  - `sectors`: Sektör yönetimi ve kategorizasyon
  
- **Dağıtım**: 
  - **Vercel**: Kolay erişim ve ölçeklenebilirlik için otomatik deployment
  - **GitHub**: Versiyon kontrolü ve CI/CD entegrasyonu

## Kurulum Talimatları

1. **Repository'yi Klonlayın**:
   ```bash
   git clone https://github.com/ufakraki/opion_crm.git
   cd opion_crm
   ```

2. **Bağımlılıkları Yükleyin**:
   `frontend` dizinine gidin ve gerekli paketleri yükleyin:
   ```bash
   cd frontend
   npm install
   ```

3. **Veritabanı Kurulumu**:
   - Supabase'de veritabanınızı kurmak için `database` dizininde bulunan SQL dosyalarını sırayla çalıştırın:
     ```sql
     -- 1. Önce ana şema
     database/schema.sql
     
     -- 2. Sonra sektör tablosu
     database/add_sectors_table.sql
     ```

4. **Ortam Değişkenleri**:
   - `frontend` dizininde `.env.local` dosyasında Supabase için ortam değişkenlerinizi yapılandırın.
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://kvsrkxcybabblilhvycr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3JreGN5YmFiYmxpbGh2eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTM0MDgsImV4cCI6MjA2NjAyOTQwOH0.wNcgKZl01CChmQFBfNTmp2tERKxsKet8YzwsrNW_5RY
   ```

5. **Uygulamayı Çalıştırın**:
   ```bash
   npm run dev
   ```

6. **Uygulamaya Erişin**:
   Tarayıcınızı açın ve uygulamaya erişmek için `http://localhost:3000` adresine gidin.

## Yeni Bilgisayarda Kurulum

Bu proje başka bir bilgisayarda çalıştırılmak istendiğinde aşağıdaki adımları takip edin:

### Gereksinimler
- **Node.js** (v18.0.0 veya üzeri)
- **npm** (Node.js ile birlikte gelir)
- **Git** (repository klonlama için)

### Adım Adım Kurulum

1. **Node.js Kurulumunu Kontrol Edin**:
   ```bash
   node --version
   npm --version
   ```
   Eğer Node.js yüklü değilse [nodejs.org](https://nodejs.org/) adresinden indirin.

2. **Repository'yi Klonlayın**:
   ```bash
   git clone https://github.com/ufakraki/opion_crm.git
   cd opion_crm
   ```

3. **Frontend Bağımlılıklarını Yükleyin**:
   ```bash
   cd frontend
   npm install
   ```
   Bu komut aşağıdaki paketleri otomatik yükler:
   - Next.js 15.3.4
   - React 19.1.0
   - Tailwind CSS 3.4.17
   - Supabase Client 2.39.0
   - TypeScript 5.x
   - Tüm gerekli type definitions

4. **Ortam Değişkenlerini Ayarlayın**:
   `frontend` klasöründe `.env.local` dosyası oluşturun:
   ```bash
   # .env.local dosyası oluşturun
   NEXT_PUBLIC_SUPABASE_URL=https://kvsrkxcybabblilhvycr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3JreGN5YmFiYmxpbGh2eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTM0MDgsImV4cCI6MjA2NjAyOTQwOH0.wNcgKZl01CChmQFBfNTmp2tERKxsKet8YzwsrNW_5RY
   ```

5. **Geliştirme Sunucusunu Başlatın**:
   ```bash
   npm run dev
   ```

6. **Tarayıcıda Açın**:
   `http://localhost:3000` adresine gidin.

### Yaygın Sorunlar ve Çözümleri

- **Port 3000 kullanımda hatası**: Next.js otomatik olarak başka port (3001, 3002) kullanacaktır.
- **npm install hatası**: Node.js sürümünüzü kontrol edin ve güncelleyin.
- **TypeScript hataları**: `npm run build` komutu ile kontrol yapın.

### Mobil/Tablet Desteği
Proje tamamen responsive tasarımla geliştirilmiştir:
- 📱 **Mobil cihazlar**: iPhone, Android telefonlar
- 📱 **Tablet cihazlar**: iPad, Android tabletler  
- 💻 **Desktop**: Tüm ekran boyutları

## Kullanım Kılavuzu

### Rol Tabanlı Erişim

- **Süper Adminler**: 
  - ✅ Şirketler oluşturabilir ve silebilir
  - ✅ Company adminleri atayabilir
  - ✅ Sistem geneli yönetimi yapabilir

- **Company Adminler**: 
  - ✅ Şirket kullanıcıları oluşturup yönetebilir
  - ✅ Firma kartlarını oluşturup yönetebilir
  - ✅ Sektör yönetimi yapabilir (oluştur, düzenle, sil)
  - ✅ Firma kartlarını kullanıcılara atayabilir
  - ✅ İstatistikleri görüntüleyebilir

- **Company Userlar**: 
  - ✅ Firma kartları oluşturabilir (otomatik kendilerine atanır)
  - ✅ Kendilerine atanan firma kartlarını yönetebilir
  - ✅ Mevcut sektörleri kullanabilir (yeni sektör oluşturamazlar)

### Önemli Özellikler

- **Firma Adı Güvenliği**: Firma adları sadece oluşturulurken girilebilir, sonradan değiştirilemez
- **Veri İzolasyonu**: Her şirketin verileri tamamen izole, başka şirket verilerine erişim yoktur
- **Sektör Sistemi**: Dinamik sektör yönetimi ile firma kategorilendirmesi
- **Kullanıcı Atama**: Company adminler firma kartlarını ekip üyelerine atayabilir
- **Responsive Design**: Mobil, tablet ve desktop'ta sorunsuz çalışır

## Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen iyileştirmeler veya hata düzeltmeleri için bir pull request gönderin veya bir issue açın.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.

## Geliştirme Durumu

### ✅ Tamamlanan Özellikler (v1.0)

- **Kullanıcı Yönetimi**
  - [x] Supabase Auth entegrasyonu
  - [x] Rol tabanlı erişim kontrolü (Super Admin, Company Admin, Company User)
  - [x] Kullanıcı profil yönetimi

- **Şirket Yönetimi**
  - [x] Şirket oluşturma/silme (Super Admin)
  - [x] Şirket bazlı veri izolasyonu
  - [x] RLS (Row Level Security) uygulaması

- **Firma Kartı Sistemi**
  - [x] Kapsamlı firma kartı oluşturma (ad, sektör, iletişim bilgileri, notlar)
  - [x] Fuar katılım durumu takibi
  - [x] Kullanıcı atama sistemi
  - [x] Detay görüntüleme modalları
  - [x] Canlı istatistikler

- **Sektör Yönetimi**
  - [x] Dinamik sektör oluşturma/düzenleme/silme
  - [x] Sektör-firma kartı ilişkilendirmesi
  - [x] Company admin seviyesi sektör kontrolü

- **UI/UX**
  - [x] Modern, responsive tasarım
  - [x] Kart tabanlı görünüm
  - [x] Modal sistemleri
  - [x] Breadcrumb navigasyon
  - [x] Mobil uyumluluk

### 🚧 Geliştirilmekte Olan Özellikler

- **Firma Kartı Düzenleme**: Firma kartlarını düzenleme özelliği (firma adı hariç)
- **Arama ve Filtreleme**: Gelişmiş arama ve filtreleme sistemi
- **Raporlama**: Detaylı raporlama ve export özellikleri
- **Hatırlatıcı Sistemi**: Otomatik takip hatırlatıcıları

### 📋 Planlanan Özellikler

- **İleri Düzey Raporlama**: Dashboard analytics ve görselleştirme
- **E-posta Entegrasyonu**: Otomatik e-posta gönderimi
- **Dosya Yükleme**: Firma kartlarına dosya ekleme
- **API Entegrasyonu**: Harici sistemlerle entegrasyon
- **Mobil Uygulama**: React Native tabanlı mobil app

## Changelog

### v1.0.0 (28 Haziran 2025)
- ✅ İlk stabil sürüm
- ✅ Temel CRM işlevselliği tamamlandı
- ✅ Sektör yönetimi eklendi
- ✅ Kullanıcı atama sistemi implementasyonu
- ✅ Responsive tasarım ve modern UI
- ✅ Güvenlik ve veri izolasyonu tam implementasyon

### v0.9.0 (27 Haziran 2025)
- ✅ Sektör tablosu ve CRUD işlemleri
- ✅ Firma kartı - sektör ilişkilendirmesi
- ✅ Company admin için kullanıcı atama dropdown'u
- ✅ Firma adı düzenleme kısıtlaması

### v0.8.0 (26 Haziran 2025)
- ✅ Firma kartı detay modalları
- ✅ Kullanıcı atama gösterimi
- ✅ İstatistik kartları ve canlı veri
- ✅ Responsive kart tasarımı

### v0.7.0 (25 Haziran 2025)
- ✅ Firma kartı oluşturma modalı
- ✅ Supabase CRUD fonksiyonları
- ✅ TypeScript interface'leri
- ✅ Customer_companies tablosu genişletilmesi