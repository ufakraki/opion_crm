'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, signOut } from '@/utils/supabase'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
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
        console.log('Logged in user:', user)
      console.log('User ID:', user.id)
      console.log('User email:', user.email)
      setUser(user)
        // Get user profile from database
      const { data: profileData, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        console.error('Profile error:', profileError)
        console.log('User ID that failed:', user.id)
        // Continue anyway, maybe profile doesn't exist yet
      } else {
        console.log('User profile:', profileData)
        setProfile(profileData)
      }
        // If no profile data, still show the user info
      if (!profileData) {
        console.log('No profile found, showing basic user info')
      }
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
          <div className="flex justify-between items-center h-16">            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Opion CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <div>Hoşgeldiniz, {profile?.full_name || user?.email}</div>
                <div className="text-xs text-gray-500">
                  {profile?.role || 'Yükleniyor...'} • {user?.email}
                </div>
              </div>
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
              </p>              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* Super Admin Controls */}
                {(profile?.role === 'super_admin' || user?.email === 'kutkun@gmail.com') && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Şirket Yönetimi</h3>
                    <p className="text-gray-600 text-sm">
                      Şirketleri ve şirket adminlerini yönetin
                    </p>
                    <Button 
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push('/companies')}
                    >
                      Şirketleri Yönet
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Role: {profile?.role || 'loading...'} | Email: {user?.email}
                    </p>
                  </div>
                )}

                {/* Company Admin Controls */}
                {profile?.role === 'company_admin' && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Kullanıcı Yönetimi</h3>
                    <p className="text-gray-600 text-sm">
                      Şirket kullanıcılarınızı yönetin
                    </p>
                    <Button 
                      className="mt-4 w-full bg-green-600 hover:bg-green-700"
                      onClick={() => router.push(`/companies/${profile.company_id}/users`)}
                    >
                      Kullanıcıları Yönet
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Role: {profile?.role} | Company: {profile?.company_id}
                    </p>
                  </div>
                )}
                
                {/* All Users - Firma Kartları */}
                {(profile?.role === 'company_admin' || profile?.role === 'company_user') && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Firma Kartları</h3>
                    <p className="text-gray-600 text-sm">
                      Müşteri firmalarınızı yönetin
                    </p>
                    <Button 
                      className="mt-4 w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => router.push('/customer-companies')}
                    >
                      Firma Kartlarını Görüntüle
                    </Button>
                  </div>
                )}

                {profile?.role !== 'super_admin' && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Firma Kartları</h3>
                    <p className="text-gray-600 text-sm">
                      Müşteri firmalarınızı yönetin
                    </p>
                    <Button className="mt-4 w-full" disabled>
                      Yakında Gelecek
                    </Button>
                  </div>
                )}
                
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
