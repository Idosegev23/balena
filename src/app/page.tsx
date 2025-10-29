'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Company } from '@/lib/supabase'
import { Building2, Star, CheckSquare, Calendar, MapPin, Lightbulb, Plus, Zap, Search, BookOpen, BarChart3 } from 'lucide-react'
import { EnhancedCompanyModal } from '@/components/EnhancedCompanyModal'
import Link from 'next/link'
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
import { SmartBusinessCardScanner } from '@/components/SmartBusinessCardScanner'
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
  const [showBusinessCardScanner, setShowBusinessCardScanner] = useState(false)

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

  // Fetch dashboard data and setup real-time subscription
  useEffect(() => {
    if (user) {
      fetchDashboardData()
      setupRealtimeSubscription()
    }

    // Listen for visited status changes
    const handleVisitedStatusChange = (event: CustomEvent) => {
      console.log('Dashboard received visited status change:', event.detail)
      // Refresh companies data to update stats
      fetchDashboardData()
    }

    window.addEventListener('companyVisitedStatusChanged', handleVisitedStatusChange as EventListener)
    
    return () => {
      // Cleanup subscription on unmount
      supabase.removeAllChannels()
      window.removeEventListener('companyVisitedStatusChanged', handleVisitedStatusChange as EventListener)
    }
  }, [user])

  // Initialize/persist department filter (mobile-first)
  useEffect(() => {
    if (!user) return
    const persisted = sessionStorage.getItem('dashboard_dept_filter')
    if (persisted) {
      setDeptFilter(persisted)
    } else {
      // Don't auto-filter by department - show all companies by default
      setDeptFilter('')
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
      ? allCompanies.filter(c => {
          if (!c.department) return false
          // Split department string and check if any matches the filter
          const departments = c.department.split(',').map(d => d.trim())
          return departments.includes(filter)
        })
      : allCompanies

    const totalCompanies = filteredCompanies.length
    const mustVisitCompanies = filteredCompanies.filter(c => c.visit_priority === 'MUST_VISIT').length
    const visitedCompanies = filteredCompanies.filter(c => c.visited === true).length
    const followUpRequired = 0 // TODO: Add follow-up tracking based on filtered companies

    return {
      totalCompanies,
      mustVisitCompanies,
      visitedCompanies,
      followUpRequired
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('companies_dashboard_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'companies' 
        }, 
        (payload) => {
          console.log('page.tsx: Real-time update received:', payload)
          
          if (payload.eventType === 'UPDATE') {
            const updatedCompany = payload.new as Company
            console.log('page.tsx: Updating company in real-time:', updatedCompany.id, 'tags:', updatedCompany.tags)
            
            // Update companies list
            setCompanies(prev => {
              const newCompanies = prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
              console.log('page.tsx: Real-time dashboard companies updated')
              return newCompanies
            })
            
            // Update selected company if it's the same one
            if (selectedCompany && selectedCompany.id === updatedCompany.id) {
              setSelectedCompany(updatedCompany)
              console.log('page.tsx: Real-time selected company updated')
            }
            
            // Re-fetch stats to update dashboard numbers
            fetchDashboardData()
          } else if (payload.eventType === 'INSERT') {
            const newCompany = payload.new as Company
            setCompanies(prev => [...prev, newCompany])
            fetchDashboardData() // Update stats
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setCompanies(prev => prev.filter(c => c.id !== deletedId))
            fetchDashboardData() // Update stats
          }
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
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
      setShowQuickAddModal(false)
      setShowBusinessCardScanner(true)
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
    <div className="main-content bg-gray-50">
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

      {/* Premium Corporate Dashboard */}
      {activeView === 'dashboard' && (
        <div ref={elementRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-16 xs:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* Executive Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight">
                    K-Show 2025
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 font-light mt-1">
                    Düsseldorf Exhibition • Oct 8-15, 2025
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Current User</p>
                    <p className="text-sm font-medium text-slate-700">{user?.user_metadata?.full_name || user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Elegant Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            {/* Executive Department Navigation */}
            <div className="mb-8">
              <div className="flex items-center space-x-1 bg-slate-100/50 backdrop-blur-sm rounded-xl p-1">
                {[
                  { key: '', label: 'All Departments' },
                  { key: 'Commercial', label: 'Commercial' },
                  { key: 'Operations', label: 'Operations' },
                  { key: 'R&D', label: 'R&D' },
                  { key: 'Marketing', label: 'Marketing' }
                ].map((dept) => (
                  <button
                    key={dept.key}
                    onClick={() => setDeptFilter(dept.key)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      deptFilter === dept.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Executive KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* Total Companies - Primary CTA */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  setActiveView('discovery')
                  setShowDiscoveryPage(true)
                }}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Total</div>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">
                  {stats?.totalCompanies || 0}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Companies to Discover
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>

              {/* Must Visit - High Priority */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Priority</div>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">
                  {stats?.mustVisitCompanies || 0}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Must Visit Companies
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-200 to-amber-300 rounded-b-2xl"></div>
              </motion.div>

              {/* Visited - Success Metric */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => setActiveView('visits')}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Completed</div>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">
                  {stats?.visitedCompanies || 0}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Companies Visited
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>

              {/* Follow-up - Action Required */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Pending</div>
                </div>
                <div className="text-3xl font-light text-slate-900 mb-1">
                  {stats?.followUpRequired || 0}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Follow-up Required
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-b-2xl"></div>
              </motion.div>
            </div>

            {/* Executive Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddCompanyModal(true)}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <Plus className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Add Company</div>
                        <div className="text-sm text-slate-500">Register new exhibitor</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowQuickAddModal(true)}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <Zap className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Quick Actions</div>
                        <div className="text-sm text-slate-500">Bulk operations</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveView('discovery')
                        setShowDiscoveryPage(true)
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <Search className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Advanced Search</div>
                        <div className="text-sm text-slate-500">Find companies</div>
                      </div>
                    </motion.button>
                    
                    <Link href="/readme">
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                          <BookOpen className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">Documentation</div>
                          <div className="text-sm text-slate-500">Project guide & setup</div>
                        </div>
                      </motion.div>
                    </Link>
                    
                    <Link href="/summary">
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                          <BarChart3 className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">Exhibition Summary</div>
                          <div className="text-sm text-slate-500">Visit data & analytics</div>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* AI-Powered Smart Recommendations */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden h-full">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-900">Smart Recommendations</h3>
                          <p className="text-sm text-slate-500">AI-powered company suggestions</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-purple-700">AI Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ProactiveRecommendations 
                      currentCompany={selectedCompany || undefined}
                      onCompanyClick={handleCompanyClick}
                      trigger="manual"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visits Dashboard */}
      {activeView === 'visits' && (
        <div className="pt-16 xs:pt-18">
          <VisitsDashboard onCompanyClick={handleCompanyClick} />
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <div className="p-6 mobile-content pt-16 xs:pt-18">
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
          console.log('🏠 page.tsx: Updating company in main list:', updatedCompany.id, 'priority:', updatedCompany.visit_priority, 'tags:', updatedCompany.tags)
          // Update the company in the companies list
          setCompanies(prev => {
            const newCompanies = prev.map(c => c.id === updatedCompany.id ? updatedCompany : c)
            console.log('🏠 page.tsx: Companies list updated - priority should now show in discovery page!')
            return newCompanies
          })
          // Update the selected company
          setSelectedCompany(updatedCompany)
          console.log('🏠 page.tsx: Selected company updated')
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
          initialCompanies={companies}
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

      {/* Smart Business Card Scanner */}
      <SmartBusinessCardScanner
        isOpen={showBusinessCardScanner}
        onClose={() => setShowBusinessCardScanner(false)}
        onScanComplete={(data, selectedCompany) => {
          console.log('Business card scanned:', data, 'Company:', selectedCompany)
          if (selectedCompany) {
            setMessage(`Business card linked to ${selectedCompany.company}!`)
          } else {
            setMessage('Business card scanned successfully!')
          }
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