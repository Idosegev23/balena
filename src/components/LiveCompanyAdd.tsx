'use client'

import { useState } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Search, Plus, Building2, MapPin, Globe, Phone, Mail, X } from 'lucide-react'

interface LiveCompanyAddProps {
  onCompanyAdded?: (company: Company) => void
}

export function LiveCompanyAdd({ onCompanyAdded }: LiveCompanyAddProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [manualEntry, setManualEntry] = useState(false)
  const [saving, setSaving] = useState(false)

  // Manual entry form state
  const [formData, setFormData] = useState({
    company: '',
    location: '',
    hall: '',
    stand: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    contact_person: ''
  })

  const searchKShow = async () => {
    if (!searchTerm.trim()) return
    
    setSearching(true)
    
    try {
      // Mock K-Show search - in real implementation would call K-Show API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock results
      const mockResults = [
        {
          company: searchTerm,
          location: 'Germany',
          hall: 'Hall 8a',
          stand: 'B40',
          website: `www.${searchTerm.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `${searchTerm} is a leading manufacturer of advanced materials and solutions for the plastics industry.`,
          contact_person: 'Sales Manager',
          products: 'Biodegradable additives, Compostable compounds, Bio-based plasticizers',
          certifications: ['OK compost', 'ASTM D6400']
        },
        {
          company: `${searchTerm} Technologies`,
          location: 'Netherlands',
          hall: 'Hall 7',
          stand: 'C15',
          website: `www.${searchTerm.toLowerCase()}tech.nl`,
          description: `Advanced technology solutions for sustainable plastics.`,
          contact_person: 'Technical Director'
        }
      ]
      
      setSearchResults(mockResults)
      
    } catch (error) {
      console.error('Error searching K-Show:', error)
      alert('שגיאה בחיפוש. נסה שוב.')
    }
    
    setSearching(false)
  }

  const selectCompanyFromSearch = (company: any) => {
    setSelectedCompany(company)
    setFormData({
      company: company.company || '',
      location: company.location || '',
      hall: company.hall || '',
      stand: company.stand || '',
      email: '',
      phone: '',
      website: company.website || '',
      description: company.description || '',
      contact_person: company.contact_person || ''
    })
  }

  const saveCompany = async () => {
    if (!user || !formData.company.trim()) return
    
    setSaving(true)
    
    try {
      // Check if company already exists
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id, company')
        .eq('company', formData.company.trim())
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingCompany) {
        alert('החברה כבר קיימת במערכת')
        setSaving(false)
        return
      }

      // Add new company
      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert({
          company: formData.company.trim(),
          location: formData.location || null,
          hall: formData.hall || null,
          stand: formData.stand || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          description: formData.description || null,
          contact_person: formData.contact_person || null,
          visit_priority: 'MEDIUM',
          relevance_status: 'pending',
          created_at: new Date().toISOString(),
          source_search_term: searchTerm,
          marked_by: user.user_metadata?.full_name || user.email,
          marked_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Add to activity feed
      await supabase
        .from('activity_feed')
        .insert({
          user_name: user.user_metadata?.full_name || user.email,
          action_type: 'company_added_live',
          company_id: newCompany.id,
          description: `הוסיף חברה חדשה: ${formData.company}`,
          metadata: {
            source: selectedCompany ? 'k_show_search' : 'manual_entry',
            hall: formData.hall,
            stand: formData.stand,
            location: formData.location
          }
        })

      onCompanyAdded?.(newCompany)
      
      // Reset and close
      resetForm()
      setIsOpen(false)
      
    } catch (error) {
      console.error('Error saving company:', error)
      alert('שגיאה בשמירת החברה')
    }
    
    setSaving(false)
  }

  const resetForm = () => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedCompany(null)
    setManualEntry(false)
    setFormData({
      company: '',
      location: '',
      hall: '',
      stand: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      contact_person: ''
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    resetForm()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        <Plus className="w-5 h-5" />
        הוסף חברה חדשה
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}>
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">הוסף חברה חדשה</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {!selectedCompany && !manualEntry && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">איך תרצה להוסיף את החברה?</h3>
                <p className="text-gray-600 mb-6">חפש באתר K-Show או הוסף ידנית</p>
              </div>

              {/* K-Show Search */}
              <div className="border rounded-lg p-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  חיפוש באתר K-Show
                </h4>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="שם החברה..."
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && searchKShow()}
                  />
                  <button
                    onClick={searchKShow}
                    disabled={searching || !searchTerm.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {searching ? '🔍 מחפש...' : 'חפש'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-medium">תוצאות חיפוש:</h5>
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => selectCompanyFromSearch(result)}
                        className="w-full text-right p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300"
                      >
                        <div className="font-medium">{result.company}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          📍 {result.location} • 🏢 {result.hall}/{result.stand}
                        </div>
                        {result.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {result.description.length > 100 ? result.description.slice(0, 100) + '...' : result.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Entry */}
              <div className="border rounded-lg p-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  הזנה ידנית
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  אם לא מצאת את החברה בחיפוש, תוכל להוסיף אותה ידנית
                </p>
                <button
                  onClick={() => setManualEntry(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
                >
                  📝 הוסף ידנית
                </button>
              </div>
            </div>
          )}

          {(selectedCompany || manualEntry) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {selectedCompany ? 'פרטי החברה מK-Show' : 'הזנה ידנית'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  חזור לחיפוש
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">שם החברה *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">מיקום/מדינה</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">איש קשר</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">אולם</label>
                  <input
                    type="text"
                    value={formData.hall}
                    onChange={(e) => setFormData(prev => ({ ...prev, hall: e.target.value }))}
                    placeholder="Hall 8a"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">דוכן</label>
                  <input
                    type="text"
                    value={formData.stand}
                    onChange={(e) => setFormData(prev => ({ ...prev, stand: e.target.value }))}
                    placeholder="B40"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">אימייל</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">טלפון</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">אתר אינטרנט</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">תיאור החברה</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveCompany}
                  disabled={saving || !formData.company.trim()}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? '⏳ שומר...' : '💾 שמור חברה'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
