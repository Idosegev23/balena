'use client'

import React, { useState } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { Company, supabase } from '@/lib/supabase'

interface TagManagerProps {
  company: Company
  onUpdate: (updatedCompany: Company) => void
  isEditing?: boolean
}

// תגיות מוגדרות מראש
const PREDEFINED_TAGS = [
  { value: 'supplier', label: 'Supplier', color: 'bg-blue-100 text-blue-800' },
  { value: 'competitor', label: 'Competitor', color: 'bg-red-100 text-red-800' },
  { value: 'partner', label: 'Partner', color: 'bg-green-100 text-green-800' },
  { value: 'customer', label: 'Customer', color: 'bg-purple-100 text-purple-800' },
  { value: 'vendor', label: 'Vendor', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'distributor', label: 'Distributor', color: 'bg-orange-100 text-orange-800' },
  { value: 'manufacturer', label: 'Manufacturer', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'service_provider', label: 'Service Provider', color: 'bg-pink-100 text-pink-800' },
  { value: 'technology', label: 'Technology', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'innovation', label: 'Innovation', color: 'bg-teal-100 text-teal-800' },
  { value: 'rd', label: 'R&D', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'commercial', label: 'Commercial', color: 'bg-sky-100 text-sky-800' },
  { value: 'operations', label: 'Operations', color: 'bg-amber-100 text-amber-800' },
  { value: 'marketing', label: 'Marketing', color: 'bg-rose-100 text-rose-800' },
  { value: 'sustainability', label: 'Sustainability', color: 'bg-lime-100 text-lime-800' },
  { value: 'machinery', label: 'Machinery', color: 'bg-slate-100 text-slate-800' }
]

// Generate unique colors for custom tags
const generateCustomTagColor = (tagValue: string): string => {
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
  for (let i = 0; i < tagValue.length; i++) {
    hash = ((hash << 5) - hash + tagValue.charCodeAt(i)) & 0xffffffff
  }
  return colors[Math.abs(hash) % colors.length]
}

export function TagManager({ company, onUpdate, isEditing = false }: TagManagerProps) {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  const currentTags = company.tags || []

  const getTagColor = (tag: string) => {
    const predefined = PREDEFINED_TAGS.find(t => t.value === tag)
    return predefined ? predefined.color : generateCustomTagColor(tag)
  }

  const getTagLabel = (tag: string) => {
    const predefined = PREDEFINED_TAGS.find(t => t.value === tag)
    return predefined ? predefined.label : tag
  }

  const addTag = async (tagValue: string) => {
    if (!tagValue || currentTags.includes(tagValue)) return

    setSaving(true)
    try {
      const updatedTags = [...currentTags, tagValue]
      const { data, error } = await supabase
        .from('companies')
        .update({ tags: updatedTags })
        .eq('id', company.id)
        .select()
        .single()

      if (error) throw error

      onUpdate({ ...company, tags: updatedTags })
      setNewTag('')
      setIsAddingTag(false)
    } catch (error) {
      console.error('Error adding tag:', error)
    }
    setSaving(false)
  }

  const removeTag = async (tagToRemove: string) => {
    setSaving(true)
    try {
      const updatedTags = currentTags.filter(tag => tag !== tagToRemove)
      const { data, error } = await supabase
        .from('companies')
        .update({ tags: updatedTags })
        .eq('id', company.id)
        .select()
        .single()

      if (error) throw error

      onUpdate({ ...company, tags: updatedTags })
    } catch (error) {
      console.error('Error removing tag:', error)
    }
    setSaving(false)
  }

  const addCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim().toLowerCase().replace(/\s+/g, '_'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-700">Company Tags</h3>
      </div>

      {/* תצוגת תגיות קיימות */}
      <div className="flex flex-wrap gap-2">
        {currentTags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
          >
            {getTagLabel(tag)}
            {(isEditing || !isEditing) && (
              <button
                onClick={() => removeTag(tag)}
                disabled={saving}
                className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                title="Remove tag"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        
        {/* כפתור הוספת תגית */}
        {!isAddingTag && (
          <button
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Tag
          </button>
        )}
      </div>

      {/* הוספת תגית חדשה */}
      {isAddingTag && (
        <div className="space-y-3">
          {/* תגיות מוגדרות מראש */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Quick Tags</label>
            <div className="flex flex-wrap gap-1">
              {PREDEFINED_TAGS
                .filter(tag => !currentTags.includes(tag.value))
                .map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => addTag(tag.value)}
                    disabled={saving}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${tag.color}`}
                  >
                    {tag.label}
                  </button>
                ))}
            </div>
          </div>

          {/* תגית מותאמת אישית */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom Tag</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter custom tag..."
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              />
              <button
                onClick={addCustomTag}
                disabled={!newTag.trim() || saving}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingTag(false)
                  setNewTag('')
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
