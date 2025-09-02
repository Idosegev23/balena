'use client'

import { useState, useEffect, useRef } from 'react'
import { Company, supabase } from '@/lib/supabase'
import { X, Star, MapPin, Phone, Mail, Globe, Building2, Users, Calendar, FileText, Camera, Bookmark } from 'lucide-react'
import { VisitTracker } from './VisitTracker'
import { BusinessCardScanner } from './BusinessCardScanner'
import { NotesAndPhotos } from './NotesAndPhotos'
import { FollowUpInterface } from './FollowUpInterface'

interface CompanyModalProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function CompanyModal({ company, isOpen, onClose, onUpdate }: CompanyModalProps) {
  const [editedCompany, setEditedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'value' | 'visit' | 'notes' | 'follow'>('info')
  const modalRef = useRef<HTMLDivElement>(null)

  const sanitizeText = (html: string) => {
    if (!html) return ''
    try {
      // Preserve line breaks where meaningful
      const normalized = html
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<\s*\/p\s*>/gi, '\n')
        .replace(/<\s*p\s*>/gi, '')
      const el = document.createElement('div')
      el.innerHTML = normalized
      const text = (el.textContent || el.innerText || '')
      return text.replace(/\r?\n\s*\n+/g, '\n\n').replace(/\s+$/g, '').trim()
    } catch {
      // Fallback: strip tags
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    }
  }

