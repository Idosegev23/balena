'use client'

import { useState, useEffect, useRef } from 'react'
import { Company, supabase } from '@/lib/supabase'
import { X, Star, MapPin, Phone, Mail, Globe, Building2, Users, Calendar, FileText, Camera, Bookmark, ArrowLeft, Info, Lightbulb, Target, CheckSquare } from 'lucide-react'
import { VisitTracker } from './VisitTracker'
import { BusinessCardScanner } from './BusinessCardScanner'
import { NotesAndPhotos } from './NotesAndPhotos'
import { FollowUpInterface } from './FollowUpInterface'
import { AdvancedPlanningModals } from './AdvancedPlanningModals'

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
  const [activePlanningModal, setActivePlanningModal] = useState<'timing' | 'route' | 'team' | 'questions' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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

  const isEnglishText = (text: string) => {
    if (!text) return false
    // Check if text contains more Latin characters than Hebrew characters
    const latinChars = text.match(/[a-zA-Z]/g) || []
    const hebrewChars = text.match(/[\u0590-\u05FF]/g) || []
    return latinChars.length > hebrewChars.length && latinChars.length > 10
  }

  useEffect(() => {
    if (company) {
      // Extract hall and stand from location if they're not separate
      let hall = company.hall
      let stand = company.stand
      
      if (!hall || !stand) {
        // Try to parse location like "Hall 6 / A39" or "Hall 8a / F10"
        const locationMatch = company.location?.match(/Hall\s*(\w+)\s*\/\s*(\w+)/i)
        if (locationMatch) {
          hall = hall || `Hall ${locationMatch[1]}`
          stand = stand || locationMatch[2]
        }
      }

      setEditedCompany({
        ...company,
        hall,
        stand,
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

      setMessage('✅ Company updated successfully!')
      setIsEditing(false)
      onUpdate()
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      setMessage('❌ Error saving. Please try again.')
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
      className="fixed inset-0 bg-black/50 z-50 flex md:items-center md:justify-center md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-modal-title"
      aria-describedby="company-modal-content"
    >
      <div
        className="bg-white w-full h-full md:max-w-4xl md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-3 p-4 border-b" style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)`, paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          {/* Top Row - Company Name & Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Building2 className="w-6 h-6 text-white flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 id="company-modal-title" className="text-lg font-bold text-white truncate">{company.company}</h2>
                <p className="text-white/80 text-sm truncate">{company.location}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg text-white flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Bottom Row - Priority & Score */}
          <div className="flex items-center gap-2 justify-center">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[company.visit_priority || 'LOW']}`}>
              {company.visit_priority === 'MUST_VISIT' ? 'Must Visit' : 
               company.visit_priority === 'HIGH' ? 'High Priority' :
               company.visit_priority === 'MEDIUM' ? 'Medium Priority' :
               company.visit_priority === 'LOW' ? 'Low Priority' : 'Monitor Only'}
            </div>
            {company.relevance_score && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white">
                <Star className="w-3 h-3" />
                <span className="font-bold text-sm">{company.relevance_score}/100</span>
              </div>
            )}
            {company.hall && company.stand && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white">
                <Building2 className="w-3 h-3" />
                <span className="text-sm font-bold">{company.hall}/{company.stand}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - With Current Tab Title */}
        <div className="border-b bg-white">
          {/* Current Tab Title with Back Button */}
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center">
            <button
              onClick={() => {
                // Use browser history for proper back navigation
                window.history.back()
              }}
              className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
              style={{ color: 'var(--balena-dark)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h3 className="flex-1 text-base font-bold text-center" style={{ color: 'var(--balena-dark)' }}>
              {activeTab === 'info' && (
                <div className="flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>Company Details</span>
                </div>
              )}
              {activeTab === 'value' && (
                <div className="flex items-center justify-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Value for Balena</span>
                </div>
              )}
              {activeTab === 'visit' && (
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Visit Planning</span>
                </div>
              )}
              {activeTab === 'notes' && (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Notes</span>
                </div>
              )}
              {activeTab === 'follow' && (
                <div className="flex items-center justify-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  <span>Follow-up</span>
                </div>
              )}
            </h3>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          {/* Tab Buttons */}
          <div className="flex overflow-x-auto hide-scrollbar">
            <button
              onClick={() => { setActiveTab('info'); setIsEditing(false); }}
              className={`flex-1 min-w-0 px-4 py-3 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'info' ? 'bg-blue-50 border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{ borderColor: activeTab === 'info' ? 'var(--balena-dark)' : 'transparent' }}
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTab('value'); setIsEditing(false); }}
              className={`flex-1 min-w-0 px-4 py-3 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'value' ? 'bg-blue-50 border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{ borderColor: activeTab === 'value' ? 'var(--balena-dark)' : 'transparent' }}
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTab('visit'); setIsEditing(false); }}
              className={`flex-1 min-w-0 px-4 py-3 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'visit' ? 'bg-blue-50 border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{ borderColor: activeTab === 'visit' ? 'var(--balena-dark)' : 'transparent' }}
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTab('notes'); setIsEditing(false); }}
              className={`flex-1 min-w-0 px-4 py-3 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'notes' ? 'bg-blue-50 border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{ borderColor: activeTab === 'notes' ? 'var(--balena-dark)' : 'transparent' }}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTab('follow'); setIsEditing(false); }}
              className={`flex-1 min-w-0 px-4 py-3 text-center font-medium transition-colors flex items-center justify-center ${
                activeTab === 'follow' ? 'bg-blue-50 border-b-2 text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{ borderColor: activeTab === 'follow' ? 'var(--balena-dark)' : 'transparent' }}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div id="company-modal-content" className="flex-1 p-4 md:p-6 overflow-y-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Edit Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                  Company Details
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isEditing ? '❌ Cancel' : '✏️ Edit'}
                </button>
              </div>

              {/* Company Info Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="p-4 border rounded-xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Company Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full p-3 border rounded-lg text-base text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  ) : (
                    <div 
                      className={`text-base font-semibold ${
                        isEnglishText(editedCompany.company || '') ? 'text-left' : 'text-right'
                      }`} 
                      style={{ color: 'var(--balena-dark)' }}
                    >
                      {editedCompany.company || '—'}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Location</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  ) : (
                    <div 
                      className={`text-sm ${
                        isEnglishText(editedCompany.location || '') ? 'text-left' : 'text-right'
                      }`}
                    >
                      {editedCompany.location || '—'}
                    </div>
                  )}
                </div>

                {/* Hall - Highlighted for Navigation */}
                <div className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50 shadow-sm">
                  <div className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Hall
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.hall || ''}
                      onChange={(e) => handleInputChange('hall', e.target.value)}
                      className="w-full p-3 border rounded-lg text-base text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      placeholder="Hall 8a"
                    />
                  ) : (
                    <div className="text-lg font-bold text-right text-blue-700">
                      {editedCompany.hall || '—'}
                    </div>
                  )}
                </div>

                {/* Stand - Highlighted for Navigation */}
                <div className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50 shadow-sm">
                  <div className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Stand
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.stand || ''}
                      onChange={(e) => handleInputChange('stand', e.target.value)}
                      className="w-full p-3 border rounded-lg text-base text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      placeholder="B40"
                    />
                  ) : (
                    <div className="text-lg font-bold text-right text-blue-700">
                      {editedCompany.stand || '—'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedCompany.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      autoComplete="email"
                    />
                  ) : (
                    <div className="text-sm text-right">
                      {editedCompany.email ? (
                        <a href={`mailto:${editedCompany.email}`} className="text-blue-600 hover:underline">
                          {editedCompany.email}
                        </a>
                      ) : company.website_emails ? (
                        <div className="space-y-1">
                          {company.website_emails.split(',').slice(0, 2).map((email, idx) => (
                            <div key={idx}>
                              <a href={`mailto:${email.trim()}`} className="text-blue-600 hover:underline text-xs">
                                {email.trim()}
                              </a>
                              <span className="text-gray-400 text-xs ml-1">(website)</span>
                            </div>
                          ))}
                        </div>
                      ) : '—'}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Phone</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedCompany.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      autoComplete="tel"
                    />
                  ) : (
                    <div className="text-sm text-right">
                      {editedCompany.phone ? (
                        <a href={`tel:${editedCompany.phone}`} className="text-blue-600 hover:underline">
                          {editedCompany.phone}
                        </a>
                      ) : company.website_phones ? (
                        <div className="space-y-1">
                          {company.website_phones.split(',').slice(0, 2).map((phone, idx) => (
                            <div key={idx}>
                              <a href={`tel:${phone.trim()}`} className="text-blue-600 hover:underline text-xs">
                                {phone.trim()}
                              </a>
                              <span className="text-gray-400 text-xs ml-1">(website)</span>
                            </div>
                          ))}
                        </div>
                      ) : '—'}
                    </div>
                  )}
                </div>

                {/* Website - Span 2 columns */}
                <div className="col-span-2 p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Website</div>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedCompany.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      autoComplete="url"
                    />
                  ) : (
                    <div className="text-sm text-right">
                      {editedCompany.website ? (
                        <a 
                          href={editedCompany.website.startsWith('http') ? editedCompany.website : `https://${editedCompany.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          {editedCompany.website}
                        </a>
                      ) : '—'}
                    </div>
                  )}
                </div>

                {/* Visit Priority */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Visit Priority</div>
                  {isEditing ? (
                    <select
                      value={editedCompany.visit_priority || 'LOW'}
                      onChange={(e) => handleInputChange('visit_priority', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="MUST_VISIT">Must Visit</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                      <option value="MONITOR_ONLY">Monitor Only</option>
                    </select>
                  ) : (
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityColors[editedCompany.visit_priority || 'LOW']}`}>
                      {editedCompany.visit_priority === 'MUST_VISIT' ? 'Must Visit' : 
                       editedCompany.visit_priority === 'HIGH' ? 'High' :
                       editedCompany.visit_priority === 'MEDIUM' ? 'Medium' :
                       editedCompany.visit_priority === 'LOW' ? 'Low' : 'Monitor Only'}
                    </div>
                  )}
                </div>

                {/* Connection Type */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Connection Type</div>
                  {isEditing ? (
                    <select
                      value={editedCompany.connection_type || 'SUPPLIER'}
                      onChange={(e) => handleInputChange('connection_type', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="SUPPLIER">Supplier</option>
                      <option value="PARTNER">Partner</option>
                      <option value="COMPETITOR">Competitor</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="SERVICE">Service</option>
                      <option value="STRATEGIC">Strategic</option>
                    </select>
                  ) : (
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${connectionColors[editedCompany.connection_type || 'SUPPLIER']}`}>
                      {editedCompany.connection_type === 'SUPPLIER' ? 'Supplier' :
                       editedCompany.connection_type === 'PARTNER' ? 'Partner' :
                       editedCompany.connection_type === 'COMPETITOR' ? 'Competitor' :
                       editedCompany.connection_type === 'CUSTOMER' ? 'Customer' :
                       editedCompany.connection_type === 'SERVICE' ? 'Service' : 'Strategic'}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Department</div>
                  {isEditing ? (
                    <select
                      value={editedCompany.department || 'Commercial'}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="Commercial">Commercial</option>
                      <option value="Operations">Operations</option>
                      <option value="R&D">R&D</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  ) : (
                    <div className="text-sm text-right font-medium">
                      {editedCompany.department || '—'}
                    </div>
                  )}
                </div>

                {/* Where they present */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Where They Present</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCompany.where_they_present || ''}
                      onChange={(e) => handleInputChange('where_they_present', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  ) : (
                    <div className="text-sm text-right">{editedCompany.where_they_present || '—'}</div>
                  )}
                </div>
              </div>

              {/* Company Quick Summary from Scraped Data */}
              {(company.why_relevant || company.description || company.about_us) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--balena-dark)' }}>
                    📋 Company Overview
                  </h3>
                  <div className="space-y-4">
                    
                    {/* Claude Analysis Quick View */}
                    {company.why_relevant && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                        <div className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                          🤖 AI Analysis Summary
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {company.why_relevant.substring(0, 200)}
                          {company.why_relevant.length > 200 ? '...' : ''}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {company.department && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {company.department}
                            </span>
                          )}
                          {company.goal_category && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {company.goal_category}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Description */}
                    {(company.description || company.about_us) && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-1">Company Description</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {(company.description || company.about_us || '').substring(0, 300)}
                          {(company.description || company.about_us || '').length > 300 ? '...' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Contact Information from Scraper */}
              {(company.website_emails || company.website_phones || company.contact_person || company.contact_info) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--balena-dark)' }}>
                    📞 Additional Contact Details (from website)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Contact Person */}
                    {company.contact_person && (
                      <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="text-xs font-medium text-blue-600 mb-1">Contact Person</div>
                        <div className="text-sm font-medium text-blue-800">
                          {company.contact_person}
                        </div>
                      </div>
                    )}

                    {/* Website Emails */}
                    {company.website_emails && (
                      <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                        <div className="text-xs font-medium text-green-600 mb-1">Website Emails</div>
                        <div className="text-sm">
                          {company.website_emails.split(',').map((email, idx) => (
                            <div key={idx} className="mb-1">
                              <a href={`mailto:${email.trim()}`} className="text-green-700 hover:underline text-sm">
                                {email.trim()}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Website Phones */}
                    {company.website_phones && (
                      <div className="p-3 border rounded-lg bg-purple-50 border-purple-200">
                        <div className="text-xs font-medium text-purple-600 mb-1">Website Phones</div>
                        <div className="text-sm">
                          {company.website_phones.split(',').map((phone, idx) => (
                            <div key={idx} className="mb-1">
                              <a href={`tel:${phone.trim()}`} className="text-purple-700 hover:underline text-sm">
                                {phone.trim()}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Website Contact Info */}
                    {company.contact_info && (
                      <div className="col-span-full p-3 border rounded-lg bg-gray-50">
                        <div className="text-xs font-medium text-gray-600 mb-1">Contact Information</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {company.contact_info.substring(0, 300)}
                          {company.contact_info.length > 300 ? '...' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Website Information */}
              {(company.website_title || company.meta_description) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--balena-dark)' }}>
                    🌐 Website Information
                  </h3>
                  <div className="space-y-4">
                    
                    {company.website_title && (
                      <div className="p-3 border rounded-lg bg-indigo-50 border-indigo-200">
                        <div className="text-xs font-medium text-indigo-600 mb-1">Website Title</div>
                        <div className="text-sm font-medium text-indigo-800">
                          {company.website_title}
                        </div>
                      </div>
                    )}

                    {company.meta_description && (
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="text-xs font-medium text-gray-600 mb-1">Meta Description</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {company.meta_description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'value' && (
            <div className="space-y-6">
              {/* Claude AI Analysis */}
              {company.why_relevant && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    🤖 Claude AI Analysis
                  </h3>
                  <div 
                    className={`text-base leading-7 whitespace-pre-wrap ${
                      isEnglishText(company.why_relevant) ? 'text-left' : 'text-right'
                    }`} 
                    style={{ color: 'var(--balena-dark)' }}
                  >
                    {company.why_relevant}
                  </div>
                  
                  {/* Department & Category Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {company.department && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        🏢 {company.department}
                      </span>
                    )}
                    {company.goal_category && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        🎯 {company.goal_category}
                      </span>
                    )}
                    {company.relevance_score && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        ⭐ {company.relevance_score}/100
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Company Description */}
              {company.description && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Company Description</h3>
                  <div 
                    className={`text-base leading-7 whitespace-pre-wrap ${
                      isEnglishText(company.description) ? 'text-left' : 'text-right'
                    }`} 
                    style={{ color: 'var(--balena-dark)' }}
                  >
                    {company.description}
                  </div>
                </div>
              )}

              {/* About Us from Website */}
              {company.about_us && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                    🌐 About Company (from website)
                  </h3>
                  <div 
                    className={`text-sm leading-6 whitespace-pre-wrap ${
                      isEnglishText(company.about_us) ? 'text-left' : 'text-right'
                    }`} 
                    style={{ color: 'var(--balena-dark)' }}
                  >
                    {company.about_us.substring(0, 500)}{company.about_us.length > 500 ? '...' : ''}
                  </div>
                </div>
              )}

              {/* Products & Services */}
              {(company.products || company.products_services) && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-sm font-bold text-orange-700 mb-3">🛠️ Products & Services</h3>
                  <div 
                    className={`text-sm leading-6 whitespace-pre-wrap ${
                      isEnglishText(company.products || company.products_services || '') ? 'text-left' : 'text-right'
                    }`} 
                    style={{ color: 'var(--balena-dark)' }}
                  >
                    {(company.products_services || company.products || '').substring(0, 400)}
                    {(company.products_services || company.products || '').length > 400 ? '...' : ''}
                  </div>
                </div>
              )}

              {/* Sustainability Info */}
              {company.sustainability_info && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                    🌱 Sustainability
                  </h3>
                  <div 
                    className={`text-sm leading-6 whitespace-pre-wrap ${
                      isEnglishText(company.sustainability_info) ? 'text-left' : 'text-right'
                    }`} 
                    style={{ color: 'var(--balena-dark)' }}
                  >
                    {company.sustainability_info.substring(0, 400)}
                    {company.sustainability_info.length > 400 ? '...' : ''}
                  </div>
                </div>
              )}

              {/* Manual Balena Value */}
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-yellow-700 mb-3">✏️ Manual Assessment</h3>
                <div 
                  className={`text-base leading-7 whitespace-pre-wrap ${
                  isEnglishText(editedCompany.balena_value || '') ? 'text-left' : 'text-right'
                }`} 
                style={{ color: 'var(--balena-dark)' }}
              >
                  {editedCompany.balena_value || 'No manual assessment yet - add your insights about value for Balena'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visit' && (
            <div className="space-y-6">
              {/* Visit Tracking */}
              <VisitTracker company={company} />
              
              {/* Advanced Planning Features */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--balena-dark)' }}>
                  Advanced Planning
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button 
                    onClick={() => setActivePlanningModal('timing')}
                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left border border-blue-200"
                  >
                    <div className="font-medium text-sm mb-1 text-blue-700">📅 Optimal Timing</div>
                    <div className="text-xs text-blue-600">
                      Best time: {company.hall ? `${company.hall} - Morning (9-11 AM)` : 'Morning (9-11 AM)'}
                  </div>
                    <div className="text-xs text-blue-500 mt-1">Low crowd density expected</div>
                  </button>
                  <button 
                    onClick={() => setActivePlanningModal('route')}
                    className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left border border-green-200"
                  >
                    <div className="font-medium text-sm mb-1 text-green-700">🗺️ Smart Route</div>
                    <div className="text-xs text-green-600">
                      {company.hall ? `${company.hall} nearby booths: 3 companies` : 'Find nearby companies'}
                  </div>
                    <div className="text-xs text-green-500 mt-1">Optimize your route</div>
                  </button>
                  <button 
                    onClick={() => setActivePlanningModal('team')}
                    className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left border border-purple-200"
                  >
                    <div className="font-medium text-sm mb-1 text-purple-700">👥 Team Coordination</div>
                    <div className="text-xs text-purple-600">Share with team members</div>
                    <div className="text-xs text-purple-500 mt-1">Coordinate visit timing</div>
                  </button>
                  <button 
                    onClick={() => setActivePlanningModal('questions')}
                    className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left border border-orange-200"
                  >
                    <div className="font-medium text-sm mb-1 text-orange-700">📋 Prepared Questions</div>
                    <div className="text-xs text-orange-600">
                      {company.department ? `${company.department} focused questions` : 'General questions'}
                  </div>
                    <div className="text-xs text-orange-500 mt-1">Customized checklist ready</div>
                  </button>
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
                  Business Cards
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

        {/* Footer - Mobile Optimized */}
        {(isEditing || message) && (
          <div className="border-t bg-white" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            {message && (
              <div className="p-4 text-center text-sm font-medium" style={{ color: 'var(--balena-dark)' }}>
                {message}
              </div>
            )}
            {isEditing && (
              <div className="flex gap-3 p-4">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex-1 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
                  style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg text-white font-medium hover:shadow-lg disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}
                >
                  {loading ? '⏳ Saving...' : '💾 Save'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Planning Modals */}
      <AdvancedPlanningModals
        company={company}
        activeModal={activePlanningModal}
        onClose={() => setActivePlanningModal(null)}
      />
    </div>
  )
}
