'use client'

import React from 'react'
import { Building2, Menu, Bell, User } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface HeaderProps {
  title?: string
  showMenu?: boolean
  onMenuClick?: () => void
  showNotifications?: boolean
  notificationCount?: number
}

export function Header({ 
  title = "K-Show 2025", 
  showMenu = false, 
  onMenuClick,
  showNotifications = false,
  notificationCount = 0 
}: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
      <div 
        className="h-14 xs:h-16 px-3 xs:px-4 flex items-center justify-between safe-area-top"
        style={{ paddingTop: 'max(0rem, env(safe-area-inset-top))' }}
      >
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500">Balena AI Platform</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm xs:text-base font-bold text-gray-900">Balena</h1>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {showNotifications && (
            <button
              className="relative p-1.5 xs:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500">Team Member</p>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors touch-target"
                aria-label="User menu"
              >
                <User className="w-3 h-3 xs:w-4 xs:h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
