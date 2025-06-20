'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/utils/supabase'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error) throw error
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Opion CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoşgeldiniz, {user?.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Opion CRM sistemine hoşgeldiniz. Sistem şu anda geliştirme aşamasında.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Firma Kartları</h3>
                  <p className="text-gray-600 text-sm">
                    Müşteri firmalarınızı yönetin
                  </p>
                  <Button className="mt-4 w-full" disabled>
                    Yakında Gelecek
                  </Button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Hatırlatmalar</h3>
                  <p className="text-gray-600 text-sm">
                    7 günlük hatırlatma sistemi
                  </p>
                  <Button className="mt-4 w-full" disabled>
                    Yakında Gelecek
                  </Button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Raporlar</h3>
                  <p className="text-gray-600 text-sm">
                    Satış raporları ve analizler
                  </p>
                  <Button className="mt-4 w-full" disabled>
                    Yakında Gelecek
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
