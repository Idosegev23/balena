'use client'

import { useState, useEffect, useRef } from 'react'
import { Company, supabase } from '@/lib/supabase'
import { X, Star, MapPin, Phone, Mail, Globe, Building2, Users, Calendar, FileText, Camera, Bookmark, ArrowLeft, Info, Lightbulb, Target, CheckSquare } from 'lucide-react'
import { VisitTracker } from './VisitTracker'
import { NotesAndPhotos } from './NotesAndPhotos'
import { FollowUpInterface } from './FollowUpInterface'
import { AdvancedPlanningModals } from './AdvancedPlanningModals'
import { LogoUploader, LogoDisplay } from './LogoUploader'

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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})
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

  const toggleExpanded = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  // Helper function to check if data exists and is meaningful
  const hasValidData = (value: string | undefined | null): boolean => {
    return Boolean(value && value.trim() !== '' && value.trim() !== 'null' && value.trim() !== 'undefined' && value !== 'Skip to main content')
  }

  const renderExpandableText = (text: string | undefined | null, sectionKey: string, maxLength: number = 500) => {
    if (!hasValidData(text)) {
      return <div className="text-gray-400 italic text-sm">Information not available</div>
    }
    
    const cleanText = text!.trim()
    const isExpanded = expandedSections[sectionKey]
    const shouldTruncate = cleanText.length > maxLength
    const displayText = shouldTruncate && !isExpanded ? cleanText.substring(0, maxLength) : cleanText
    
    return (
      <div>
        <div 
          className={`leading-6 whitespace-pre-wrap ${
            'text-left'
          }`} 
          style={{ color: 'var(--balena-dark)' }}
        >
          {displayText}
          {shouldTruncate && !isExpanded && '...'}
        </div>
        {shouldTruncate && (
          <button
            onClick={() => toggleExpanded(sectionKey)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more...'}
          </button>
        )}
      </div>
    )
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
        description: sanitizeText(company.description || '')
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
          goal_category: editedCompany.goal_category,
          tags: editedCompany.tags, // ✅ הוספתי את התגיות!
          // Enhanced fields from scraping
          detailed_address: editedCompany.detailed_address,
          sales_volume: editedCompany.sales_volume,
          export_content: editedCompany.export_content,
          employees_count: editedCompany.employees_count,
          foundation_year: editedCompany.foundation_year,
          target_groups: editedCompany.target_groups,
          company_description: editedCompany.company_description,
          main_email: editedCompany.main_email,
          main_phone: editedCompany.main_phone,
          main_website: editedCompany.main_website,
          contact_person: editedCompany.contact_person,
          contact_info: editedCompany.contact_info,
          website_emails: editedCompany.website_emails,
          website_phones: editedCompany.website_phones,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)

      if (error) throw error

      setMessage('✅ Company updated successfully!')
      setIsEditing(false)
      onUpdate()
      // Refresh the edited company state
      setEditedCompany({ ...editedCompany })
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
    const nextValue = (field === 'description') ? sanitizeText(value) : value
    setEditedCompany(prev => prev ? { ...prev, [field]: nextValue as any } : null)
  }

  const priorityColors = {
    'MUST_VISIT': 'bg-red-100 text-red-800 border-red-200',
    'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'LOW': 'bg-gray-100 text-gray-800 border-gray-200',
    'MONITOR_ONLY': 'bg-blue-100 text-blue-800 border-blue-200'
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
              {company.logo ? (
                <LogoDisplay company={company} size="md" className="flex-shrink-0 border border-white/20" />
              ) : (
              <Building2 className="w-6 h-6 text-white flex-shrink-0" />
              )}
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
          
          {/* Bottom Row - Priority & Key Info */}
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {/* Visit Priority */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[company.visit_priority || 'LOW']}`}>
              {company.visit_priority === 'MUST_VISIT' ? 'Must Visit' : 
               company.visit_priority === 'HIGH' ? 'High Priority' :
               company.visit_priority === 'MEDIUM' ? 'Medium Priority' :
               company.visit_priority === 'LOW' ? 'Low Priority' : 'Monitor Only'}
            </div>
            
            {/* Relevance Score */}
            {company.relevance_score && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white">
                <Star className="w-3 h-3" />
                <span className="font-bold text-sm">{company.relevance_score}/100</span>
              </div>
            )}
            
            {/* Hall & Stand Info */}
            {(hasValidData(company?.hall) || hasValidData(company?.stand)) && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white">
                <Building2 className="w-3 h-3" />
                <span className="text-sm font-bold">
                  {hasValidData(company?.hall) && hasValidData(company?.stand) ? `Hall ${company.hall} / ${company.stand}` : 
                   hasValidData(company?.hall) ? `Hall ${company.hall}` : 
                   hasValidData(company?.stand) ? `Stand ${company.stand}` : ''}
                </span>
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
                // Close modal and return to company list instead of dashboard
                onClose()
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
            <div className="space-y-6">
              {/* Quick Summary Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  ⚡ Quick Overview
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    {hasValidData(company?.hall) || hasValidData(company?.stand) ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-blue-600" />
                        <span className="font-medium">Location:</span>
                        <span>
                          {hasValidData(company?.hall) && hasValidData(company?.stand) ? `Hall ${company.hall}, Stand ${company.stand}` : 
                           hasValidData(company?.hall) ? `Hall ${company.hall}` : 
                           hasValidData(company?.stand) ? `Stand ${company.stand}` : 'Not specified'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Building2 size={14} />
                        <span>Location: Not specified</span>
                      </div>
                    )}
                    
                    {hasValidData(company?.website) ? (
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-green-600" />
                        <a 
                          href={company?.website?.startsWith('http') ? company.website : `https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Globe size={14} />
                        <span>Website: Not available</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {hasValidData(company?.email) ? (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-green-600" />
                        <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline truncate">
                          {company.email}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail size={14} />
                        <span>Email: Not available</span>
                      </div>
                    )}
                    
                    {hasValidData(company?.phone) ? (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-purple-600" />
                        <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                          {company.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={14} />
                        <span>Phone: Not available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                  Company Details
                </h3>
                <div className="flex gap-2">
                  {isEditing && (
                <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? '💾 Saving...' : '💾 Save'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setEditedCompany(company) // Reset changes
                        setIsEditing(false)
                      } else {
                        setIsEditing(true)
                      }
                    }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isEditing ? '❌ Cancel' : '✏️ Edit'}
                </button>
                </div>
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
                      className="w-full p-3 border rounded-lg text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  ) : (
                    <div 
                      className={`text-base font-semibold ${
                        isEnglishText(editedCompany.company || '') ? 'text-left' : 'text-left'
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
                      className="w-full p-2 border rounded text-sm text-left focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    />
                  ) : (
                    <div 
                      className={`text-sm ${
                        isEnglishText(editedCompany.location || '') ? 'text-left' : 'text-left'
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
                      className="w-full p-3 border rounded-lg text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      placeholder="Hall 8a"
                    />
                  ) : (
                    <div className="text-lg font-bold text-left text-blue-700">
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
                      className="w-full p-3 border rounded-lg text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      placeholder="B40"
                    />
                  ) : (
                    <div className="text-lg font-bold text-left text-blue-700">
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
                      className="w-full p-2 border rounded text-sm text-left focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      autoComplete="email"
                    />
                  ) : (
                    <div className="text-sm text-left">
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
                      className="w-full p-2 border rounded text-sm text-left focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      autoComplete="tel"
                    />
                  ) : (
                    <div className="text-sm text-left">
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
                      className="w-full p-2 border rounded text-sm text-left focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      autoComplete="url"
                    />
                  ) : (
                    <div className="text-sm text-left">
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
                      className="w-full p-2 border rounded text-sm text-left focus:outline-none focus:ring-1"
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


                {/* Department */}
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs font-medium text-gray-500 mb-1">Department</div>
                  {isEditing ? (
                    <select
                      value={editedCompany.department || 'Commercial'}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-left focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--balena-brown)' }}
                    >
                      <option value="Commercial">Commercial</option>
                      <option value="Operations">Operations</option>
                      <option value="R&D">R&D</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  ) : (
                    <div className="text-sm text-left font-medium">
                      {editedCompany.department || '—'}
                    </div>
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
                        <div className="text-sm text-gray-700">
                          {renderExpandableText(company.why_relevant, 'why_relevant', 200)}
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
                        <div className="text-sm text-gray-700">
                          {renderExpandableText(company.description || company.about_us || '', 'quick_description', 300)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Contact Information */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                      📞 Contact Information
                  </h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                <div className="p-4 bg-gray-50 rounded-xl border">
                  {(() => {
                    const hasEmail = hasValidData(company?.email)
                    const hasMainEmail = hasValidData(company?.main_email)
                    const hasPhone = hasValidData(company?.phone) 
                    const hasMainPhone = hasValidData(company?.main_phone)
                    const hasWebsite = hasValidData(company?.website)
                    const hasMainWebsite = hasValidData(company?.main_website)
                    const hasContactPerson = hasValidData(company?.contact_person)
                    const hasWebsiteEmails = hasValidData(company?.website_emails)
                    const hasWebsitePhones = hasValidData(company?.website_phones)
                    
                    const hasAnyContact = hasEmail || hasMainEmail || hasPhone || hasMainPhone || hasWebsite || hasMainWebsite || hasContactPerson || hasWebsiteEmails || hasWebsitePhones
                    
                    if (!hasAnyContact && !isEditing) {
                      return <div className="text-gray-400 italic">Contact information not available</div>
                    }

                    return (
                      <div className="space-y-3">
                    {/* Contact Person */}
                        {(hasContactPerson || isEditing) && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Users size={18} className="text-blue-600" />
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Contact Person</div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedCompany?.contact_person || ''}
                                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                  placeholder="Contact person name"
                                />
                              ) : (
                                <div className="font-medium">{company?.contact_person || '—'}</div>
                              )}
                        </div>
                      </div>
                    )}

                        {/* Email Section */}
                        {(hasEmail || hasMainEmail || hasWebsiteEmails || isEditing) && (
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <Mail size={18} className="text-green-600 mt-1" />
                            <div className="space-y-2 flex-1">
                              <div className="text-xs text-gray-500">Email</div>
                              
                              {/* Primary Email */}
                              {(hasEmail || isEditing) && (
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Primary:</div>
                                  {isEditing ? (
                                    <input
                                      type="email"
                                      value={editedCompany?.email || ''}
                                      onChange={(e) => handleInputChange('email', e.target.value)}
                                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                      placeholder="email@company.com"
                                    />
                                  ) : hasEmail ? (
                                    <a href={`mailto:${company?.email}`} className="text-green-700 hover:underline block">
                                      {company?.email}
                                    </a>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                        </div>
                              )}

                              {/* Main Email (from scraping) */}
                              {(hasMainEmail || isEditing) && (
                                <div>
                                  <div className="text-xs text-blue-400 mb-1">From website:</div>
                                  {isEditing ? (
                                    <input
                                      type="email"
                                      value={editedCompany?.main_email || ''}
                                      onChange={(e) => handleInputChange('main_email', e.target.value)}
                                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                      placeholder="main@company.com"
                                    />
                                  ) : hasMainEmail ? (
                                    <a href={`mailto:${company?.main_email}`} className="text-green-700 hover:underline block">
                                      {company?.main_email}
                                    </a>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                                </div>
                              )}

                              {/* Additional Emails */}
                              {hasWebsiteEmails && company?.website_emails !== company?.email && company?.website_emails !== company?.main_email && (
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Additional:</div>
                                  <div className="text-sm text-gray-600">{company?.website_emails}</div>
                                </div>
                              )}
                        </div>
                      </div>
                    )}

                        {/* Phone Section */}
                        {(hasPhone || hasMainPhone || hasWebsitePhones || isEditing) && (
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <Phone size={18} className="text-purple-600 mt-1" />
                            <div className="space-y-2 flex-1">
                              <div className="text-xs text-gray-500">Phone</div>
                              
                              {/* Primary Phone */}
                              {(hasPhone || isEditing) && (
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Primary:</div>
                                  {isEditing ? (
                                    <input
                                      type="tel"
                                      value={editedCompany?.phone || ''}
                                      onChange={(e) => handleInputChange('phone', e.target.value)}
                                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                      placeholder="+1 234 567 8900"
                                    />
                                  ) : hasPhone ? (
                                    <a href={`tel:${company?.phone}`} className="text-purple-700 hover:underline block">
                                      {company?.phone}
                                    </a>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                        </div>
                              )}

                              {/* Main Phone (from scraping) */}
                              {(hasMainPhone || isEditing) && (
                                <div>
                                  <div className="text-xs text-blue-400 mb-1">From website:</div>
                                  {isEditing ? (
                                    <input
                                      type="tel"
                                      value={editedCompany?.main_phone || ''}
                                      onChange={(e) => handleInputChange('main_phone', e.target.value)}
                                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                      placeholder="+1 234 567 8900"
                                    />
                                  ) : hasMainPhone ? (
                                    <a href={`tel:${company?.main_phone}`} className="text-purple-700 hover:underline block">
                                      {company?.main_phone}
                                    </a>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                            </div>
                              )}

                              {/* Additional Phones */}
                              {hasWebsitePhones && company?.website_phones !== company?.phone && company?.website_phones !== company?.main_phone && (
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Additional:</div>
                                  <div className="text-sm text-gray-600">{company?.website_phones}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                        {/* Website Section */}
                        {(hasWebsite || hasMainWebsite || isEditing) && (
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <Globe size={18} className="text-blue-600 mt-1" />
                            <div className="space-y-2 flex-1">
                              <div className="text-xs text-gray-500">Website</div>
                              
                              {/* Primary Website */}
                              {(hasWebsite || isEditing) && (
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Primary:</div>
                                  {isEditing ? (
                                    <input
                                      type="url"
                                      value={editedCompany?.website || ''}
                                      onChange={(e) => handleInputChange('website', e.target.value)}
                                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                      placeholder="https://company.com"
                                    />
                                  ) : hasWebsite ? (
                                    <a 
                                      href={company?.website?.startsWith('http') ? company.website : `https://${company.website}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:underline block break-all"
                                    >
                                      {company?.website}
                                    </a>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                        </div>
                              )}

                              {/* Main Website (from scraping) */}
                              {(hasMainWebsite || isEditing) && (
                                <div>
                                  <div className="text-xs text-blue-400 mb-1">From website:</div>
                                  {isEditing ? (
                                    <input
                                      type="url"
                                      value={editedCompany?.main_website || ''}
                                      onChange={(e) => handleInputChange('main_website', e.target.value)}
                                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                                      placeholder="https://main-site.com"
                                    />
                                  ) : hasMainWebsite ? (
                                    <a 
                                      href={company?.main_website?.startsWith('http') ? company.main_website : `https://${company.main_website}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:underline block break-all"
                                    >
                                      {company?.main_website}
                                    </a>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                                </div>
                              )}
                        </div>
                      </div>
                    )}

                        {/* Additional Contact Info */}
                        {(hasValidData(company?.contact_info) || isEditing) && (
                          <div className="p-3 bg-white rounded-lg">
                            <div className="text-xs text-gray-500 mb-2">Additional Information</div>
                            {isEditing ? (
                              <textarea
                                value={editedCompany?.contact_info || ''}
                                onChange={(e) => handleInputChange('contact_info', e.target.value)}
                                className="w-full p-3 border rounded text-sm focus:outline-none focus:ring-1"
                                rows={3}
                                placeholder="Additional contact information..."
                              />
                            ) : (
                              <div className="text-sm">
                                {hasValidData(company?.contact_info) ? renderExpandableText(company.contact_info, 'contact_info', 200) : '—'}
                        </div>
                            )}
                            </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Business Data - Enhanced from Scraping */}
              {(hasValidData(company?.detailed_address) || hasValidData(company?.sales_volume) || hasValidData(company?.export_content) || hasValidData(company?.employees_count) || hasValidData(company?.foundation_year) || hasValidData(company?.target_groups) || isEditing) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--balena-dark)' }}>
                    🏢 Business Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Detailed Address */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin size={12} />
                        Address
                        </div>
                      {isEditing ? (
                        <textarea
                          value={editedCompany?.detailed_address || ''}
                          onChange={(e) => handleInputChange('detailed_address', e.target.value)}
                          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                          rows={2}
                          placeholder="Company address..."
                        />
                      ) : (
                        <div className="text-sm text-gray-700">
                          {hasValidData(company?.detailed_address) ? company.detailed_address : '—'}
                            </div>
                          )}
                        </div>

                    {/* Foundation Year */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        Founded
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCompany?.foundation_year || ''}
                          onChange={(e) => handleInputChange('foundation_year', e.target.value)}
                          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                          placeholder="1995"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-blue-700">
                          {hasValidData(company?.foundation_year) ? company.foundation_year : '—'}
                      </div>
                    )}
                    </div>

                    {/* Employees Count */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                        <Users size={12} />
                        Employees
                        </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCompany?.employees_count || ''}
                          onChange={(e) => handleInputChange('employees_count', e.target.value)}
                          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                          placeholder="101-500"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-green-700">
                          {hasValidData(company?.employees_count) ? company.employees_count : '—'}
                        </div>
                      )}
                    </div>

                    {/* Sales Volume */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-xs font-medium text-yellow-600 mb-1">💰 Sales Volume</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCompany?.sales_volume || ''}
                          onChange={(e) => handleInputChange('sales_volume', e.target.value)}
                          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                          placeholder="5 - 20 Mill. US $"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-yellow-700">
                          {hasValidData(company?.sales_volume) ? company.sales_volume : '—'}
                      </div>
                    )}
                  </div>

                    {/* Export Content */}
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-medium text-purple-600 mb-1">🌍 Export %</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCompany?.export_content || ''}
                          onChange={(e) => handleInputChange('export_content', e.target.value)}
                          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                          placeholder="max. 10%"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-purple-700">
                          {hasValidData(company?.export_content) ? company.export_content : '—'}
                      </div>
                    )}
                    </div>

                    {/* Target Groups */}
                    <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <Target size={12} />
                        Target Groups
                        </div>
                      {isEditing ? (
                        <textarea
                          value={editedCompany?.target_groups || ''}
                          onChange={(e) => handleInputChange('target_groups', e.target.value)}
                          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1"
                          rows={2}
                          placeholder="Target customer groups..."
                        />
                      ) : (
                        <div className="text-sm text-gray-700">
                          {hasValidData(company?.target_groups) ? renderExpandableText(company.target_groups, 'target_groups', 150) : '—'}
                        </div>
                      )}
                    </div>

                    {/* Company Description (from scraping) */}
                    {(hasValidData(company?.company_description) || isEditing) && (
                      <div className="p-3 bg-blue-50 rounded-lg sm:col-span-2 lg:col-span-3 border border-blue-200">
                        <div className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
                          <FileText size={12} />
                          Company Description (Scraped)
                        </div>
                        {isEditing ? (
                          <textarea
                            value={editedCompany?.company_description || ''}
                            onChange={(e) => handleInputChange('company_description', e.target.value)}
                            className="w-full p-3 border rounded text-sm focus:outline-none focus:ring-1"
                            rows={3}
                            placeholder="Detailed company description..."
                          />
                        ) : (
                          <div className="text-sm text-blue-800">
                            {hasValidData(company?.company_description) ? renderExpandableText(company.company_description, 'company_description_scraped', 400) : '—'}
                          </div>
                        )}
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
                      isEnglishText(company.why_relevant) ? 'text-left' : 'text-left'
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

              {/* Company Information Sections */}
              <div className="space-y-4">
                {/* Primary Description - Show the best available description */}
                {(hasValidData(company?.about_us) || hasValidData(company?.description)) && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                      🏢 About the Company
                    </h3>
                    <div className="text-sm">
                      {renderExpandableText(
                        hasValidData(company?.about_us) ? company?.about_us : company?.description, 
                        'main_description', 
                        400
                      )}
                    </div>
                    {hasValidData(company?.about_us) && hasValidData(company?.description) && company?.about_us !== company?.description && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-xs text-blue-600 mb-2">Additional system information:</div>
                        <div className="text-sm">
                          {renderExpandableText(company.description, 'additional_description', 300)}
                  </div>
                </div>
              )}
                </div>
              )}

              {/* Products & Services */}
                {(hasValidData(company?.products) || hasValidData(company?.products_services)) && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                    🛠️ Products & Services
                  </h3>
                    <div className="text-sm">
                      {renderExpandableText(
                        hasValidData(company?.products_services) ? company?.products_services : company?.products, 
                        'products', 
                        400
                      )}
                  </div>
                </div>
              )}


              {/* Sustainability Info */}
                {hasValidData(company?.sustainability_info) && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                    🌱 Sustainability
                  </h3>
                    <div className="text-sm">
                      {renderExpandableText(company.sustainability_info, 'sustainability_info', 300)}
                  </div>
                </div>
              )}
              </div>


              {/* Company Logo Management */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                  🖼️ Company Logo
                </h3>
                <LogoUploader 
                  company={company} 
                  onLogoUpdated={(logoUrl) => {
                    setEditedCompany(prev => prev ? { ...prev, logo: logoUrl || undefined } : null)
                    onUpdate() // Refresh parent component
                  }}
                />
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
