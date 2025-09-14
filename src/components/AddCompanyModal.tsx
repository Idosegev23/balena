'use client'

import { useState } from 'react'
import { X, Building2, MapPin, Phone, Mail, Globe, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
    visit_priority: 'MEDIUM' as 'MUST_VISIT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MONITOR_ONLY',
    connection_type: 'SUPPLIER' as 'SUPPLIER' | 'PARTNER' | 'COMPETITOR' | 'CUSTOMER' | 'SERVICE' | 'STRATEGIC'
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
      visit_priority: 'MEDIUM',
      connection_type: 'SUPPLIER'
    })
    setMessage('')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://company.com"
            />
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

          {/* Department & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Commercial">Commercial</option>
                <option value="Operations">Operations</option>
                <option value="R&D">R&D</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
                Priority
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

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--balena-dark)' }}>
              Connection Type
            </label>
            <select
              value={formData.connection_type}
              onChange={(e) => handleInputChange('connection_type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SUPPLIER">Supplier</option>
              <option value="PARTNER">Partner</option>
              <option value="COMPETITOR">Competitor</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SERVICE">Service</option>
              <option value="STRATEGIC">Strategic</option>
            </select>
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
