'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCustomerCompanies, getCustomerCompaniesStats, CustomerCompany } from '@/utils/supabase'

export default function CustomersPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [customers, setCustomers] = useState<CustomerCompany[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, attending: 0 })
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
    <div className="min-h-screen bg-gray-50">      {/* Header */}
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
      </div>      {/* Main Content */}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  disabled
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
                  <span>🟢 Satış Yapıldı: {stats.active}</span>
                  <span>🔴 Satış Yapılmadı: {stats.inactive}</span>
                  <span>📋 Fuara Katılacak: {stats.attending}</span>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="text-center py-12 px-4 sm:px-6">
              <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 mb-6">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m0 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002 2z" />
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
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  disabled
                >
                  🏢 İlk Firma Kartımı Oluştur
                </button>
                
                {/* Feature Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-medium text-gray-900 text-sm">İstatistikler</h4>
                    <p className="text-xs text-gray-500">Satış ve takip verileri</p>
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
                  💡 İpucu: Firma kartları oluşturma özelliği Adım 6'da aktif olacak
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
