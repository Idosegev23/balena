'use client'

import { useState, useEffect } from 'react'
import { supabase, Company, Visit } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Eye, Clock, CheckCircle, Users, AlertTriangle, MapPin } from 'lucide-react'

interface VisitTrackerProps {
  company: Company
}

interface VisitWithUser extends Visit {
  user_email?: string
}

export function VisitTracker({ company }: VisitTrackerProps) {
  const { user } = useAuth()
  const [visits, setVisits] = useState<VisitWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchVisits()
    setupRealtimeSubscription()
  }, [company.id])

  const fetchVisits = async () => {
    try {
      const { data: visitsData, error } = await supabase
        .from('visits')
        .select('*')
        .eq('company_id', company.id)
        .order('visit_date', { ascending: false })

      if (error) throw error

      setVisits(visitsData || [])

      // Check if current user has an active visit
      const activeVisit = visitsData?.find(v => 
        v.user_id === user?.id && 
        (v.visit_status === 'planned' || v.visit_status === 'in_progress')
      )
      setCurrentVisit(activeVisit || null)

    } catch (error) {
      console.error('Error fetching visits:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`visits_${company.id}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'visits',
          filter: `company_id=eq.${company.id}`
        },
        () => {
          fetchVisits() // Refresh when visits change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleStartVisit = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      // Check if someone else is already visiting
      const activeVisits = visits.filter(v => 
        v.visit_status === 'in_progress' && v.user_id !== user.id
      )

      if (activeVisits.length > 0) {
        alert(`⚠️ חבר צוות אחר כבר ביוקר את החברה הזו!`)
        return
      }

      const { error } = await supabase
        .from('visits')
        .upsert({
          company_id: company.id,
          user_id: user.id,
          visit_status: 'in_progress',
          visit_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Add to activity feed
      await supabase
        .from('activity_feed')
        .insert({
          user_name: user.user_metadata?.full_name || user.email,
          action_type: 'visit_started',
          company_id: company.id,
          description: `התחיל ביקור ב-${company.company}`,
          metadata: {
            hall: company.hall,
            stand: company.stand,
            location: company.location
          }
        })

      fetchVisits()
      
    } catch (error) {
      console.error('Error starting visit:', error)
    }
    
    setLoading(false)
  }

  const handleEndVisit = async () => {
    if (!user || !currentVisit) return
    
    setLoading(true)
    
    try {
      const visitDuration = Math.round(
        (new Date().getTime() - new Date(currentVisit.visit_date).getTime()) / (1000 * 60)
      )

      const { error } = await supabase
        .from('visits')
        .update({
          visit_status: 'completed',
          duration_minutes: visitDuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentVisit.id)

      if (error) throw error

      // Add to activity feed
      await supabase
        .from('activity_feed')
        .insert({
          user_name: user.user_metadata?.full_name || user.email,
          action_type: 'visit_completed',
          company_id: company.id,
          description: `סיים ביקור ב-${company.company} (${visitDuration} דקות)`,
          metadata: {
            duration: visitDuration,
            hall: company.hall,
            stand: company.stand
          }
        })

      fetchVisits()
      
    } catch (error) {
      console.error('Error ending visit:', error)
    }
    
    setLoading(false)
  }

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return <Eye className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'planned': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'בביקור כעת'
      case 'completed': return 'ביקור הושלם'
      case 'planned': return 'מתוכנן'
      case 'skipped': return 'דולג'
      default: return status
    }
  }

  const activeVisits = visits.filter(v => v.visit_status === 'in_progress')
  const completedVisits = visits.filter(v => v.visit_status === 'completed')
  const isCurrentlyVisited = activeVisits.length > 0
  const isUserVisiting = currentVisit?.visit_status === 'in_progress'

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div className="space-y-3">
        {isCurrentlyVisited && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <div className="font-medium text-yellow-800">
                {isUserVisiting ? 'אתה ביוקר כעת' : 'חבר צוות אחר ביוקר כעת'}
              </div>
              <div className="text-sm text-yellow-600">
                {activeVisits.map(visit => (
                  <span key={visit.id}>
                    חבר צוות • 
                    {new Date(visit.visit_date).toLocaleTimeString('he-IL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isUserVisiting && !isCurrentlyVisited && (
            <button
              onClick={handleStartVisit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}
            >
              <Eye className="w-5 h-5" />
              התחל ביקור
            </button>
          )}

          {isUserVisiting && (
            <button
              onClick={handleEndVisit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              סיים ביקור
            </button>
          )}

          {completedVisits.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-3 border rounded-lg hover:bg-gray-50"
              style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}
            >
              <Users className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Visit History */}
      {showHistory && visits.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            היסטוריית ביקורים ({visits.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {visits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getVisitStatusColor(visit.visit_status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(visit.visit_status)}
                      {getStatusText(visit.visit_status)}
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    חבר צוות
                  </span>
                </div>
                <div className="text-xs text-gray-600 text-right">
                  <div>
                    {new Date(visit.visit_date).toLocaleDateString('he-IL')} • 
                    {new Date(visit.visit_date).toLocaleTimeString('he-IL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  {visit.duration_minutes && (
                    <div>{visit.duration_minutes} דקות</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{visits.length}</div>
          <div className="text-xs text-blue-600">סה"כ ביקורים</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">{completedVisits.length}</div>
          <div className="text-xs text-green-600">הושלמו</div>
        </div>
      </div>
    </div>
  )
}
