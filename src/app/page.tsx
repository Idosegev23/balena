'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Company } from '@/lib/supabase'
import { Building2, Star, CheckSquare, Calendar, MapPin, Lightbulb } from 'lucide-react'
import { CompanyModal } from '@/components/CompanyModal'
import { RealtimeRating } from '@/components/RealtimeRating'
import { SmartRecommendations } from '@/components/SmartRecommendations'
import { RouteOptimizer } from '@/components/RouteOptimizer'
import { LiveCompanyAdd } from '@/components/LiveCompanyAdd'
import { DataExport } from '@/components/DataExport'
import { CompanyDiscoveryPage } from '@/components/CompanyDiscoveryPage'
import { BottomNavigation } from '@/components/BottomNavigation'
import { VisitsDashboard } from '@/components/VisitsDashboard'
import { QuickAddModal } from '@/components/QuickAddModal'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'

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

  const fetchDashboardData = async () => {
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('relevance_score', { ascending: false })

      if (companiesError) throw companiesError

      setCompanies(companiesData || [])

      // Calculate stats
      const totalCompanies = companiesData?.length || 0
      const mustVisitCompanies = companiesData?.filter(c => c.visit_priority === 'MUST_VISIT').length || 0
      const visitedCompanies = 0 // TODO: Add visited tracking
      const followUpRequired = 0 // TODO: Add follow-up tracking

      setStats({
        totalCompanies,
        mustVisitCompanies,
        visitedCompanies,
        followUpRequired
      })
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
    setSelectedCompany(company)
    setShowCompanyModal(true)
  }

  const handleCloseModal = () => {
    setShowCompanyModal(false)
    setSelectedCompany(null)
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
      setShowDiscoveryPage(true)
      setActiveView('discovery')
    },
    scanCard: () => {
      // TODO: Implement business card scanning
      setMessage('תכונת סריקה בפיתוח')
    },
    addNote: () => {
      // TODO: Implement quick note
      setMessage('תכונת הערה מהירה בפיתוח')
    },
    scheduleVisit: () => {
      // TODO: Implement visit scheduling
      setMessage('תכונת תזמון ביקור בפיתוח')
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
              טוען את המערכת...
            </p>
            <p className="text-sm" style={{ color: 'var(--balena-brown)' }}>
              מתחבר לבסיס הנתונים
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
                    <label className="block text-sm font-medium mb-2 text-right">שם מלא</label>
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
                  className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
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
                  className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
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
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-medium text-lg transition-all hover:shadow-lg disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}
              >
                {loading ? '⏳ Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
              </button>
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
                💡 רק חברי צוות Balena יכולים להירשם<br/>
                (@balena.science או triroars@gmail.com)
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
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <img
              src="https://balena.science/cdn/shop/files/logo_2x_1102b1b4-e239-4c62-aa43-69f45080c3b1.png?v=1653928291&width=280"
              alt="Balena"
              className="h-8 ml-3"
            />
            <div className="text-right">
              <h1 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
                K-Show 2025
              </h1>
              <p className="text-sm" style={{ color: 'var(--balena-brown)' }}>
                ניהול חברות
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--balena-brown)' }}>
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}
            >
              יציאה
            </button>
          </div>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        threshold={threshold}
        style={pullToRefreshStyles}
      />

      {/* Mobile-First Content */}
      {activeView === 'dashboard' && (
        <div ref={elementRef} className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 pb-24 overflow-y-auto">
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

          {/* Department Filter Tabs - Mobile First */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setDeptFilter('')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  !deptFilter 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                All Departments
              </button>
              <button
                onClick={() => setDeptFilter('Commercial')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  deptFilter === 'Commercial' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Commercial
              </button>
              <button
                onClick={() => setDeptFilter('Operations')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  deptFilter === 'Operations' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Operations
              </button>
              <button
                onClick={() => setDeptFilter('R&D')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  deptFilter === 'R&D' 
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                R&D
              </button>
              <button
                onClick={() => setDeptFilter('Marketing')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
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
            <button 
              onClick={() => setShowDiscoveryPage(true)}
              className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center hover:shadow-md transition-all hover:bg-blue-50 active:scale-95 flex flex-col items-center gap-2"
            >
              <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--balena-dark)' }}>
                {stats?.totalCompanies || 0}
              </div>
              <div className="text-xs font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Discover Companies
              </div>
            </button>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center border-l-4 border-red-500 flex flex-col items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {stats?.mustVisitCompanies || 0}
              </div>
              <div className="text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 text-red-500" />
                Must Visit
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center border-l-4 border-green-500 flex flex-col items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {stats?.visitedCompanies || 0}
              </div>
              <div className="text-xs font-medium flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-green-500" />
                Visited
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center border-l-4 border-blue-500 flex flex-col items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats?.followUpRequired || 0}
              </div>
              <div className="text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" />
                Follow-up
              </div>
            </div>
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
        <div className="p-6 pb-24">
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

      {/* Company Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={showCompanyModal}
        onClose={handleCloseModal}
        onUpdate={handleUpdateCompany}
      />

      {/* Company Discovery Page */}
      {showDiscoveryPage && (
        <CompanyDiscoveryPage
          onClose={() => setShowDiscoveryPage(false)}
          onCompanyClick={(company) => {
            setShowDiscoveryPage(false)
            handleCompanyClick(company)
          }}
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

      {/* Bottom Navigation */}
      <BottomNavigation
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