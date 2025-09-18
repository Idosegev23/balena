'use client'

import { useState, useEffect } from 'react'
import { supabase, CompanyRating, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { ThumbsUp, ThumbsDown, Users, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react'

interface EnhancedRealtimeRatingProps {
  companyId: number
  company?: Company
  size?: 'small' | 'medium' | 'large'
  showTeamRatings?: boolean
  showSuggestions?: boolean
  onSuggestionClick?: (company: Company) => void
}

interface RatingWithUser extends CompanyRating {
  user_email?: string
}

interface SimilarCompany extends Company {
  similarity_score: number
  similarity_reason: string
}

export function EnhancedRealtimeRating({ 
  companyId, 
  company,
  size = 'medium', 
  showTeamRatings = true,
  showSuggestions = true,
  onSuggestionClick
}: EnhancedRealtimeRatingProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [teamRatings, setTeamRatings] = useState<RatingWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ positive: 0, negative: 0, total: 0 })
  const [suggestions, setSuggestions] = useState<SimilarCompany[]>([])
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false)
  const [ratingTrend, setRatingTrend] = useState<'improving' | 'declining' | 'stable'>('stable')

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'p-1',
      icon: 'w-4 h-4',
      text: 'text-xs',
      gap: 'gap-1'
    },
    medium: {
      button: 'p-2',
      icon: 'w-5 h-5',
      text: 'text-sm',
      gap: 'gap-2'
    },
    large: {
      button: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-base',
      gap: 'gap-3'
    }
  }

  const config = sizeConfig[size]

  useEffect(() => {
    if (user) {
      fetchRatings()
      setupRealtimeSubscription()
    }
  }, [user, companyId])

  const fetchRatings = async () => {
    try {
      // Fetch all ratings for this company
      const { data: ratings, error } = await supabase
        .from('company_ratings')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setTeamRatings(ratings || [])
      
      // Find current user's rating
      const myRating = ratings?.find(r => r.user_id === user?.id)
      setUserRating(myRating?.rating || null)

      // Calculate stats
      const positive = ratings?.filter(r => r.rating === 1).length || 0
      const negative = ratings?.filter(r => r.rating === -1).length || 0
      setStats({ positive, negative, total: ratings?.length || 0 })

      // Analyze rating trend
      if (ratings && ratings.length >= 3) {
        const recentRatings = ratings.slice(-3)
        const avgRecent = recentRatings.reduce((sum, r) => sum + r.rating, 0) / recentRatings.length
        const olderRatings = ratings.slice(0, -3)
        const avgOlder = olderRatings.length > 0 ? olderRatings.reduce((sum, r) => sum + r.rating, 0) / olderRatings.length : 0
        
        if (avgRecent > avgOlder + 0.3) {
          setRatingTrend('improving')
        } else if (avgRecent < avgOlder - 0.3) {
          setRatingTrend('declining')
        } else {
          setRatingTrend('stable')
        }
      }

    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`company_ratings_${companyId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'company_ratings',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          fetchRatings() // Refresh when any rating changes
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const generateSimilarCompanySuggestions = async (rating: number) => {
    if (!company || rating !== 1 || !showSuggestions) return

    try {
      // Find companies with similar characteristics
      const { data: similarCompanies, error } = await supabase
        .from('companies')
        .select('*')
        .neq('id', companyId)
        .or(`department.eq.${company.department},location.ilike.%${company.location?.split(' ')[0]}%`)
        .order('relevance_score', { ascending: false })
        .limit(5)

      if (error) throw error

      // Calculate similarity scores
      const companiesWithScores: SimilarCompany[] = (similarCompanies || []).map(c => {
        let score = 0
        let reasons: string[] = []

        if (c.department === company.department) {
          score += 40
          reasons.push('Same department')
        }
        
        if (c.location?.includes(company.location?.split(' ')[0] || '')) {
          score += 30
          reasons.push('Similar location')
        }

        if (Math.abs((c.relevance_score || 0) - (company.relevance_score || 0)) <= 2) {
          score += 20
          reasons.push('Similar relevance score')
        }

        if (c.visit_priority === company.visit_priority) {
          score += 10
          reasons.push('Same priority level')
        }

        return {
          ...c,
          similarity_score: score,
          similarity_reason: reasons.join(', ')
        }
      }).filter(c => c.similarity_score >= 30) // Only show reasonably similar companies

      setSuggestions(companiesWithScores)
      if (companiesWithScores.length > 0) {
        setShowSuggestionPanel(true)
      }

    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }

  const handleRating = async (rating: -1 | 1) => {
    if (!user) return
    
    setLoading(true)
    
    try {
      const newRating = userRating === rating ? 0 : rating // Toggle off if clicking same rating
      
      // First, try to update existing rating
      const { data: existingRating } = await supabase
        .from('company_ratings')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .single()

      let error = null

      if (existingRating) {
        // Update existing rating
        if (newRating === 0) {
          // Delete if rating is 0 (neutral/removed)
          const result = await supabase
            .from('company_ratings')
            .delete()
            .eq('company_id', companyId)
            .eq('user_id', user.id)
          error = result.error
        } else {
          // Update existing rating
          const result = await supabase
            .from('company_ratings')
            .update({
              rating: newRating,
              updated_at: new Date().toISOString()
            })
            .eq('company_id', companyId)
            .eq('user_id', user.id)
          error = result.error
        }
      } else if (newRating !== 0) {
        // Insert new rating (only if not 0)
        const result = await supabase
          .from('company_ratings')
          .insert({
            company_id: companyId,
            user_id: user.id,
            rating: newRating,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        error = result.error
      }

      if (error) throw error

      // Add to activity feed (only if activity_feed table exists)
      try {
        await supabase
          .from('activity_feed')
          .insert({
            user_id: user.id,
            company_id: companyId,
            action_type: 'rated',
            action_data: {
              rating: newRating,
              previous_rating: userRating
            }
          })
      } catch (activityError) {
        // Ignore activity feed errors - it's not critical
        console.log('Activity feed not available:', activityError)
      }

      setUserRating(newRating === 0 ? null : newRating)
      
      // Generate suggestions if positive rating
      if (newRating === 1) {
        await generateSimilarCompanySuggestions(newRating)
      }
      
      // Refresh ratings to get updated stats
      await fetchRatings()
      
    } catch (error) {
      console.error('Error saving rating:', error)
    }
    
    setLoading(false)
  }

  const getRatingColor = (rating: number) => {
    if (rating === 1) return 'text-green-600 bg-green-50 border-green-200'
    if (rating === -1) return 'text-red-600 bg-red-50 border-red-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getTrendIcon = () => {
    switch (ratingTrend) {
      case 'improving':
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case 'declining':
        return <AlertCircle className="w-3 h-3 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center ${config.gap}`}>
        {/* Thumbs Up */}
        <button
          onClick={() => handleRating(1)}
          disabled={loading}
          className={`
            ${config.button} rounded-lg border-2 transition-all disabled:opacity-50
            ${userRating === 1 
              ? 'text-green-600 bg-green-100 border-green-300 shadow-md' 
              : 'text-gray-600 bg-white border-gray-200 hover:bg-green-50 hover:border-green-200'
            }
          `}
          title="Relevant for Balena"
        >
          <ThumbsUp className={`${config.icon} ${userRating === 1 ? 'fill-current' : ''}`} />
        </button>

        {/* Stats with trend indicator */}
        {showTeamRatings && stats.total > 0 && (
          <div className={`flex items-center ${config.gap} ${config.text} text-gray-600`}>
            <div className="flex items-center gap-1">
              <span className="text-green-600 font-medium">{stats.positive}</span>
              <ThumbsUp className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-600 font-medium">{stats.negative}</span>
              <ThumbsDown className="w-3 h-3 text-red-600" />
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{stats.total}</span>
              {getTrendIcon()}
            </div>
          </div>
        )}

        {/* Thumbs Down */}
        <button
          onClick={() => handleRating(-1)}
          disabled={loading}
          className={`
            ${config.button} rounded-lg border-2 transition-all disabled:opacity-50
            ${userRating === -1 
              ? 'text-red-600 bg-red-100 border-red-300 shadow-md' 
              : 'text-gray-600 bg-white border-gray-200 hover:bg-red-50 hover:border-red-200'
            }
          `}
          title="Not relevant for Balena"
        >
          <ThumbsDown className={`${config.icon} ${userRating === -1 ? 'fill-current' : ''}`} />
        </button>

        {/* Suggestions trigger */}
        {suggestions.length > 0 && (
          <button
            onClick={() => setShowSuggestionPanel(!showSuggestionPanel)}
            className={`${config.button} rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all`}
            title="View similar companies"
          >
            <Lightbulb className={`${config.icon}`} />
          </button>
        )}

        {/* Team Avatars (only for large size) */}
        {showTeamRatings && size === 'large' && teamRatings.length > 0 && (
          <div className="flex items-center gap-1 mr-2">
            {teamRatings.slice(0, 3).map((rating, index) => (
              <div
                key={rating.id}
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2
                  ${getRatingColor(rating.rating)}
                `}
                title={`User: ${
                  rating.rating === 1 ? '👍 Relevant' : rating.rating === -1 ? '👎 Not relevant' : '😐 Neutral'
                }`}
              >
                {rating.rating === 1 ? '👍' : rating.rating === -1 ? '👎' : '😐'}
              </div>
            ))}
            {teamRatings.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs text-gray-600">
                +{teamRatings.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Suggestions Panel */}
      {showSuggestionPanel && suggestions.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Similar Companies You Might Like</h4>
            <button
              onClick={() => setShowSuggestionPanel(false)}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full text-left p-3 bg-white rounded-lg border hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm text-gray-800 group-hover:text-blue-600">
                    {suggestion.company}
                  </h5>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {suggestion.similarity_score}% match
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">📍 {suggestion.location}</p>
                <p className="text-xs text-blue-600">{suggestion.similarity_reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
