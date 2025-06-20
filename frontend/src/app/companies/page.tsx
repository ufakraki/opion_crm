'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, fetchCompanies, createCompany, deleteCompany } from '@/utils/supabase'
import { Button } from '@/components/ui/button'

interface Company {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export default function CompaniesPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadCompanies()
  }, [])

  const checkUserAndLoadCompanies = async () => {
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
      
      // Only super admin can access companies page
      if (profileData?.role !== 'super_admin') {
        router.push('/dashboard')
        return
      }
      
      // Load companies
      await loadCompanies()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const { data, error } = await fetchCompanies()
      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompanyName.trim()) return
    
    setCreating(true)
    try {
      const { data, error } = await createCompany({
        name: newCompanyName.trim(),
        created_by: user.id
      })
      
      if (error) throw error
      
      await loadCompanies()
      setNewCompanyName('')
      setShowCreateForm(false)
      alert('Şirket başarıyla oluşturuldu!')    } catch (error: any) {
      console.error('Error creating company:', error)
      alert('Şirket oluşturulamadı: ' + (error?.message || 'Bilinmeyen hata'))
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`"${companyName}" şirketini silmek istediğinizden emin misiniz?`)) {
      return
    }
    
    try {
      const { error } = await deleteCompany(companyId)
      if (error) throw error
      
      await loadCompanies()
      alert('Şirket başarıyla silindi!')    } catch (error: any) {
      console.error('Error deleting company:', error)
      alert('Şirket silinemedi: ' + (error?.message || 'Bilinmeyen hata'))
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
                onClick={() => router.push('/dashboard')}
                className="text-gray-600"
              >
                ← Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Şirket Yönetimi</h1>
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
          <h2 className="text-2xl font-bold text-gray-900">Şirketler</h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Yeni Şirket
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Yeni Şirket Oluştur</h3>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şirket adını girin"
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
                    setNewCompanyName('')
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Companies List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {companies.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                Henüz şirket oluşturulmamış
              </li>
            ) : (
              companies.map((company) => (
                <li key={company.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Oluşturulma: {new Date(company.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/companies/${company.id}/users`)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Kullanıcılar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteCompany(company.id, company.name)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Sil
                      </Button>
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
