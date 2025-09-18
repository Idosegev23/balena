'use client'

import { useState, useEffect } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users, 
  ChevronRight, 
  Brain,
  Zap,
  Star,
  MapPin,
  Building2,
  AlertTriangle
} from 'lucide-react'

interface ProactiveRecommendationsProps {
  currentCompany?: Company
  onCompanyClick?: (company: Company) => void
  trigger?: 'rating_change' | 'pattern_detected' | 'manual'
}

interface SmartRecommendation {
  id: string
  title: string
  description: string
  companies: Company[]
  reason: string
  confidence: number
  icon: React.ReactNode
  priority: 'critical' | 'high' | 'medium' | 'low'
  trigger: string
  actionable: boolean
}

interface PatternAnalysis {
  trending_departments: string[]
  high_rated_locations: string[]
  preferred_company_sizes: string[]
  successful_patterns: any[]
}

export function ProactiveRecommendations({ 
  currentCompany, 
  onCompanyClick, 
  trigger = 'manual' 
}: ProactiveRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [patterns, setPatterns] = useState<PatternAnalysis | null>(null)
  const [showPatternInsights, setShowPatternInsights] = useState(false)

  useEffect(() => {
    if (user) {
      analyzePatterns()
      generateProactiveRecommendations()
    }
  }, [user, currentCompany, trigger])

  const analyzePatterns = async () => {
    try {
      // Analyze team rating patterns
      const { data: ratings, error: ratingsError } = await supabase
        .from('company_ratings')
        .select(`
          *,
          companies (
            department,
            location,
            employees_count,
            visit_priority,
            relevance_score
          )
        `)
        .eq('rating', 1) // Only positive ratings

      if (ratingsError) throw ratingsError

      // Analyze department trends
      const deptCounts: { [key: string]: number } = {}
      const locationCounts: { [key: string]: number } = {}
      const sizeCounts: { [key: string]: number } = {}

      ratings?.forEach(rating => {
        const company = rating.companies as any
        if (company) {
          // Department analysis
          if (company.department) {
            deptCounts[company.department] = (deptCounts[company.department] || 0) + 1
          }
          
          // Location analysis
          if (company.location) {
            const country = company.location.split(',').pop()?.trim() || company.location
            locationCounts[country] = (locationCounts[country] || 0) + 1
          }
          
          // Size analysis
          if (company.employees_count) {
            const sizeCategory = categorizeCompanySize(company.employees_count)
            sizeCounts[sizeCategory] = (sizeCounts[sizeCategory] || 0) + 1
          }
        }
      })

      const trendingDepartments = Object.entries(deptCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([dept]) => dept)

      const highRatedLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([location]) => location)

      const preferredSizes = Object.entries(sizeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([size]) => size)

      setPatterns({
        trending_departments: trendingDepartments,
        high_rated_locations: highRatedLocations,
        preferred_company_sizes: preferredSizes,
        successful_patterns: []
      })

    } catch (error) {
      console.error('Error analyzing patterns:', error)
    }
  }

  const categorizeCompanySize = (employeeCount: string): string => {
    const count = parseInt(employeeCount.replace(/[^\d]/g, ''))
    if (count < 50) return 'Small (< 50)'
    if (count < 250) return 'Medium (50-250)'
    if (count < 1000) return 'Large (250-1000)'
    return 'Enterprise (1000+)'
  }

  const generateProactiveRecommendations = async () => {
    setLoading(true)
    
    try {
      // Fetch all companies with ratings
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          company_ratings (
            rating,
            user_id,
            created_at
          )
        `)
        .order('relevance_score', { ascending: false })

      if (companiesError) throw companiesError

      // Fetch team ratings for analysis
      const { data: teamRatings, error: ratingsError } = await supabase
        .from('company_ratings')
        .select('*')

      if (ratingsError) throw ratingsError

      const smartRecommendations: SmartRecommendation[] = []

      // 1. CRITICAL: Companies with high team consensus but user hasn't rated
      const highConsensusUnrated = companies?.filter(company => {
        const companyRatings = teamRatings?.filter(r => r.company_id === company.id) || []
        const positiveRatings = companyRatings.filter(r => r.rating === 1)
        const userRating = companyRatings.find(r => r.user_id === user?.id)
        
        return !userRating && 
               companyRatings.length >= 2 && 
               positiveRatings.length / companyRatings.length >= 0.75
      }) || []

      if (highConsensusUnrated.length > 0) {
        smartRecommendations.push({
          id: 'high_consensus_unrated',
          title: 'Team Favorites You Haven\'t Rated',
          description: 'Companies with strong positive team consensus',
          companies: highConsensusUnrated.slice(0, 4),
          reason: 'High team agreement (75%+ positive)',
          confidence: 95,
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          priority: 'critical',
          trigger: 'pattern_analysis',
          actionable: true
        })
      }

      // 2. HIGH: Pattern-based recommendations
      if (patterns && patterns.trending_departments.length > 0) {
        const patternBasedCompanies = companies?.filter(company => {
          const userRating = company.company_ratings?.find((r: any) => r.user_id === user?.id)
          return !userRating && 
                 patterns.trending_departments.includes(company.department || '') &&
                 (company.relevance_score || 0) >= 7
        }) || []

        if (patternBasedCompanies.length > 0) {
          smartRecommendations.push({
            id: 'pattern_based',
            title: 'Based on Your Team\'s Preferences',
            description: `Companies in ${patterns.trending_departments.join(', ')}`,
            companies: patternBasedCompanies.slice(0, 6),
            reason: `Team shows strong interest in ${patterns.trending_departments[0]}`,
            confidence: 85,
            icon: <Brain className="w-5 h-5 text-purple-600" />,
            priority: 'high',
            trigger: 'pattern_analysis',
            actionable: true
          })
        }
      }

      // 3. HIGH: Similar to recently highly rated companies
      if (currentCompany) {
        const recentPositiveRatings = teamRatings
          ?.filter(r => r.rating === 1 && new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .map(r => r.company_id) || []

        const similarToRecent = companies?.filter(company => {
          if (recentPositiveRatings.includes(company.id) || company.id === currentCompany.id) return false
          
          const userRating = company.company_ratings?.find((r: any) => r.user_id === user?.id)
          if (userRating) return false

          // Check similarity
          const sameDepartment = company.department === currentCompany.department
          const similarLocation = company.location?.includes(currentCompany.location?.split(' ')[0] || '') || false
          const similarRelevance = Math.abs((company.relevance_score || 0) - (currentCompany.relevance_score || 0)) <= 2
          
          return sameDepartment || similarLocation || similarRelevance
        }) || []

        if (similarToRecent.length > 0) {
          smartRecommendations.push({
            id: 'similar_to_recent',
            title: 'Similar to Recent Favorites',
            description: `Companies similar to ${currentCompany.company}`,
            companies: similarToRecent.slice(0, 5),
            reason: 'Similar characteristics to recently rated companies',
            confidence: 80,
            icon: <Zap className="w-5 h-5 text-orange-600" />,
            priority: 'high',
            trigger: 'similarity_analysis',
            actionable: true
          })
        }
      }

      // 4. MEDIUM: Location-based hot spots
      if (patterns && patterns.high_rated_locations.length > 0) {
        const locationHotspots = companies?.filter(company => {
          const userRating = company.company_ratings?.find((r: any) => r.user_id === user?.id)
          const location = company.location?.split(',').pop()?.trim() || company.location
          
          return !userRating && 
                 patterns.high_rated_locations.includes(location || '') &&
                 (company.relevance_score || 0) >= 6
        }) || []

        if (locationHotspots.length > 0) {
          smartRecommendations.push({
            id: 'location_hotspots',
            title: 'Companies from Hot Locations',
            description: `From ${patterns.high_rated_locations.join(', ')}`,
            companies: locationHotspots.slice(0, 6),
            reason: `Team shows preference for companies from ${patterns.high_rated_locations[0]}`,
            confidence: 70,
            icon: <MapPin className="w-5 h-5 text-blue-600" />,
            priority: 'medium',
            trigger: 'location_analysis',
            actionable: true
          })
        }
      }

      // 5. MEDIUM: Must visit companies not yet planned
      const mustVisitUnplanned = companies?.filter(company => {
        const hasVisitPlan = company.meeting_scheduled || company.meeting_completed
        return company.visit_priority === 'MUST_VISIT' && !hasVisitPlan
      }) || []

      if (mustVisitUnplanned.length > 0) {
        smartRecommendations.push({
          id: 'must_visit_unplanned',
          title: 'Must-Visit Companies Need Planning',
          description: 'High priority companies without visit plans',
          companies: mustVisitUnplanned.slice(0, 8),
          reason: 'Marked as must-visit but no meeting scheduled',
          confidence: 90,
          icon: <Target className="w-5 h-5 text-red-600" />,
          priority: 'high',
          trigger: 'planning_gap',
          actionable: true
        })
      }

      // Sort by priority and confidence
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      smartRecommendations.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return b.confidence - a.confidence
      })

      setRecommendations(smartRecommendations)
      
    } catch (error) {
      console.error('Error generating proactive recommendations:', error)
    }
    
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-300 bg-red-50'
      case 'high': return 'border-orange-300 bg-orange-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      case 'low': return 'border-gray-300 bg-gray-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 animate-pulse" style={{ color: 'var(--balena-dark)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            Analyzing Patterns...
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No smart recommendations yet</h3>
        <p className="text-sm text-gray-500">
          Rate more companies to unlock AI-powered insights and suggestions
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            AI-Powered Insights
          </h2>
        </div>
        
        {patterns && (
          <button
            onClick={() => setShowPatternInsights(!showPatternInsights)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            Pattern Insights
          </button>
        )}
      </div>

      {/* Pattern Insights Panel */}
      {showPatternInsights && patterns && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-3">Team Patterns Detected</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-700 mb-1">Trending Departments:</p>
              <p className="text-blue-600">{patterns.trending_departments.join(', ') || 'None yet'}</p>
            </div>
            <div>
              <p className="font-medium text-blue-700 mb-1">Preferred Locations:</p>
              <p className="text-blue-600">{patterns.high_rated_locations.join(', ') || 'None yet'}</p>
            </div>
            <div>
              <p className="font-medium text-blue-700 mb-1">Company Sizes:</p>
              <p className="text-blue-600">{patterns.preferred_company_sizes.join(', ') || 'None yet'}</p>
            </div>
          </div>
        </div>
      )}

      {recommendations.map((rec) => (
        <div 
          key={rec.id} 
          className={`border-2 rounded-xl p-4 ${getPriorityColor(rec.priority)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {rec.icon}
              <div>
                <h3 className="font-bold text-lg">{rec.title}</h3>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(rec.priority)}`}>
                {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
              </div>
              <div className="text-xs text-gray-500">
                {rec.confidence}% confidence
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 italic">{rec.reason}</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rec.companies.map((company) => (
              <button
                key={company.id}
                onClick={() => onCompanyClick?.(company)}
                className="text-left p-3 bg-white rounded-lg border hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm group-hover:text-blue-600" style={{ color: 'var(--balena-dark)' }}>
                    {company.company}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--balena-brown)' }}>
                  📍 {company.location}
                </p>
                <div className="flex items-center gap-2">
                  {company.relevance_score && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      ⭐ {company.relevance_score}/10
                    </span>
                  )}
                  {company.visit_priority === 'MUST_VISIT' && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      🎯 Must Visit
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {rec.companies.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No companies available in this category
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
