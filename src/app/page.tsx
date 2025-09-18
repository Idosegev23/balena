'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Company } from '@/lib/supabase'
import { Building2, Star, CheckSquare, Calendar, MapPin, Lightbulb } from 'lucide-react'
import { EnhancedCompanyModal } from '@/components/EnhancedCompanyModal'
import { RealtimeRating } from '@/components/RealtimeRating'
import { SmartRecommendations } from '@/components/SmartRecommendations'
import { ProactiveRecommendations } from '@/components/ProactiveRecommendations'
import { EnhancedRealtimeRating } from '@/components/EnhancedRealtimeRating'
import { RouteOptimizer } from '@/components/RouteOptimizer'
import { LiveCompanyAdd } from '@/components/LiveCompanyAdd'
import { DataExport } from '@/components/DataExport'
import { CompanyDiscoveryPage } from '@/components/CompanyDiscoveryPage'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { VisitsDashboard } from '@/components/VisitsDashboard'
import { QuickAddModal } from '@/components/QuickAddModal'
import { AddCompanyModal } from '@/components/AddCompanyModal'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'
import { ShimmerButton } from '@/components/ui/shimmer-button'

interface DashboardStats {
  totalCompanies: number
  mustVisitCompanies: number
  visitedCompanies: number
  followUpRequired: number
}

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [teamRole, setTeamRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showDiscoveryPage, setShowDiscoveryPage] = useState(false)
  const [deptFilter, setDeptFilter] = useState<string>('')
  const [activeView, setActiveView] = useState<'dashboard' | 'discovery' | 'visits' | 'settings'>('dashboard')
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false)

  // Browser history management for mobile back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { view, companyModal, discoveryPage, quickAddModal } = event.state
        
        if (quickAddModal) {
          setShowQuickAddModal(true)
          return
        }
        
        if (companyModal && selectedCompany) {
          setShowCompanyModal(true)
          return
        }
        
        if (discoveryPage) {
          setShowDiscoveryPage(true)
          setActiveView('discovery')
          return
        }
        
        if (view) {
          setActiveView(view)
          setShowCompanyModal(false)
          setShowDiscoveryPage(false)
          setShowQuickAddModal(false)
          return
        }
      }
      
      // Default: close all modals and go to dashboard
      setShowCompanyModal(false)
      setShowDiscoveryPage(false)
      setShowQuickAddModal(false)
      setActiveView('dashboard')
    }

    window.addEventListener('popstate', handlePopState)
    
    // Set initial state
    window.history.replaceState({ view: 'dashboard' }, '')
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [selectedCompany])

  // Update history when views change
  useEffect(() => {
    if (showQuickAddModal) {
      window.history.pushState({ 
        view: activeView, 
        quickAddModal: true,
        discoveryPage: showDiscoveryPage 
      }, '')
    } else if (showCompanyModal && selectedCompany) {
      window.history.pushState({ 
        view: activeView, 
        companyModal: true,
        discoveryPage: showDiscoveryPage 
      }, '')
    } else if (showDiscoveryPage) {
      window.history.pushState({ view: 'discovery', discoveryPage: true }, '')
    } else {
      window.history.pushState({ view: activeView }, '')
    }
  }, [activeView, showCompanyModal, showDiscoveryPage, showQuickAddModal, selectedCompany])

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // Initialize/persist department filter (mobile-first)
  useEffect(() => {
    if (!user) return
    const persisted = sessionStorage.getItem('dashboard_dept_filter')
    if (persisted) {
      setDeptFilter(persisted)
    } else {
      const userDept = (user.user_metadata?.team_role as string) || ''
      setDeptFilter(userDept)
    }
  }, [user])

  useEffect(() => {
    if (deptFilter !== undefined) {
      sessionStorage.setItem('dashboard_dept_filter', deptFilter)
    }
  }, [deptFilter])

  // Update stats when department filter changes
  useEffect(() => {
    if (companies.length > 0) {
      const newStats = calculateFilteredStats(companies, deptFilter)
      setStats(newStats)
    }
  }, [companies, deptFilter])

  const calculateFilteredStats = (allCompanies: Company[], filter: string) => {
    const filteredCompanies = filter 
      ? allCompanies.filter(c => c.department === filter)
      : allCompanies

    const totalCompanies = filteredCompanies.length
    const mustVisitCompanies = filteredCompanies.filter(c => c.visit_priority === 'MUST_VISIT').length
    const visitedCompanies = 0 // TODO: Add visited tracking based on filtered companies
    const followUpRequired = 0 // TODO: Add follow-up tracking based on filtered companies

    return {
      totalCompanies,
      mustVisitCompanies,
      visitedCompanies,
      followUpRequired
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('relevance_score', { ascending: false })

      if (companiesError) throw companiesError

      setCompanies(companiesData || [])

      // Calculate stats based on current filter
      const newStats = calculateFilteredStats(companiesData || [], deptFilter)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  // Pull to refresh
  const { elementRef, isRefreshing, pullDistance, pullToRefreshStyles, threshold } = usePullToRefresh({
    onRefresh: fetchDashboardData,
    disabled: activeView !== 'dashboard'
  })

  const handleCompanyClick = (company: Company) => {
    // Store current scroll position before opening modal
    const currentScrollY = window.scrollY
    const discoveryScrollElement = document.querySelector('[data-discovery-scroll]')
    const discoveryScrollY = discoveryScrollElement ? discoveryScrollElement.scrollTop : 0

    // Store the current state in sessionStorage for reliable restoration
    sessionStorage.setItem('preModalState', JSON.stringify({
      activeView,
      showDiscoveryPage,
      scrollY: currentScrollY,
      discoveryScrollY,
      timestamp: Date.now()
    }))

    setSelectedCompany(company)
    setShowCompanyModal(true)
  }

  const handleCloseModal = () => {
    setShowCompanyModal(false)
    setSelectedCompany(null)

    // Restore the exact previous state
    try {
      const preModalStateStr = sessionStorage.getItem('preModalState')
      if (preModalStateStr) {
        const preModalState = JSON.parse(preModalStateStr)

        // Only restore if the state is recent (within last 5 minutes)
        if (Date.now() - preModalState.timestamp < 300000) {
          setActiveView(preModalState.activeView)
          setShowDiscoveryPage(preModalState.showDiscoveryPage)

          // Restore scroll position after a brief delay to ensure DOM is ready
          setTimeout(() => {
            if (preModalState.showDiscoveryPage && preModalState.discoveryScrollY > 0) {
              const discoveryScrollElement = document.querySelector('[data-discovery-scroll]')
              if (discoveryScrollElement) {
                discoveryScrollElement.scrollTo({ top: preModalState.discoveryScrollY, behavior: 'instant' })
              }
            } else if (preModalState.scrollY > 0) {
              window.scrollTo({ top: preModalState.scrollY, behavior: 'instant' })
            }
          }, 100)

          // Clean up stored state
          sessionStorage.removeItem('preModalState')
          return
        }
      }
    } catch (error) {
      console.error('Error restoring pre-modal state:', error)
    }

    // Fallback: Return to the previous state based on history
    const currentState = window.history.state
    if (currentState) {
      // If we were in discovery page, return to it
      if (currentState.discoveryPage) {
        setShowDiscoveryPage(true)
        setActiveView('discovery')
      } else {
        // Otherwise, return to the view we were in
        setActiveView(currentState.view || 'dashboard')
        setShowDiscoveryPage(false)
      }
    } else {
      // Final fallback to dashboard
      setActiveView('dashboard')
      setShowDiscoveryPage(false)
    }
  }

  const handleUpdateCompany = () => {
    fetchDashboardData() // Refresh data after update
  }

  const handleViewChange = (view: 'dashboard' | 'discovery' | 'visits' | 'settings') => {
    setActiveView(view)
    if (view === 'discovery') {
      setShowDiscoveryPage(true)
    } else {
      setShowDiscoveryPage(false)
    }
  }

  const handleQuickAddActions = {
    addCompany: () => {
      setShowQuickAddModal(false)
      setShowAddCompanyModal(true)
    },
    scanCard: () => {
      // TODO: Implement business card scanning
      setMessage('Card scanning feature in development')
    },
    addNote: () => {
      // TODO: Implement quick note
      setMessage('Quick note feature in development')
    },
    scheduleVisit: () => {
      // TODO: Implement visit scheduling
      setMessage('Visit scheduling feature in development')
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Check if email is allowed
        const isAllowedEmail = email === 'triroars@gmail.com' || email.endsWith('@balena.science')
        
        if (!isAllowedEmail) {
          setMessage('❌ Only Balena team members can register. Contact admin for permissions.')
          setLoading(false)
          return
        }

        if (!fullName.trim() || !teamRole.trim()) {
          setMessage('❌ Please fill all fields')
          setLoading(false)
          return
        }

        const { error } = await signUp(email, password, fullName, teamRole)
        
        if (error) {
          setMessage(`❌ ${error.message}`)
        } else {
          setMessage('✅ Successfully registered! Check your email for confirmation.')
        }
      } else {
        const { error } = await signIn(email, password)
        
        if (error) {
          setMessage(`❌ ${error.message}`)
        } else {
          setMessage('✅ Successfully logged in!')
        }
      }
    } catch (error) {
      setMessage('❌ System error. Please try again.')
    }
    
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://cdn.shopify.com/videos/c/o/v/42240da61c1e452fbc059519fec69966.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `linear-gradient(135deg, var(--balena-light) 0%, var(--balena-cream) 50%, var(--balena-pink) 100%)`
            }}
          ></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="mb-6">
            <img
              src="https://balena.science/cdn/shop/files/logo_2x_1102b1b4-e239-4c62-aa43-69f45080c3b1.png?v=1653928291&width=280"
              alt="Balena"
              className="h-24 mx-auto mb-4 animate-pulse"
            />
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--balena-dark)' }}>
              K-Show 2025
            </h1>
            <p className="text-lg" style={{ color: 'var(--balena-brown)' }}>
              Company Discovery & Management
            </p>
          </div>
          
          {/* Loading Animation */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: 'var(--balena-dark)', animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: 'var(--balena-brown)', animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: 'var(--balena-pink)', animationDelay: '300ms' }}></div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 mx-auto">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full progress-animation"
                  style={{ 
                    background: `linear-gradient(90deg, var(--balena-pink) 0%, var(--balena-brown) 50%, var(--balena-dark) 100%)`
                  }}
                ></div>
              </div>
            </div>
            
            <p className="text-xl font-medium" style={{ color: 'var(--balena-dark)' }}>
              Loading system...
            </p>
            <p className="text-sm" style={{ color: 'var(--balena-brown)' }}>
              Connecting to database
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://cdn.shopify.com/videos/c/o/v/42240da61c1e452fbc059519fec69966.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/30"></div>
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `linear-gradient(135deg, var(--balena-light) 0%, var(--balena-cream) 50%, var(--balena-pink) 100%)`
            }}
          ></div>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md relative z-10 p-4">
          <div className="text-center mb-8">
            <img
              src="https://balena.science/cdn/shop/files/logo_2x_1102b1b4-e239-4c62-aa43-69f45080c3b1.png?v=1653928291&width=280"
              alt="Balena"
              className="h-20 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--balena-dark)' }}>
              K-Show 2025
            </h1>
            <p style={{ color: 'var(--balena-brown)' }}>
              Company Discovery & Management
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--balena-dark)' }}>
              {isSignUp ? 'Sign Up' : 'Login'}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">Team Role</label>
                    <select
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Operations">Operations</option>
                      <option value="R&D">R&D</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2 text-left">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--balena-brown)' }}
                  placeholder={isSignUp ? "name@balena.science or triroars@gmail.com" : "name@balena.science"}
                  autoComplete="email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-left">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--balena-brown)' }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              
              {message && (
                <div className="text-center p-3 rounded-lg bg-blue-50 text-sm">
                  {message}
                </div>
              )}
              
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="w-full py-3 font-medium text-lg disabled:opacity-50"
                background="linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)"
                shimmerColor="#ffffff"
                shimmerDuration="2.5s"
              >
                {loading ? '⏳ Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
              </ShimmerButton>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setMessage('')
                  setEmail('')
                  setPassword('')
                  setFullName('')
                  setTeamRole('')
                }}
                className="text-sm underline"
                style={{ color: 'var(--balena-brown)' }}
              >
                {isSignUp ? 'Already have an account - Login' : 'Don\'t have an account - Sign Up'}
              </button>
            </div>
            
            {isSignUp && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs text-center">
                💡 Only Balena team members can register<br/>
                (@balena.science or triroars@gmail.com)
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      {/* Header */}
      <Header 
        title="K-Show 2025"
        showNotifications={true}
        notificationCount={stats?.followUpRequired || 0}
      />

      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        threshold={threshold}
        style={pullToRefreshStyles}
      />

      {/* Mobile-First Content */}
      {activeView === 'dashboard' && (
        <div ref={elementRef} className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 pb-32 overflow-y-auto">
          <div className="space-y-4">
          {/* Mobile-First Welcome */}
          <div className="text-center py-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: 'var(--balena-dark)' }}>
              K-Show 2025
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--balena-brown)' }}>
              Düsseldorf • October 8-15
            </p>
          </div>

          {/* Department Filter Tabs - Mobile First with improved spacing */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b overflow-x-auto">
              <button
                onClick={() => setDeptFilter('')}
                className={`flex-shrink-0 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  !deptFilter 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                All Depts
              </button>
              <button
                onClick={() => setDeptFilter('Commercial')}
                className={`flex-shrink-0 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  deptFilter === 'Commercial' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Commercial
              </button>
              <button
                onClick={() => setDeptFilter('Operations')}
                className={`flex-shrink-0 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  deptFilter === 'Operations' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Operations
              </button>
              <button
                onClick={() => setDeptFilter('R&D')}
                className={`flex-shrink-0 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  deptFilter === 'R&D' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                R&D
              </button>
              <button
                onClick={() => setDeptFilter('Marketing')}
                className={`flex-shrink-0 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  deptFilter === 'Marketing' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Marketing
              </button>
            </div>
          </div>

          {/* Mobile-First Stats */}
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => {
                setActiveView('discovery')
                setShowDiscoveryPage(true)
              }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all flex flex-col items-center gap-2 text-white"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Building2 className="w-6 h-6 mb-1" />
              </motion.div>
              <div className="text-2xl font-bold">
                {stats?.totalCompanies || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                🏢 Discover
              </div>
            </motion.button>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-lg text-center flex flex-col items-center gap-2 text-white">
              <Star className="w-6 h-6 mb-1" />
              <div className="text-2xl font-bold">
                {stats?.mustVisitCompanies || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                ⭐ Must Visit
              </div>
            </div>
            <button
              onClick={() => setActiveView('visits')}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-2 text-white"
            >
              <CheckSquare className="w-6 h-6 mb-1" />
              <div className="text-2xl font-bold">
                {stats?.visitedCompanies || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                ✅ Visited
              </div>
            </button>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg text-center flex flex-col items-center gap-2 text-white">
              <Calendar className="w-6 h-6 mb-1" />
              <div className="text-2xl font-bold">
                {stats?.followUpRequired || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                📅 Follow-up
              </div>
            </div>
          </div>

          {/* AI-Powered Smart Recommendations */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <ProactiveRecommendations 
              currentCompany={selectedCompany || undefined}
              onCompanyClick={handleCompanyClick}
              trigger="manual"
            />
          </div>
        </div>
        </div>
      )}

      {/* Visits Dashboard */}
      {activeView === 'visits' && (
        <VisitsDashboard onCompanyClick={handleCompanyClick} />
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <div className="p-6 pb-32">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--balena-dark)' }}>Settings</h1>
            <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span>Logged in User</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Department</span>
                <span className="font-medium">{user?.user_metadata?.team_role || 'Not set'}</span>
              </div>
              <div className="border-t pt-4">
                <button
                  onClick={signOut}
                  className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Company Modal */}
      <EnhancedCompanyModal
        company={selectedCompany}
        isOpen={showCompanyModal}
        onClose={handleCloseModal}
        onUpdate={handleUpdateCompany}
        onCompanyUpdate={(updatedCompany) => {
          console.log('page.tsx: Updating company in main list:', updatedCompany.id, 'tags:', updatedCompany.tags)
          // Update the company in the companies list
          setCompanies(prev => {
            const newCompanies = prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
            console.log('page.tsx: Companies list updated')
            return newCompanies
          })
          // Update the selected company
          setSelectedCompany(updatedCompany)
          console.log('page.tsx: Selected company updated')
        }}
      />

      {/* Company Discovery Page - Show even when modal is open so it stays in background */}
      {showDiscoveryPage && (
        <CompanyDiscoveryPage
          onClose={() => {
            setShowDiscoveryPage(false)
            setActiveView('dashboard')
          }}
          onCompanyClick={handleCompanyClick}
        />
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onAddCompany={handleQuickAddActions.addCompany}
        onScanCard={handleQuickAddActions.scanCard}
        onAddNote={handleQuickAddActions.addNote}
        onScheduleVisit={handleQuickAddActions.scheduleVisit}
      />

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onCompanyAdded={() => {
          fetchDashboardData()
          setMessage('Company added successfully!')
        }}
      />

      {/* Footer */}
      <Footer
        activeTab={activeView}
        onTabChange={handleViewChange}
        onQuickAdd={() => setShowQuickAddModal(true)}
      />

      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-lg shadow-lg border z-50">
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  )
}