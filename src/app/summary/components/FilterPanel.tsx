'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { FilterState } from '../data/types'

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableDepartments: string[]
  availableHalls: string[]
  availableTags: string[]
}

export function FilterPanel({ 
  filters, 
  onFiltersChange, 
  availableDepartments, 
  availableHalls, 
  availableTags 
}: FilterPanelProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      department: '',
      hall: '',
      visitPriority: '',
      visitStatus: '',
      tags: [],
      relevanceScore: [0, 100]
    })
  }

  const hasActiveFilters = filters.search || filters.department || filters.hall || 
    filters.visitPriority || filters.visitStatus || filters.tags.length > 0 ||
    filters.relevanceScore[0] > 0 || filters.relevanceScore[1] < 100

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search companies, descriptions, contacts..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Department Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Department</label>
        <select
          value={filters.department}
          onChange={(e) => updateFilter('department', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Departments</option>
          {availableDepartments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Hall Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Exhibition Hall</label>
        <select
          value={filters.hall}
          onChange={(e) => updateFilter('hall', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Halls</option>
          {availableHalls.map(hall => (
            <option key={hall} value={hall}>Hall {hall}</option>
          ))}
        </select>
      </div>

      {/* Visit Priority Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Visit Priority</label>
        <select
          value={filters.visitPriority}
          onChange={(e) => updateFilter('visitPriority', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="MUST_VISIT">Must Visit</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Tags</label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                const newTags = filters.tags.includes(tag)
                  ? filters.tags.filter(t => t !== tag)
                  : [...filters.tags, tag]
                updateFilter('tags', newTags)
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Relevance Score Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Relevance Score: {filters.relevanceScore[0]} - {filters.relevanceScore[1]}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.relevanceScore[0]}
            onChange={(e) => updateFilter('relevanceScore', [parseInt(e.target.value), filters.relevanceScore[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={filters.relevanceScore[1]}
            onChange={(e) => updateFilter('relevanceScore', [filters.relevanceScore[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
