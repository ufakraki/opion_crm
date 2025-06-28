'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  supabase, 
  getCountries, 
  createCountry, 
  updateCountry, 
  deleteCountry, 
  Country 
} from '../../../../utils/supabase'

export default function CountriesPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [countries, setCountries] = useState<Country[]>([])
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: ''
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
        
        // Profile yüklendikten sonra ülkeleri getir
        if (profileData && companyId) {
          await fetchCountries(companyId as string)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router, companyId])

  // Ülkeleri getir
  async function fetchCountries(companyId: string) {
    try {
      console.log('🔄 Fetching countries for company:', companyId)
      
      const result = await getCountries(companyId)
      
      if (result.error) {
        console.error('❌ Error fetching countries:', result.error)
        alert('Ülkeler yüklenirken hata oluştu!')
      } else {
        console.log('✅ Countries fetched successfully:', result.data)
        setCountries(result.data)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching countries:', error)
    }
  }

  // Form reset
  const resetForm = () => {
    setFormData({ name: '' })
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Create country
  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      console.log('🔄 Creating country:', formData.name)
      
      const result = await createCountry(companyId as string, formData.name)
      
      if (result.error) {
        console.error('❌ Error creating country:', result.error)
        alert('Ülke oluşturulurken hata oluştu!')
      } else {
        console.log('✅ Country created successfully:', result.data)
        setShowCreateModal(false)
        resetForm()
        await fetchCountries(companyId as string) // Listeyi yenile
      }
    } catch (error) {
      console.error('❌ Unexpected error creating country:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  // Edit country
  const handleEditCountry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCountry) return

    setCreating(true)

    try {
      console.log('🔄 Updating country:', editingCountry.id, formData.name)
      
      const result = await updateCountry(editingCountry.id!, formData.name)
      
      if (result.error) {
        console.error('❌ Error updating country:', result.error)
        alert('Ülke güncellenirken hata oluştu!')
      } else {
        console.log('✅ Country updated successfully:', result.data)
        setShowEditModal(false)
        setEditingCountry(null)
        resetForm()
        await fetchCountries(companyId as string) // Listeyi yenile
      }
    } catch (error) {
      console.error('❌ Unexpected error updating country:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  // Delete country
  const handleDeleteCountry = async (countryId: string) => {
    if (!confirm('Bu ülkeyi silmek istediğinizden emin misiniz?')) return

    setDeleting(countryId)

    try {
      console.log('🔄 Deleting country:', countryId)
      
      const result = await deleteCountry(countryId)
      
      if (result.error) {
        console.error('❌ Error deleting country:', result.error)
        alert('Ülke silinirken hata oluştu!')
      } else {
        console.log('✅ Country deleted successfully')
        await fetchCountries(companyId as string) // Listeyi yenile
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting country:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setDeleting(null)
    }
  }

  // Open edit modal
  const openEditModal = (country: Country) => {
    setEditingCountry(country)
    setFormData({ name: country.name })
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'company_admin' && profile?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700"
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
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Geri
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Ülke Yönetimi</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center"
            >
              <span className="mr-2">+</span>
              Yeni Ülke Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🌍</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Ülke
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {countries.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countries List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Ülke Listesi
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Şirketinize ait ülkeleri yönetin
              </p>
            </div>
            
            {countries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🌍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz ülke eklenmemiş
                </h3>
                <p className="text-gray-500 mb-6">
                  İlk ülkenizi ekleyerek başlayın
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  İlk Ülkeyi Ekle
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {countries.map((country) => (
                  <li key={country.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-teal-600 font-medium text-sm">
                              🌍
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {country.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Oluşturulma: {new Date(country.created_at || '').toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(country)}
                          className="text-teal-600 hover:text-teal-900 text-sm"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteCountry(country.id!)}
                          disabled={deleting === country.id}
                          className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                        >
                          {deleting === country.id ? 'Siliniyor...' : 'Sil'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Yeni Ülke Ekle
              </h3>
              <form onSubmit={handleCreateCountry}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ülke Adı
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Örn: Türkiye"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {creating ? 'Ekleniyor...' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCountry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ülke Düzenle
              </h3>
              <form onSubmit={handleEditCountry}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ülke Adı
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Örn: Türkiye"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingCountry(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    {creating ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
