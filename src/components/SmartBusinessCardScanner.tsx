'use client'

import React, { useState, useEffect } from 'react'
import { BusinessCardScanner, ScannedData } from './BusinessCardScanner'
import { supabase, Company } from '@/lib/supabase'
import { Search, Building2, X, MapPin, CheckCircle, ArrowRight } from 'lucide-react'

interface SmartBusinessCardScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete?: (data: ScannedData, selectedCompany?: Company) => void
}

interface CompanyMatch {
  company: Company
  similarity: number
  matchReason: string
}

export function SmartBusinessCardScanner({ 
  isOpen, 
  onClose, 
  onScanComplete 
}: SmartBusinessCardScannerProps) {
  const [step, setStep] = useState<'scan' | 'match'>('scan')
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [suggestedMatches, setSuggestedMatches] = useState<CompanyMatch[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

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

  const calculateSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0
    
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
    const norm1 = normalize(text1)
    const norm2 = normalize(text2)
    
    if (norm1 === norm2) return 1
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8
    
    // Simple word matching
    const words1 = norm1.split(/\s+/)
    const words2 = norm2.split(/\s+/)
    const commonWords = words1.filter(word => words2.includes(word))
    
    if (commonWords.length > 0) {
      return commonWords.length / Math.max(words1.length, words2.length)
    }
    
    return 0
  }

  const findMatchingCompanies = (scannedData: ScannedData): CompanyMatch[] => {
    const matches: CompanyMatch[] = []
    
    companies.forEach(company => {
      let maxSimilarity = 0
      let matchReason = ''
      
      // Check company name match
      if (scannedData.company) {
        const similarity = calculateSimilarity(scannedData.company, company.company)
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity
          matchReason = `Company name match: "${scannedData.company}" ↔ "${company.company}"`
        }
      }
      
      // Check if contact person matches any existing contacts
      if (scannedData.name && company.contact_persons) {
        try {
          const contacts = Array.isArray(company.contact_persons) 
            ? company.contact_persons 
            : JSON.parse(company.contact_persons as string)
          
          contacts.forEach((contact: any) => {
            if (contact.name) {
              const similarity = calculateSimilarity(scannedData.name!, contact.name)
              if (similarity > maxSimilarity) {
                maxSimilarity = similarity
                matchReason = `Contact match: "${scannedData.name}" ↔ "${contact.name}"`
              }
            }
          })
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Check email domain match
      if (scannedData.email && company.email) {
        const scannedDomain = scannedData.email.split('@')[1]
        const companyDomain = company.email.split('@')[1]
        if (scannedDomain && companyDomain && scannedDomain === companyDomain) {
          maxSimilarity = Math.max(maxSimilarity, 0.9)
          matchReason = `Email domain match: ${scannedDomain}`
        }
      }
      
      // Check website match
      if (scannedData.website && company.website) {
        const similarity = calculateSimilarity(scannedData.website, company.website)
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity
          matchReason = `Website match: "${scannedData.website}" ↔ "${company.website}"`
        }
      }
      
      if (maxSimilarity > 0.3) { // Only include matches above 30% similarity
        matches.push({
          company,
          similarity: maxSimilarity,
          matchReason
        })
      }
    })
    
    // Sort by similarity (highest first)
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
  }

  const handleScanComplete = (data: ScannedData) => {
    console.log('Scan completed, finding matching companies...', data)
    setScannedData(data)
    
    const matches = findMatchingCompanies(data)
    setSuggestedMatches(matches)
    setStep('match')
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
    onScanComplete?.(scannedData!, company)
    onClose()
  }

  const handleSkipMatching = () => {
    onScanComplete?.(scannedData!)
    onClose()
  }

  const handleBackToScan = () => {
    setStep('scan')
    setScannedData(null)
    setSuggestedMatches([])
    setSelectedCompany(null)
  }

  if (!isOpen) return null

  if (step === 'scan') {
    return (
      <BusinessCardScanner
        onScanComplete={handleScanComplete}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Card Scanned</h2>
              <p className="text-sm text-gray-600">Select the matching company or search for a different one</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Scanned Data Summary */}
        {scannedData && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <h3 className="font-medium text-blue-900 mb-2">Extracted Information:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {scannedData.name && (
                <div><span className="font-medium">Name:</span> {scannedData.name}</div>
              )}
              {scannedData.company && (
                <div><span className="font-medium">Company:</span> {scannedData.company}</div>
              )}
              {scannedData.title && (
                <div><span className="font-medium">Title:</span> {scannedData.title}</div>
              )}
              {scannedData.email && (
                <div><span className="font-medium">Email:</span> {scannedData.email}</div>
              )}
            </div>
          </div>
        )}

        {/* Suggested Matches */}
        {suggestedMatches.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-green-600" />
              Suggested Matches
            </h3>
            <div className="space-y-3">
              {suggestedMatches.map((match, index) => (
                <button
                  key={match.company.id}
                  onClick={() => handleCompanySelect(match.company)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{match.company.company}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {Math.round(match.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{match.matchReason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {match.company.department && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {match.company.department}
                          </span>
                        )}
                        {match.company.hall && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Hall {match.company.hall}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search All Companies */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Or Search All Companies</h3>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Companies List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading companies...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No companies found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCompanies.slice(0, 10).map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{company.company}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
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
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToScan}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Scan
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSkipMatching}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip Matching
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
