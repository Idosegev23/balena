'use client'

import { useState } from 'react'
import { X, Building2, MapPin, Phone, Mail, Globe, Save, Tag, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Available tags for company categorization
const availableTags = [
  { id: 'supplier', label: 'Supplier', color: 'bg-blue-100 text-blue-800' },
  { id: 'competitor', label: 'Competitor', color: 'bg-red-100 text-red-800' },
  { id: 'partner', label: 'Partner', color: 'bg-green-100 text-green-800' },
  { id: 'customer', label: 'Customer', color: 'bg-purple-100 text-purple-800' },
  { id: 'vendor', label: 'Vendor', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'distributor', label: 'Distributor', color: 'bg-orange-100 text-orange-800' },
  { id: 'manufacturer', label: 'Manufacturer', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'service_provider', label: 'Service Provider', color: 'bg-pink-100 text-pink-800' },
  { id: 'technology', label: 'Technology', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'innovation', label: 'Innovation', color: 'bg-teal-100 text-teal-800' },
  { id: 'rd', label: 'R&D', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'commercial', label: 'Commercial', color: 'bg-sky-100 text-sky-800' },
  { id: 'operations', label: 'Operations', color: 'bg-amber-100 text-amber-800' },
  { id: 'marketing', label: 'Marketing', color: 'bg-rose-100 text-rose-800' },
  { id: 'sustainability', label: 'Sustainability', color: 'bg-lime-100 text-lime-800' },
  { id: 'machinery', label: 'Machinery', color: 'bg-slate-100 text-slate-800' }
]

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCompanyAdded: () => void
}

export function AddCompanyModal({ isOpen, onClose, onCompanyAdded }: AddCompanyModalProps) {
  const [formData, setFormData] = useState({
    company: '',
    location: '',
    hall: '',
    stand: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    department: 'Commercial',
    goal_category: 'R&D',
    visit_priority: 'MEDIUM' as 'MUST_VISIT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MONITOR_ONLY',
    tags: [] as string[],
    logo_url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('companies')
        .insert([{
          ...formData,
          department: formData.department, // Keep for backward compatibility
          relevance_score: 50, // Default score
          source_search_term: 'manual_entry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      setMessage('Company added successfully!')
      setTimeout(() => {
        onCompanyAdded()
        onClose()
        resetForm()
      }, 1500)
    } catch (error) {
      console.error('Error adding company:', error)
      setMessage('Error adding company. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      company: '',
      location: '',
      hall: '',
      stand: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      department: 'Commercial',
      goal_category: 'R&D',
      visit_priority: 'MEDIUM',
      tags: [],
      logo_url: ''
    })
    setMessage('')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // If website field is changed, try to get logo
    if (field === 'website' && value.trim()) {
      fetchWebsiteLogo(value.trim())
    }
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const fetchWebsiteLogo = async (website: string) => {
    try {
      // Normalize website URL
      let url = website
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      
      // Extract domain
      const domain = new URL(url).hostname
      
      // Try multiple favicon sources
      const logoSources = [
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
        `https://${domain}/apple-touch-icon.png`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://logo.clearbit.com/${domain}`
      ]
      
      // Try the first available logo
      for (const logoUrl of logoSources) {
        try {
          const response = await fetch(logoUrl, { method: 'HEAD' })
          if (response.ok) {
            setFormData(prev => ({ ...prev, logo_url: logoUrl }))
            break
          }
        } catch (e) {
          continue
        }
      }
    } catch (error) {
      console.log('Could not fetch logo for website:', website)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" style={{ color: 'var(--balena-blue)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
              Add New Company
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hall 1/A01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                Hall
              </label>
              <input
                type="text"
                value={formData.hall}
                onChange={(e) => handleInputChange('hall', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hall 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                Stand
              </label>
              <input
                type="text"
                value={formData.stand}
                onChange={(e) => handleInputChange('stand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="A01"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="company.com"
              />
              {formData.logo_url && (
                <div className="flex items-center">
                  <img 
                    src={formData.logo_url} 
                    alt="Company logo" 
                    className="w-10 h-10 object-contain border rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the company..."
            />
          </div>

          {/* Goal Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                <span className="text-red-500">*</span> Goal Category
              </label>
              <select
                value={formData.goal_category}
                onChange={(e) => handleInputChange('goal_category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="R&D">R&D - Research & Development</option>
                <option value="Commercial">Commercial - Sales & Business</option>
                <option value="Operations">Operations - Manufacturing</option>
                <option value="Marketing">Marketing - Brand & Strategy</option>
                <option value="Sustainability">Sustainability - Environment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                Visit Priority
              </label>
              <select
                value={formData.visit_priority}
                onChange={(e) => handleInputChange('visit_priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MUST_VISIT">Must Visit</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="MONITOR_ONLY">Monitor Only</option>
              </select>
            </div>
          </div>

          {/* Company Tags */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--balena-dark)' }}>
              <Tag className="w-4 h-4 inline mr-1" />
              Company Tags
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTags.map(tag => {
                const isSelected = formData.tags.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`p-2 border rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? `${tag.color} border-current`
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{tag.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-1 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select relevant tags to help categorize this company
            </p>
          </div>


          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.company.trim()}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Company
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
