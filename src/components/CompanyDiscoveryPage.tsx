'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Search, Filter, Download, Eye, Star, MapPin, Building2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { RealtimeRating } from './RealtimeRating'
import { EnhancedRealtimeRating } from './EnhancedRealtimeRating'
import { CompanyTagging } from './CompanyTagging'
import { LogoDisplayWithUpload } from './LogoDisplayWithUpload'
import { EnhancedCompanyModal } from './EnhancedCompanyModal'
import { MobileSearchModal } from './MobileSearchModal'
import { VisitedStatus } from './VisitedStatus'
import { ShimmerButton } from './ui/shimmer-button'

interface CompanyDiscoveryPageProps {
  onClose: () => void
  onCompanyClick: (company: Company) => void
  initialCompanies?: Company[]
}

interface FilterOptions {
  searchTerm: string
  department: string
  visitPriority: string
  location: string
  hall: string
  connectionType: string
  hasContact: boolean
  hasWebsite: boolean
  tags: string[]
  visitedStatus: 'all' | 'visited' | 'not_visited'
  isFavorite: boolean
  meetingStatus: 'all' | 'requested' | 'scheduled' | 'completed'
}

export function CompanyDiscoveryPage({ onClose, onCompanyClick, initialCompanies }: CompanyDiscoveryPageProps) {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [userRatings, setUserRatings] = useState<Set<number>>(new Set())
  const [availableHalls, setAvailableHalls] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'company' | 'location' | 'priority' | 'department' | 'hall'>('company')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Helper function to check if data is valid
  const hasValidData = (value: any): boolean => {
    if (!value) return false
    if (typeof value === 'string') {
      const cleaned = value.trim()
      return cleaned !== '' && cleaned !== 'Skip to main content' && cleaned !== 'N/A'
    }
    return true
  }
  
  // Autocomplete states
  const [searchInput, setSearchInput] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteCompanies, setAutocompleteCompanies] = useState<Company[]>([])
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const companiesPerPage = 20

  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    department: '',
    visitPriority: '',
    location: '',
    hall: '',
    connectionType: '',
    hasContact: false,
    hasWebsite: false,
    tags: [],
    visitedStatus: 'all',
    isFavorite: false,
    meetingStatus: 'all'
  })

  const departments = ['Commercial', 'Operations', 'R&D', 'Marketing']
  const visitPriorities = ['MUST_VISIT', 'HIGH', 'MEDIUM', 'LOW', 'MONITOR_ONLY']
  const connectionTypes = ['SUPPLIER', 'PARTNER', 'COMPETITOR', 'CUSTOMER', 'SERVICE', 'STRATEGIC']
  const availableTags = ['supplier', 'competitor', 'partner', 'customer', 'vendor', 'distributor', 'manufacturer', 'service_provider', 'technology', 'innovation']

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.department) count++
    if (filters.visitPriority) count++
    if (filters.location) count++
    if (filters.hall) count++
    if (filters.connectionType) count++
    if (filters.hasContact) count++
    if (filters.hasWebsite) count++
    if (filters.tags.length > 0) count++
    if (filters.visitedStatus !== 'all') count++
    if (filters.isFavorite) count++
    if (filters.meetingStatus !== 'all') count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  useEffect(() => {
    // Load persisted state
    const persistedState = sessionStorage.getItem('discovery_state')
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState)
        setFilters(prev => ({ ...prev, ...parsed.filters }))
        setSortBy(parsed.sortBy || 'company')
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
    
    // Use initialCompanies if provided (from parent), otherwise fetch from database
    if (initialCompanies && initialCompanies.length > 0) {
      console.log('🔄 CompanyDiscoveryPage: Using initial companies from parent:', initialCompanies.length)
      setCompanies(initialCompanies)
      
      // Extract halls from initial companies too
      const halls = new Set<string>()
      initialCompanies.forEach(company => {
        if (company.hall && company.hall.trim() !== '') {
          halls.add(company.hall.trim())
        }
      })
      
      const sortedHalls = Array.from(halls).sort((a, b) => {
        const aMatch = a.match(/^(\d+)([a-z]?)$/i)
        const bMatch = b.match(/^(\d+)([a-z]?)$/i)
        
        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1])
          const bNum = parseInt(bMatch[1])
          
          if (aNum !== bNum) {
            return aNum - bNum
          }
          
          return (aMatch[2] || '').localeCompare(bMatch[2] || '')
        }
        
        return a.localeCompare(b)
      })
      
      setAvailableHalls(sortedHalls)
      setLoading(false)
    } else {
      console.log('🔄 CompanyDiscoveryPage: Fetching companies from database')
      fetchCompanies()
    }
    
    // Fetch user ratings for favorites filter
    fetchUserRatings()
    
    setupRealtimeSubscription()
    
    return () => {
      // Cleanup subscription on unmount
      supabase.removeAllChannels()
    }
  }, [initialCompanies])

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

  // Reset page to 1 when filters actually change (not on mount or state restore)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [filtersInitialized, setFiltersInitialized] = useState(false)
  
  useEffect(() => {
    if (!isFirstLoad && filtersInitialized) {
      setPage(1)
    }
  }, [filters, sortBy, sortOrder])

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)
      // Mark filters as initialized after first load (including persisted state)
      setTimeout(() => setFiltersInitialized(true), 100)
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

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('companies_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'companies' 
        }, 
        (payload) => {
          console.log('CompanyDiscoveryPage: Real-time update received:', payload)
          
          if (payload.eventType === 'UPDATE') {
            const updatedCompany = payload.new as Company
            console.log('CompanyDiscoveryPage: Updating company in real-time:', updatedCompany.id, 'tags:', updatedCompany.tags)
            setCompanies(prev => {
              const newCompanies = prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
              console.log('CompanyDiscoveryPage: Real-time companies list updated')
              return newCompanies
            })
          } else if (payload.eventType === 'INSERT') {
            const newCompany = payload.new as Company
            setCompanies(prev => [...prev, newCompany])
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setCompanies(prev => prev.filter(c => c.id !== deletedId))
          }
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
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
      
      // Extract unique halls from companies data
      const halls = new Set<string>()
      companiesWithParsedLocation.forEach(company => {
        if (company.hall && company.hall.trim() !== '') {
          halls.add(company.hall.trim())
        }
      })
      
      // Sort halls naturally (1, 2, 3, 7a, 8a, 8b, etc.)
      const sortedHalls = Array.from(halls).sort((a, b) => {
        // Extract numeric part and letter part
        const aMatch = a.match(/^(\d+)([a-z]?)$/i)
        const bMatch = b.match(/^(\d+)([a-z]?)$/i)
        
        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1])
          const bNum = parseInt(bMatch[1])
          
          if (aNum !== bNum) {
            return aNum - bNum
          }
          
          // Same number, compare letters
          return (aMatch[2] || '').localeCompare(bMatch[2] || '')
        }
        
        // Fallback to string comparison
        return a.localeCompare(b)
      })
      
      setAvailableHalls(sortedHalls)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
    
    setLoading(false)
  }

  const fetchUserRatings = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('company_ratings')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('rating', 1)

      if (error) throw error
      
      const likedCompanyIds = new Set((data || []).map(r => r.company_id))
      setUserRatings(likedCompanyIds)
    } catch (error) {
      console.error('Error fetching user ratings:', error)
    }
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

    // Department - support multiple departments separated by comma
    if (filters.department) {
      filtered = filtered.filter(company => {
        if (!company.department) return false
        // Split department string and check if any matches the filter
        const departments = company.department.split(',').map(d => d.trim())
        return departments.includes(filters.department)
      })
    }

    // Visit Priority
    if (filters.visitPriority) {
      filtered = filtered.filter(company => company.visit_priority === filters.visitPriority)
    }


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

    // Connection Type - removed as column no longer exists
    // if (filters.connectionType) {
    //   filtered = filtered.filter(company => company.connection_type === filters.connectionType)
    // }

    // Has Contact
    if (filters.hasContact) {
      filtered = filtered.filter(company => company.main_email || company.email || company.main_phone || company.phone)
    }

    // Has Website
    if (filters.hasWebsite) {
      filtered = filtered.filter(company => company.main_website || company.website)
    }

    // Tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(company => {
        const companyTags = company.tags || []
        return filters.tags.some(tag => companyTags.includes(tag))
      })
    }

    // Visited Status
    if (filters.visitedStatus !== 'all') {
      filtered = filtered.filter(company => {
        if (filters.visitedStatus === 'visited') {
          return company.visited === true
        } else if (filters.visitedStatus === 'not_visited') {
          return company.visited !== true
        }
        return true
      })
    }

    // Favorites filter
    if (filters.isFavorite) {
      filtered = filtered.filter(company => userRatings.has(company.id))
    }

    // Meeting status filter
    if (filters.meetingStatus !== 'all') {
      filtered = filtered.filter(company => {
        switch (filters.meetingStatus) {
          case 'requested':
            return company.meeting_requested === true
          case 'scheduled':
            return company.meeting_scheduled === true
          case 'completed':
            return company.meeting_completed === true
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
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

  const handleExportFilteredCompanies = async (exportAll = false) => {
    if (isExporting) return
    
    setIsExporting(true)
    
    try {
      // Determine which companies to export
      let companyIds: number[]
      
      if (exportAll) {
        // Export ALL companies from the database - remove any limits
        const { data: allCompanies, error: allCompaniesError, count } = await supabase
          .from('companies')
          .select('id', { count: 'exact' })
          .limit(1000) // Set a high limit to ensure we get all companies
        
        if (allCompaniesError) throw allCompaniesError
        companyIds = allCompanies?.map(c => c.id) || []
        console.log('📊 Starting export for ALL companies:', companyIds.length, 'Total in DB:', count)
      } else {
        // Export only filtered companies
        companyIds = filteredCompanies.map(c => c.id)
        console.log('📊 Starting export for filtered companies:', companyIds.length)
      }
      
      // Get companies data - ensure no limit
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds)
        .limit(1000) // Set high limit to ensure we get all companies
        .order('company')

      if (companiesError) throw companiesError

      // Get ratings data separately - ensure no limit
      const { data: ratings, error: ratingsError } = await supabase
        .from('company_ratings')
        .select('company_id, rating, notes, user_id, created_at')
        .in('company_id', companyIds)
        .limit(5000) // High limit for ratings

      if (ratingsError) {
        console.warn('⚠️ Could not fetch ratings:', ratingsError)
      }

      // Get notes data separately - ensure no limit
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('company_id, content, note_type, created_at, user_id, is_private')
        .in('company_id', companyIds)
        .limit(5000) // High limit for notes

      if (notesError) {
        console.warn('⚠️ Could not fetch notes:', notesError)
      }

      // Combine the data
      const detailedCompanies = companies?.map(company => ({
        ...company,
        company_ratings: ratings?.filter(r => r.company_id === company.id) || [],
        notes: notes?.filter(n => n.company_id === company.id) || []
      }))

      console.log('📊 Export data sample:', {
        requestedCompanyIds: companyIds.length,
        actualCompaniesReturned: companies?.length || 0,
        totalCompanies: detailedCompanies?.length,
        totalRatings: ratings?.length || 0,
        totalNotes: notes?.length || 0,
        firstCompany: detailedCompanies?.[0]?.company,
        sampleRatings: detailedCompanies?.[0]?.company_ratings?.length || 0,
        sampleNotes: detailedCompanies?.[0]?.notes?.length || 0,
        sampleTags: detailedCompanies?.[0]?.tags
      })

      // Create CSV content with BOM for Hebrew support
      let csvContent = "\uFEFF"
      
      // Headers - organized for maximum usability
      csvContent += "Company Name,Hall,Stand,Location,Visit Priority,Tags,Likes,Dislikes,Email,Phone,Website,Contact Person,Rating Notes,General Notes,Private Notes,Description,Last Updated\n"
      
      // Process each company with error handling
      for (let index = 0; index < (detailedCompanies?.length || 0); index++) {
        const company = detailedCompanies![index]
        try {
        // Helper function to clean text for CSV
        const cleanText = (text: string | null | undefined): string => {
          if (!text) return ''
          return String(text)
            .replace(/[\r\n\t]+/g, ' ')  // Replace newlines and tabs with spaces
            .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
            .replace(/"/g, '""')         // Escape quotes for CSV
            .trim()                      // Remove leading/trailing spaces
        }

        // Process ratings
        const ratings = company.company_ratings || []
        const likes = ratings.filter((r: any) => r.rating === 1).length
        const dislikes = ratings.filter((r: any) => r.rating === -1).length
        const ratingNotes = ratings
          .map((r: any) => cleanText(r.notes))
          .filter(Boolean)
          .join('; ')
        
        // Process notes by type
        const notes = company.notes || []
        const generalNotes = notes
          .filter((n: any) => !n.is_private)
          .map((n: any) => `${cleanText(n.note_type || 'Note')}: ${cleanText(n.content)}`)
          .filter((note: string) => note.length > 2) // Only include non-empty notes
          .join('; ')
        const privateNotes = notes
          .filter((n: any) => n.is_private)
          .map((n: any) => `${cleanText(n.note_type || 'Private')}: ${cleanText(n.content)}`)
          .filter((note: string) => note.length > 2) // Only include non-empty notes
          .join('; ')
        
        // Process tags
        const tags = Array.isArray(company.tags) ? company.tags.join(', ') : cleanText(company.tags)
        
        // Format website as clickable link
        const website = company.website ? 
          (company.website.startsWith('http') ? company.website : `https://${company.website}`) : ''
        
        // Get last updated date
        const lastUpdated = company.updated_at ? new Date(company.updated_at).toLocaleDateString('he-IL') : ''

        // Debug log for first few companies
        if (index < 3) {
          console.log(`📋 Company ${index + 1} (${company.company}):`, {
            ratings: ratings.length,
            likes,
            dislikes,
            ratingNotes,
            notes: notes.length,
            generalNotes,
            privateNotes,
            tags,
            lastUpdated
          })
        }
        
        // Create CSV row with proper order: Company Name,Hall,Stand,Location,Visit Priority,Tags,Likes,Dislikes,Email,Phone,Website,Contact Person,Rating Notes,General Notes,Private Notes,Description,Last Updated
        const csvRow = [
          cleanText(company.company),                    // Company Name
          cleanText(company.hall),                       // Hall  
          cleanText(company.stand),                      // Stand
          cleanText(company.location),                   // Location
          cleanText(company.visit_priority),             // Visit Priority
          tags,                                          // Tags
          likes.toString(),                              // Likes
          dislikes.toString(),                           // Dislikes
          cleanText(company.email),                      // Email
          cleanText(company.phone),                      // Phone
          website,                                       // Website (formatted as link)
          cleanText(company.contact_person),             // Contact Person
          ratingNotes,                                   // Rating Notes
          generalNotes,                                  // General Notes
          privateNotes,                                  // Private Notes
          cleanText(company.description),                // Description
          lastUpdated                                    // Last Updated
        ].map(field => `"${field}"`).join(',')

        csvContent += csvRow + '\n'
        
        // Log progress every 50 companies
        if (index % 50 === 0 || index === (detailedCompanies?.length || 0) - 1) {
          console.log(`📋 Processed ${index + 1}/${detailedCompanies?.length || 0} companies`)
        }
        
        } catch (error: any) {
          console.error(`❌ Error processing company ${index + 1}:`, company?.company || 'Unknown', error)
          // Continue with next company - don't break the export
        }
      }

      // Download the file using Blob (handles large files better)
      const fileName = exportAll 
        ? `all_companies_${new Date().toISOString().split('T')[0]}.csv`
        : `filtered_companies_${new Date().toISOString().split('T')[0]}.csv`
      
      console.log('📄 CSV content size:', csvContent.length, 'characters')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      URL.revokeObjectURL(url)

      // Show success message with details
      const exportedCount = detailedCompanies?.length || 0
      const ratingsCount = ratings?.length || 0
      const notesCount = notes?.length || 0
      const companiesWithTags = detailedCompanies?.filter((c: any) => c.tags && c.tags.length > 0).length || 0
      
      alert(`✅ CSV Export Completed Successfully!

📊 ${exportedCount} companies exported ${exportAll ? '(All Companies)' : '(Filtered Companies)'}
👍 ${ratingsCount} ratings
📝 ${notesCount} notes  
🏷️ ${companiesWithTags} companies with tags

📋 File includes:
• One row per company
• Clickable website links
• All tags, notes and ratings
• Excel-friendly format

📁 Saved as: ${fileName}`)
      
    } catch (error: any) {
      console.error('Export error:', error)
      alert(`❌ Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
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

  // Old exportToCSV function removed - now using handleExportFilteredCompanies with full data

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
    <div 
      className="fixed inset-0 bg-white z-50 flex flex-col mobile-content"
      style={{
        overscrollBehavior: 'none',
        touchAction: 'pan-x pan-y',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b bg-gradient-to-r safe-area-top" style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}>
        <div className="flex items-center gap-2 xs:gap-3 flex-1 min-w-0">
          <Building2 className="w-5 h-5 xs:w-6 xs:h-6 text-white flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-white leading-tight">
              <span className="sm:hidden">Discovery</span>
              <span className="hidden sm:inline">Advanced Company Discovery</span>
            </h1>
            <span className="bg-white/20 text-white px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm">
              {filteredCompanies.length} of {companies.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportFilteredCompanies(true)}
            disabled={isExporting}
            className={`p-1.5 xs:p-2 rounded-lg text-white touch-target flex-shrink-0 transition-all ${
              isExporting 
                ? 'bg-white/10 cursor-not-allowed' 
                : 'hover:bg-white/20'
            }`}
            aria-label="Export all companies"
            title={isExporting ? "Exporting..." : "Export ALL companies to CSV"}
          >
            {isExporting ? (
              <div className="animate-spin w-3 h-3 xs:w-4 xs:h-4 border border-white/30 border-t-white rounded-full" />
            ) : (
              <Download className="w-3 h-3 xs:w-4 xs:h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 xs:p-2 hover:bg-white/20 rounded-lg text-white touch-target flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 xs:w-6 xs:h-6" />
          </button>
        </div>
      </div>

      {/* Search & Filters Bar - Mobile Optimized */}
      <div className="p-3 xs:p-4 sm:p-6 border-b bg-gray-50">
        <div className="flex gap-2 xs:gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Desktop Search */}
          <div className="hidden sm:flex flex-1 relative">
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
                  // Use filteredCompanies instead of companies to respect active filters
                  const suggestions = filteredCompanies
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
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Clear Search Button */}
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('')
                  setFilters(prev => ({ ...prev, searchTerm: '' }))
                  setShowAutocomplete(false)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
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

          {/* Mobile Search Button */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className={`sm:hidden p-2.5 xs:p-3 border rounded-lg transition-colors relative touch-target ${
              searchInput ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 text-gray-600'
            }`}
            title={searchInput ? `Searching: "${searchInput}"` : "Search companies"}
            aria-label="Open search"
          >
            <Search className="w-4 h-4 xs:w-5 xs:h-5" />
            {searchInput && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                ●
              </span>
            )}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 border rounded-lg transition-colors relative touch-target ${
              activeFiltersCount > 0 
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                : 'hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4 xs:w-5 xs:h-5" />
            <span className="hidden xs:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 xs:h-5 xs:w-5 flex items-center justify-center font-medium">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-3 h-3 xs:w-4 xs:h-4" /> : <ChevronDown className="w-3 h-3 xs:w-4 xs:h-4" />}
          </button>
          <ShimmerButton
            onClick={() => handleExportFilteredCompanies(true)}
            disabled={isExporting}
            className={`flex items-center gap-1 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 touch-target transition-all ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            background={isExporting ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" : "linear-gradient(135deg, #059669 0%, #047857 100%)"}
            shimmerColor="#ffffff"
            shimmerDuration="2s"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 xs:h-5 xs:w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Download className="w-4 h-4 xs:w-5 xs:h-5" />
            )}
            <span className="hidden xs:inline">
              {isExporting ? 'Exporting...' : 'Export All Companies'}
            </span>
            <span className="xs:hidden">
              {isExporting ? 'Exporting...' : 'Export All'}
            </span>
          </ShimmerButton>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5 p-3 bg-white rounded-lg border shadow-sm max-h-64 overflow-y-auto"
            >
            <div>
              <label className="block text-xs font-medium mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Visit Priority</label>
              <select
                value={filters.visitPriority}
                onChange={(e) => setFilters(prev => ({ ...prev, visitPriority: e.target.value }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                <option value="">All Priorities</option>
                {visitPriorities.map(priority => (
                  <option key={priority} value={priority}>{getPriorityText(priority)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Germany, Netherlands..."
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Hall</label>
              <select
                value={filters.hall}
                onChange={(e) => setFilters(prev => ({ ...prev, hall: e.target.value }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                <option value="">All Halls</option>
                {availableHalls.map(hall => (
                  <option key={hall} value={hall}>
                    Hall {hall}
                  </option>
                ))}
              </select>
            </div>


            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={filters.hasContact}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasContact: e.target.checked }))}
                  className="rounded w-3 h-3"
                />
                <span className="text-xs">Has Contact</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={filters.hasWebsite}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasWebsite: e.target.checked }))}
                  className="rounded w-3 h-3"
                />
                <span className="text-xs">Has Website</span>
              </label>
            </div>

            {/* Tags Filter */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium mb-1">Tags</label>
              <div className="flex flex-wrap gap-1">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag]
                      setFilters(prev => ({ ...prev, tags: newTags }))
                    }}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
              {filters.tags.length > 0 && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear all tags
                </button>
              )}
            </div>

            {/* Visit Status Filter */}
            <div>
              <label className="block text-xs font-medium mb-1">Visit Status</label>
              <select
                value={filters.visitedStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, visitedStatus: e.target.value as 'all' | 'visited' | 'not_visited' }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                <option value="all">All Companies</option>
                <option value="visited">✅ Visited</option>
                <option value="not_visited">⭕ Not Visited</option>
              </select>
            </div>

            {/* Favorites Filter */}
            <div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isFavorite}
                  onChange={(e) => setFilters(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="w-3 h-3 text-yellow-600 border-gray-300 rounded"
                />
                <span className="text-xs">⭐ Favorites only</span>
              </label>
            </div>

            {/* Meeting Status Filter */}
            <div>
              <label className="block text-xs font-medium mb-1">Meetings</label>
              <select
                value={filters.meetingStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, meetingStatus: e.target.value as 'all' | 'requested' | 'scheduled' | 'completed' }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                <option value="all">All Meetings</option>
                <option value="requested">📝 Requested</option>
                <option value="scheduled">📅 Scheduled</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            <div className="lg:col-span-5 pt-2 border-t">
              <button
                onClick={() => {
                  setSearchInput('')
                  setFilters({
                    searchTerm: '',
                    department: '',
                    visitPriority: '',
                    location: '',
                    hall: '',
                    connectionType: '',
                    hasContact: false,
                    hasWebsite: false,
                    tags: [],
                    visitedStatus: 'all',
                    isFavorite: false,
                    meetingStatus: 'all'
                  })
                  setShowAutocomplete(false)
                }}
                className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sorting */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
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
          <div
            className="h-full overflow-y-auto"
            data-discovery-scroll
            style={{
              overscrollBehavior: 'none',
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedCompanies.map((company) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-all bg-white cursor-pointer hover:border-blue-300"
                  onClick={() => onCompanyClick(company)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <LogoDisplayWithUpload 
                      company={company} 
                      size="md" 
                      className="flex-shrink-0 mt-1"
                      showUploadButton={true}
                      onLogoUpdate={(logoUrl) => {
                        // Update the company in the list
                        setCompanies(prev => 
                          prev.map(c => c.id === company.id ? { ...c, logo_url: logoUrl } : c)
                        )
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1" style={{ color: 'var(--balena-dark)' }}>
                        {company.company}
                      </h3>
                      {hasValidData(company.contact_person) && (
                        <p className="text-sm text-gray-600 mb-1">
                          👤 {company.contact_person}
                        </p>
                      )}
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

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="flex-1 truncate">{company.location}</span>
                      {company.hall && company.stand && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {company.hall}/{company.stand}
                        </span>
                      )}
                    </div>
                    
                    {/* Email */}
                    {(company.main_email || company.email || company.website_emails) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">📧</span>
                        <a 
                          href={`mailto:${company.main_email || company.email || company.website_emails?.split(',')[0]}`}
                          className="text-blue-600 hover:underline truncate flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company.main_email || company.email || company.website_emails?.split(',')[0]}
                        </a>
                      </div>
                    )}
                    
                    {/* Phone */}
                    {(company.main_phone || company.phone || company.website_phones) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">📞</span>
                        <a 
                          href={`tel:${company.main_phone || company.phone || company.website_phones?.split(',')[0]}`}
                          className="text-blue-600 hover:underline flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company.main_phone || company.phone || company.website_phones?.split(',')[0]}
                        </a>
                      </div>
                    )}
                    
                    {/* Website */}
                    {(company.main_website || company.website) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-purple-600">🌐</span>
                        <a 
                          href={(company.main_website || company.website)?.startsWith('http') ? (company.main_website || company.website) : `https://${company.main_website || company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Company Description */}
                  {(company.company_description || company.about_us || company.products_services) && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        📋 {(company.company_description || company.about_us || company.products_services || '').substring(0, 120)}
                        {(company.company_description || company.about_us || company.products_services || '').length > 120 ? '...' : ''}
                      </p>
                    </div>
                  )}
                  
                  {/* Business Info */}
                  {(company.employees_count || company.foundation_year || company.sales_volume) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {company.employees_count && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          👥 {company.employees_count} employees
                        </span>
                      )}
                      {company.foundation_year && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                          📅 Est. {company.foundation_year}
                        </span>
                      )}
                      {company.sales_volume && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          💰 {company.sales_volume}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Sustainability */}
                  {company.sustainability_info && (
                    <div className="bg-green-50 p-2 rounded-md mb-3">
                      <p className="text-xs text-green-700">
                        🌱 <strong>Sustainability:</strong> {company.sustainability_info.substring(0, 80)}
                        {company.sustainability_info.length > 80 ? '...' : ''}
                      </p>
                    </div>
                  )}

                  {company.why_relevant && (
                    <details className="mb-3">
                      <summary className="text-xs cursor-pointer" style={{ color: 'var(--balena-dark)' }}>
                        💡 {(company.why_relevant || '').slice(0, 60)}{(company.why_relevant || '').length > 60 ? '…' : ''}
                      </summary>
                      <div className="text-xs mt-1 space-y-1" style={{ color: 'var(--balena-dark)' }}>
                        {company.why_relevant && (
                          <p><strong>Claude Analysis:</strong> {company.why_relevant}</p>
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

                  {/* Visit Status */}
                  <div onClick={(e) => e.stopPropagation()} className="mb-3">
                    <VisitedStatus
                      company={company}
                      onUpdate={(updatedCompany) => {
                        // Update the company in the list
                        setCompanies(prev => 
                          prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
                        )
                      }}
                      size="small"
                      showDetails={false}
                    />
                  </div>

                  {/* Company Tagging */}
                  <div onClick={(e) => e.stopPropagation()} className="mb-3">
                    <CompanyTagging
                      company={company}
                      onTagsUpdate={(tags) => {
                        // Update the company in the list
                        console.log('CompanyDiscoveryPage: Updating tags for company', company.id, 'to:', tags)
                        const updatedCompany = { ...company, tags }
                        setCompanies(prev => {
                          const newCompanies = prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
                          console.log('CompanyDiscoveryPage: Updated companies array')
                          return newCompanies
                        })
                      }}
                      size="small"
                      showAddButton={true}
                    />
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <EnhancedRealtimeRating 
                      companyId={company.id} 
                      company={company}
                      size="small"
                      showTeamRatings={false}
                      showSuggestions={true}
                      onSuggestionClick={onCompanyClick}
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

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <MobileSearchModal
          isOpen={showMobileSearch}
          onClose={() => setShowMobileSearch(false)}
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value)
            // Debounce filter update - this will update the background page
            window.clearTimeout((window as any).__searchTimer)
            ;(window as any).__searchTimer = window.setTimeout(() => {
              setFilters(prev => ({ ...prev, searchTerm: value }))
            }, 250)
          }}
        companies={filteredCompanies}
        autocompleteCompanies={autocompleteCompanies}
        showAutocomplete={showAutocomplete}
        onAutocompleteSelect={(company) => {
          setSearchInput(company.company || '')
          setFilters(prev => ({ ...prev, searchTerm: company.company || '' }))
          setShowMobileSearch(false)
        }}
        onAutocompleteToggle={(show) => {
          if (show) {
            const suggestions = companies
              .filter(company => 
                company.company?.toLowerCase().includes(searchInput.toLowerCase())
              )
              .slice(0, 8)
            setAutocompleteCompanies(suggestions)
          }
          setShowAutocomplete(show)
        }}
        />
      )}
    </div>
  )
}
