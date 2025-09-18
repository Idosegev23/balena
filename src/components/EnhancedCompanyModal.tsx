'use client'

import React, { useState, useEffect } from 'react'
import { Company, supabase } from '@/lib/supabase'
import { 
  X, Star, MapPin, Phone, Mail, Globe, Building2, Users, Calendar, 
  FileText, Camera, Bookmark, Info, Lightbulb, Target, CheckSquare,
  Edit3, Save, ExternalLink, User, Building, DollarSign, Briefcase,
  Award, Factory, TrendingUp, Clock, MessageCircle, ChevronDown,
  ChevronUp, Eye, Heart, AlertCircle, CheckCircle2, CreditCard, Scan
} from 'lucide-react'
import { BusinessCardScanner } from './BusinessCardScanner'
import { NotesTab } from './NotesTab'
import { ShimmerButton } from './ui/shimmer-button'

interface EnhancedCompanyModalProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function EnhancedCompanyModal({ company, isOpen, onClose, onUpdate }: EnhancedCompanyModalProps) {
  const [editedCompany, setEditedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'contact' | 'business' | 'analysis' | 'actions' | 'notes'>('overview')
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})
  const [message, setMessage] = useState('')

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px' // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (company) {
      setEditedCompany(company)
    }
  }, [company])

  if (!isOpen || !company) return null

  // Helper functions
  const hasValidData = (value: any): boolean => {
    if (!value) return false
    if (typeof value === 'string') {
      const cleaned = value.trim()
      return cleaned !== '' && cleaned !== 'Skip to main content' && cleaned !== 'N/A'
    }
    return true
  }

  const toggleExpanded = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleScannedData = async (scannedData: any) => {
    if (!editedCompany) return

    // Auto-fill contact information from scanned business card
    const updatedCompany = { ...editedCompany }
    
    if (scannedData.name && !updatedCompany.contact_person) {
      updatedCompany.contact_person = scannedData.name
    }
    
    if (scannedData.email && !updatedCompany.main_email) {
      updatedCompany.main_email = scannedData.email
    }
    
    if (scannedData.phone && !updatedCompany.main_phone) {
      updatedCompany.main_phone = scannedData.phone
    }
    
    if (scannedData.website && !updatedCompany.main_website) {
      updatedCompany.main_website = scannedData.website
    }

    // Add to contact_persons array if it exists
    if (scannedData.name || scannedData.email || scannedData.phone) {
      const newContact = {
        name: scannedData.name || '',
        title: scannedData.title || '',
        email: scannedData.email || '',
        phone: scannedData.phone || '',
        scanned_from_card: true,
        scanned_at: new Date().toISOString()
      }
      
      const existingContacts = updatedCompany.contact_persons || []
      updatedCompany.contact_persons = [...existingContacts, newContact]
    }

    setEditedCompany(updatedCompany)
    setMessage('Business card scanned successfully! Contact information has been added.')
    
    // Auto-save the scanned data
    try {
      await handleSave(updatedCompany)
    } catch (error) {
      console.error('Error saving scanned data:', error)
      setMessage('Business card scanned but failed to save. Please save manually.')
    }
  }

  const renderExpandableText = (text: string, section: string, maxLength: number = 200) => {
    if (!hasValidData(text)) {
      return <span className="text-gray-400 italic">Information not available</span>
    }
    
    const isExpanded = expandedSections[section]
    const shouldTruncate = text.length > maxLength
    const displayText = shouldTruncate && !isExpanded ? text.substring(0, maxLength) + '...' : text
    
    return (
      <div>
        <p className="text-gray-700 leading-relaxed">{displayText}</p>
        {shouldTruncate && (
          <button
            onClick={() => toggleExpanded(section)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
          >
            {isExpanded ? (
              <span className="flex items-center gap-1">
                <ChevronUp className="h-4 w-4" />
                Show less
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <ChevronDown className="h-4 w-4" />
                Show more
              </span>
            )}
          </button>
        )}
      </div>
    )
  }

  const handleSave = async (companyToSave?: Company) => {
    const targetCompany = companyToSave || editedCompany
    if (!targetCompany) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          main_email: targetCompany.main_email,
          main_phone: targetCompany.main_phone,
          main_website: targetCompany.main_website,
          contact_person: targetCompany.contact_person,
          company_description: targetCompany.company_description,
          about_us: targetCompany.about_us,
          detailed_address: targetCompany.detailed_address,
          visit_priority: targetCompany.visit_priority,
          contact_persons: targetCompany.contact_persons,
          must_visit: targetCompany.must_visit,
          meeting_requested: targetCompany.meeting_requested,
          meeting_scheduled: targetCompany.meeting_scheduled,
          meeting_completed: targetCompany.meeting_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetCompany.id)

      if (error) throw error
      
      setMessage('Company updated successfully')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating company:', error)
      setMessage('Error updating company')
    } finally {
      setLoading(false)
    }
  }

  const getRelevanceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    if (score >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'MUST_VISIT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderClaudeAnalysis = () => {
    if (!company.claude_analysis) return null
    
    let analysis
    try {
      analysis = typeof company.claude_analysis === 'string' 
        ? JSON.parse(company.claude_analysis) 
        : company.claude_analysis
    } catch {
      return null
    }

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">AI Analysis - Why to Meet Them</h3>
        </div>
        
        {analysis.why && (
          <div className="mb-4">
            <h4 className="font-medium text-purple-800 mb-2">Meeting Reason:</h4>
            <p className="text-purple-700 leading-relaxed">{analysis.why}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.department && (
            <div className="bg-white p-3 rounded-md border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Relevant Department</span>
              </div>
              <p className="text-sm text-purple-700">{analysis.department}</p>
            </div>
          )}
          
          {analysis.category && (
            <div className="bg-white p-3 rounded-md border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Category</span>
              </div>
              <p className="text-sm text-purple-700">{analysis.category}</p>
            </div>
          )}
          
          {analysis.score && (
            <div className="bg-white p-3 rounded-md border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Relevance Score</span>
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getRelevanceColor(analysis.score)}`}>
                {analysis.score}/100
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const TabButton = ({ id, label, icon: Icon, isActive }: { id: string, label: string, icon: any, isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-xs sm:text-sm min-w-0 flex-shrink-0 ${
        isActive 
          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
      <span className="text-xs sm:text-sm leading-tight">{id === 'analysis' ? 'AI' : label}</span>
    </button>
  )

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[60]"
      onClick={(e) => {
        // Close modal if clicking on backdrop (not on modal content)
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile-Optimized Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-6 text-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {(company.logo_url || company.logo) ? (
                  <img 
                    src={company.logo_url || company.logo} 
                    alt={`${company.company} logo`}
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain bg-white rounded-lg p-1 sm:p-2 shadow-lg"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      // Show fallback icon
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center" style={{ display: (company.logo_url || company.logo) ? 'none' : 'block' }}>
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 leading-tight">{company.company}</h1>
                <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                  {hasValidData(company.hall) && (
                    <span className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                      🏢 {company.hall}{company.stand && ` / ${company.stand}`}
                    </span>
                  )}
                  {company.relevance_score && (
                    <span className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                      ⭐ <span className="hidden sm:inline">Score: </span>{company.relevance_score}
                    </span>
                  )}
                  {company.visit_priority && (
                    <span className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                      🎯 <span className="hidden sm:inline">{company.visit_priority}</span>
                      <span className="sm:hidden">{company.visit_priority.charAt(0)}</span>
                    </span>
                  )}
                  {hasValidData(company.employees_count) && (
                    <span className="bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                      👥 <span className="hidden sm:inline">{company.employees_count} employees</span>
                      <span className="sm:hidden">{company.employees_count}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1.5 sm:p-2 rounded-lg transition-colors"
                title="Edit company"
              >
                <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1.5 sm:p-2 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Tabs */}
        <div className="bg-gray-50 px-1 sm:px-6 py-2 sm:py-3 border-b">
          <div className="grid grid-cols-7 sm:flex sm:gap-2 gap-1 overflow-x-auto scrollbar-hide scroll-smooth">
            <TabButton id="overview" label="Overview" icon={Eye} isActive={activeTab === 'overview'} />
            <TabButton id="details" label="Details" icon={Building2} isActive={activeTab === 'details'} />
            <TabButton id="contact" label="Contact" icon={Phone} isActive={activeTab === 'contact'} />
            <TabButton id="business" label="Business" icon={Briefcase} isActive={activeTab === 'business'} />
            <TabButton id="analysis" label="AI" icon={Lightbulb} isActive={activeTab === 'analysis'} />
            <TabButton id="notes" label="Notes" icon={FileText} isActive={activeTab === 'notes'} />
            <TabButton id="actions" label="Actions" icon={CheckSquare} isActive={activeTab === 'actions'} />
          </div>
        </div>

        {/* Mobile-Optimized Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh]">
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Company Logo and Basic Info */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {(company.logo_url || company.logo) ? (
                      <img 
                        src={company.logo_url || company.logo} 
                        alt={`${company.company} logo`}
                        className="h-24 w-24 object-contain bg-white rounded-lg p-3 shadow-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{company.company}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hasValidData(company.detailed_address) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{company.detailed_address}</span>
                        </div>
                      )}
                      {hasValidData(company.main_website || company.website) && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <a 
                            href={company.main_website || company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Company Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Relevance</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{company.relevance_score || 'N/A'}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Location</span>
                  </div>
                  <p className="text-lg font-semibold text-green-900">
                    {hasValidData(company.hall) ? `${company.hall}/${company.stand}` : 'TBD'}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Employees</span>
                  </div>
                  <p className="text-lg font-semibold text-purple-900">
                    {company.employees_count || 'Unknown'}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Founded</span>
                  </div>
                  <p className="text-lg font-semibold text-orange-900">
                    {company.foundation_year || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Claude Analysis */}
              {renderClaudeAnalysis()}

              {/* Company Description */}
              {hasValidData(company.company_description || company.about_us || company.description) && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Company Description
                  </h3>
                  {renderExpandableText(
                    company.company_description || company.about_us || company.description || '',
                    'company_description'
                  )}
                </div>
              )}

              {/* Complete Contact Information */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Phone className="h-6 w-6 text-green-600" />
                  Contact Information
                </h3>
                
                {/* Primary Contact */}
                {hasValidData(company.contact_person) && (
                  <div className="mb-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Primary Contact
                    </h4>
                    <p className="text-gray-700">{company.contact_person}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Main Email */}
                  {hasValidData(company.main_email) && (
                    <a 
                      href={`mailto:${company.main_email}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border-l-4 border-green-500"
                    >
                      <Mail className="h-5 w-5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Primary Email</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{company.main_email}</div>
                      </div>
                    </a>
                  )}
                  
                  {/* Main Phone */}
                  {hasValidData(company.main_phone) && (
                    <a 
                      href={`tel:${company.main_phone}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border-l-4 border-blue-500"
                    >
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Primary Phone</div>
                        <div className="text-sm font-medium text-gray-900">{company.main_phone}</div>
                      </div>
                    </a>
                  )}
                  
                  {/* Website */}
                  {hasValidData(company.main_website) && (
                    <a 
                      href={company.main_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border-l-4 border-purple-500"
                    >
                      <Globe className="h-5 w-5 text-purple-600" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Website</div>
                        <div className="text-sm font-medium text-gray-900 truncate">Company Website</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  )}
                </div>
                
                {/* Additional Contact Methods */}
                {(hasValidData(company.website_emails) || hasValidData(company.website_phones)) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Additional Contact Methods</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hasValidData(company.website_emails) && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Other Emails</div>
                          <div className="text-sm text-gray-700">{company.website_emails}</div>
                        </div>
                      )}
                      {hasValidData(company.website_phones) && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Other Phones</div>
                          <div className="text-sm text-gray-700">{company.website_phones}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Company Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <p className="text-gray-900">{company.company}</p>
                  </div>
                  
                  {hasValidData(company.detailed_address) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <p className="text-gray-900">{company.detailed_address}</p>
                    </div>
                  )}
                  
                  {hasValidData(company.website_title) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website Title</label>
                      <p className="text-gray-900">{company.website_title}</p>
                    </div>
                  )}
                  
                  {hasValidData(company.data_source) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                      <p className="text-gray-900">{company.data_source}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Products & Services */}
              {hasValidData(company.products_services || company.products) && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Factory className="h-5 w-5 text-blue-600" />
                    Products and Services
                  </h3>
                  {renderExpandableText(
                    company.products_services || company.products || '',
                    'products_services'
                  )}
                </div>
              )}

              {/* Sustainability */}
              {hasValidData(company.sustainability_info) && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Sustainability Information
                  </h3>
                  {renderExpandableText(company.sustainability_info || '', 'sustainability_info')}
                </div>
              )}

              {/* Target Groups */}
              {hasValidData(company.target_groups) && (
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Target Audiences
                  </h3>
                  <p className="text-gray-700">{company.target_groups}</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Contact */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Primary Contact
                  </h3>
                  <div className="space-y-3">
                    {hasValidData(company.contact_person) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name and Position</label>
                        <p className="text-gray-900">{company.contact_person}</p>
                      </div>
                    )}
                    
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                          <input
                            type="email"
                            value={editedCompany?.main_email || ''}
                            onChange={(e) => setEditedCompany(prev => prev ? {...prev, main_email: e.target.value} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                          <input
                            type="tel"
                            value={editedCompany?.main_phone || ''}
                            onChange={(e) => setEditedCompany(prev => prev ? {...prev, main_phone: e.target.value} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Website</label>
                          <input
                            type="url"
                            value={editedCompany?.main_website || ''}
                            onChange={(e) => setEditedCompany(prev => prev ? {...prev, main_website: e.target.value} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {hasValidData(company.main_email) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <a href={`mailto:${company.main_email}`} className="text-blue-600 hover:underline">
                              {company.main_email}
                            </a>
                          </div>
                        )}
                        
                        {hasValidData(company.main_phone) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <a href={`tel:${company.main_phone}`} className="text-blue-600 hover:underline">
                              {company.main_phone}
                            </a>
                          </div>
                        )}
                        
                        {hasValidData(company.main_website) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Website</label>
                            <a 
                              href={company.main_website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {company.main_website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Contacts */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Additional Contacts
                  </h3>
                  
                  {hasValidData(company.website_emails) && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">Emails from Website</label>
                      <p className="text-gray-900">{company.website_emails}</p>
                    </div>
                  )}
                  
                  {hasValidData(company.website_phones) && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">Phones from Website</label>
                      <p className="text-gray-900">{company.website_phones}</p>
                    </div>
                  )}
                  
                  {hasValidData(company.contact_info) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Contact Info</label>
                      {renderExpandableText(company.contact_info || '', 'contact_info')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Financial Data
                  </h3>
                  <div className="space-y-3">
                    {hasValidData(company.sales_volume) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sales Volume</label>
                        <p className="text-gray-900">{company.sales_volume}</p>
                      </div>
                    )}
                    
                    {hasValidData(company.export_content) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Export Content</label>
                        <p className="text-gray-900">{company.export_content}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    Company Data
                  </h3>
                  <div className="space-y-3">
                    {hasValidData(company.employees_count) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Employees</label>
                        <p className="text-gray-900">{company.employees_count}</p>
                      </div>
                    )}
                    
                    {hasValidData(company.foundation_year) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Foundation Year</label>
                        <p className="text-gray-900">{company.foundation_year}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {renderClaudeAnalysis()}
              
              {hasValidData(company.why_relevant) && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    Why Relevant to Balena
                  </h3>
                  {renderExpandableText(company.why_relevant || '', 'why_relevant')}
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Relevance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getRelevanceColor(company.relevance_score).includes('green') ? 'text-green-600' : 
                      getRelevanceColor(company.relevance_score).includes('yellow') ? 'text-yellow-600' : 
                      getRelevanceColor(company.relevance_score).includes('orange') ? 'text-orange-600' : 'text-red-600'}`}>
                      {company.relevance_score || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Relevance Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${company.priority_score ? 'text-blue-600' : 'text-gray-400'}`}>
                      {company.priority_score || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Priority Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPriorityColor(company.visit_priority).includes('red') ? 'text-red-600' :
                      getPriorityColor(company.visit_priority).includes('orange') ? 'text-orange-600' :
                      getPriorityColor(company.visit_priority).includes('yellow') ? 'text-yellow-600' : 'text-blue-600'}`}>
                      {company.visit_priority || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Visit Priority</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visit Planning */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Visit Planning
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Must Visit</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.must_visit || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, must_visit: e.target.checked} : null)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Meeting Required</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.meeting_requested || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, meeting_requested: e.target.checked} : null)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Meeting Scheduled</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.meeting_scheduled || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, meeting_scheduled: e.target.checked} : null)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Meeting Completed</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.meeting_completed || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, meeting_completed: e.target.checked} : null)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Follow-up Actions */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                    Follow-up Actions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Brochures Collected</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.brochures_collected || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, brochures_collected: e.target.checked} : null)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Samples Requested</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.samples_requested || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, samples_requested: e.target.checked} : null)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Samples Received</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.samples_received || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, samples_received: e.target.checked} : null)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Quotes Requested</span>
                      <input
                        type="checkbox"
                        checked={editedCompany?.quotes_requested || false}
                        onChange={(e) => setEditedCompany(prev => prev ? {...prev, quotes_requested: e.target.checked} : null)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Card Scanner */}
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Business Card Scanner
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan business cards from contacts at this company to automatically add their information.
                  </p>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Scan className="h-4 w-4" />
                    Scan Business Card
                  </button>
                </div>
              </div>

              {/* Priority Selection */}
              {isEditing && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Visit Priority</h3>
                  <select
                    value={editedCompany?.visit_priority || ''}
                    onChange={(e) => setEditedCompany(prev => prev ? {...prev, visit_priority: e.target.value as any} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="MUST_VISIT">Must Visit</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                    <option value="MONITOR_ONLY">Monitor Only</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <NotesTab company={company} onUpdate={onUpdate} />
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <ShimmerButton
              onClick={() => handleSave()}
              disabled={loading}
              className="px-4 py-2 disabled:opacity-50 flex items-center gap-2"
              background="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              shimmerColor="#ffffff"
              shimmerDuration="2s"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save'}
            </ShimmerButton>
          </div>
        )}
      </div>

      {/* Business Card Scanner Modal */}
      {showScanner && (
        <BusinessCardScanner
          onScanComplete={handleScannedData}
          onClose={() => setShowScanner(false)}
          companyName={company.company}
        />
      )}
    </div>
  )
}
