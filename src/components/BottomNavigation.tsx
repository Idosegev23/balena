'use client'

import { useState } from 'react'
import { Home, Search, Calendar, Settings, Plus } from 'lucide-react'

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'discovery' | 'visits' | 'settings'
  onTabChange: (tab: 'dashboard' | 'discovery' | 'visits' | 'settings') => void
  onQuickAdd: () => void
}

export function BottomNavigation({ activeTab, onTabChange, onQuickAdd }: BottomNavigationProps) {
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={onQuickAdd}
        className="fixed bottom-24 left-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center active:scale-95"
        aria-label="Add New Company"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center py-2 px-2 transition-colors active:scale-95 ${
              activeTab === 'dashboard' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => onTabChange('discovery')}
            className={`flex flex-col items-center justify-center py-2 px-2 transition-colors active:scale-95 ${
              activeTab === 'discovery' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Discover</span>
          </button>

          <button
            onClick={() => onTabChange('visits')}
            className={`flex flex-col items-center justify-center py-2 px-2 transition-colors active:scale-95 ${
              activeTab === 'visits' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Visits</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center py-2 px-2 transition-colors active:scale-95 ${
              activeTab === 'settings' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </>
  )
}
