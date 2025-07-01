# Opion CRM

Opion CRM, Altaion Interactive tarafından geliştirilen modern bir müşteri ilişkileri yönetimi (CRM) yazılımıdır. Bu uygulama, şirketlerin müşteri etkileşimlerini yönetmelerine, satışları takip etmelerine, müşteri firma bilgilerini korumalarına ve fuar katılımlarını verimli bir şekilde organize etmelerine yardımcı olmak için tasarlanmıştır.

## Özellikler

### Kullanıcı Yönetimi ve Yetkiler
- **Super Admin**: Şirketler oluşturabilir ve şirket yöneticileri atayabilir.
- **Şirket Yöneticisi (Company Admin)**: 
  - Şirket kullanıcıları oluşturabilir ve yönetebilir
  - Tüm müşteri firma kartlarına tam erişim (görüntüleme, düzenleme, silme)
  - Firmaları kullanıcılara atayabilir
  - Tüm şirket istatistiklerine ve verilerine erişim
- **Şirket Kullanıcısı (Company User)**: 
  - Müşteri firma kartları oluşturabilir
  - Sadece atanan müşteri firmalarını düzenleyebilir
  - Tüm firmaları görüntüleyebilir ancak sınırlı düzenleme yetkisi
  - Atanan firmalara göre filtrelenmiş istatistiklere erişim

### Müşteri Firma Yönetimi
- **Kapsamlı Firma Kartları**: 
  - Tam firma bilgileri (ad, sektör, ülke, iletişim detayları)
  - Çoklu e-posta adresleri ve iletişim kişileri
  - Web sitesi ve adres bilgileri
  - Zengin notlar ve etkileşim geçmişi
- **Fuar Katılım Takibi**: 
  - Checkbox arayüzü ile çoklu fuar seçimi
  - Durum takibi (Fuara Katılıyor, Katılmıyor, Görüşülüyor, Görüşülmedi)
  - Gerçek zamanlı durum rozetleri ve görsel göstergeler
- **Akıllı Durum Sistemi**: 
  - Fuar katılımı ve notlara dayalı otomatik durum belirleme
  - Renkli durum rozetleri (🟢 🔴 🔵 🟡)
  - Öncelik tabanlı durum mantığı

### Gelişmiş Filtreleme ve İstatistikler
- **Etkileşimli İstatistik Barı**: 
  - Her durum için tıklanabilir filtre butonları
  - Gerçek zamanlı sayı güncellemeleri
  - Role dayalı veri görünürlüğü (yönetici hepsini görür, kullanıcı atananları görür)
- **Akıllı Filtreleme Mantığı**: 
  - "Tümü" filtresi tüm roller için tam veri setini gösterir
  - Durum spesifik filtreler kullanıcı yetkilerini dikkate alır
  - Sayfalama desteği ile kesintisiz filtreleme

### Kullanıcı Arayüzü ve Deneyimi
- **İkili Görünüm Modları**: Farklı tercihler için kart görünümü ve tablo görünümü
- **Duyarlı Tasarım**: Tamamen mobil-optimize edilmiş arayüz
- **Modal Tabanlı Etkileşimler**: Tüm CRUD işlemleri için temiz, modern modal sistemi
- **Yetki Farkında UI**: Butonlar ve aksiyonlar kullanıcı yetkilerine göre uyum sağlar
- **Gerçek Zamanlı Güncellemeler**: İşlemlerden sonra anlık veri yenileme

## Teknoloji Yığını

- **Frontend**: Modern, tip güvenli React uygulaması için Next.js 14 ve TypeScript
- **Stil**: Duyarlı ve utility-first stil için Tailwind CSS
- **Backend**: PostgreSQL veritabanı, kimlik doğrulama ve gerçek zamanlı özellikler için Supabase
- **Deployment**: Kesintisiz deployment ve hosting için Vercel
- **State Yönetimi**: Verimli state yönetimi için React hooks
- **UI Bileşenleri**: Özel modal sistemi ve duyarlı kart düzenleri

## Son Güncellemeler (En Son Sürüm)

### ✅ **Yetki Tabanlı UI Sistemi**
- Role dayalı buton durumları (kullanıcı yetkilerine göre aktif/pasif)
- Şirket yöneticisi tüm şirketleri düzenleyip silebilir
- Şirket kullanıcısı sadece atanan şirketleri düzenleyebilir
- Arayüz boyunca görsel yetki göstergeleri

### ✅ **Gelişmiş İstatistikler ve Filtreleme**
- Tıklanabilir filtre butonları ile etkileşimli istatistik barı
- Kullanıcı yetkilerini dikkate alan akıllı filtreleme mantığı
- Her durum kategorisi için gerçek zamanlı sayı güncellemeleri
- "Tümü" filtresi tam veri setini gösterir, durum filtreleri atamaları dikkate alır

### ✅ **Geliştirilmiş Fuar Yönetimi**
- Modern checkbox arayüzü ile çoklu fuar seçimi
- Gerçek zamanlı fuar katılım takibi
- Şirket kartlarında görsel fuar göstergeleri
- Kapsamlı fuar atama sistemi

### ✅ **İyileştirilmiş Kullanıcı Deneyimi**
- Tüm CRUD işlemleri için modern modal sistemi
- Mobil ve masaüstü için optimize edilmiş duyarlı tasarım
- İşlemlerden sonra gerçek zamanlı veri güncellemeleri
- Renk kodlaması ile sezgisel durum rozet sistemi

