'use client'

import { useState } from 'react'
import { X, Building2, Camera, FileText, Calendar } from 'lucide-react'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCompany: () => void
  onScanCard: () => void
  onAddNote: () => void
  onScheduleVisit: () => void
}

export function QuickAddModal({ 
  isOpen, 
  onClose, 
  onAddCompany, 
  onScanCard, 
  onAddNote, 
  onScheduleVisit 
}: QuickAddModalProps) {
  if (!isOpen) return null

  const actions = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Add Company',
      description: 'Add new company to system',
      action: onAddCompany,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-600'
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Scan Business Card',
      description: 'Capture and scan business card',
      action: onScanCard,
      color: 'bg-green-50 hover:bg-green-100 text-green-600'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Add Note',
      description: 'Write quick note',
      action: onAddNote,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-600'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Schedule Visit',
      description: 'Plan company visit',
      action: onScheduleVisit,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-600'
    }
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            Quick Action
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action()
                onClose()
              }}
              className={`w-full p-4 rounded-xl transition-all text-left ${action.color}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm opacity-75">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 text-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
