'use client'

import { useState, useEffect } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Map, MapPin, Clock, Users, Star, Navigation, Calendar } from 'lucide-react'

interface RouteOptimizerProps {
  companies: Company[]
  onCompanyClick?: (company: Company) => void
}

interface OptimizedRoute {
  id: string
  name: string
  day: string
  companies: Company[]
  estimatedDuration: number
  hallsVisited: string[]
  startTime: string
  endTime: string
  walkingDistance: number // in meters
}

interface HallLocation {
  hall: string
  level?: string
  coordinates: { x: number, y: number } // Relative coordinates for sorting
}

export function RouteOptimizer({ companies, onCompanyClick }: RouteOptimizerProps) {
  const { user } = useAuth()
  const [routes, setRoutes] = useState<OptimizedRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [optimizationMethod, setOptimizationMethod] = useState<'proximity' | 'priority' | 'time'>('proximity')

  // K-Show 2025 hall layout (simplified coordinates)
  const hallLayout: Record<string, HallLocation> = {
    'Hall 1': { hall: 'Hall 1', level: '1', coordinates: { x: 0, y: 0 } },
    'Hall 2': { hall: 'Hall 2', level: '1', coordinates: { x: 1, y: 0 } },
    'Hall 3': { hall: 'Hall 3', level: '1', coordinates: { x: 2, y: 0 } },
    'Hall 4': { hall: 'Hall 4', level: '1', coordinates: { x: 0, y: 1 } },
    'Hall 5': { hall: 'Hall 5', level: '1', coordinates: { x: 1, y: 1 } },
    'Hall 6': { hall: 'Hall 6', level: '1', coordinates: { x: 2, y: 1 } },
    'Hall 7': { hall: 'Hall 7', level: '1', coordinates: { x: 0, y: 2 } },
    'Hall 7a': { hall: 'Hall 7a', level: '1', coordinates: { x: 0.5, y: 2 } },
    'Hall 8': { hall: 'Hall 8', level: '1', coordinates: { x: 1, y: 2 } },
    'Hall 8a': { hall: 'Hall 8a', level: '1', coordinates: { x: 1.5, y: 2 } },
    'Hall 8b': { hall: 'Hall 8b', level: '1', coordinates: { x: 1.7, y: 2 } },
    'Hall 9': { hall: 'Hall 9', level: '1', coordinates: { x: 2, y: 2 } },
    'Hall 10': { hall: 'Hall 10', level: '1', coordinates: { x: 0, y: 3 } },
    'Hall 11': { hall: 'Hall 11', level: '1', coordinates: { x: 1, y: 3 } },
    'Hall 12': { hall: 'Hall 12', level: '1', coordinates: { x: 2, y: 3 } },
    'Hall 13': { hall: 'Hall 13', level: '1', coordinates: { x: 0, y: 4 } },
    'Hall 14': { hall: 'Hall 14', level: '1', coordinates: { x: 1, y: 4 } },
    'Hall 15': { hall: 'Hall 15', level: '1', coordinates: { x: 2, y: 4 } },
    'Hall 16': { hall: 'Hall 16', level: '1', coordinates: { x: 0, y: 5 } },
    'Hall 17': { hall: 'Hall 17', level: '1', coordinates: { x: 1, y: 5 } },
  }

  const showDays = [
    'Wednesday 8/10',
    'Thursday 9/10', 
    'Friday 10/10',
    'Saturday 11/10',
    'Sunday 12/10',
    'Monday 13/10',
    'Tuesday 14/10',
    'Wednesday 15/10'
  ]

  useEffect(() => {
    generateOptimizedRoutes()
  }, [companies, optimizationMethod])

  const calculateDistance = (hall1: string, hall2: string): number => {
    const loc1 = hallLayout[hall1]
    const loc2 = hallLayout[hall2]
    
    if (!loc1 || !loc2) return 1000 // Unknown halls get high distance

    const dx = loc1.coordinates.x - loc2.coordinates.x
    const dy = loc1.coordinates.y - loc2.coordinates.y
    return Math.sqrt(dx * dx + dy * dy) * 200 // Each unit = ~200 meters
  }

  const groupCompaniesByHall = (companies: Company[]): Record<string, Company[]> => {
    return companies.reduce((groups, company) => {
      const hall = company.hall || 'Unknown'
      if (!groups[hall]) groups[hall] = []
      groups[hall].push(company)
      return groups
    }, {} as Record<string, Company[]>)
  }

  const generateOptimizedRoutes = () => {
    setLoading(true)

    try {
      // Filter high priority companies
      const priorityCompanies = companies.filter(company => 
        company.visit_priority === 'MUST_VISIT' || 
        company.visit_priority === 'HIGH' ||
        (company.relevance_score && company.relevance_score >= 7)
      )

      // Group by hall
      const hallGroups = groupCompaniesByHall(priorityCompanies)
      const halls = Object.keys(hallGroups).filter(hall => hall !== 'Unknown')

      // Sort halls by proximity using traveling salesman approach (simplified)
      const optimizedHallOrder = optimizeHallOrder(halls)

      // Create routes - max 2 halls per day, 4-6 companies per route
      const generatedRoutes: OptimizedRoute[] = []
      let dayIndex = 0

      for (let i = 0; i < optimizedHallOrder.length; i += 2) {
        const routeHalls = optimizedHallOrder.slice(i, i + 2)
        const routeCompanies: Company[] = []

        // Collect companies from these halls
        routeHalls.forEach(hall => {
          const hallCompanies = hallGroups[hall] || []
          
          // Sort by priority within hall
          const sortedCompanies = hallCompanies.sort((a, b) => {
            const priorityOrder = { 'MUST_VISIT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
            const aPriority = priorityOrder[a.visit_priority as keyof typeof priorityOrder] || 1
            const bPriority = priorityOrder[b.visit_priority as keyof typeof priorityOrder] || 1
            
            if (aPriority !== bPriority) return bPriority - aPriority
            return (b.relevance_score || 0) - (a.relevance_score || 0)
          })

          routeCompanies.push(...sortedCompanies.slice(0, 6)) // Max 6 per hall
        })

        if (routeCompanies.length > 0) {
          const route: OptimizedRoute = {
            id: `route-${dayIndex + 1}`,
            name: `Route ${routeHalls.join(' + ')}`,
            day: showDays[dayIndex % showDays.length],
            companies: routeCompanies,
            estimatedDuration: Math.max(routeCompanies.length * 20, 120), // 20 min per company, min 2 hours
            hallsVisited: routeHalls,
            startTime: '09:00',
            endTime: calculateEndTime('09:00', routeCompanies.length * 20),
            walkingDistance: calculateRouteDistance(routeHalls)
          }
          generatedRoutes.push(route)
          dayIndex++
        }
      }

      setRoutes(generatedRoutes)
    } catch (error) {
      console.error('Error generating routes:', error)
    }

    setLoading(false)
  }

  const optimizeHallOrder = (halls: string[]): string[] => {
    if (halls.length <= 1) return halls

    // Simple nearest neighbor algorithm
    const ordered: string[] = []
    const remaining = [...halls]
    
    // Start with Hall 1 if available, otherwise first hall
    let current = remaining.find(h => h === 'Hall 1') || remaining[0]
    ordered.push(current)
    remaining.splice(remaining.indexOf(current), 1)

    while (remaining.length > 0) {
      let nearest = remaining[0]
      let minDistance = calculateDistance(current, nearest)

      for (const hall of remaining) {
        const distance = calculateDistance(current, hall)
        if (distance < minDistance) {
          minDistance = distance
          nearest = hall
        }
      }

      ordered.push(nearest)
      remaining.splice(remaining.indexOf(nearest), 1)
      current = nearest
    }

    return ordered
  }

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  const calculateRouteDistance = (halls: string[]): number => {
    if (halls.length <= 1) return 0
    
    let totalDistance = 0
    for (let i = 0; i < halls.length - 1; i++) {
      totalDistance += calculateDistance(halls[i], halls[i + 1])
    }
    return Math.round(totalDistance)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MUST_VISIT': return 'bg-red-100 text-red-800 border border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const filteredRoutes = selectedDay === 'all' 
    ? routes 
    : routes.filter(route => route.day === selectedDay)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            Optimal Visit Routes
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--balena-dark)' }}></div>
          <p>Calculating optimal routes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            Optimal Visit Routes
          </h2>
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'var(--balena-brown)' }}
          >
            <option value="all">All Days</option>
            {showDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          
          <select
            value={optimizationMethod}
            onChange={(e) => setOptimizationMethod(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'var(--balena-brown)' }}
          >
            <option value="proximity">By Proximity</option>
            <option value="priority">By Priority</option>
            <option value="time">By Time</option>
          </select>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredRoutes.map((route) => (
          <div 
            key={route.id} 
            className="border-2 rounded-xl p-6 bg-white hover:shadow-lg transition-shadow"
            style={{ borderColor: 'var(--balena-pink)' }}
          >
            {/* Route Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--balena-dark)' }}>
                  {route.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--balena-brown)' }}>
                  {route.day}
                </p>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>{route.startTime} - {route.endTime}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>{route.walkingDistance}m walking</span>
                </div>
              </div>
            </div>

            {/* Route Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{route.companies.length}</div>
                <div className="text-xs text-blue-600">Companies</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{route.hallsVisited.length}</div>
                <div className="text-xs text-green-600">Halls</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{Math.round(route.estimatedDuration / 60)}h</div>
                <div className="text-xs text-orange-600">Time</div>
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm" style={{ color: 'var(--balena-dark)' }}>
                Companies in route:
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {route.companies.map((company, index) => (
                  <button
                    key={company.id}
                    onClick={() => onCompanyClick?.(company)}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{company.company}</span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">
                          📍 {company.hall}/{company.stand}
                        </span>
                        {company.visit_priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(company.visit_priority)}`}>
                            {company.visit_priority === 'MUST_VISIT' ? 'Must Visit' : company.visit_priority}
                          </span>
                        )}
                        {company.relevance_score && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            ⭐ {company.relevance_score}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Route Actions */}
            <div className="flex gap-2 mt-4">
              <button 
                className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50 text-sm"
                style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}
              >
                📱 Send to Device
              </button>
              <button 
                className="flex-1 py-2 px-4 text-white rounded-lg hover:shadow-lg text-sm"
                style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}
              >
                📅 Schedule Visit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-8">
          <Map className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Routes Available</h3>
          <p className="text-sm text-gray-500">
            Try changing the criteria or add more high-priority companies
          </p>
        </div>
      )}
    </div>
  )
}
