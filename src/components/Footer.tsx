'use client'

import React from 'react'
import { Plus, Home, Search, MapPin, Settings } from 'lucide-react'

interface FooterProps {
  activeTab: string
  onTabChange: (tab: 'dashboard' | 'discovery' | 'visits' | 'settings') => void
  onQuickAdd: () => void
}

export function Footer({ activeTab, onTabChange, onQuickAdd }: FooterProps) {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      color: 'text-blue-600'
    },
    {
      id: 'discovery',
      label: 'Discover',
      icon: Search,
      color: 'text-green-600'
    },
    {
      id: 'visits',
      label: 'Visits',
      icon: MapPin,
      color: 'text-purple-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-gray-600'
    }
  ]

  return (
    <>
      {/* Floating Action Button - Enhanced for small screens */}
      <button
        onClick={onQuickAdd}
        className="fixed bottom-20 right-3 xs:right-4 w-12 h-12 xs:w-14 xs:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center active:scale-95 touch-target"
        aria-label="Quick Add"
      >
        <Plus className="w-5 h-5 xs:w-6 xs:h-6" />
      </button>

      {/* Bottom Navigation */}
      <footer 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-4 h-14 xs:h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'dashboard' | 'discovery' | 'visits' | 'settings')}
                className={`flex flex-col items-center justify-center py-1.5 xs:py-2 px-1 transition-all duration-200 active:scale-95 touch-target ${
                  isActive 
                    ? `${tab.color} bg-blue-50 relative` 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 xs:w-8 h-0.5 bg-current rounded-full" />
                )}
                <Icon className={`w-4 h-4 xs:w-5 xs:h-5 mb-0.5 xs:mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''} leading-tight`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </footer>
    </>
  )
}
