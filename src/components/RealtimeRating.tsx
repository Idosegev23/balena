'use client'

import { useState, useEffect } from 'react'
import { supabase, CompanyRating } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { ThumbsUp, ThumbsDown, Users } from 'lucide-react'

interface RealtimeRatingProps {
  companyId: number
  size?: 'small' | 'medium' | 'large'
  showTeamRatings?: boolean
}

interface RatingWithUser extends CompanyRating {
  user?: {
    full_name?: string
    email: string
  }
}

export function RealtimeRating({ companyId, size = 'medium', showTeamRatings = true }: RealtimeRatingProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [teamRatings, setTeamRatings] = useState<RatingWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ positive: 0, negative: 0, total: 0 })

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
        .select(`
          *,
          user:users(full_name, email)
        `)
        .eq('company_id', companyId)

      if (error) throw error

      setTeamRatings(ratings || [])
      
      // Find current user's rating
      const myRating = ratings?.find(r => r.user_id === user?.id)
      setUserRating(myRating?.rating || null)

      // Calculate stats
      const positive = ratings?.filter(r => r.rating === 1).length || 0
      const negative = ratings?.filter(r => r.rating === -1).length || 0
      setStats({ positive, negative, total: ratings?.length || 0 })

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

  const handleRating = async (rating: -1 | 1) => {
    if (!user) return
    
    setLoading(true)
    
    try {
      const newRating = userRating === rating ? 0 : rating // Toggle off if clicking same rating
      
      const { error } = await supabase
        .from('company_ratings')
        .upsert({
          company_id: companyId,
          user_id: user.id,
          rating: newRating,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Add to activity feed
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

      setUserRating(newRating === 0 ? null : newRating)
      
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

  return (
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
        title="רלוונטי לBalena"
      >
        <ThumbsUp className={`${config.icon} ${userRating === 1 ? 'fill-current' : ''}`} />
      </button>

      {/* Stats */}
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
        title="לא רלוונטי לBalena"
      >
        <ThumbsDown className={`${config.icon} ${userRating === -1 ? 'fill-current' : ''}`} />
      </button>

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
              title={`${rating.user?.full_name || rating.user?.email}: ${
                rating.rating === 1 ? '👍 רלוונטי' : rating.rating === -1 ? '👎 לא רלוונטי' : '😐 נייטרלי'
              }`}
            >
              {rating.user?.full_name?.charAt(0) || rating.user?.email?.charAt(0) || '?'}
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
  )
}
