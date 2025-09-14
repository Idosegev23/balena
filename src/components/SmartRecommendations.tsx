'use client'

import { useState, useEffect } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Lightbulb, TrendingUp, Target, Users, ChevronRight } from 'lucide-react'

interface SmartRecommendationsProps {
  currentCompany?: Company
  onCompanyClick?: (company: Company) => void
}

interface RecommendationGroup {
  title: string
  description: string
  companies: Company[]
  reason: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

export function SmartRecommendations({ currentCompany, onCompanyClick }: SmartRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      generateRecommendations()
    }
  }, [user, currentCompany])

  const generateRecommendations = async () => {
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

      // Fetch team ratings
      const { data: teamRatings, error: ratingsError } = await supabase
        .from('company_ratings')
        .select('*')
        .eq('rating', 1) // Only positive ratings

      if (ratingsError) throw ratingsError

      const recommendationGroups: RecommendationGroup[] = []

      // 1. Based on team positive ratings
      if (teamRatings && teamRatings.length > 0) {
        const highlyRatedCompanies = companies?.filter(company => {
          const positiveRatings = teamRatings.filter(r => r.company_id === company.id)
          return positiveRatings.length >= 2 // At least 2 team members liked it
        }) || []

        if (highlyRatedCompanies.length > 0) {
          recommendationGroups.push({
            title: 'Team Recommended',
            description: 'Companies that received positive ratings from multiple team members',
            companies: highlyRatedCompanies.slice(0, 5),
            reason: 'Team rated positively',
            icon: <Users className="w-5 h-5 text-green-600" />,
            priority: 'high'
          })
        }
      }

      // 2. Similar companies based on current company
      if (currentCompany) {
        const similarCompanies = companies?.filter(company => {
          if (company.id === currentCompany.id) return false
          
          // Check similarity by department, connection_type, or keywords
          const sameDepartment = company.department === currentCompany.department
          const sameConnectionType = company.connection_type === currentCompany.connection_type
          const similarLocation = company.location?.includes(currentCompany.location?.split(' ')[0] || '') || false
          
          return sameDepartment || sameConnectionType || similarLocation
        }) || []

        if (similarCompanies.length > 0) {
          recommendationGroups.push({
            title: 'Similar Companies',
            description: `Similar to ${currentCompany.company}`,
            companies: similarCompanies.slice(0, 4),
            reason: 'Similar characteristics',
            icon: <Target className="w-5 h-5 text-blue-600" />,
            priority: 'medium'
          })
        }
      }

      // 3. High relevance score companies not yet rated
      const unratedHighRelevance = companies?.filter(company => {
        const hasUserRating = company.company_ratings?.some((r: any) => r.user_id === user?.id)
        return !hasUserRating && (company.relevance_score || 0) >= 8
      }) || []

      if (unratedHighRelevance.length > 0) {
        recommendationGroups.push({
          title: 'High Relevance',
          description: 'Companies with high relevance scores not yet rated',
          companies: unratedHighRelevance.slice(0, 6),
          reason: 'High relevance score',
          icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
          priority: 'high'
        })
      }

      // 4. Must visit companies
      const mustVisitCompanies = companies?.filter(company => 
        company.visit_priority === 'MUST_VISIT'
      ) || []

      if (mustVisitCompanies.length > 0) {
        recommendationGroups.push({
          title: 'Must Visit',
          description: 'Companies marked as highest priority',
          companies: mustVisitCompanies.slice(0, 8),
          reason: 'Highest priority',
          icon: <Target className="w-5 h-5 text-red-600" />,
          priority: 'high'
        })
      }

      setRecommendations(recommendationGroups)
      
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
    
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-orange-200 bg-orange-50'
      case 'low': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            Smart Recommendations
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
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
        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No recommendations available</h3>
        <p className="text-sm text-gray-500">
          Start rating companies to receive personalized recommendations
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
          Smart Recommendations
        </h2>
      </div>

      {recommendations.map((group, groupIndex) => (
        <div 
          key={groupIndex} 
          className={`border-2 rounded-xl p-4 ${getPriorityColor(group.priority)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {group.icon}
              <div>
                <h3 className="font-bold text-lg">{group.title}</h3>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(group.priority)}`}>
              {group.priority === 'high' ? 'High Priority' : 
               group.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.companies.map((company) => (
              <button
                key={company.id}
                onClick={() => onCompanyClick?.(company)}
                className="text-right p-3 bg-white rounded-lg border hover:shadow-md transition-all group"
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
                {company.relevance_score && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      ⭐ {company.relevance_score}/10
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {group.companies.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No companies available in this category
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
