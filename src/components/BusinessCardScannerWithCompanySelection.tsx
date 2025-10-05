'use client'

import React, { useState, useEffect } from 'react'
import { BusinessCardScanner, ScannedData } from './BusinessCardScanner'
import { supabase, Company } from '@/lib/supabase'
import { Search, Building2, X, MapPin } from 'lucide-react'

interface BusinessCardScannerWithCompanySelectionProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete?: (data: ScannedData) => void
}

export function BusinessCardScannerWithCompanySelection({ 
  isOpen, 
  onClose, 
  onScanComplete 
}: BusinessCardScannerWithCompanySelectionProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchCompanies()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(company =>
        company.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.department && company.department.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredCompanies(filtered)
    }
  }, [searchTerm, companies])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('company', { ascending: true })

      if (error) throw error
      setCompanies(data || [])
      setFilteredCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
    setShowScanner(true)
  }

  const handleScanComplete = (data: ScannedData) => {
    setShowScanner(false)
    setSelectedCompany(null)
    setSearchTerm('')
    onScanComplete?.(data)
    onClose()
  }

  const handleScannerClose = () => {
    setShowScanner(false)
    setSelectedCompany(null)
  }

  if (!isOpen) return null

  if (showScanner && selectedCompany) {
    return (
      <BusinessCardScanner
        onScanComplete={handleScanComplete}
        onClose={handleScannerClose}
        companyName={selectedCompany.company}
        companyId={selectedCompany.id}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Scan Business Card</h2>
              <p className="text-sm text-gray-600">Select a company to associate with the business card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No companies found</p>
              {searchTerm && (
                <p className="text-sm mt-1">Try adjusting your search term</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:bg-blue-50 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{company.company}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {company.department && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {company.department}
                          </span>
                        )}
                        {company.hall && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Hall {company.hall}
                          </span>
                        )}
                        {company.location && (
                          <span className="text-gray-500">{company.location}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Select a company to start scanning business cards
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
