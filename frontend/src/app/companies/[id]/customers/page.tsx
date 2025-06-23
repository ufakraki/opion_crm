'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  supabase, 
  getCustomerCompanies, 
  getCustomerCompaniesStats, 
  createCustomerCompany, 
  CustomerCompany 
} from '../../../../utils/supabase'

export default function CustomersPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [customers, setCustomers] = useState<CustomerCompany[]>([])
  const [stats, setStats] = useState({ total: 0, attendingFair: 0, notAttendingFair: 0, underDiscussion: 0 })
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    contact_person: '',
    notes: '',
    attending_fair: undefined as boolean | undefined
  })

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profileData)
        
        // Profile yüklendikten sonra customer verilerini getir
        if (profileData && companyId) {
          await fetchCustomerData(companyId as string)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router, companyId])

  // Customer verilerini getir
  async function fetchCustomerData(companyId: string) {
    try {
      console.log('🔄 Fetching customer data for company:', companyId)
      
      // Customer companies ve stats'ı paralel olarak getir
      const [customersResult, statsResult] = await Promise.all([
        getCustomerCompanies(companyId),
        getCustomerCompaniesStats(companyId)
      ])
      
      if (customersResult.error) {
        console.error('❌ Error fetching customers:', customersResult.error)
      } else {
        console.log('✅ Customers fetched successfully:', customersResult.data)
        setCustomers(customersResult.data)
      }
      
      if (statsResult.error) {
        console.error('❌ Error fetching stats:', statsResult.error)
      } else {
        console.log('✅ Stats fetched successfully:', statsResult)
        setStats(statsResult)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching customer data:', error)
    }
  }
  
  // Modal ve form fonksiyonları
  const resetForm = () => {
    setFormData({
      name: '',
      sector: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      contact_person: '',
      notes: '',
      attending_fair: undefined
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      console.log('🔄 Creating new customer with form data:', formData)
      
      const customerData: CustomerCompany = {
        ...formData,
        company_id: companyId as string,
        attending_fair: formData.attending_fair // undefined, true, false olabilir
      }

      const result = await createCustomerCompany(customerData)
      
      if (result.error) {
        console.error('❌ Error creating customer:', result.error)
        alert('Firma kartı oluşturulurken hata oluştu!')
      } else {
        console.log('✅ Customer created successfully:', result.data)
        
        // Formu temizle ve modalı kapat
        resetForm()
        setShowCreateModal(false)
        
        // Verileri yenile
        if (companyId) {
          await fetchCustomerData(companyId as string)
        }
        
        alert('✅ Firma kartı başarıyla oluşturuldu!')
      }
    } catch (error) {
      console.error('❌ Unexpected error creating customer:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Yetki kontrolü
  if (!profile || (profile.role !== 'company_admin' && profile.role !== 'company_user')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Geri
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Firma Kartları</h1>
                <p className="text-xs sm:text-sm text-gray-500">Müşteri firmalarınızı yönetin</p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              Dashboard → Firma Kartları {companyId && `(${companyId.toString().slice(0, 8)}...)`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Search & Actions Bar */}
          <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              
              {/* Search Box */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Firma adı, sektör veya telefon ile arama yapın..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">(Arama özelliği yakında aktif olacak)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Yeni Firma Kartı
                </button>
                <button 
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  disabled
                >
                  📊 İstatistikler
                </button>
              </div>
            </div>
          </div>

          {/* Lista Container */}
          <div className="bg-white rounded-lg shadow">
            
            {/* Stats Bar */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Toplam: {stats.total} firma kartı</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🟢 Fuara Katılan Firma: {stats.attendingFair}</span>
                  <span>🔴 Fuara Katılmayan Firma: {stats.notAttendingFair}</span>
                  <span>💬 Görüşülen Firma: {stats.underDiscussion}</span>
                </div>
              </div>
            </div>
            
            {/* Empty State vs Customer List */}
            {customers.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12 px-4 sm:px-6">
                <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 mb-6">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m0 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  İlk firma kartınızı oluşturun
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Müşteri firmalarınızı takip etmek, notlar almak ve hatırlatıcılar oluşturmak için firma kartları kullanın.
                </p>
                
                <div className="space-y-4">
                  {/* Main CTA Button */}
                  <button 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => setShowCreateModal(true)}
                  >
                    🏢 İlk Firma Kartımı Oluştur
                  </button>
                  
                  {/* Feature Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">📊</div>
                      <h4 className="font-medium text-gray-900 text-sm">İstatistikler</h4>
                      <p className="text-xs text-gray-500">Fuar katılım verileri</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">🔔</div>
                      <h4 className="font-medium text-gray-900 text-sm">Hatırlatıcılar</h4>
                      <p className="text-xs text-gray-500">Otomatik takip sistemi</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">📱</div>
                      <h4 className="font-medium text-gray-900 text-sm">Mobil Uyumlu</h4>
                      <p className="text-xs text-gray-500">Heryerde erişilebilir</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-6">
                    💡 İpucu: Firma kartları sistemi aktif durumda
                  </p>
                </div>
              </div>
            ) : (
              /* Customer List */
              <div className="p-0">
                {/* Customer Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
                  {customers.map((customer) => (
                    <div key={customer.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {customer.name}
                            </h3>
                            {customer.sector && (
                              <p className="text-sm text-gray-500 mt-1">
                                📋 {customer.sector}
                              </p>
                            )}
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex flex-col gap-1 ml-4">
                            {customer.attending_fair === true && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                🟢 Fuara Katılacak
                              </span>
                            )}
                            {customer.attending_fair === false && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🔴 Fuara Katılmayacak
                              </span>
                            )}
                            {(customer.attending_fair === null || customer.attending_fair === undefined) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                💬 Görüşülüyor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        
                        {/* Contact Information */}
                        <div className="space-y-2">
                          {customer.contact_person && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-5 text-gray-400">👤</span>
                              <span className="ml-2">{customer.contact_person}</span>
                            </div>
                          )}
                          
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-5 text-gray-400">📞</span>
                              <a href={`tel:${customer.phone}`} className="ml-2 hover:text-blue-600 transition-colors">
                                {customer.phone}
                              </a>
                            </div>
                          )}
                          
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-5 text-gray-400">✉️</span>
                              <a href={`mailto:${customer.email}`} className="ml-2 hover:text-blue-600 transition-colors truncate">
                                {customer.email}
                              </a>
                            </div>
                          )}
                          
                          {customer.website && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-5 text-gray-400">🌐</span>
                              <a 
                                href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 hover:text-blue-600 transition-colors truncate"
                              >
                                {customer.website}
                              </a>
                            </div>
                          )}
                          
                          {customer.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-5 text-gray-400">📍</span>
                              <span className="ml-2 truncate">{customer.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes Preview */}
                        {customer.notes && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 line-clamp-2">
                              📝 {customer.notes}
                            </p>
                          </div>
                        )}                        {/* Last Contact Date */}
                        {customer.last_contact_date && (
                          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                            Son İletişim: {new Date(customer.last_contact_date).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                          {/* Assigned User */}
                        {customer.assigned_user && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="w-5 text-gray-400">👨‍💼</span>
                              <span className="ml-2 font-medium">
                                @{customer.assigned_user.username}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer - Actions */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                        <div className="flex justify-between items-center">
                          {/* Left side - Creation info */}
                          <div className="text-xs text-gray-400">
                            {customer.created_at && (
                              <>Oluşturuldu: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</>
                            )}
                          </div>
                          
                          {/* Right side - Action buttons */}
                          <div className="flex space-x-2">
                            <button 
                              className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:text-gray-400"
                              disabled
                            >
                              👁️ Görüntüle
                            </button>
                            <button 
                              className="text-xs px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:text-gray-400"
                              disabled
                            >
                              ✏️ Düzenle
                            </button>
                            <button 
                              className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:text-gray-400"
                              disabled
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Yeni Firma Kartı Oluştur</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateCustomer} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Firma Adı */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firma Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: ABC Teknoloji Ltd. Şti."
                  />
                </div>

                {/* Sektör */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör
                  </label>
                  <input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Teknoloji, İnşaat, Sağlık"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+90 (XXX) XXX-XXXX"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="info@firma.com"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="www.firma.com veya https://www.firma.com"
                  />
                </div>

                {/* İletişim Kişisi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim Kişisi
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ad Soyad / Pozisyon"
                  />
                </div>

                {/* Adres */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Şehir, Ülke veya tam adres (Örn: İstanbul, Türkiye)"
                  />
                </div>

                {/* Notlar */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bu firma hakkında notlar, hatırlatıcılar..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="attending_fair"
                      checked={formData.attending_fair === true}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, attending_fair: true }))
                        } else {
                          setFormData(prev => ({ ...prev, attending_fair: undefined }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Firma Fuara Katılıyor
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="attending_fair"
                      checked={formData.attending_fair === false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, attending_fair: false }))
                        } else {
                          setFormData(prev => ({ ...prev, attending_fair: undefined }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Firma Fuara Katılmıyor
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={creating}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      🏢 Firma Kartı Oluştur
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
