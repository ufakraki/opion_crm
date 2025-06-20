# Opion CRM

Opion CRM, Altaion Interactive tarafından geliştirilen müşteri ilişkileri yönetimi (CRM) yazılımıdır. Bu uygulama, şirketlerin müşteri etkileşimlerini yönetmelerine, satışları takip etmelerine ve şirket bilgilerini verimli bir şekilde korumasına yardımcı olmak için tasarlanmıştır.

## Özellikler

- **Kullanıcı Rolleri**: 
  - Süper Admin: Şirketler oluşturabilir ve şirket yöneticileri atayabilir.
  - Şirket Yöneticisi: Şirket kullanıcıları oluşturabilir ve şirket kartlarını yönetebilir.
  - Şirket Kullanıcısı: Şirket kartları oluşturup yönetebilir, hatırlatıcıları görüntüleyebilir ve şirket bilgilerini güncelleyebilir.

- **Şirket Kartı Yönetimi**: 
  - Ad, sektör, telefon numarası, e-posta, notlar ve durum onay kutuları (Satış Yapıldı, Fuara Katılmıyor) gibi temel detaylarla şirket kartları oluşturun ve yönetin.
  - Son etkileşim tarihine dayalı otomatik takip hatırlatıcıları.

- **Arama İşlevselliği**: 
  - Bilgilere kolay erişim için şirket kartlarında hızlı arama.

- **Kontrol Paneli**: 
  - Şirket kullanıcılarının şirket kartlarını ve hatırlatıcılarını görüntüleyebileceği kullanıcı dostu kontrol paneli.

- **Responsive Tasarım**: 
  - Mobil, tablet ve desktop cihazlarda mükemmel görüntüleme.
  - Dokunmatik ekran desteği ve mobil-first yaklaşım.

## Teknoloji Yığını

- **Frontend**: Duyarlı ve dinamik kullanıcı arayüzü için Next.js ile geliştirilmiştir.
- **Backend**: Veritabanı yönetimi ve kimlik doğrulama için Supabase kullanır.
- **Dağıtım**: Kolay erişim ve ölçeklenebilirlik için uygulama Vercel'de dağıtılır.

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
   - Supabase'de veritabanınızı kurmak için `database` dizininde bulunan `schema.sql` dosyasını kullanın.

4. **Ortam Değişkenleri**:
   - `frontend` dizininde `.env.local` dosyasında Supabase için ortam değişkenlerinizi yapılandırın.
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

- Süper Adminler şirketler oluşturabilir ve roller atayabilir.
- Şirket Yöneticileri kullanıcıları ve şirket kartlarını yönetebilir.
- Şirket Kullanıcıları şirket kartlarını oluşturup yönetebilir ve hatırlatıcıları görüntüleyebilir.

## Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen iyileştirmeler veya hata düzeltmeleri için bir pull request gönderin veya bir issue açın.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.