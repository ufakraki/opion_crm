'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser, getUserProfile, getCompanyUsers, createCompanyAdmin, createCompanyUser } from '@/utils/supabase'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export default function CompanyUsersPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [userType, setUserType] = useState<'company_admin' | 'company_user'>('company_user')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    checkUserAndLoadUsers()
  }, [])

  const checkUserAndLoadUsers = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error) throw error
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      // Get user profile
      const { data: profileData, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        console.error('Profile error:', profileError)
        return
      }
      
      setProfile(profileData)
      
      // Only super admin can access this page
      if (profileData?.role !== 'super_admin') {
        router.push('/dashboard')
        return
      }
      
      // Load company users
      await loadUsers()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await getCompanyUsers(companyId)
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setCreating(true)
    try {
      const { data, error } = await createCompanyAdmin({
        ...formData,
        company_id: companyId
      })
      
      if (error) throw error
      
      await loadUsers()
      setFormData({ email: '', password: '', full_name: '' })
      setShowCreateForm(false)
      alert('Company Admin başarıyla oluşturuldu!')    } catch (error: any) {
      console.error('Error creating user:', error)
      alert('Kullanıcı oluşturulamadı: ' + (error?.message || 'Bilinmeyen hata'))
    } finally {
      setCreating(false)
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/companies')}
                className="text-gray-600"
              >
                ← Şirketler
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Şirket Kullanıcıları</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name} ({profile?.role})
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcılar</h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Company Admin Oluştur
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Yeni Company Admin Oluştur</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormData({ email: '', password: '', full_name: '' })
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                Bu şirkette henüz kullanıcı oluşturulmamış
              </li>
            ) : (
              users.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Role: {user.role} • Oluşturulma: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}
