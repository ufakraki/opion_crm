'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  supabase, 
  getCustomerCompanies, 
  getCustomerCompaniesStats, 
  createCustomerCompany, 
  updateCustomerCompany,
  deleteCustomerCompany,
  getCompanyUsers,
  getSectors,
  getCountries,
  getFairs,
  getCustomerCompanyFairs,
  CustomerCompany,
  Sector,
  Country,
  Fair
} from '../../../../utils/supabase'

export default function CustomersPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [customers, setCustomers] = useState<CustomerCompany[]>([])
  const [stats, setStats] = useState({ total: 0, attendingFair: 0, notAttendingFair: 0, underDiscussion: 0 })
  const [companyUsers, setCompanyUsers] = useState<any[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [fairs, setFairs] = useState<Fair[]>([])

  // CustomerFairsList component - müşterinin fuarlarını gösterir
  const CustomerFairsList = ({ customerId }: { customerId: string }) => {
    const [customerFairs, setCustomerFairs] = useState<string[]>([])
    const [fairsLoading, setFairsLoading] = useState(true)

    useEffect(() => {
      async function fetchCustomerFairs() {
        setFairsLoading(true)
        try {
          const result = await getCustomerCompanyFairs(customerId)
          setCustomerFairs(result.data || [])
        } catch (error) {
          console.error('Error fetching customer fairs:', error)
        } finally {
          setFairsLoading(false)
        }
      }
      
      fetchCustomerFairs()
    }, [customerId])

    if (fairsLoading) {
      return <div className="text-sm text-gray-500">Fuar bilgileri yükleniyor...</div>
    }

    if (customerFairs.length === 0) {
      return <div className="text-sm text-gray-500 italic">Bu firma henüz hiçbir fuara kayıtlı değil</div>
    }

    const customerFairNames = fairs.filter(fair => customerFairs.includes(fair.id!)).map(fair => fair.name)

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {customerFairNames.map((fairName, index) => (
            <div key={index} className="flex items-center bg-blue-50 rounded-lg px-3 py-2">
              <span className="text-blue-600 mr-2">🎪</span>
              <span className="text-sm font-medium text-blue-800">{fairName}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Toplam {customerFairs.length} fuara kayıtlı
        </p>
      </div>
    )
  }
  // View and pagination state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25) // Normal pagination - 25 firma per page
  
  // Filtreleme state
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCompany | null>(null)
  // Sil/Düzenle modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<CustomerCompany | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState<CustomerCompany | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector_id: '', // Sektör dropdown için
    country_id: '', // Ülke dropdown için
    phone: '',
    email1: '',
    email2: '',
    email3: '',
    address: '',
    website: '',
    contact_person: '',
    notes: '',
    attending_fair: undefined as boolean | undefined,
    assigned_user_id: '', // Company admin için kullanıcı seçimi
    fairs: [] as string[] // Çoklu fuar seçimi
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
            // Company admin ise kullanıcıları da getir
          if (profileData.role === 'company_admin') {
            await fetchCompanyUsers(companyId as string)
          }
          
          // Sektörleri getir
          await fetchSectors(companyId as string)
          
          // Ülkeleri getir
          await fetchCountries(companyId as string)
          
          // Fuarları getir
          await fetchFairs(companyId as string)
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
  // Company users'ı getir (sadece company admin için)
  async function fetchCompanyUsers(companyId: string) {
    try {
      console.log('🔄 Fetching company users for company:', companyId)
      
      const result = await getCompanyUsers(companyId)
      
      if (result.error) {
        console.error('❌ Error fetching company users:', result.error)
      } else {
        console.log('✅ Company users fetched successfully:', result.data)
        // Sadece company_user rolündeki kullanıcıları filtrele
        const companyUsersList = result.data?.filter(user => user.role === 'company_user') || []
        setCompanyUsers(companyUsersList)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching company users:', error)
    }
  }

  // Sektörleri getir
  async function fetchSectors(companyId: string) {
    try {
      console.log('🔄 Fetching sectors for company:', companyId)
      
      const result = await getSectors(companyId)
      
      if (result.error) {
        console.error('❌ Error fetching sectors:', result.error)
      } else {
        console.log('✅ Sectors fetched successfully:', result.data)
        setSectors(result.data)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching sectors:', error)
    }
  }
  
  // Ülkeleri getir
  async function fetchCountries(companyId: string) {
    try {
      console.log('🔄 Fetching countries for company:', companyId)
      
      const result = await getCountries(companyId)
      
      if (result.error) {
        console.error('❌ Error fetching countries:', result.error)
      } else {
        console.log('✅ Countries fetched successfully:', result.data)
        setCountries(result.data)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching countries:', error)
    }
  }
  
  // Fuarları getir
  async function fetchFairs(companyId: string) {
    try {
      console.log('🔄 Fetching fairs for company:', companyId)
      
      const result = await getFairs(companyId)
      
      if (result.error) {
        console.error('❌ Error fetching fairs:', result.error)
      } else {
        console.log('✅ Fairs fetched successfully:', result.data)
        setFairs(result.data)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching fairs:', error)
    }
  }
  
  // Pagination helper functions
  const getPaginatedCustomers = () => {
    // Önce filtreleme yap
    let filteredCustomers = customers;
    
    if (statusFilter !== 'all') {
      filteredCustomers = customers.filter(customer => {
        // Company user sadece kendi atanan firmalarını görsün (filtrelerde)
        if (profile?.role === 'company_user' && customer.assigned_user_id !== profile.id) {
          return false;
        }
        
        const status = getCustomerStatus(customer);
        return status.type === statusFilter;
      });
    }
    // "Tümü" seçildiğinde company user da tüm şirket datasını görebilir
    
    // Sonra pagination yap
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCustomers.slice(startIndex, endIndex)
  }
  
  const getTotalPages = () => {
    // Filtrelenmiş veriye göre sayfa sayısı hesapla
    let filteredCustomers = customers;
    
    if (statusFilter !== 'all') {
      filteredCustomers = customers.filter(customer => {
        if (profile?.role === 'company_user' && customer.assigned_user_id !== profile.id) {
          return false;
        }
        const status = getCustomerStatus(customer);
        return status.type === statusFilter;
      });
    }
    // "Tümü" seçildiğinde company user da tüm şirket datasını görebilir
    
    return Math.ceil(filteredCustomers.length / itemsPerPage)
  }
  
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  // Status helper functions - ADIM 7.2
  const getCustomerStatus = (customer: CustomerCompany) => {
    // Önce fuar durumunu kontrol et (en yüksek öncelik)
    if (customer.attending_fair === true) {
      return {
        type: 'attending_fair',
        label: 'Fuara Katılıyor',
        color: 'bg-green-100 text-green-800',
        icon: '🟢'
      }
    }
    
    if (customer.attending_fair === false) {
      return {
        type: 'not_attending_fair',
        label: 'Fuara Katılmıyor',
        color: 'bg-red-100 text-red-800',
        icon: '🔴'
      }
    }
    
    // Fuar durumu belirlenmemişse, not durumuna bak
    if (customer.notes && customer.notes.trim().length > 0) {
      return {
        type: 'under_discussion',
        label: 'Görüşülüyor',
        color: 'bg-blue-100 text-blue-800',
        icon: '�'
      }
    }
    
    // Hiçbir durum yoksa görüşülmedi
    return {
      type: 'not_contacted',
      label: 'Görüşülmedi',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '�'
    }
  }

  // Stats hesaplama - ADIM 7.2 güncellemesi
  const getUpdatedStats = () => {
    const allCustomers = customers;
    
    // "Tümü" için tüm şirket datası
    const total = allCustomers.length;
    
    // Diğer statlar için company user ise sadece atanan firmalar, company admin ise tüm firmalar
    let statsCustomers = allCustomers;
    if (profile?.role === 'company_user') {
      statsCustomers = allCustomers.filter(c => c.assigned_user_id === profile.id);
    }
    
    const attending = statsCustomers.filter(c => c.attending_fair === true).length
    const notAttending = statsCustomers.filter(c => c.attending_fair === false).length
    const underDiscussion = statsCustomers.filter(c => 
      (c.attending_fair === null || c.attending_fair === undefined) && 
      c.notes && c.notes.trim().length > 0
    ).length
    const notContacted = statsCustomers.filter(c => 
      (c.attending_fair === null || c.attending_fair === undefined) && 
      (!c.notes || c.notes.trim().length === 0)
    ).length
    
    return {
      total: total, // Her zaman tüm firma datası
      attendingFair: attending, // Company user için sadece atanan firmalar
      notAttendingFair: notAttending, // Company user için sadece atanan firmalar
      underDiscussion: underDiscussion, // Company user için sadece atanan firmalar
      notContacted: notContacted // Company user için sadece atanan firmalar
    }
  }
  
  // Permission helper functions - ADIM 7.5
  const canEditCustomer = (customer: CustomerCompany) => {
    if (!profile) return false
    
    // Company admin tüm firmaları düzenleyebilir
    if (profile.role === 'company_admin') {
      return true
    }
    
    // Company user sadece kendine atanan firmaları düzenleyebilir
    if (profile.role === 'company_user') {
      return customer.assigned_user_id === profile.id
    }
    
    return false
  }

  const canDeleteCustomer = (customer: CustomerCompany) => {
    if (!profile) return false
    
    // Sadece company admin silebilir
    if (profile.role === 'company_admin') {
      return true
    }
    
    // Company user hiç silemez
    return false
  }

  const canViewCustomer = (customer: CustomerCompany) => {
    if (!profile) return false
    
    // Herkes görüntüleyebilir (kendi şirketindeki firmaları)
    return true
  }
  
  // Modal ve form fonksiyonları
  const resetForm = () => {
    setFormData({
      name: '',
      sector_id: '',
      country_id: '',
      phone: '',
      email1: '',
      email2: '',
      email3: '',
      address: '',
      website: '',
      contact_person: '',
      notes: '',
      attending_fair: undefined,
      assigned_user_id: '',
      fairs: []
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
        attending_fair: formData.attending_fair, // undefined, true, false olabilir
        assigned_user_id: formData.assigned_user_id || undefined // Company admin seçimi varsa kullan
      }

      const result = await createCustomerCompany(customerData)
      
      if (result.error) {
        console.error('❌ Error creating customer:', result.error)
        alert('Firma kartı oluşturulurken hata oluştu!')
      } else {
        // Eğer fairs seçiliyse, join tablosuna ekle
        if (formData.fairs && formData.fairs.length > 0 && result.data && result.data[0]?.id) {
          const customerCompanyId = result.data[0].id;
          // Her bir seçili fuar için join tablosuna ekle
          await supabase.from('customer_companies_fairs').insert(
            formData.fairs.map(fair_id => ({ customer_company_id: customerCompanyId, fair_id }))
          );
        }
        
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

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerToEdit) return
    
    setCreating(true)

    try {
      const updateData = {
        name: formData.name,
        sector_id: formData.sector_id,
        country_id: formData.country_id,
        phone: formData.phone,
        email1: formData.email1,
        email2: formData.email2,
        email3: formData.email3,
        address: formData.address,
        website: formData.website,
        contact_person: formData.contact_person,
        notes: formData.notes,
        attending_fair: formData.attending_fair,
        assigned_user_id: formData.assigned_user_id || undefined,
        fairs: formData.fairs
      }

      const result = await updateCustomerCompany(customerToEdit.id!, updateData)
      
      if (result.error) {
        console.error('❌ Error updating customer:', result.error)
        alert('Firma kartı güncellenirken hata oluştu!')
      } else {
        
        // Formu temizle ve modalı kapat
        resetForm()
        setShowEditModal(false)
        setCustomerToEdit(null)
        
        // Verileri yenile
        if (companyId) {
          await fetchCustomerData(companyId as string)
        }
        
        alert('✅ Firma kartı başarıyla güncellendi!')
      }
    } catch (error) {
      console.error('❌ Unexpected error updating customer:', error)
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
              Dashboard → Firma Kartları
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
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 bg-white">
                  <button
                    className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('cards')}
                  >
                    🔲 Kartlar
                  </button>
                  <button
                    className={`px-3 py-2 text-sm rounded-r-lg transition-colors border-l border-gray-300 ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('table')}
                  >
                    📋 Liste
                  </button>
                </div>
                
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  onClick={() => {
                    resetForm()
                    setShowCreateModal(true)
                  }}
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
                  <span className="font-medium">Toplam: {getUpdatedStats().total} firma kartı</span>
                  {customers.length > itemsPerPage && (
                    <span className="ml-2 text-gray-500">
                      (Sayfa {currentPage}/{getTotalPages()})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      setStatusFilter('all')
                      setCurrentPage(1)
                    }}
                    className={`px-2 py-1 rounded transition-colors ${
                      statusFilter === 'all' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    📊 Tümü: {getUpdatedStats().total}
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('attending_fair')
                      setCurrentPage(1)
                    }}
                    className={`px-2 py-1 rounded transition-colors ${
                      statusFilter === 'attending_fair' 
                        ? 'bg-green-100 text-green-800' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    🟢 Fuara Katılan: {getUpdatedStats().attendingFair}
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('not_attending_fair')
                      setCurrentPage(1)
                    }}
                    className={`px-2 py-1 rounded transition-colors ${
                      statusFilter === 'not_attending_fair' 
                        ? 'bg-red-100 text-red-800' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    🔴 Fuara Katılmayan: {getUpdatedStats().notAttendingFair}
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('under_discussion')
                      setCurrentPage(1)
                    }}
                    className={`px-2 py-1 rounded transition-colors ${
                      statusFilter === 'under_discussion' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    🔵 Görüşülüyor: {getUpdatedStats().underDiscussion}
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('not_contacted')
                      setCurrentPage(1)
                    }}
                    className={`px-2 py-1 rounded transition-colors ${
                      statusFilter === 'not_contacted' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    🟡 Görüşülmedi: {getUpdatedStats().notContacted}
                  </button>
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
                    onClick={() => {
                      resetForm()
                      setShowCreateModal(true)
                    }}
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
                {/* Cards View */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
                    {getPaginatedCustomers().map((customer) => (
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
                              {(() => {
                                const status = getCustomerStatus(customer)
                                return (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.icon} {status.label}
                                  </span>
                                )
                              })()}
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
                            
                            {(customer.email1 || customer.email2 || customer.email3) && (
                              <div className="space-y-1">
                                {customer.email1 && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-5 text-gray-400">✉️</span>
                                    <a href={`mailto:${customer.email1}`} className="ml-2 hover:text-blue-600 transition-colors truncate">
                                      {customer.email1}
                                    </a>
                                  </div>
                                )}
                                {customer.email2 && (
                                  <div className="flex items-center text-sm text-gray-600 ml-6">
                                    <a href={`mailto:${customer.email2}`} className="hover:text-blue-600 transition-colors truncate">
                                      {customer.email2}
                                    </a>
                                  </div>
                                )}
                                {customer.email3 && (
                                  <div className="flex items-center text-sm text-gray-600 ml-6">
                                    <a href={`mailto:${customer.email3}`} className="hover:text-blue-600 transition-colors truncate">
                                      {customer.email3}
                                    </a>
                                  </div>
                                )}
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
                          )}

                          {/* Last Contact Date */}
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
                            {/* Left side - Date info */}
                            <div className="text-xs text-gray-400">
                              {customer.updated_at && customer.updated_at !== customer.created_at ? (
                                <>Güncellendi: {new Date(customer.updated_at).toLocaleDateString('tr-TR')}</>
                              ) : customer.created_at ? (
                                <>Oluşturuldu: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</>
                              ) : (
                                <>Tarih bilinmiyor</>
                              )}
                            </div>
                            
                            {/* Right side - Action buttons */}
                            <div className="flex space-x-2">
                              {/* Görüntüle - Herkes görüntüleyebilir */}
                              {canViewCustomer(customer) && (
                                <button 
                                  className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  onClick={() => {
                                    setSelectedCustomer(customer)
                                    setShowDetailModal(true)
                                  }}
                                >
                                  👁️ Görüntüle
                                </button>
                              )}
                              
                              {/* Düzenle - Yetki kontrolü ile */}
                              {canEditCustomer(customer) ? (
                                <button 
                                  className="text-xs px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                  onClick={async () => {
                                    setCustomerToEdit(customer);
                                    
                                    // Önce müşterinin fuarlarını çek
                                    let customerFairs: string[] = [];
                                    try {
                                      const fairsResult = await getCustomerCompanyFairs(customer.id!);
                                      customerFairs = (fairsResult.data || []).map(id => String(id));
                                    } catch (error) {
                                      console.error('Müşteri fuarları çekilemedi:', error);
                                    }
                                    
                                    // formData'yı müşteri verileriyle doldur
                                    setFormData({
                                      name: customer.name || '',
                                      sector_id: customer.sector_id ? customer.sector_id.toString() : '',
                                      country_id: customer.country_id ? customer.country_id.toString() : '',
                                      phone: customer.phone || '',
                                      email1: customer.email1 || '',
                                      email2: customer.email2 || '',
                                      email3: customer.email3 || '',
                                      address: customer.address || '',
                                      website: customer.website || '',
                                      contact_person: customer.contact_person || '',
                                      notes: customer.notes || '',
                                      attending_fair: customer.attending_fair ?? undefined,
                                      assigned_user_id: customer.assigned_user_id || '',
                                      fairs: customerFairs
                                    });
                                    
                                    setShowEditModal(true);
                                  }}
                                >
                                  ✏️ Düzenle
                                </button>
                              ) : (
                                <button 
                                  className="text-xs px-3 py-1 text-gray-400 cursor-not-allowed rounded"
                                  disabled
                                  title="Bu firmayı düzenleme yetkiniz yok"
                                >
                                  ✏️ Düzenle
                                </button>
                              )}
                              {/* Sil - Yetki kontrolü ile */}
                              {canDeleteCustomer(customer) ? (
                                <button 
                                  className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  onClick={() => {
                                    setCustomerToDelete(customer);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  🗑️ Sil
                                </button>
                              ) : (
                                <button 
                                  className="text-xs px-3 py-1 text-gray-400 cursor-not-allowed rounded"
                                  disabled
                                  title="Bu firmayı silme yetkiniz yok"
                                >
                                  🗑️ Sil
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Firma Bilgileri
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İletişim
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Atanan Kullanıcı
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedCustomers().map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {customer.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    📋 {customer.sector || 'Sektör belirtilmemiş'}
                                  </div>
                                  {customer.address && (
                                    <div className="text-xs text-gray-400 truncate max-w-xs">
                                      📍 {customer.address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 space-y-1">
                                {customer.contact_person && (
                                  <div className="text-sm text-gray-600">
                                    👤 {customer.contact_person}
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="text-sm text-gray-600">
                                    📞 {customer.phone}
                                  </div>
                                )}
                                {customer.email1 && (
                                  <div className="text-sm text-gray-600">
                                    ✉️ {customer.email1}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(() => {
                                const status = getCustomerStatus(customer)
                                return (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.icon} {status.label}
                                  </span>
                                )
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {customer.assigned_user ? (
                                <div className="text-sm text-gray-600">
                                  👨‍💼 @{customer.assigned_user.username}
                                </div>
                              ) : (
                                <span className="text-gray-400">Atanmamış</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {/* Görüntüle - Herkes görüntüleyebilir */}
                                {canViewCustomer(customer) && (
                                  <button 
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={() => {
                                      setSelectedCustomer(customer)
                                      setShowDetailModal(true)
                                    }}
                                    title="Detaylarını görüntüle"
                                  >
                                    👁️
                                  </button>
                                )}
                                
                                {/* Düzenle - Yetki kontrolü ile */}
                                {canEditCustomer(customer) ? (
                                  <button 
                                    className="text-green-600 hover:text-green-900"
                                    onClick={async () => {
                                      setCustomerToEdit(customer);
                                      
                                      // Önce müşterinin fuarlarını çek
                                      let customerFairs: string[] = [];
                                      try {
                                        const fairsResult = await getCustomerCompanyFairs(customer.id!);
                                        customerFairs = (fairsResult.data || []).map(id => String(id));
                                      } catch (error) {
                                        console.error('Müşteri fuarları çekilemedi:', error);
                                      }
                                      
                                      // formData'yı müşteri verileriyle doldur
                                      setFormData({
                                        name: customer.name || '',
                                        sector_id: customer.sector_id ? customer.sector_id.toString() : '',
                                        country_id: customer.country_id ? customer.country_id.toString() : '',
                                        phone: customer.phone || '',
                                        email1: customer.email1 || '',
                                        email2: customer.email2 || '',
                                        email3: customer.email3 || '',
                                        address: customer.address || '',
                                        website: customer.website || '',
                                        contact_person: customer.contact_person || '',
                                        notes: customer.notes || '',
                                        attending_fair: customer.attending_fair ?? undefined,
                                        assigned_user_id: customer.assigned_user_id || '',
                                        fairs: customerFairs
                                      });
                                      setShowEditModal(true);
                                    }}
                                    title="Düzenle"
                                  >
                                    ✏️
                                  </button>
                                ) : (
                                  <button 
                                    className="text-gray-400 cursor-not-allowed"
                                    disabled
                                    title="Bu firmayı düzenleme yetkiniz yok"
                                  >
                                    ✏️
                                  </button>
                                )}
                                
                                {/* Sil - Yetki kontrolü ile */}
                                {canDeleteCustomer(customer) ? (
                                  <button 
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => {
                                      setCustomerToDelete(customer);
                                      setShowDeleteModal(true);
                                    }}
                                    title="Sil"
                                  >
                                    🗑️
                                  </button>
                                ) : (
                                  <button 
                                    className="text-gray-400 cursor-not-allowed"
                                    disabled
                                    title="Bu firmayı silme yetkiniz yok"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {customers.length > itemsPerPage && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === getTotalPages()}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                          {' - '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, customers.length)}
                          </span>
                          {' / '}
                          <span className="font-medium">{customers.length}</span>
                          {' sonuç gösteriliyor'}
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Önceki</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === getTotalPages()}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Sonraki</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
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

                {/* Sektör Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör *
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sektör Seçin</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id?.toString() || ''}>{sector.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ülke Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ülke *
                  </label>
                  <select
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Ülke Seçin</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id?.toString() || ''}>{country.name}</option>
                    ))}
                  </select>
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

                {/* Email 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email 1
                  </label>
                  <input
                    type="email"
                    name="email1"
                    value={formData.email1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="info@firma.com"
                  />
                </div>

                {/* Email 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email 2
                  </label>
                  <input
                    type="email"
                    name="email2"
                    value={formData.email2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="satış@firma.com"
                  />
                </div>

                {/* Email 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email 3
                  </label>
                  <input
                    type="email"
                    name="email3"
                    value={formData.email3}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="destek@firma.com"
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
                    placeholder="Şehir ve tam adres"
                  />
                </div>

                {/* Fuar Seçimi - Checkbox Listesi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuar Seçimi
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-32 overflow-y-auto">
                    {fairs.length > 0 ? (
                      <div className="space-y-2">
                        {fairs.map((fair) => (
                          <div key={fair.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`create-fair-${fair.id}`}
                              checked={fair.id ? formData.fairs.includes(fair.id) : false}
                              onChange={(e) => {
                                if (!fair.id) return; // Guard clause
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    fairs: [...prev.fairs, fair.id!]
                                  }))
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    fairs: prev.fairs.filter(id => id !== fair.id)
                                  }))
                                }
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`create-fair-${fair.id}`} className="ml-2 text-sm text-gray-700">
                              {fair.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Henüz fuar tanımlanmamış</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.fairs.length > 0 
                      ? `${formData.fairs.length} fuar seçili` 
                      : 'İstediğiniz fuarları seçebilirsiniz'
                    } ({fairs.length} fuar mevcut)
                  </p>
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
                </div>                {/* Atanan Kullanıcı Bilgisi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atanan Kullanıcı
                  </label>
                  
                  {profile?.role === 'company_admin' ? (
                    // Company Admin için dropdown
                    <div className="space-y-2">
                      <select
                        name="assigned_user_id"
                        value={formData.assigned_user_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Kullanıcı Seçin</option>
                        {companyUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} (@{user.username})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">
                        {formData.assigned_user_id ? 
                          'Seçilen kullanıcıya atanacak' : 
                          'Kullanıcı seçilmezse otomatik olarak size atanacak'
                        }
                      </p>
                    </div>
                  ) : (
                    // Company User için mevcut durum
                    <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 text-gray-400">👨‍💼</span>
                        <span className="ml-2 font-medium">
                          {profile ? `${profile.full_name} (@${profile.username})` : 'Yükleniyor...'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Bu firma kartı otomatik olarak size atanacaktır
                      </p>
                    </div>
                  )}
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

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Firma Kartı Detayları</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedCustomer(null)
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
            <div className="px-6 py-4">
              <div className="space-y-6">
                
                {/* Firma Bilgileri */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Firma Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
                      <div className="text-sm text-gray-900 font-medium">{selectedCustomer.name}</div>
                    </div>
                    
                    {selectedCustomer.sector && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                        <div className="text-sm text-gray-600">{selectedCustomer.sector}</div>
                      </div>
                    )}
                    
                    {selectedCustomer.contact_person && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Kişisi</label>
                        <div className="text-sm text-gray-600">{selectedCustomer.contact_person}</div>
                      </div>
                    )}
                    
                    {selectedCustomer.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <div className="text-sm text-gray-600">
                          <a href={`tel:${selectedCustomer.phone}`} className="hover:text-blue-600 transition-colors">
                            {selectedCustomer.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {(selectedCustomer.email1 || selectedCustomer.email2 || selectedCustomer.email3) && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Adresleri</label>
                        <div className="space-y-1">
                          {selectedCustomer.email1 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-500">Email 1:</span>
                              <a href={`mailto:${selectedCustomer.email1}`} className="ml-2 hover:text-blue-600 transition-colors">
                                {selectedCustomer.email1}
                              </a>
                            </div>
                          )}
                          {selectedCustomer.email2 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-500">Email 2:</span>
                              <a href={`mailto:${selectedCustomer.email2}`} className="ml-2 hover:text-blue-600 transition-colors">
                                {selectedCustomer.email2}
                              </a>
                            </div>
                          )}
                          {selectedCustomer.email3 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-500">Email 3:</span>
                              <a href={`mailto:${selectedCustomer.email3}`} className="ml-2 hover:text-blue-600 transition-colors">
                                {selectedCustomer.email3}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedCustomer.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <div className="text-sm text-gray-600">
                          <a 
                            href={selectedCustomer.website.startsWith('http') ? selectedCustomer.website : `https://${selectedCustomer.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors"
                          >
                            {selectedCustomer.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedCustomer.address && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <div className="text-sm text-gray-600">{selectedCustomer.address}</div>
                    </div>
                  )}
                </div>

                {/* Durum ve Atama Bilgileri */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Durum ve Atama</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuar Katılım Durumu</label>
                      <div className="flex items-center">
                        {selectedCustomer.attending_fair === true && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🟢 Fuara Katılacak
                          </span>
                        )}
                        {selectedCustomer.attending_fair === false && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔴 Fuara Katılmayacak
                          </span>
                        )}
                        {(selectedCustomer.attending_fair === null || selectedCustomer.attending_fair === undefined) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            💬 Görüşülüyor
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kullanıcı</label>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 text-gray-400">👨‍💼</span>
                        <span className="ml-2 font-medium">
                          {selectedCustomer.assigned_user ? 
                            `${selectedCustomer.assigned_user.full_name} (@${selectedCustomer.assigned_user.username})` : 
                            'Atanmamış'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fuar Bilgileri */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fuar Bilgileri</h3>
                  <CustomerFairsList customerId={selectedCustomer.id!} />
                </div>

                {/* Notlar */}
                {selectedCustomer.notes && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notlar</h3>
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCustomer.notes}</div>
                    </div>
                  </div>
                )}

                {/* Tarih Bilgileri */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tarih Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    
                    {/* Tek tarih gösterimi - updated_at varsa onu, yoksa created_at'ı göster */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {selectedCustomer.updated_at && 
                         selectedCustomer.updated_at !== selectedCustomer.created_at 
                         ? "Son Güncellenme" : "Oluşturulma Tarihi"}
                      </label>
                      <div>
                        {selectedCustomer.updated_at && 
                         selectedCustomer.updated_at !== selectedCustomer.created_at 
                         ? new Date(selectedCustomer.updated_at).toLocaleDateString('tr-TR') + ' ' + new Date(selectedCustomer.updated_at).toLocaleTimeString('tr-TR')
                         : selectedCustomer.created_at 
                           ? new Date(selectedCustomer.created_at).toLocaleDateString('tr-TR') + ' ' + new Date(selectedCustomer.created_at).toLocaleTimeString('tr-TR')
                           : 'Bilinmiyor'
                        }
                      </div>
                    </div>
                    
                    {selectedCustomer.last_contact_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Son İletişim Tarihi</label>
                        <div>{new Date(selectedCustomer.last_contact_date).toLocaleDateString('tr-TR')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedCustomer(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Kapat
                </button>
                {/* Düzenle ve Sil butonları - Yetki kontrollü */}
                {canEditCustomer(selectedCustomer) ? (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={async () => {
                      setCustomerToEdit(selectedCustomer);
                      
                      // Önce müşterinin fuarlarını çek
                      let customerFairs: string[] = [];
                      try {
                        if (selectedCustomer.id) {
                          const fairsResult = await getCustomerCompanyFairs(selectedCustomer.id);
                          customerFairs = (fairsResult.data || []).map(id => String(id));
                        }
                      } catch (error) {
                        console.error('Müşteri fuarları çekilemedi:', error);
                      }
                      
                      // formData'yı müşteri verileriyle doldur
                      setFormData({
                        name: selectedCustomer.name || '',
                        sector_id: selectedCustomer.sector_id ? selectedCustomer.sector_id.toString() : '',
                        country_id: selectedCustomer.country_id ? selectedCustomer.country_id.toString() : '',
                        phone: selectedCustomer.phone || '',
                        email1: selectedCustomer.email1 || '',
                        email2: selectedCustomer.email2 || '',
                        email3: selectedCustomer.email3 || '',
                        address: selectedCustomer.address || '',
                        website: selectedCustomer.website || '',
                        contact_person: selectedCustomer.contact_person || '',
                        notes: selectedCustomer.notes || '',
                        attending_fair: selectedCustomer.attending_fair ?? undefined,
                        assigned_user_id: selectedCustomer.assigned_user_id || '',
                        fairs: customerFairs
                      });
                      
                      setCustomerToEdit(selectedCustomer);
                      setShowEditModal(true);
                      setShowDetailModal(false);
                    }}
                  >
                    ✏️ Düzenle
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                    disabled
                    title="Bu firmayı düzenleme yetkiniz yok"
                  >
                    ✏️ Düzenle
                  </button>
                )}
                {canDeleteCustomer(selectedCustomer) ? (
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => {
                      setCustomerToDelete(selectedCustomer);
                      setShowDeleteModal(true);
                      setShowDetailModal(false);
                    }}
                  >
                    🗑️ Sil
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                    disabled
                    title="Bu firmayı silme yetkiniz yok"
                  >
                    🗑️ Sil
                  </button>
                )}
              </div>
            </div>          </div>
        </div>
      )}
    {/* Silme Onay Modalı */}
    {showDeleteModal && customerToDelete && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Silme Onayı</h3>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerToDelete(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-6">
            <p className="text-gray-700 mb-4">
              <span className="font-semibold text-red-600">{customerToDelete.name}</span> adlı firma kartını silmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCustomerToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!customerToDelete.id) {
                      alert('Geçersiz firma kartı!');
                      return;
                    }
                    
                    const result = await deleteCustomerCompany(customerToDelete.id);
                    
                    if (result.error) {
                      console.error('❌ Error deleting customer:', result.error);
                      alert('Firma kartı silinirken hata oluştu!');
                    } else {
                      
                      // Modalı kapat
                      setShowDeleteModal(false);
                      setCustomerToDelete(null);
                      
                      // Verileri yenile
                      if (companyId) {
                        await fetchCustomerData(companyId as string);
                      }
                      
                      alert('✅ Firma kartı başarıyla silindi!');
                    }
                  } catch (error) {
                    console.error('❌ Unexpected error deleting customer:', error);
                    alert('Beklenmeyen bir hata oluştu!');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Düzenleme Modalı */}
    {showEditModal && customerToEdit && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Firma Kartını Düzenle</h3>
            <button
              onClick={() => {
                setShowEditModal(false);
                setCustomerToEdit(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Düzenleme Formu - Yeni Firma Oluşturma ile Aynı */}
          <form onSubmit={handleEditCustomer} className="px-6 py-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Örn: ABC Teknoloji Ltd. Şti."
                />
              </div>

              {/* Sektör Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sektör *
                </label>
                <select
                  name="sector_id"
                  value={formData.sector_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sektör Seçin</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id?.toString() || ''}>{sector.name}</option>
                  ))}
                </select>
              </div>

              {/* Ülke Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ülke *
                </label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Ülke Seçin</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id?.toString() || ''}>{country.name}</option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="+90 (XXX) XXX-XXXX"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ad Soyad / Pozisyon"
                />
              </div>

              {/* Email 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email 1
                </label>
                <input
                  type="email"
                  name="email1"
                  value={formData.email1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="info@firma.com"
                />
              </div>

              {/* Email 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email 2
                </label>
                <input
                  type="email"
                  name="email2"
                  value={formData.email2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="satış@firma.com"
                />
              </div>

              {/* Email 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email 3
                </label>
                <input
                  type="email"
                  name="email3"
                  value={formData.email3}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="destek@firma.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="www.firma.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Şehir ve tam adres"
                />
              </div>

              {/* Fuar Seçimi - Checkbox Listesi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuar Seçimi
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                  {fairs.length > 0 ? (
                    <div className="space-y-2">
                      {fairs.map((fair) => (
                        <div key={fair.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`edit-fair-${fair.id}`}
                            checked={fair.id ? formData.fairs.includes(fair.id) : false}
                            onChange={(e) => {
                              if (!fair.id) return; // Guard clause
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  fairs: [...prev.fairs, fair.id!]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  fairs: prev.fairs.filter(id => id !== fair.id)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <label htmlFor={`edit-fair-${fair.id}`} className="ml-2 text-sm text-gray-700">
                            {fair.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Henüz fuar eklenmemiş</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.fairs.length > 0 
                    ? `${formData.fairs.length} fuar seçili` 
                    : 'İstediğiniz fuarları seçebilirsiniz'
                  } ({fairs.length} fuar mevcut)
                </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Bu firma hakkında notlar, hatırlatıcılar..."
                />
              </div>

              {/* Atanan Kullanıcı Bilgisi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atanan Kullanıcı
                </label>
                
                {profile?.role === 'company_admin' ? (
                  // Company Admin için dropdown
                  <div className="space-y-2">
                    <select
                      name="assigned_user_id"
                      value={formData.assigned_user_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Kullanıcı Seçin</option>
                      {companyUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} (@{user.username})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      {formData.assigned_user_id ? 
                        'Seçilen kullanıcıya atanacak' : 
                        'Kullanıcı seçilmezse mevcut atama korunacak'
                      }
                    </p>
                  </div>
                ) : (
                  // Company User için mevcut durum
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 text-gray-400">👨‍💼</span>
                      <span className="ml-2 font-medium">
                        {customerToEdit.assigned_user ? 
                          `${customerToEdit.assigned_user.full_name} (@${customerToEdit.assigned_user.username})` : 
                          'Atanmamış'
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Company user olarak atama değiştiremezsiniz
                    </p>
                  </div>
                )}
              </div>

              {/* Fuar Katılım Durumu - Checkbox'lar */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuar Katılım Durumu
                </label>
                
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
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
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
                  setShowEditModal(false);
                  setCustomerToEdit(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={creating}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creating || !formData.name.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    ✏️ Değişiklikleri Kaydet
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
