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
    // If we came from Discovery Page, restore it
    if (showDiscoveryPage) {
      // Discovery Page is already shown, modal just closes
      return
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
      {/* Mobile-First Top Bar */}
      <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Mobile Optimized */}
            <div className="flex items-center gap-3">
              <img
                src="https://balena.science/cdn/shop/files/logo_2x_1102b1b4-e239-4c62-aa43-69f45080c3b1.png?v=1653928291&width=280"
                alt="Balena"
                className="h-10 w-auto"
              />
              <div className="text-right">
                <h1 className="text-lg sm:text-xl font-bold leading-none" style={{ color: 'var(--balena-dark)' }}>
                  K-Show 2025
                </h1>
                <p className="text-xs sm:text-sm leading-none mt-1" style={{ color: 'var(--balena-brown)' }}>
                  {user.user_metadata?.team_role || 'ניהול חברות'}
                </p>
              </div>
            </div>

            {/* User Menu - Mobile Optimized */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {user.user_metadata?.team_role || 'Member'}
                </div>
              </div>
              <button
                onClick={() => setActiveView('settings')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {(user.user_metadata?.full_name || user.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </button>
            </div>
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
          {/* Loading State */}
          {!stats && (
            <div className="space-y-4 animate-pulse">
              <div className="bg-white rounded-xl h-20"></div>
              <div className="bg-white rounded-xl h-32"></div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="bg-white rounded-xl h-24"></div>
                <div className="bg-white rounded-xl h-24"></div>
                <div className="bg-white rounded-xl h-24"></div>
                <div className="bg-white rounded-xl h-24"></div>
              </div>
            </div>
          )}
          
          {stats && (
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

          {/* Department Filter Tabs - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-600 mb-3 text-center">סנן לפי מחלקה</h3>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  onClick={() => setDeptFilter('')}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all active:scale-95 ${
                    !deptFilter 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🏢 כל המחלקות
                </button>
                <button
                  onClick={() => setDeptFilter('Commercial')}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all active:scale-95 ${
                    deptFilter === 'Commercial' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  💼 מסחרי
                </button>
                <button
                  onClick={() => setDeptFilter('Operations')}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all active:scale-95 ${
                    deptFilter === 'Operations' 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ⚙️ תפעול
                </button>
                <button
                  onClick={() => setDeptFilter('R&D')}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all active:scale-95 ${
                    deptFilter === 'R&D' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔬 מו״פ
                </button>
                <button
                  onClick={() => setDeptFilter('Marketing')}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all active:scale-95 col-span-2 sm:col-span-1 ${
                    deptFilter === 'Marketing' 
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📢 שיווק
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-First Stats Cards */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <button 
              onClick={() => {
                setActiveView('discovery')
                setShowDiscoveryPage(true)
              }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all active:scale-95 flex flex-col items-center gap-2 text-white"
            >
              <Building2 className="w-6 h-6 mb-1" />
              <div className="text-2xl font-bold">
                {stats?.totalCompanies || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                🏢 גלה חברות
              </div>
            </button>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-lg text-center flex flex-col items-center gap-2 text-white">
              <Star className="w-6 h-6 mb-1" />
              <div className="text-2xl font-bold">
                {stats?.mustVisitCompanies || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                ⭐ חובה לבקר
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
                ✅ ביקרתי
              </div>
            </button>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg text-center flex flex-col items-center gap-2 text-white">
              <Calendar className="w-6 h-6 mb-1" />
              <div className="text-2xl font-bold">
                {stats?.followUpRequired || 0}
              </div>
              <div className="text-xs font-medium opacity-90">
                📅 מעקב
              </div>
            </div>
          </div>

          {/* Quick Actions Mobile-First */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--balena-dark)' }}>
              פעולות מהירות
            </h3>
            <div className="grid gap-3 grid-cols-2">
              <button
                onClick={() => {
                  setActiveView('discovery')
                  setShowDiscoveryPage(true)
                }}
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 hover:from-blue-100 hover:to-blue-200 transition-all active:scale-95 flex flex-col items-center gap-2"
              >
                <Building2 className="w-8 h-8 text-blue-600 mb-1" />
                <span className="text-sm font-medium text-blue-800">גלה חברות</span>
                <span className="text-xs text-blue-600">חפש והוסף חברות חדשות</span>
              </button>
              
              <button
                onClick={() => setActiveView('visits')}
                className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 hover:from-green-100 hover:to-green-200 transition-all active:scale-95 flex flex-col items-center gap-2"
              >
                <MapPin className="w-8 h-8 text-green-600 mb-1" />
                <span className="text-sm font-medium text-green-800">ניהול ביקורים</span>
                <span className="text-xs text-green-600">תכנן ועקוב אחר ביקורים</span>
              </button>
              
              <button
                onClick={() => setShowQuickAddModal(true)}
                className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 hover:from-purple-100 hover:to-purple-200 transition-all active:scale-95 flex flex-col items-center gap-2"
              >
                <Lightbulb className="w-8 h-8 text-purple-600 mb-1" />
                <span className="text-sm font-medium text-purple-800">הוספה מהירה</span>
                <span className="text-xs text-purple-600">הוסף חברה או הערה</span>
              </button>
              
              <button
                onClick={() => setActiveView('settings')}
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 hover:from-gray-100 hover:to-gray-200 transition-all active:scale-95 flex flex-col items-center gap-2"
              >
                <Star className="w-8 h-8 text-gray-600 mb-1" />
                <span className="text-sm font-medium text-gray-800">הגדרות</span>
                <span className="text-xs text-gray-600">פרופיל ועדיפויות</span>
              </button>
            </div>
          </div>

          {/* Top Companies Preview - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                  חברות מובילות
                </h3>
                <button
                  onClick={() => {
                    setActiveView('discovery')
                    setShowDiscoveryPage(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ראה הכל ←
                </button>
              </div>
            </div>
            <div className="p-4">
              {companies
                .filter(c => deptFilter ? c.department?.includes(deptFilter) : true)
                .slice(0, 3)
                .map((company, index) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanyClick(company)}
                    className="w-full p-3 mb-3 last:mb-0 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all active:scale-98 text-right"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate mb-1">
                          {company.company}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          📍 {company.location}
                        </div>
                        {company.why_relevant && (
                          <div className="text-xs text-blue-600 mt-1 line-clamp-2">
                            {company.why_relevant.substring(0, 80)}...
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 mr-3">
                        {company.relevance_score && (
                          <span className="text-sm font-bold text-yellow-600">
                            ⭐ {company.relevance_score}
                          </span>
                        )}
                        {company.department && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {company.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              {companies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">אין חברות להציג</p>
                  <button
                    onClick={() => {
                      setActiveView('discovery')
                      setShowDiscoveryPage(true)
                    }}
                    className="mt-2 text-blue-600 text-sm hover:text-blue-800"
                  >
                    גלה חברות חדשות
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* K-Show Info Card - Mobile */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-800 mb-2">
                📅 K-Show 2025
              </h3>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Düsseldorf, Germany</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>8-15 October 2025</span>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-purple-600">
                    התערוכה הגדולה בעולם לתעשיית הפלסטיק והגומי
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Visits Dashboard */}
      {activeView === 'visits' && (
        <VisitsDashboard onCompanyClick={handleCompanyClick} />
      )}

      {/* Settings View - Mobile Optimized */}
      {activeView === 'settings' && (
        <div className="p-4 pb-24 space-y-4">
          {/* User Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">
                  {(user?.user_metadata?.full_name || user?.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1">
                {user?.user_metadata?.full_name || 'משתמש'}
              </h2>
              <p className="text-blue-100 text-sm">
                {user?.user_metadata?.team_role || 'חבר צוות'}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Settings Options */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                הגדרות משתמש
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">מחלקה</div>
                    <div className="text-sm text-gray-500">המחלקה שלך ב-Balena</div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {user?.user_metadata?.team_role || 'לא נקבע'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">אימייל</div>
                    <div className="text-sm text-gray-500">כתובת המייל שלך</div>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--balena-dark)' }}>
              על האפליקציה
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>גרסה</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>עדכון אחרון</span>
                <span className="font-medium">ינואר 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span>מטרה</span>
                <span className="font-medium">K-Show 2025</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => fetchDashboardData()}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors active:scale-98 flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span className="font-medium">רענן נתונים</span>
            </button>
            
            <button
              onClick={signOut}
              className="w-full p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors active:scale-98 flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span className="font-medium">התנתק</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">
              פותח עבור Balena Science במיוחד ל-K-Show 2025
            </p>
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
          onClose={() => {
            setShowDiscoveryPage(false)
            setActiveView('dashboard')
          }}
          onCompanyClick={(company) => {
            // Keep Discovery Page open in background, just show modal on top
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