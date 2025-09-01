'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Company } from '@/lib/supabase'
import { Building2 } from 'lucide-react'
import { CompanyModal } from '@/components/CompanyModal'
import { RealtimeRating } from '@/components/RealtimeRating'
import { SmartRecommendations } from '@/components/SmartRecommendations'
import { RouteOptimizer } from '@/components/RouteOptimizer'
import { LiveCompanyAdd } from '@/components/LiveCompanyAdd'
import { DataExport } from '@/components/DataExport'
import { CompanyDiscoveryPage } from '@/components/CompanyDiscoveryPage'

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

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Check if email is allowed
        const isAllowedEmail = email === 'triroars@gmail.com' || email.endsWith('@balena.science')
        
        if (!isAllowedEmail) {
          setMessage('❌ רק חברי צוות Balena יכולים להירשם. צור קשר עם המנהל להרשאות.')
          setLoading(false)
          return
        }

        if (!fullName.trim() || !teamRole.trim()) {
          setMessage('❌ אנא מלא את כל השדות')
          setLoading(false)
          return
        }

        const { error } = await signUp(email, password, fullName, teamRole)
        
        if (error) {
          setMessage(`❌ ${error.message}`)
        } else {
          setMessage('✅ נרשמת בהצלחה! בדוק את תיבת האימייל שלך לאישור.')
        }
      } else {
        const { error } = await signIn(email, password)
        
        if (error) {
          setMessage(`❌ ${error.message}`)
        } else {
          setMessage('✅ נכנסת בהצלחה!')
        }
      }
    } catch (error) {
      setMessage('❌ שגיאה במערכת. נסה שוב.')
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
              {isSignUp ? 'הרשמה למערכת' : 'כניסה למערכת'}
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
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      placeholder="שם פרטי ומשפחה"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-right">תפקיד בצוות</label>
                    <select
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--balena-brown)' }}
                      required
                    >
                      <option value="">בחר תפקיד</option>
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
                <label className="block text-sm font-medium mb-2 text-right">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--balena-brown)' }}
                  placeholder={isSignUp ? "name@balena.science או triroars@gmail.com" : "name@balena.science"}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-right">סיסמה</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--balena-brown)' }}
                  placeholder="••••••••"
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
                {loading ? '⏳ בתהליך...' : (isSignUp ? 'הרשמה' : 'כניסה')}
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
                {isSignUp ? 'יש לי כבר חשבון - כניסה' : 'אין לי חשבון - הרשמה'}
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

      {/* Mobile-First Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="space-y-4">
          {/* Mobile-First Welcome */}
          <div className="text-center py-3 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-1 flex items-center justify-center gap-2" style={{ color: 'var(--balena-dark)' }}>
              🎯 K-Show 2025
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--balena-brown)' }}>
              Düsseldorf • 8-15 באוקטובר
            </p>
          </div>

          {/* Mobile-First Stats */}
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            <button 
              onClick={() => setShowDiscoveryPage(true)}
              className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center hover:shadow-md transition-all hover:bg-blue-50 active:scale-95"
            >
              <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--balena-dark)' }}>
                {stats?.totalCompanies || 0}
              </div>
              <div className="text-xs font-medium">🔍 גלה</div>
            </button>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center border-l-4 border-red-500">
              <div className="text-xl sm:text-2xl font-bold mb-1 text-red-600">
                {stats?.mustVisitCompanies || 0}
              </div>
              <div className="text-xs font-medium">⭐ חובה</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center border-l-4 border-green-500">
              <div className="text-xl sm:text-2xl font-bold mb-1 text-green-600">
                {stats?.visitedCompanies || 0}
              </div>
              <div className="text-xs font-medium">✅ בוקרו</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm text-center border-l-4 border-blue-500">
              <div className="text-xl sm:text-2xl font-bold mb-1 text-blue-600">
                {stats?.followUpRequired || 0}
              </div>
              <div className="text-xs font-medium">📋 פולואפ</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--balena-dark)' }}>
              מה תרצה לעשות?
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="p-6 border-2 rounded-xl text-center hover:shadow-lg transition-all relative" style={{ borderColor: 'var(--balena-pink)' }}>
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-bold">גלה חברות</div>
                <div className="text-xs mt-1" style={{ color: 'var(--balena-brown)' }}>
                  {stats?.totalCompanies || 0} חברות זמינות
                </div>
                {stats && stats.totalCompanies > 0 && (
                  <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    ✓
                  </div>
                )}
              </button>
              <button className="p-6 border-2 rounded-xl text-center hover:shadow-lg transition-all relative" style={{ borderColor: 'var(--balena-brown)' }}>
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold">תכנן ביקורים</div>
                <div className="text-xs mt-1" style={{ color: 'var(--balena-brown)' }}>
                  {stats?.mustVisitCompanies || 0} מטרות עיקריות
                </div>
                {stats && stats.mustVisitCompanies > 0 && (
                  <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    !
                  </div>
                )}
              </button>
              <button className="p-6 border-2 rounded-xl text-center hover:shadow-lg transition-all" style={{ borderColor: 'var(--balena-brown)' }}>
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold">רשום ביקור</div>
                <div className="text-xs mt-1" style={{ color: 'var(--balena-brown)' }}>במהלך התערוכה</div>
              </button>
              <button className="p-6 border-2 rounded-xl text-center hover:shadow-lg transition-all" style={{ borderColor: 'var(--balena-brown)' }}>
                <div className="text-2xl mb-2">✅</div>
                <div className="font-bold">פולואפ</div>
                <div className="text-xs mt-1" style={{ color: 'var(--balena-brown)' }}>
                  {stats?.followUpRequired || 0} דורשים מעקב
                </div>
              </button>
            </div>
          </div>

          {/* Top Priority Companies - Compact */}
          {companies.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                  🎯 חברות חובה
                </h3>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                  {companies.filter(c => c.visit_priority === 'MUST_VISIT').length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {companies
                  .filter(company => company.visit_priority === 'MUST_VISIT')
                  .slice(0, 6)
                  .map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanyClick(company)}
                      className="border rounded-lg p-3 hover:shadow-md transition-all text-right bg-gray-50 hover:bg-white cursor-pointer group"
                      style={{ borderColor: 'var(--balena-pink)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm group-hover:text-blue-600 transition-colors flex-1" style={{ color: 'var(--balena-dark)' }}>
                          {company.company}
                        </h4>
                        {company.relevance_score && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium ml-2">
                            ⭐ {company.relevance_score}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--balena-brown)' }}>
                        <span>📍 {company.location}</span>
                        {company.hall && company.stand && (
                          <span>🏢 {company.hall}/{company.stand}</span>
                        )}
                      </div>
                      {company.balena_value && (
                        <p className="text-xs mb-3" style={{ color: 'var(--balena-dark)' }}>
                          💡 {company.balena_value.slice(0, 60)}...
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div onClick={(e) => e.stopPropagation()}>
                          <RealtimeRating 
                            companyId={company.id} 
                            size="small" 
                            showTeamRatings={false}
                          />
                        </div>
                        <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          לחץ לפרטים →
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
              {companies.filter(c => c.visit_priority === 'MUST_VISIT').length > 6 && (
                <div className="text-center mt-4">
                  <button className="px-6 py-2 text-sm border rounded-lg hover:bg-gray-50" style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}>
                    צפה בכל החברות הפריוריטות ({companies.filter(c => c.visit_priority === 'MUST_VISIT').length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Tools Row */}
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => setShowDiscoveryPage(true)}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all text-center border"
              style={{ borderColor: 'var(--balena-brown)' }}
            >
              <div className="text-lg mb-1">🔍</div>
              <div className="text-sm font-medium">גלה חברות</div>
            </button>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <LiveCompanyAdd 
                onCompanyAdded={(company) => {
                  setCompanies(prev => [company, ...prev])
                  fetchDashboardData()
                }}
              />
            </div>

            <details className="bg-white rounded-lg shadow-sm">
              <summary className="p-4 cursor-pointer text-center hover:bg-gray-50 rounded-lg">
                <div className="text-lg mb-1">🧠</div>
                <div className="text-sm font-medium">כלים מתקדמים</div>
              </summary>
              <div className="p-4 border-t">
                <div className="space-y-4">
                  <SmartRecommendations 
                    onCompanyClick={handleCompanyClick}
                  />
                  <RouteOptimizer 
                    companies={companies}
                    onCompanyClick={handleCompanyClick}
                  />
                  <DataExport />
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

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
    </div>
  )
}