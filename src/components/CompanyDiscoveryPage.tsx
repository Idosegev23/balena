'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Search, Filter, Download, Eye, Star, MapPin, Building2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { RealtimeRating } from './RealtimeRating'
import { LogoDisplay } from './LogoUploader'

interface CompanyDiscoveryPageProps {
  onClose: () => void
  onCompanyClick: (company: Company) => void
}

interface FilterOptions {
  searchTerm: string
  department: string
  visitPriority: string
  relevanceScore: [number, number]
  location: string
  hall: string
  connectionType: string
  hasContact: boolean
  hasWebsite: boolean
}

export function CompanyDiscoveryPage({ onClose, onCompanyClick }: CompanyDiscoveryPageProps) {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'company' | 'location' | 'priority' | 'department' | 'hall'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Autocomplete states
  const [searchInput, setSearchInput] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteCompanies, setAutocompleteCompanies] = useState<Company[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const companiesPerPage = 20

  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    department: '',
    visitPriority: '',
    relevanceScore: [0, 100],
    location: '',
    hall: '',
    connectionType: '',
    hasContact: false,
    hasWebsite: false
  })

  const departments = ['Commercial', 'Operations', 'R&D', 'Marketing']
  const visitPriorities = ['MUST_VISIT', 'HIGH', 'MEDIUM', 'LOW', 'MONITOR_ONLY']
  const connectionTypes = ['SUPPLIER', 'PARTNER', 'COMPETITOR', 'CUSTOMER', 'SERVICE', 'STRATEGIC']

  useEffect(() => {
    // Load persisted state
    const persistedState = sessionStorage.getItem('discovery_state')
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState)
        setFilters(prev => ({ ...prev, ...parsed.filters }))
        setSortBy(parsed.sortBy || 'relevance_score')
        setSortOrder(parsed.sortOrder || 'desc')
        setPage(parsed.page || 1)
        setShowFilters(parsed.showFilters || false)
      } catch {}
    } else {
      // Default department filter to user's team_role when first loading
      const userDept = user?.user_metadata?.team_role as string | undefined
      if (userDept && ['Commercial', 'Operations', 'R&D', 'Marketing'].includes(userDept)) {
        setFilters(prev => ({ ...prev, department: userDept }))
      }
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    // Save all discovery state to sessionStorage
    const discoveryState = {
      filters,
      sortBy,
      sortOrder,
      page,
      showFilters
    }
    sessionStorage.setItem('discovery_state', JSON.stringify(discoveryState))
  }, [filters, sortBy, sortOrder, page, showFilters])

  useEffect(() => {
    applyFilters()
  }, [companies, filters, sortBy, sortOrder])

  // Reset page to 1 when filters actually change (not on mount)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  useEffect(() => {
    if (!isFirstLoad) {
      setPage(1)
    }
  }, [filters, sortBy, sortOrder])

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [])

  const parseLocationString = (location: string): { hall?: string, stand?: string } => {
    if (!location) return {}
    
    // Common patterns: "Hall 8a Level 1 Stand E03-32", "Hall 7/Level 1/Stand A23-45", "Hall 8a, Stand E03-32"
    const hallMatch = location.match(/Hall\s*(\d+[a-z]?)/i)
    const standMatch = location.match(/Stand\s*([A-Z]\d{2}-\d{2}|[A-Z]\d+[-/]?\d*)/i)
    
    return {
      hall: hallMatch ? `Hall ${hallMatch[1]}` : undefined,
      stand: standMatch ? standMatch[1] : undefined
    }
  }

  const fetchCompanies = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('company')

      if (error) throw error
      
      // Parse location data and update missing hall/stand info
      const companiesWithParsedLocation = (data || []).map(company => {
        if (company.location && (!company.hall || !company.stand)) {
          const parsed = parseLocationString(company.location)
          return {
            ...company,
            hall: company.hall || parsed.hall,
            stand: company.stand || parsed.stand
          }
        }
        return company
      })
      
      setCompanies(companiesWithParsedLocation)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
    
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...companies]

    // Search term - Enhanced to include scraped data
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(company => 
        company.company?.toLowerCase().includes(term) ||
        company.description?.toLowerCase().includes(term) ||
        company.location?.toLowerCase().includes(term) ||
        company.balena_value?.toLowerCase().includes(term) ||
        company.why_relevant?.toLowerCase().includes(term) ||
        company.department?.toLowerCase().includes(term) ||
        company.goal_category?.toLowerCase().includes(term) ||
        company.about_us?.toLowerCase().includes(term) ||
        company.products?.toLowerCase().includes(term) ||
        company.products_services?.toLowerCase().includes(term) ||
        company.sustainability_info?.toLowerCase().includes(term) ||
        company.contact_person?.toLowerCase().includes(term) ||
        company.website_title?.toLowerCase().includes(term) ||
        company.hall?.toLowerCase().includes(term) ||
        company.stand?.toLowerCase().includes(term)
      )
    }

    // Department
    if (filters.department) {
      filtered = filtered.filter(company => company.department === filters.department)
    }

    // Visit Priority
    if (filters.visitPriority) {
      filtered = filtered.filter(company => company.visit_priority === filters.visitPriority)
    }

    // Relevance Score
    filtered = filtered.filter(company => {
      const score = company.relevance_score || 0
      return score >= filters.relevanceScore[0] && score <= filters.relevanceScore[1]
    })

    // Location
    if (filters.location) {
      filtered = filtered.filter(company => 
        company.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Hall
    if (filters.hall) {
      filtered = filtered.filter(company => 
        company.hall?.toLowerCase().includes(filters.hall.toLowerCase())
      )
    }

    // Connection Type
    if (filters.connectionType) {
      filtered = filtered.filter(company => company.connection_type === filters.connectionType)
    }

    // Has Contact
    if (filters.hasContact) {
      filtered = filtered.filter(company => company.email || company.phone)
    }

    // Has Website
    if (filters.hasWebsite) {
      filtered = filtered.filter(company => company.website)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'relevance':
          aValue = a.relevance_score || 0
          bValue = b.relevance_score || 0
          break
        case 'company':
          aValue = a.company?.toLowerCase() || ''
          bValue = b.company?.toLowerCase() || ''
          break
        case 'location':
          aValue = a.location?.toLowerCase() || ''
          bValue = b.location?.toLowerCase() || ''
          break
        case 'priority':
          const priorityOrder = { 'MUST_VISIT': 5, 'HIGH': 4, 'MEDIUM': 3, 'LOW': 2, 'MONITOR_ONLY': 1 }
          aValue = priorityOrder[a.visit_priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.visit_priority as keyof typeof priorityOrder] || 0
          break
        case 'department':
          aValue = a.department?.toLowerCase() || ''
          bValue = b.department?.toLowerCase() || ''
          break
        case 'hall':
          aValue = a.hall?.toLowerCase() || ''
          bValue = b.hall?.toLowerCase() || ''
          break
        default:
          aValue = a.company
          bValue = b.company
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredCompanies(filtered)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MUST_VISIT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      case 'MONITOR_ONLY': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'MUST_VISIT': return 'Must Visit'
      case 'HIGH': return 'High'
      case 'MEDIUM': return 'Medium'
      case 'LOW': return 'Low'
      case 'MONITOR_ONLY': return 'Monitor'
      default: return priority
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Company Name', 'Location', 'Hall', 'Stand', 'Priority', 'Relevance Score', 'Department', 'Goal Category',
      'Connection Type', 'Where Presenting', 'Contact Person', 'Email', 'Phone', 'Website', 'Website Emails', 'Website Phones',
      'Claude Analysis', 'Manual Value Assessment', 'About Us', 'Products & Services', 'Sustainability'
    ]
    const csvContent = [
      headers.join(','),
      ...filteredCompanies.map(company => [
        company.company || '',
        company.location || '',
        company.hall || '',
        company.stand || '',
        getPriorityText(company.visit_priority || ''),
        company.relevance_score || '',
        company.department || '',
        company.goal_category || '',
        company.connection_type || '',
        company.where_they_present || '',
        company.contact_person || '',
        company.email || '',
        company.phone || '',
        company.website || '',
        company.website_emails || '',
        company.website_phones || '',
        (company.why_relevant || '').replace(/\n/g, ' ').slice(0, 300),
        (company.balena_value || '').replace(/\n/g, ' ').slice(0, 300),
        (company.about_us || '').replace(/\n/g, ' ').slice(0, 200),
        (company.products_services || '').replace(/\n/g, ' ').slice(0, 200),
        (company.sustainability_info || '').replace(/\n/g, ' ').slice(0, 200)
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `companies-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage)
  
  // Ensure page is within valid range
  const validPage = Math.max(1, Math.min(page, totalPages || 1))

  const paginatedCompanies = filteredCompanies.slice(
    (validPage - 1) * companiesPerPage,
    validPage * companiesPerPage
  )

  // Update page if it's out of range
  useEffect(() => {
    if (page !== validPage) {
      setPage(validPage)
    }
  }, [page, validPage])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r" style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}>
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Advanced Company Discovery</h1>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
            {filteredCompanies.length} of {companies.length}
          </span>
        </div>
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-white/20 rounded-lg text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value
                setSearchInput(value)
                
                // Show autocomplete for company names
                if (value.length >= 2) {
                  const suggestions = companies
                    .filter(company => 
                      company.company?.toLowerCase().includes(value.toLowerCase())
                    )
                    .slice(0, 8)
                  setAutocompleteCompanies(suggestions)
                  setShowAutocomplete(true)
                } else {
                  setShowAutocomplete(false)
                }
                
                // Debounce filter update
                window.clearTimeout((window as any).__searchTimer)
                ;(window as any).__searchTimer = window.setTimeout(() => {
                  setFilters(prev => ({ ...prev, searchTerm: value }))
                }, 250)
              }}
              onFocus={() => {
                if (searchInput.length >= 2) setShowAutocomplete(true)
              }}
              onBlur={() => {
                // Delay hiding to allow click on autocomplete
                setTimeout(() => setShowAutocomplete(false), 200)
              }}
              placeholder="🔍 Search by company name, description, location, hall, products..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocompleteCompanies.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {autocompleteCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSearchInput(company.company || '')
                      setFilters(prev => ({ ...prev, searchTerm: company.company || '' }))
                      setShowAutocomplete(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  >
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{company.company}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {company.hall && company.stand ? `${company.hall}/${company.stand}` : company.location}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-100"
          >
            <Filter className="w-5 h-5" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 bg-white rounded-lg border">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visit Priority</label>
              <select
                value={filters.visitPriority}
                onChange={(e) => setFilters(prev => ({ ...prev, visitPriority: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Priorities</option>
                {visitPriorities.map(priority => (
                  <option key={priority} value={priority}>{getPriorityText(priority)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Germany, Netherlands..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hall</label>
              <select
                value={filters.hall}
                onChange={(e) => setFilters(prev => ({ ...prev, hall: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Halls</option>
                <option value="Hall 1">Hall 1</option>
                <option value="Hall 2">Hall 2</option>
                <option value="Hall 3">Hall 3</option>
                <option value="Hall 4">Hall 4</option>
                <option value="Hall 5">Hall 5</option>
                <option value="Hall 6">Hall 6</option>
                <option value="Hall 7">Hall 7</option>
                <option value="Hall 7a">Hall 7a</option>
                <option value="Hall 8">Hall 8</option>
                <option value="Hall 8a">Hall 8a</option>
                <option value="Hall 8b">Hall 8b</option>
                <option value="Hall 9">Hall 9</option>
                <option value="Hall 10">Hall 10</option>
                <option value="Hall 11">Hall 11</option>
                <option value="Hall 12">Hall 12</option>
                <option value="Hall 13">Hall 13</option>
                <option value="Hall 14">Hall 14</option>
                <option value="Hall 15">Hall 15</option>
                <option value="Hall 16">Hall 16</option>
                <option value="Hall 17">Hall 17</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Relevance Score: {filters.relevanceScore[0]} - {filters.relevanceScore[1]}</label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.relevanceScore[0]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    relevanceScore: [parseInt(e.target.value), prev.relevanceScore[1]] 
                  }))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.relevanceScore[1]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    relevanceScore: [prev.relevanceScore[0], parseInt(e.target.value)] 
                  }))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasContact}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasContact: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Has Contact Info</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasWebsite}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasWebsite: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Has Website</span>
              </label>
            </div>
          </div>
        )}

        {/* Sorting */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">⭐ Relevance (Score)</option>
            <option value="company">🏢 Company Name (A-Z)</option>
            <option value="location">📍 Location</option>
            <option value="hall">🏛️ Hall</option>
            <option value="department">🏢 Department</option>
            <option value="priority">🎯 Visit Priority</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedCompanies.map((company) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
                  onClick={() => onCompanyClick(company)}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <LogoDisplay company={company} size="sm" className="flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate" style={{ color: 'var(--balena-dark)' }}>
                        {company.company}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {company.visit_priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getPriorityColor(company.visit_priority)}`}>
                        {getPriorityText(company.visit_priority)}
                      </span>
                    )}
                    {company.relevance_score && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        ⭐ {company.relevance_score}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{company.location}</span>
                    </div>
                    {company.hall && company.stand && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{company.hall} / {company.stand}</span>
                      </div>
                    )}
                    {(company.email || company.website_emails) && (
                      <div className="flex items-center gap-1">
                        <span>📧 {company.email || company.website_emails?.split(',')[0]}</span>
                      </div>
                    )}
                    {(company.phone || company.website_phones) && (
                      <div className="flex items-center gap-1">
                        <span>📞 {company.phone || company.website_phones?.split(',')[0]}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-1">
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>🌐</span>
                          <span className="underline">Company Website</span>
                        </a>
                      </div>
                    )}
                    {company.contact_person && (
                      <div className="flex items-center gap-1">
                        <span>👤 {company.contact_person}</span>
                      </div>
                    )}
                    {(company.about_us || company.products_services) && (
                      <div className="text-xs text-gray-600 mt-1">
                        📋 {(company.about_us || company.products_services || '').substring(0, 100)}
                        {(company.about_us || company.products_services || '').length > 100 ? '...' : ''}
                      </div>
                    )}
                    {company.sustainability_info && (
                      <div className="text-xs text-green-600 mt-1">
                        🌱 Sustainability: {company.sustainability_info.substring(0, 80)}
                        {company.sustainability_info.length > 80 ? '...' : ''}
                      </div>
                    )}
                  </div>

                  {(company.why_relevant || company.balena_value) && (
                    <details className="mb-3">
                      <summary className="text-xs cursor-pointer" style={{ color: 'var(--balena-dark)' }}>
                        💡 {(company.why_relevant || company.balena_value || '').slice(0, 60)}{(company.why_relevant || company.balena_value || '').length > 60 ? '…' : ''}
                      </summary>
                      <div className="text-xs mt-1 space-y-1" style={{ color: 'var(--balena-dark)' }}>
                        {company.why_relevant && (
                          <p><strong>Claude Analysis:</strong> {company.why_relevant}</p>
                        )}
                        {company.balena_value && company.balena_value !== company.why_relevant && (
                          <p><strong>Balena Value:</strong> {company.balena_value}</p>
                        )}
                        {company.department && (
                          <p><strong>Department:</strong> {company.department}</p>
                        )}
                        {company.goal_category && (
                          <p><strong>Goal Category:</strong> {company.goal_category}</p>
                        )}
                      </div>
                    </details>
                  )}

                  <div onClick={(e) => e.stopPropagation()}>
                    <RealtimeRating 
                      companyId={company.id} 
                      size="small"
                      showTeamRatings={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {filteredCompanies.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No companies found</h3>
                <p className="text-gray-500">Try adjusting filters or search terms</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={() => {
              const newPage = Math.max(1, validPage - 1)
              setPage(newPage)
            }}
            disabled={validPage === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {/* Show first page if not in range */}
            {validPage > 3 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-100"
                >
                  1
                </button>
                {validPage > 4 && <span className="px-2">...</span>}
              </>
            )}
            
            {/* Show pages around current page */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const startPage = Math.max(1, Math.min(totalPages - 4, validPage - 2))
              const pageNum = startPage + i
              
              if (pageNum > totalPages) return null
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    validPage === pageNum 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            
            {/* Show last page if not in range */}
            {validPage < totalPages - 2 && (
              <>
                {validPage < totalPages - 3 && <span className="px-2">...</span>}
                <button
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => {
              const newPage = Math.min(totalPages, validPage + 1)
              setPage(newPage)
            }}
            disabled={validPage === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center py-2 text-sm text-gray-600 bg-gray-50">
          Page {validPage} of {totalPages} • Showing {paginatedCompanies.length} of {filteredCompanies.length} companies
        </div>
      )}
    </div>
  )
}
