'use client'

import { useState, useEffect } from 'react'
import { supabase, Company, CompanyRating } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Calendar, Clock, CheckCircle, AlertCircle, MapPin, Star, Filter } from 'lucide-react'

interface Visit {
  id: string
  company_id: string
  status: 'planned' | 'in_progress' | 'completed'
  created_at: string
  companies: Company
}

interface VisitsDashboardProps {
  onCompanyClick: (company: Company) => void
}

export function VisitsDashboard({ onCompanyClick }: VisitsDashboardProps) {
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [likedCompanies, setLikedCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'visits' | 'liked'>('liked')
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    showVisited: false,
    showUnvisited: true
  })

  useEffect(() => {
    if (user) {
      fetchVisits()
      fetchLikedCompanies()
      setupRealtimeSubscription()
    }
  }, [user])

  const setupRealtimeSubscription = () => {
    if (!user) return

    // Subscribe to rating changes to update liked companies in real-time
    const ratingsChannel = supabase
      .channel('company_ratings_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'company_ratings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchLikedCompanies() // Refresh liked companies when ratings change
        }
      )
      .subscribe()

    // Subscribe to visit changes
    const visitsChannel = supabase
      .channel('visits_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'visits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchVisits() // Refresh visits when they change
        }
      )
      .subscribe()

    // Subscribe to companies table changes to catch visited status updates
    const companiesChannel = supabase
      .channel('companies_visited_changes')
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'companies'
        },
        (payload) => {
          console.log('Company update detected:', payload)
          // Refresh both visits and liked companies as visited status affects both
          fetchVisits()
          fetchLikedCompanies()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ratingsChannel)
      supabase.removeChannel(visitsChannel)
      supabase.removeChannel(companiesChannel)
    }
  }

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          company_id,
          status,
          created_at,
          companies!inner (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVisits((data as unknown as Visit[]) || [])
    } catch (error) {
      console.error('Error fetching visits:', error)
    }
    setLoading(false)
  }

  const fetchLikedCompanies = async () => {
    try {
      // Get companies that the current user rated positively
      const { data: ratings, error: ratingsError } = await supabase
        .from('company_ratings')
        .select('company_id')
        .eq('user_id', user?.id)
        .eq('rating', 1)

      if (ratingsError) throw ratingsError

      if (ratings && ratings.length > 0) {
        const companyIds = ratings.map(r => r.company_id)
        
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .in('id', companyIds)
          .order('company')

        if (companiesError) throw companiesError
        setLikedCompanies(companies || [])
      } else {
        setLikedCompanies([])
      }
    } catch (error) {
      console.error('Error fetching liked companies:', error)
      setLikedCompanies([])
    }
  }

  const todayVisits = visits.filter(visit => {
    const today = new Date().toDateString()
    const visitDate = new Date(visit.created_at).toDateString()
    return today === visitDate
  })

  const plannedVisits = visits.filter(v => v.status === 'planned')
  const inProgressVisits = visits.filter(v => v.status === 'in_progress')
  const completedVisits = visits.filter(v => v.status === 'completed')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-orange-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planned'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_progress':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Check if a company has been visited
  const isCompanyVisited = (company: Company) => {
    // Check both the company.visited field and the visits table
    return company.visited || visits.some(visit => visit.company_id === company.id.toString() && visit.status === 'completed')
  }

  // Filter liked companies based on filter options
  const filteredLikedCompanies = likedCompanies.filter(company => {
    // Department filter
    if (filterOptions.department && company.department !== filterOptions.department) {
      return false
    }
    
    // Visit status filter
    const isVisited = isCompanyVisited(company)
    if (!filterOptions.showVisited && isVisited) {
      return false
    }
    if (!filterOptions.showUnvisited && !isVisited) {
      return false
    }
    
    return true
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-32">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--balena-dark)' }}>
            Visits & Favorites
          </h1>
          <p className="text-sm" style={{ color: 'var(--balena-brown)' }}>
            Track your favorite companies and visits
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'liked'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favorites ({likedCompanies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'visits'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Visits ({visits.length})</span>
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'liked' && (
          <>
            {/* Filters for Liked Companies */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filter Favorites</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Department</label>
                  <select
                    value={filterOptions.department}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Departments</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Operations">Operations</option>
                    <option value="R&D">R&D</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOptions.showVisited}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, showVisited: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show Visited</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOptions.showUnvisited}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, showUnvisited: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show Unvisited</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Stats for Liked Companies */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-yellow-500">
                <div className="text-2xl font-bold text-yellow-600">{likedCompanies.length}</div>
                <div className="text-xs text-yellow-600">Total Favorites</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-green-500">
                <div className="text-2xl font-bold text-green-600">
                  {likedCompanies.filter(c => isCompanyVisited(c)).length}
                </div>
                <div className="text-xs text-green-600">Visited</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-blue-500">
                <div className="text-2xl font-bold text-blue-600">
                  {likedCompanies.filter(c => !isCompanyVisited(c)).length}
                </div>
                <div className="text-xs text-blue-600">To Visit</div>
              </div>
            </div>

            {/* Liked Companies List */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--balena-dark)' }}>
                <Star className="w-5 h-5 text-yellow-500" />
                Favorite Companies ({filteredLikedCompanies.length})
              </h3>
              <div className="space-y-3">
                {filteredLikedCompanies.map((company) => {
                  const visited = isCompanyVisited(company)
                  return (
                    <button
                      key={company.id}
                      onClick={() => onCompanyClick(company)}
                      className={`w-full p-3 border rounded-lg hover:shadow-md transition-all text-left ${
                        visited ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium" style={{ color: 'var(--balena-dark)' }}>
                          {company.company}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {visited && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {company.visit_priority === 'MUST_VISIT' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Must Visit
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--balena-brown)' }}>
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                        {company.hall && company.stand && (
                          <span>• {company.hall}/{company.stand}</span>
                        )}
                        {company.department && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full ml-auto">
                            {company.department}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {filteredLikedCompanies.length === 0 && (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2 text-gray-600">No favorites found</h3>
                  <p className="text-sm text-gray-500">
                    {likedCompanies.length === 0 
                      ? 'Go to Discovery page and like companies to add them here'
                      : 'Try adjusting your filters'
                    }
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'visits' && (
          <>
            {/* Stats for Visits */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{plannedVisits.length}</div>
            <div className="text-xs text-blue-600">Planned</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{inProgressVisits.length}</div>
            <div className="text-xs text-orange-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{completedVisits.length}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
        </div>

        {/* Today's Visits */}
        {todayVisits.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--balena-dark)' }}>
              <Calendar className="w-5 h-5" />
              Today&apos;s Visits ({todayVisits.length})
            </h3>
            <div className="space-y-3">
              {todayVisits.map((visit) => (
                <button
                  key={visit.id}
                  onClick={() => onCompanyClick(visit.companies)}
                  className="w-full p-3 border rounded-lg hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium" style={{ color: 'var(--balena-dark)' }}>
                      {visit.companies.company}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(visit.status)}
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(visit.status)}`}>
                        {getStatusText(visit.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--balena-brown)' }}>
                    <MapPin className="w-4 h-4" />
                    <span>{visit.companies.location}</span>
                    {visit.companies.hall && visit.companies.stand && (
                      <span>• {visit.companies.hall}/{visit.companies.stand}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Visits */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold mb-3" style={{ color: 'var(--balena-dark)' }}>
            All Visits ({visits.length})
          </h3>
          <div className="space-y-3">
            {visits.map((visit) => (
              <button
                key={visit.id}
                onClick={() => onCompanyClick(visit.companies)}
                className="w-full p-3 border rounded-lg hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: 'var(--balena-dark)' }}>
                    {visit.companies.company}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(visit.status)}
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(visit.status)}`}>
                      {getStatusText(visit.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--balena-brown)' }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{visit.companies.location}</span>
                    {visit.companies.hall && visit.companies.stand && (
                      <span>• {visit.companies.hall}/{visit.companies.stand}</span>
                    )}
                  </div>
                  <span className="text-xs">
                    {new Date(visit.created_at).toLocaleDateString('en-US')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {visits.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2 text-gray-600">No visits yet</h3>
            <p className="text-sm text-gray-500">Start planning visits from the main dashboard</p>
          </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
