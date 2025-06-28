'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  supabase, 
  getFairs, 
  createFair, 
  updateFair, 
  deleteFair, 
  Fair 
} from '../../../../utils/supabase'

export default function FairsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [fairs, setFairs] = useState<Fair[]>([])
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFair, setEditingFair] = useState<Fair | null>(null)
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
        
        // Profile yüklendikten sonra fuar verilerini getir
        if (profileData && companyId) {
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

  // Fuar verilerini getir
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

  // Form reset
  const resetForm = () => {
    setFormData({
      name: ''
    })
  }

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Create fair
  const handleCreateFair = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      console.log('🔄 Creating new fair with form data:', formData)
      
      const fairData = {
        name: formData.name,
        company_id: companyId as string
      }

      const result = await createFair(fairData)
      
      if (result.error) {
        console.error('❌ Error creating fair:', result.error)
        console.error('❌ Full error object:', JSON.stringify(result.error, null, 2))
        const errorMessage = typeof result.error === 'object' && result.error && 'message' in result.error 
          ? (result.error as any).message 
          : JSON.stringify(result.error)
        alert(`Fuar oluşturulurken hata oluştu: ${errorMessage}`)
      } else {
        console.log('✅ Fair created successfully:', result.data)
        
        // Formu temizle ve modalı kapat
        resetForm()
        setShowCreateModal(false)
        
        // Verileri yenile
        if (companyId) {
          await fetchFairs(companyId as string)
        }
        
        alert('✅ Fuar başarıyla oluşturuldu!')
      }
    } catch (error) {
      console.error('❌ Unexpected error creating fair:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  // Edit fair
  const handleEditFair = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFair) return
    
    setCreating(true)

    try {
      console.log('🔄 Updating fair with form data:', formData)
      
      const result = await updateFair(editingFair.id!, { name: formData.name })
      
      if (result.error) {
        console.error('❌ Error updating fair:', result.error)
        alert('Fuar güncellenirken hata oluştu!')
      } else {
        console.log('✅ Fair updated successfully:', result.data)
        
        // Formu temizle ve modalı kapat
        resetForm()
        setShowEditModal(false)
        setEditingFair(null)
        
        // Verileri yenile
        if (companyId) {
          await fetchFairs(companyId as string)
        }
        
        alert('✅ Fuar başarıyla güncellendi!')
      }
    } catch (error) {
      console.error('❌ Unexpected error updating fair:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setCreating(false)
    }
  }

  // Delete fair
  const handleDeleteFair = async (fairId: string, fairName: string) => {
    if (!confirm(`"${fairName}" fuarını silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeleting(fairId)

    try {
      console.log('🔄 Deleting fair:', fairId)
      
      const result = await deleteFair(fairId)
      
      if (result.error) {
        console.error('❌ Error deleting fair:', result.error)
        const errorMessage = typeof result.error === 'object' && result.error && 'message' in result.error 
          ? (result.error as any).message 
          : JSON.stringify(result.error)
        alert(`Fuar silinirken hata oluştu: ${errorMessage}`)
      } else {
        console.log('✅ Fair deleted successfully')
        
        // Verileri yenile
        if (companyId) {
          await fetchFairs(companyId as string)
        }
        
        alert('✅ Fuar başarıyla silindi!')
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting fair:', error)
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setDeleting(null)
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

  // Yetki kontrolü - sadece company admin fuar yönetimi yapabilir
  if (!profile || profile.role !== 'company_admin') {
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fuar Yönetimi</h1>
                <p className="text-xs sm:text-sm text-gray-500">Şirketinizin fuarlarını yönetin</p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              Dashboard → Fuar Yönetimi {companyId && `(${companyId.toString().slice(0, 8)}...)`}
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
              <div className="flex-1">
                <h2 className="text-lg font-medium text-gray-900 mb-1">Fuar Listesi</h2>
                <p className="text-sm text-gray-500">Toplam {fairs.length} fuar</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Yeni Fuar Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Fairs List */}
          <div className="bg-white rounded-lg shadow">
            {fairs.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12 px-4 sm:px-6">
                <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 mb-6">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m0 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2-2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  İlk fuarınızı ekleyin
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Şirketinizin katıldığı fuarları tanımlayarak firma kartlarında kullanabilirsiniz.
                </p>
                
                <button 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => setShowCreateModal(true)}
                >
                  🏢 İlk Fuarımı Ekle
                </button>
              </div>
            ) : (
              /* Fairs List */
              <div className="divide-y divide-gray-200">
                {fairs.map((fair) => (
                  <div key={fair.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {fair.name}
                        </h3>
                        {fair.created_at && (
                          <p className="text-sm text-gray-500 mt-1">
                            Oluşturuldu: {new Date(fair.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="text-sm px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => {
                            setEditingFair(fair)
                            setFormData({ name: fair.name })
                            setShowEditModal(true)
                          }}
                        >
                          ✏️ Düzenle
                        </button>
                        <button 
                          className="text-sm px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDeleteFair(fair.id!, fair.name)}
                          disabled={deleting === fair.id}
                        >
                          {deleting === fair.id ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              Siliniyor...
                            </div>
                          ) : (
                            '🗑️ Sil'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Fair Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Yeni Fuar Ekle</h2>
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
            <form onSubmit={handleCreateFair} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuar Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Teknoloji Fuarı 2025"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6">
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
                      🏢 Fuar Ekle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fair Modal */}
      {showEditModal && editingFair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Fuar Düzenle</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingFair(null)
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
            <form onSubmit={handleEditFair} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuar Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Teknoloji Fuarı 2025"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingFair(null)
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
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      ✏️ Fuar Güncelle
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
