'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  supabase, 
  getSectors, 
  createSector, 
  updateSector, 
  deleteSector, 
  Sector 
} from '../../../../utils/supabase'

export default function SectorsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [sectors, setSectors] = useState<Sector[]>([])
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSector, setEditingSector] = useState<Sector | null>(null)
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
        
        // Profile yüklendikten sonra sektörleri getir
        if (profileData && companyId) {
          await fetchSectors(companyId as string)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router, companyId])

  // Sektörleri getir
  async function fetchSectors(companyId: string) {
    try {
      console.log('🔄 Fetching sectors for company:', companyId)
      
      const result = await getSectors(companyId)
      
      if (result.error) {
        console.error('❌ Error fetching sectors:', result.error)
        alert('Sektörler yüklenirken hata oluştu!')
      } else {
        console.log('✅ Sectors fetched successfully:', result.data)
        setSectors(result.data)
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching sectors:', error)
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

  // Create sector
  const handleCreateSector = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      console.log('🔄 Creating new sector:', formData)
      
      const result = await createSector({
        name: formData.name,
        company_id: companyId as string
      })
      
      if (result.error) {
        console.error('❌ Error creating sector:', result.error)
        alert('Sektör oluşturulurken hata oluştu!')
      } else {
        console.log('✅ Sector created successfully:', result.data)
        
        // Formu temizle ve modalı kapat
        resetForm()
        setShowCreateModal(false)
        
        // Verileri yenile
        if (companyId) {
          await fetchSectors(companyId as string)
        }
        
        alert('✅ Sektör başarıyla oluşturuldu!')
      }
    } catch (error) {
      console.error('❌ Unexpected error creating sector:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  // Edit sector
  const handleEditSector = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSector) return
    
    setCreating(true)

    try {
      console.log('🔄 Updating sector:', editingSector.id, formData)
      
      const result = await updateSector(editingSector.id!, {
        name: formData.name
      })
      
      if (result.error) {
        console.error('❌ Error updating sector:', result.error)
        alert('Sektör güncellenirken hata oluştu!')
      } else {
        console.log('✅ Sector updated successfully:', result.data)
        
        // Formu temizle ve modalı kapat
        resetForm()
        setShowEditModal(false)
        setEditingSector(null)
        
        // Verileri yenile
        if (companyId) {
          await fetchSectors(companyId as string)
        }
        
        alert('✅ Sektör başarıyla güncellendi!')
      }
    } catch (error) {
      console.error('❌ Unexpected error updating sector:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  // Delete sector
  const handleDeleteSector = async (sectorId: string, sectorName: string) => {
    if (!confirm(`"${sectorName}" sektörünü silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeleting(sectorId)

    try {
      console.log('🔄 Deleting sector:', sectorId)
      
      const result = await deleteSector(sectorId)
      
      if (result.error) {
        console.error('❌ Error deleting sector:', result.error)
        alert('Sektör silinirken hata oluştu!')
      } else {
        console.log('✅ Sector deleted successfully')
        
        // Verileri yenile
        if (companyId) {
          await fetchSectors(companyId as string)
        }
        
        alert('✅ Sektör başarıyla silindi!')
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting sector:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setDeleting(null)
    }
  }

  // Open edit modal
  const openEditModal = (sector: Sector) => {
    setEditingSector(sector)
    setFormData({ name: sector.name })
    setShowEditModal(true)
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

  // Yetki kontrolü - Sadece company admin
  if (!profile || profile.role !== 'company_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya sadece şirket yöneticileri erişebilir.</p>
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sektör Yönetimi</h1>
                <p className="text-xs sm:text-sm text-gray-500">Firma kartları için sektörleri yönetin</p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              Dashboard → Sektör Yönetimi
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Actions Bar */}
          <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Sektörler</h2>
                <p className="text-sm text-gray-500">Toplam {sectors.length} sektör</p>
              </div>

              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                onClick={() => setShowCreateModal(true)}
              >
                + Yeni Sektör Ekle
              </button>
            </div>
          </div>

          {/* Sectors List */}
          <div className="bg-white rounded-lg shadow">
            {sectors.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12 px-4 sm:px-6">
                <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 mb-6">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  İlk sektörünüzü oluşturun
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Firma kartlarınızı sınıflandırmak için sektörler oluşturun.
                </p>
                
                <button 
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  onClick={() => setShowCreateModal(true)}
                >
                  🏭 İlk Sektörümü Oluştur
                </button>
              </div>
            ) : (
              /* Sectors List */
              <div className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
                  {sectors.map((sector) => (
                    <div key={sector.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      
                      {/* Sector Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              🏭 {sector.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Sector Body */}
                      <div className="p-4 space-y-3">
                        <div className="text-sm text-gray-500">
                          {sector.created_at && (
                            <>Oluşturuldu: {new Date(sector.created_at).toLocaleDateString('tr-TR')}</>
                          )}
                        </div>
                      </div>

                      {/* Sector Footer - Actions */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="text-xs px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            onClick={() => openEditModal(sector)}
                          >
                            ✏️ Düzenle
                          </button>
                          <button 
                            className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            onClick={() => handleDeleteSector(sector.id!, sector.name)}
                            disabled={deleting === sector.id}
                          >
                            {deleting === sector.id ? '⏳' : '🗑️'} Sil
                          </button>
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

      {/* Create Sector Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Yeni Sektör Oluştur</h2>
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
            <form onSubmit={handleCreateSector} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Örn: Teknoloji, İnşaat, Sağlık"
                  />
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      🏭 Sektör Oluştur
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sector Modal */}
      {showEditModal && editingSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Sektörü Düzenle</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSector(null)
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
            <form onSubmit={handleEditSector} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Örn: Teknoloji, İnşaat, Sağlık"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSector(null)
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      ✏️ Sektörü Güncelle
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
