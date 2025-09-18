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
  { id: 'innovation', label: 'Innovation', color: 'bg-teal-100 text-teal-800' },
  { id: 'rd', label: 'R&D', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'commercial', label: 'Commercial', color: 'bg-sky-100 text-sky-800' },
  { id: 'operations', label: 'Operations', color: 'bg-amber-100 text-amber-800' },
  { id: 'marketing', label: 'Marketing', color: 'bg-rose-100 text-rose-800' },
  { id: 'sustainability', label: 'Sustainability', color: 'bg-lime-100 text-lime-800' },
  { id: 'machinery', label: 'Machinery', color: 'bg-slate-100 text-slate-800' }
]

// Generate unique colors for custom tags
const generateCustomTagColor = (tagId: string): string => {
  const colors = [
    'bg-violet-100 text-violet-800',
    'bg-fuchsia-100 text-fuchsia-800', 
    'bg-emerald-100 text-emerald-800',
    'bg-sky-100 text-sky-800',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-800',
    'bg-lime-100 text-lime-800',
    'bg-slate-100 text-slate-800',
    'bg-zinc-100 text-zinc-800',
    'bg-neutral-100 text-neutral-800'
  ]
  // Use a simple hash function to get consistent colors for the same tag
  let hash = 0
  for (let i = 0; i < tagId.length; i++) {
    hash = ((hash << 5) - hash + tagId.charCodeAt(i)) & 0xffffffff
  }
  return colors[Math.abs(hash) % colors.length]
}

export function CompanyTagging({ 
  company, 
  onTagsUpdate, 
  size = 'medium',
  showAddButton = true 
}: CompanyTaggingProps) {
  const [currentTags, setCurrentTags] = useState<string[]>(company.tags || [])
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [customTagInput, setCustomTagInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    console.log('CompanyTagging: company.tags changed to:', company.tags)
    setCurrentTags(company.tags || [])
  }, [company.tags, company.id])

  const getTagConfig = (tagId: string) => {
    return availableTags.find(tag => tag.id === tagId) || {
      id: tagId,
      label: tagId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: generateCustomTagColor(tagId)
    }
  }

  const handleTagToggle = async (tagId: string) => {
    setIsUpdating(true)
    
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId]

    console.log('Updating tags for company:', company.id, 'from:', currentTags, 'to:', newTags)

    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ tags: newTags })
        .eq('id', company.id)
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Tags updated successfully:', data)
      setCurrentTags(newTags)
      onTagsUpdate?.(newTags)
      
      // Show success feedback
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error updating tags:', error)
      // Revert the UI state on error
      setCurrentTags(company.tags || [])
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddCustomTag = async () => {
    const customTag = customTagInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (!customTag || currentTags.includes(customTag)) {
      setCustomTagInput('')
      return
    }
    
    await handleTagToggle(customTag)
    setCustomTagInput('')
    setShowCustomInput(false)
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

          {/* Custom Tag Input */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">Custom Tag</h4>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showCustomInput ? 'Cancel' : 'Add Custom'}
              </button>
            </div>
            
            {showCustomInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  placeholder="Enter custom tag..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                  disabled={isUpdating}
                />
                <button
                  onClick={handleAddCustomTag}
                  disabled={!customTagInput.trim() || isUpdating}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            )}
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

      {/* Success State */}
      {showSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="rounded-full h-4 w-4 bg-green-600 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span>Tags saved successfully!</span>
        </div>
      )}
    </div>
  )
}
