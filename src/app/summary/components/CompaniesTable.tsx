'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ExternalLink, User, Phone, Mail } from 'lucide-react'
import { Company } from '../data/types'

interface CompaniesTableProps {
  companies: Company[]
}

type SortField = keyof Company
type SortDirection = 'asc' | 'desc'

export function CompaniesTable({ companies }: CompaniesTableProps) {
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

  const sortedCompanies = [...companies].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''

    // Handle arrays (tags)
    if (Array.isArray(aValue)) aValue = aValue.join(', ')
    if (Array.isArray(bValue)) bValue = bValue.join(', ')

    // Handle dates
    if (sortField === 'visit_date') {
      aValue = aValue ? new Date(aValue as string).getTime() : 0
      bValue = bValue ? new Date(bValue as string).getTime() : 0
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

  const toggleRowExpansion = (companyId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId)
    } else {
      newExpanded.add(companyId)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MUST_VISIT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
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
              <SortableHeader field="visit_priority">Priority</SortableHeader>
              <SortableHeader field="relevance_score">Score</SortableHeader>
              <SortableHeader field="visit_date">Visit Date</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedCompanies.map((company) => (
              <React.Fragment key={company.id}>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleRowExpansion(company.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      {expandedRows.has(company.id) ? 'Hide' : 'Show'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-900 max-w-xs">
                      {company.company}
                    </div>
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                    {company.hall}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                    {company.stand}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                    {company.department}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(company.visit_priority)}`}>
                      {company.visit_priority?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-slate-900">{company.relevance_score}</div>
                      <div className="ml-2 w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${company.relevance_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                    {company.visit_date ? new Date(company.visit_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {company.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded">
                          {tag}
                        </span>
                      ))}
                      {company.tags.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded">
                          +{company.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(company.id) && (
                  <tr>
                    <td colSpan={9} className="px-4 py-4 bg-slate-50">
                      <div className="space-y-4">
                        {/* Contact Information */}
                        {(company.contact_person || company.email || company.phone) && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Contact Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {company.contact_person && (
                                <div>
                                  <span className="font-medium text-slate-700">Contact Person:</span>
                                  <div className="text-slate-900">{company.contact_person}</div>
                                </div>
                              )}
                              {company.email && (
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2 text-slate-500" />
                                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-800">
                                    {company.email}
                                  </a>
                                </div>
                              )}
                              {company.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2 text-slate-500" />
                                  <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-800">
                                    {company.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {company.description && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {company.description.length > 300 
                                ? `${company.description.substring(0, 300)}...` 
                                : company.description}
                            </p>
                          </div>
                        )}

                        {/* Why Relevant */}
                        {company.why_relevant && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Why Relevant</h4>
                            <p className="text-sm text-slate-700 leading-relaxed">{company.why_relevant}</p>
                          </div>
                        )}

                        {/* All Tags */}
                        {company.tags.length > 0 && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">All Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {company.tags.map(tag => (
                                <span key={tag} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
