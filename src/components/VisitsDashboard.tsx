'use client'

import { useState, useEffect } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Calendar, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchVisits()
    }
  }, [user])

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
        return 'מתוכנן'
      case 'in_progress':
        return 'בתהליך'
      case 'completed':
        return 'הושלם'
      default:
        return 'לא ידוע'
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
    <div className="p-4 pb-24">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--balena-dark)' }}>
            ביקורים ומעקב
          </h1>
          <p className="text-sm" style={{ color: 'var(--balena-brown)' }}>
            ניהול ביקורים בתערוכה
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{plannedVisits.length}</div>
            <div className="text-xs text-blue-600">מתוכנן</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{inProgressVisits.length}</div>
            <div className="text-xs text-orange-600">בתהליך</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{completedVisits.length}</div>
            <div className="text-xs text-green-600">הושלם</div>
          </div>
        </div>

        {/* Today's Visits */}
        {todayVisits.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--balena-dark)' }}>
              <Calendar className="w-5 h-5" />
              ביקורים להיום ({todayVisits.length})
            </h3>
            <div className="space-y-3">
              {todayVisits.map((visit) => (
                <button
                  key={visit.id}
                  onClick={() => onCompanyClick(visit.companies)}
                  className="w-full p-3 border rounded-lg hover:shadow-md transition-all text-right"
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
            כל הביקורים ({visits.length})
          </h3>
          <div className="space-y-3">
            {visits.map((visit) => (
              <button
                key={visit.id}
                onClick={() => onCompanyClick(visit.companies)}
                className="w-full p-3 border rounded-lg hover:shadow-md transition-all text-right"
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
                    {new Date(visit.created_at).toLocaleDateString('he-IL')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {visits.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2 text-gray-600">אין ביקורים עדיין</h3>
            <p className="text-sm text-gray-500">התחל לתכנן ביקורים מהדאשבורד הראשי</p>
          </div>
        )}
      </div>
    </div>
  )
}