  useEffect(() => {
    if (company) {
      setEditedCompany({
        ...company,
        description: sanitizeText(company.description || ''),
        balena_value: sanitizeText(company.balena_value || '')
      })
    }
  }, [company])

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const nodes = modalRef.current?.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')
        if (!nodes || nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first) { e.preventDefault(); last.focus() }
        } else {
          if (active === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = original
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !company || !editedCompany) return null

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          company: editedCompany.company,
          location: editedCompany.location,
          hall: editedCompany.hall,
          stand: editedCompany.stand,
          email: editedCompany.email,
          phone: editedCompany.phone,
          website: editedCompany.website,
          visit_priority: editedCompany.visit_priority,
          department: editedCompany.department,
          balena_value: editedCompany.balena_value,
          connection_type: editedCompany.connection_type,
          where_they_present: editedCompany.where_they_present,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)

      if (error) throw error

      setMessage('✅ החברה עודכנה בהצלחה!')
      onUpdate()
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setMessage('❌ שגיאה בשמירה. נסה שוב.')
      console.error('Error updating company:', error)
    }
    
    setLoading(false)
  }

  const handleInputChange = (field: keyof Company, value: string) => {
    const nextValue = (field === 'description' || field === 'balena_value') ? sanitizeText(value) : value
    setEditedCompany(prev => prev ? { ...prev, [field]: nextValue as any } : null)
  }

  const priorityColors = {
    'MUST_VISIT': 'bg-red-100 text-red-800 border-red-200',
    'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'LOW': 'bg-gray-100 text-gray-800 border-gray-200',
    'MONITOR_ONLY': 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const connectionColors = {
    'SUPPLIER': 'bg-green-100 text-green-800',
    'PARTNER': 'bg-purple-100 text-purple-800',
    'COMPETITOR': 'bg-red-100 text-red-800',
    'CUSTOMER': 'bg-blue-100 text-blue-800',
    'SERVICE': 'bg-yellow-100 text-yellow-800',
    'STRATEGIC': 'bg-pink-100 text-pink-800'
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-modal-title"
      aria-describedby="company-modal-content"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 z-10" style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)`, paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Building2 className="w-8 h-8 text-white" />
            <div>
              <h2 id="company-modal-title" className="text-xl md:text-2xl font-bold text-white truncate max-w-[60vw] md:max-w-none">{company.company}</h2>
              <p className="text-white/80 truncate max-w-[60vw] md:max-w-none">{company.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[company.visit_priority || 'LOW']}`}>
              {company.visit_priority === 'MUST_VISIT' ? 'חובה לבקר' : 
               company.visit_priority === 'HIGH' ? 'גבוהה' :
               company.visit_priority === 'MEDIUM' ? 'בינונית' :
               company.visit_priority === 'LOW' ? 'נמוכה' : 'מעקב בלבד'}
            </div>
            {company.relevance_score && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white">
                <Star className="w-4 h-4" />
                <span className="font-bold">{company.relevance_score}/10</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg text-white"
              aria-label="סגור"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b sticky top-[64px] md:top-[80px] z-10 bg-white">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
              activeTab === 'info' ? 'border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{ borderColor: activeTab === 'info' ? 'var(--balena-dark)' : 'transparent' }}
          >
            📋 פרטי החברה
          </button>
          <button
            onClick={() => setActiveTab('value')}
            className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
              activeTab === 'value' ? 'border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{ borderColor: activeTab === 'value' ? 'var(--balena-dark)' : 'transparent' }}
          >
            💡 ערך לBalena
          </button>
          <button
            onClick={() => setActiveTab('visit')}
            className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
              activeTab === 'visit' ? 'border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{ borderColor: activeTab === 'visit' ? 'var(--balena-dark)' : 'transparent' }}
          >
            🎯 תכנון ביקור
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
              activeTab === 'notes' ? 'border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{ borderColor: activeTab === 'notes' ? 'var(--balena-dark)' : 'transparent' }}
          >
            📝 הערות
          </button>
          <button
            onClick={() => setActiveTab('follow')}
            className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
              activeTab === 'follow' ? 'border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{ borderColor: activeTab === 'follow' ? 'var(--balena-dark)' : 'transparent' }}
          >
            ✅ פולואפ
          </button>
        </div>

        {/* Content */}
        <div id="company-modal-content" className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <details className="bg-white border rounded-lg" open>
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium flex items-center justify-between">פרטי בסיס</summary>
                <div className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">שם החברה</label>
                  <input
                    type="text"
                    value={editedCompany.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--balena-brown)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">מיקום</label>
                  <input
                    type="text"
                    value={editedCompany.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--balena-brown)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">אולם</label>
                  <input
                    type="text"
                    value={editedCompany.hall || ''}
                    onChange={(e) => handleInputChange('hall', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--balena-brown)' }}
                    placeholder="Hall 8a"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">דוכן</label>
                  <input
                    type="text"
                    value={editedCompany.stand || ''}
                    onChange={(e) => handleInputChange('stand', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--balena-brown)' }}
                    placeholder="B40"
                  />
                </div>
                </div>
              </details>

              {/* Contact Info */}
              <details className="bg-white border rounded-lg" open>
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium flex items-center justify-between">פרטי קשר</summary>
                <div className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">אימייל</label>
                    <input
                      type="email"
                      value={editedCompany.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">טלפון</label>
                    <input
                      type="tel"
                      value={editedCompany.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-right">אתר אינטרנט</label>
                    <input
                      type="url"
                      value={editedCompany.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  </div>
                </div>
              </details>

              {/* Classification */}
              <details className="bg-white border rounded-lg" open>
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium flex items-center justify-between">סיווג</summary>
                <div className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">עדיפות ביקור</label>
                    <select
                      value={editedCompany.visit_priority || 'LOW'}
                      onChange={(e) => handleInputChange('visit_priority', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="MUST_VISIT">חובה לבקר</option>
                      <option value="HIGH">גבוהה</option>
                      <option value="MEDIUM">בינונית</option>
                      <option value="LOW">נמוכה</option>
                      <option value="MONITOR_ONLY">מעקב בלבד</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">סוג קשר</label>
                    <select
                      value={editedCompany.connection_type || 'SUPPLIER'}
                      onChange={(e) => handleInputChange('connection_type', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="SUPPLIER">ספק</option>
                      <option value="PARTNER">שותף</option>
                      <option value="COMPETITOR">מתחרה</option>
                      <option value="CUSTOMER">לקוח</option>
                      <option value="SERVICE">שירות</option>
                      <option value="STRATEGIC">אסטרטגי</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">מחלקה</label>
                    <select
                      value={editedCompany.department || 'Commercial'}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="Commercial">Commercial</option>
                      <option value="Operations">Operations</option>
                      <option value="R&D">R&D</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
              </details>

            </div>
          )}

          {activeTab === 'value' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-right" style={{ color: 'var(--balena-dark)' }}>ערך לBalena</label>
                <div className="p-4 border rounded-lg bg-gray-50 text-sm leading-6 whitespace-pre-wrap" style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-dark)' }}>
                  {editedCompany.balena_value || '—'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visit' && (
            <div className="space-y-6">
              {/* Visit Tracking */}
              <VisitTracker company={company} />
              
              {/* Future Features */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--balena-dark)' }}>
                  תכנון מתקדם (בפיתוח)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">📅 תזמון אופטימלי</div>
                    <div className="text-xs text-gray-600">זמן ביקור מומלץ על בסיס צפיפות</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">🗺️ מסלול חכם</div>
                    <div className="text-xs text-gray-600">ניווט מדוכנים קרובים</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">👥 תיאום צוות</div>
                    <div className="text-xs text-gray-600">שיתוף מיקום ותכנון</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">📋 שאלות מוכנות</div>
                    <div className="text-xs text-gray-600">רשימה מותאמת לחברה</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Business Card Scanner */}
              <div className="border-b pb-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  כרטיסי ביקור
                </h3>
                <BusinessCardScanner 
                  companyId={company.id}
                  onCardAdded={() => {
                    // Refresh or show success message
                  }}
                />
              </div>

              {/* Notes and Photos */}
              <NotesAndPhotos companyId={company.id} />
            </div>
          )}

          {activeTab === 'follow' && (
            <div className="space-y-6">
              <FollowUpInterface companyId={company.id} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          {message && (
            <div className="text-sm font-medium">
              {message}
            </div>
          )}
          <div className="flex gap-3 mr-auto">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white font-medium hover:shadow-lg disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}
            >
              {loading ? '⏳ שומר...' : '💾 שמור שינויים'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
