'use client'

import React, { useState, useEffect } from 'react'
import { Tag, Plus, X, Check } from 'lucide-react'
import { supabase, Company } from '@/lib/supabase'

interface CompanyTaggingProps {
  company: Company
  onTagsUpdate?: (tags: string[]) => void
  size?: 'small' | 'medium' | 'large'
  showAddButton?: boolean
}

const availableTags = [
  { id: 'supplier', label: 'Supplier', color: 'bg-blue-100 text-blue-800' },
  { id: 'competitor', label: 'Competitor', color: 'bg-red-100 text-red-800' },
  { id: 'partner', label: 'Partner', color: 'bg-green-100 text-green-800' },
  { id: 'customer', label: 'Customer', color: 'bg-purple-100 text-purple-800' },
  { id: 'vendor', label: 'Vendor', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'distributor', label: 'Distributor', color: 'bg-orange-100 text-orange-800' },
  { id: 'manufacturer', label: 'Manufacturer', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'service_provider', label: 'Service Provider', color: 'bg-pink-100 text-pink-800' },
  { id: 'technology', label: 'Technology', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'innovation', label: 'Innovation', color: 'bg-teal-100 text-teal-800' }
]

export function CompanyTagging({ 
  company, 
  onTagsUpdate, 
  size = 'medium',
  showAddButton = true 
}: CompanyTaggingProps) {
  const [currentTags, setCurrentTags] = useState<string[]>(company.tags || [])
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setCurrentTags(company.tags || [])
  }, [company.tags])

  const getTagConfig = (tagId: string) => {
    return availableTags.find(tag => tag.id === tagId) || {
      id: tagId,
      label: tagId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: 'bg-gray-100 text-gray-800'
    }
  }

  const handleTagToggle = async (tagId: string) => {
    setIsUpdating(true)
    
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId]

    try {
      const { error } = await supabase
        .from('companies')
        .update({ tags: newTags })
        .eq('id', company.id)

      if (error) throw error

      setCurrentTags(newTags)
      onTagsUpdate?.(newTags)
    } catch (error) {
      console.error('Error updating tags:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const sizeClasses = {
    small: {
      tag: 'px-2 py-1 text-xs',
      button: 'p-1 text-xs',
      icon: 'w-3 h-3'
    },
    medium: {
      tag: 'px-3 py-1.5 text-sm',
      button: 'p-2 text-sm',
      icon: 'w-4 h-4'
    },
    large: {
      tag: 'px-4 py-2 text-base',
      button: 'p-3 text-base',
      icon: 'w-5 h-5'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {currentTags.map(tagId => {
          const tagConfig = getTagConfig(tagId)
          return (
            <div
              key={tagId}
              className={`${tagConfig.color} ${classes.tag} rounded-full font-medium flex items-center gap-2 transition-all duration-200`}
            >
              <span>{tagConfig.label}</span>
              <button
                onClick={() => handleTagToggle(tagId)}
                className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                disabled={isUpdating}
                aria-label={`Remove ${tagConfig.label} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}

        {/* Add Tag Button */}
        {showAddButton && (
          <button
            onClick={() => setShowTagSelector(!showTagSelector)}
            className={`${classes.tag} border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 rounded-full font-medium flex items-center gap-2 transition-all duration-200 hover:bg-gray-50`}
            disabled={isUpdating}
          >
            <Plus className={classes.icon} />
            <span>Add Tag</span>
          </button>
        )}
      </div>

      {/* Tag Selector */}
      {showTagSelector && (
        <div className="bg-white border rounded-lg shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Select Tags</h3>
              <p className="text-xs text-gray-500 mt-1">Choose multiple tags for this company</p>
            </div>
            <button
              onClick={() => setShowTagSelector(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableTags.map(tag => {
              const isSelected = currentTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`${classes.button} border rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? `${tag.color} border-current`
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  disabled={isUpdating}
                >
                  <span className="truncate">{tag.label}</span>
                  {isSelected && <Check className="w-3 h-3 ml-1 flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => {
                availableTags.forEach(tag => {
                  if (!currentTags.includes(tag.id)) {
                    handleTagToggle(tag.id)
                  }
                })
              }}
              className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
              disabled={isUpdating}
            >
              Select All
            </button>
            <button
              onClick={() => {
                currentTags.forEach(tagId => handleTagToggle(tagId))
              }}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isUpdating}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isUpdating && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span>Updating tags...</span>
        </div>
      )}
    </div>
  )
}