## Veritabanı Şeması

Uygulama, aşağıdaki ana tablolarla Supabase üzerinden iyi yapılandırılmış bir PostgreSQL veritabanı kullanır:
- `profiles` - Kullanıcı yönetimi ve roller
- `companies` - Şirket bilgileri
- `customer_companies` - Müşteri firma kartları
- `sectors` - Endüstri sektörleri
- `countries` - Ülke verileri
- `fairs` - Fuar/etkinlik bilgileri
- `customer_companies_fairs` - Fuar katılımı için junction tablosu

## Kurulum Talimatları

1. **Repository'yi Klonlayın**:
   ```bash
   git clone <repository-url>
   cd opion_crm
   ```

2. **Bağımlılıkları Yükleyin**:
   `frontend` dizinine gidin ve gerekli paketleri yükleyin:
   ```bash
   cd frontend
   npm install
   ```

3. **Veritabanı Kurulumu**:
   - Supabase'de veritabanınızı kurmak için `database` dizinindeki `schema.sql` dosyasını kullanın
   - Uygun veri erişim kontrolü için Row Level Security (RLS) politikalarını yapılandırın

4. **Ortam Değişkenleri**:
   `frontend` dizininde aşağıdaki değişkenlerle bir `.env.local` dosyası oluşturun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Uygulamayı Çalıştırın**:
   ```bash
   npm run dev
   ```

6. **Uygulamaya Erişin**:
   Tarayıcınızı açın ve uygulamaya erişmek için `http://localhost:3000` adresine gidin.

## Kullanım Kılavuzu

### Super Adminler İçin
- Şirketler oluşturun ve yönetin
- Şirket admin rolleri atayın
- Sistem genelinde işlemleri denetleyin

### Şirket Adminleri İçin
- Şirket kullanıcıları oluşturun ve yönetin
- Tüm müşteri firma verilerine tam erişim
- Şirketleri belirli kullanıcılara atayın
- Kapsamlı istatistikleri ve raporları görüntüleyin

### Şirket Kullanıcıları İçin
- Yeni müşteri firma kartları oluşturun
- Size atanan şirketleri düzenleyin
- Tüm şirketleri görüntüleyin (atanmayanlar salt okunur)
- Kişiselleştirilmiş istatistiklere ve filtrelere erişin

## Proje Yapısı

```
opion_crm/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── companies/[id]/
│   │   │   │   ├── customers/     # Ana müşteri yönetimi
│   │   │   │   ├── countries/     # Ülke yönetimi
│   │   │   │   ├── sectors/       # Sektör yönetimi
│   │   │   │   └── users/         # Kullanıcı yönetimi
│   │   │   ├── dashboard/         # Ana panel
│   │   │   └── login/            # Kimlik doğrulama
│   │   ├── components/ui/        # Yeniden kullanılabilir UI bileşenleri
│   │   ├── lib/                  # Yardımcı fonksiyonlar
│   │   └── utils/               # Supabase yapılandırması
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   └── schema.sql              # Veritabanı şeması
└── README.md
```

## Ana Özellikler Dökümü

### 🎯 **Akıllı Durum Sistemi**
Uygulama, akıllı bir durum belirleme sistemi içerir:
1. **Fuar Katılımı** (en yüksek öncelik): Katılanlar için yeşil, katılmayanlar için kırmızı
2. **Görüşme Durumu**: Notları olan şirketler için mavi (görüşülüyor)
3. **İletişim Kurulmadı**: Not veya fuar durumu olmayan şirketler için sarı

### 🔐 **Role Dayalı Erişim Kontrolü**
- **Şirket Yöneticisi**: Tüm müşteri şirketlere tam CRUD erişimi
- **Şirket Kullanıcısı**: Sadece atanan şirketleri düzenleyebilir, diğerlerini salt okunur olarak görür
- **Dinamik UI**: Butonlar yetkiye göre otomatik olarak aktif/pasif hale gelir

### 📊 **Etkileşimli İstatistikler**
- Tıklanabilir durum butonları ile gerçek zamanlı filtreleme
- Akıllı veri görünürlüğü: "Tümü" tam veri setini gösterir, durum filtreleri kullanıcı atamalarını dikkate alır
- Her kategori için canlı sayı güncellemeleri

### 🎨 **Modern UI/UX**
- Duyarlı kart ve tablo görünümleri
- Temiz kullanıcı deneyimi için modal tabanlı etkileşimler
- Hızlı görsel tanıma için renk kodlu durum rozetleri
- Mobil optimize edilmiş duyarlı tasarım

## Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen bu yönergeleri takip edin:

1. **Repository'yi fork edin** ve bir özellik dalı oluşturun
2. **Değişikliklerinizi yapın** açık, açıklayıcı commit mesajları ile
3. **Hem masaüstü hem de mobil cihazlarda kapsamlı test edin**
4. **Değişikliklerin detaylı açıklaması ile bir pull request gönderin**

### Geliştirme Yönergeleri
- TypeScript en iyi uygulamalarını takip edin
- Duyarlı tasarım ilkelerini koruyun
- Uygun hata yönetimi sağlayın
- Açık, kendi kendini belgelendiren kod yazın
- Yetki tabanlı işlevselliği kapsamlı olarak test edin

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla detay için LICENSE dosyasına bakın.

---

**Altaion Interactive tarafından geliştirilmiştir** | **Son Güncelleme: Temmuz 2025**