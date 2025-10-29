'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Calendar, Clock, MapPin } from 'lucide-react'
import { Visit } from '../data/types'

interface VisitsTableProps {
  visits: Visit[]
}

type SortField = keyof Visit
type SortDirection = 'asc' | 'desc'

export function VisitsTable({ visits }: VisitsTableProps) {
  const [sortField, setSortField] = useState<SortField>('visit_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedVisits = [...visits].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''

    // Handle arrays
    if (Array.isArray(aValue)) aValue = aValue.join(', ')
    if (Array.isArray(bValue)) bValue = bValue.join(', ')

    // Handle dates
    if (sortField === 'visit_date') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const toggleRowExpansion = (visitId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId)
    } else {
      newExpanded.add(visitId)
    }
    setExpandedRows(newExpanded)
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  )

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Details
              </th>
              <SortableHeader field="company">Company</SortableHeader>
              <SortableHeader field="hall">Hall</SortableHeader>
              <SortableHeader field="stand">Stand</SortableHeader>
              <SortableHeader field="department">Department</SortableHeader>
              <SortableHeader field="visit_date">Visit Date</SortableHeader>
              <SortableHeader field="duration_minutes">Duration</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Follow-up
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedVisits.map((visit) => {
              const { date, time } = formatDateTime(visit.visit_date)
              return (
                <React.Fragment key={visit.id}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRowExpansion(visit.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        {expandedRows.has(visit.id) ? 'Hide' : 'Show'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-900 max-w-xs">
                        {visit.company}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                      {visit.hall}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                      {visit.stand}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                      {visit.department}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                        <div>
                          <div className="font-medium">{date}</div>
                          <div className="text-xs text-slate-500">{time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {visit.duration_minutes ? (
                        <div className="flex items-center text-sm text-slate-900">
                          <Clock className="w-4 h-4 mr-2 text-slate-500" />
                          {visit.duration_minutes} min
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        visit.follow_up_required 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {visit.follow_up_required ? 'Required' : 'None'}
                      </span>
                    </td>
                  </tr>
                  {expandedRows.has(visit.id) && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 bg-slate-50">
                        <div className="space-y-4">
                          {/* Visit Details */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Visit Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-slate-700">Location:</span>
                                <div className="text-slate-900">Hall {visit.hall}, Stand {visit.stand}</div>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700">Department:</span>
                                <div className="text-slate-900">{visit.department}</div>
                              </div>
                              {visit.duration_minutes && (
                                <div>
                                  <span className="font-medium text-slate-700">Duration:</span>
                                  <div className="text-slate-900">{visit.duration_minutes} minutes</div>
                                </div>
                              )}
                              {visit.follow_up_date && (
                                <div>
                                  <span className="font-medium text-slate-700">Follow-up Date:</span>
                                  <div className="text-slate-900">{new Date(visit.follow_up_date).toLocaleDateString()}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Contacts Met */}
                          {visit.contacts_met && visit.contacts_met.length > 0 && (
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">Contacts Met</h4>
                              <div className="flex flex-wrap gap-2">
                                {visit.contacts_met.map((contact, index) => (
                                  <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                    {contact}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Visit Notes */}
                          {visit.notes && (
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">Visit Notes</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">{visit.notes}</p>
                            </div>
                          )}

                          {/* Next Steps */}
                          {visit.next_steps && (
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">Next Steps</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">{visit.next_steps}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
