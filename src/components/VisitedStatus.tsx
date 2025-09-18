'use client'

import React, { useState } from 'react'
import { CheckCircle2, Circle, Calendar, User } from 'lucide-react'
import { Company, supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface VisitedStatusProps {
  company: Company
  onUpdate: (updatedCompany: Company) => void
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
}

export function VisitedStatus({ company, onUpdate, size = 'medium', showDetails = true }: VisitedStatusProps) {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)

  const toggleVisited = async () => {
    if (!user || updating) return

    setUpdating(true)
    try {
      const newVisitedStatus = !company.visited
      const updateData: any = {
        visited: newVisitedStatus,
        visit_date: newVisitedStatus ? new Date().toISOString() : null,
        visited_by: newVisitedStatus ? user.id : null
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', company.id)
        .select()
        .single()

      if (error) throw error

      onUpdate({ ...company, ...updateData })
    } catch (error) {
      console.error('Error updating visit status:', error)
    }
    setUpdating(false)
  }

  const formatVisitDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'h-4 w-4'
      case 'large': return 'h-8 w-8'
      default: return 'h-5 w-5'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'small': return 'text-xs'
      case 'large': return 'text-base'
      default: return 'text-sm'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleVisited}
        disabled={updating}
        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
          company.visited
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={company.visited ? 'Mark as not visited' : 'Mark as visited'}
      >
        {company.visited ? (
          <CheckCircle2 className={`${getIconSize()} text-green-600`} />
        ) : (
          <Circle className={`${getIconSize()} text-gray-400`} />
        )}
        <span className={`${getTextSize()} font-medium`}>
          {company.visited ? 'Visited' : 'Not Visited'}
        </span>
      </button>

      {showDetails && company.visited && company.visit_date && (
        <div className={`${getTextSize()} text-gray-500 flex items-center gap-1`}>
          <Calendar className="h-3 w-3" />
          <span>{formatVisitDate(company.visit_date)}</span>
        </div>
      )}

      {showDetails && company.visited && company.visited_by && (
        <div className={`${getTextSize()} text-gray-500 flex items-center gap-1`}>
          <User className="h-3 w-3" />
          <span>by Team</span>
        </div>
      )}
    </div>
  )
}
