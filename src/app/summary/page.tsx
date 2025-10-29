'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Table, Calendar, Filter as FilterIcon } from 'lucide-react'
import Link from 'next/link'

// Import data and components
import { companiesData } from './data/companies'
import { visitsData } from './data/visits'
import { FilterState } from './data/types'
import { DataOverview } from './components/DataOverview'
import { FilterPanel } from './components/FilterPanel'
import { CompaniesTable } from './components/CompaniesTable'
import { VisitsTable } from './components/VisitsTable'
import { ExcelExport } from './components/ExcelExport'

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'visits'>('overview')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: '',
    hall: '',
    visitPriority: '',
    visitStatus: '',
    tags: [],
    relevanceScore: [0, 100]
  })

  // Extract unique values for filters
  const availableDepartments = useMemo(() => {
    const departments = new Set<string>()
    companiesData.forEach(company => {
      if (company.department) {
        company.department.split(',').forEach(dept => {
          departments.add(dept.trim())
        })
      }
    })
    return Array.from(departments).sort()
  }, [])

  const availableHalls = useMemo(() => {
    const halls = new Set<string>()
    companiesData.forEach(company => {
      if (company.hall) halls.add(company.hall)
    })
    return Array.from(halls).sort()
  }, [])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    companiesData.forEach(company => {
      company.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [])

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    return companiesData.filter(company => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [
          company.company,
          company.description,
          company.contact_person,
          company.why_relevant,
          company.email,
          company.phone,
          ...company.tags
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchableText.includes(searchTerm)) return false
      }

      // Department filter
      if (filters.department) {
        if (!company.department?.includes(filters.department)) return false
      }

      // Hall filter
      if (filters.hall) {
        if (company.hall !== filters.hall) return false
      }

      // Visit priority filter
      if (filters.visitPriority) {
        if (company.visit_priority !== filters.visitPriority) return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => company.tags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Relevance score filter
      if (company.relevance_score < filters.relevanceScore[0] || 
          company.relevance_score > filters.relevanceScore[1]) {
        return false
      }

      return true
    })
  }, [filters])

  // Filter visits based on filtered companies
  const filteredVisits = useMemo(() => {
    const filteredCompanyIds = new Set(filteredCompanies.map(c => c.id))
    return visitsData.filter(visit => filteredCompanyIds.has(visit.company_id))
  }, [filteredCompanies])

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-3 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">K-Show 2025 Summary</h1>
                <p className="text-sm text-slate-500">Exhibition visit summary and analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <ExcelExport 
                companies={filteredCompanies} 
                visits={filteredVisits}
                className="hidden sm:inline-flex"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-80 flex-shrink-0"
            >
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                availableDepartments={availableDepartments}
                availableHalls={availableHalls}
                availableTags={availableTags}
              />
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Tab Navigation */}
            <motion.div variants={fadeInUp} className="bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              <div className="flex space-x-1">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'companies', label: 'Companies', icon: Table },
                  { key: 'visits', label: 'Visits', icon: Calendar }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                    {key === 'companies' && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded-full">
                        {filteredCompanies.length}
                      </span>
                    )}
                    {key === 'visits' && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded-full">
                        {filteredVisits.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Results Summary */}
            {(filters.search || filters.department || filters.hall || filters.visitPriority || 
              filters.tags.length > 0 || filters.relevanceScore[0] > 0 || filters.relevanceScore[1] < 100) && (
              <motion.div 
                variants={fadeInUp}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    Showing <span className="font-semibold">{filteredCompanies.length}</span> companies 
                    and <span className="font-semibold">{filteredVisits.length}</span> visits
                    {filters.search && (
                      <span> matching "{filters.search}"</span>
                    )}
                  </div>
                  <button
                    onClick={() => setFilters({
                      search: '',
                      department: '',
                      hall: '',
                      visitPriority: '',
                      visitStatus: '',
                      tags: [],
                      relevanceScore: [0, 100]
                    })}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <DataOverview companies={filteredCompanies} visits={filteredVisits} />
              )}
              
              {activeTab === 'companies' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Companies</h2>
                    <ExcelExport 
                      companies={filteredCompanies} 
                      visits={filteredVisits}
                      className="sm:hidden"
                    />
                  </div>
                  <CompaniesTable companies={filteredCompanies} />
                </div>
              )}
              
              {activeTab === 'visits' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Visits</h2>
                    <ExcelExport 
                      companies={filteredCompanies} 
                      visits={filteredVisits}
                      className="sm:hidden"
                    />
                  </div>
                  <VisitsTable visits={filteredVisits} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
