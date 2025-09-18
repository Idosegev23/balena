'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Company } from '@/lib/supabase'

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
  searchInput: string
  onSearchChange: (value: string) => void
  companies: Company[]
  autocompleteCompanies: Company[]
  showAutocomplete: boolean
  onAutocompleteSelect: (company: Company) => void
  onAutocompleteToggle: (show: boolean) => void
}

export function MobileSearchModal({
  isOpen,
  onClose,
  searchInput,
  onSearchChange,
  companies,
  autocompleteCompanies,
  showAutocomplete,
  onAutocompleteSelect,
  onAutocompleteToggle
}: MobileSearchModalProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus on input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSearchChange = (value: string) => {
    onSearchChange(value)
    
    // Show autocomplete for company names
    if (value.length >= 2) {
      const suggestions = companies
        .filter(company => 
          company.company?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8)
      onAutocompleteToggle(suggestions.length > 0)
    } else {
      onAutocompleteToggle(false)
    }
  }

  const handleAutocompleteSelect = (company: Company) => {
    onAutocompleteSelect(company)
    onAutocompleteToggle(false)
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex flex-col"
      style={{
        overscrollBehavior: 'none',
        touchAction: 'pan-x pan-y'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Search Overlay - positioned at top */}
      <div className="bg-white shadow-lg border-b max-h-96">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchInput.length >= 2) onAutocompleteToggle(true)
                }}
                placeholder="🔍 Search companies..."
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              
              {/* Clear Search Button */}
              {searchInput && (
                <button
                  onClick={() => {
                    onSearchChange('')
                    onAutocompleteToggle(false)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Results / Autocomplete */}
        {(showAutocomplete && autocompleteCompanies.length > 0) || searchInput.length >= 2 ? (
          <div 
            className="bg-white overflow-y-auto max-h-80"
            style={{
              overscrollBehavior: 'none',
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {showAutocomplete && autocompleteCompanies.length > 0 ? (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
                  Company Suggestions
                </h3>
                <div className="space-y-2">
                  {autocompleteCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleAutocompleteSelect(company)}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors flex items-center gap-3"
                    >
                      <div className="flex-shrink-0">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={`${company.company} logo`}
                            className="h-8 w-8 object-contain bg-white rounded border"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {company.company}
                        </div>
                        {company.hall && company.stand && (
                          <div className="text-sm text-gray-500">
                            {company.hall}/{company.stand}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : searchInput.length >= 2 ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No companies found matching &quot;{searchInput}&quot;</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Start typing to search companies...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Search by name, location, hall, products, or description
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
