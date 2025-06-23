'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function CustomersPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

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
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router])

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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                ← Geri
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Firma Kartları</h1>
                <p className="text-sm text-gray-500">Müşteri firmalarınızı yönetin</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Şirket: {companyId}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m0 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz firma kartı bulunmamaktadır
              </h3>
              <p className="text-gray-500 mb-6">
                İlk firma kartınızı oluşturmak için aşağıdaki butona tıklayın.
              </p>
              
              {/* Adım 2'de bu buton çalışacak */}
              <button 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled
              >
                + Yeni Firma Kartı Oluştur
              </button>
              <p className="text-xs text-gray-400 mt-2">
                (Yakında aktif olacak)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
