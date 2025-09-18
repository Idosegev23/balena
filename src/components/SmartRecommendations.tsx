'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Lightbulb, TrendingUp, Target, Users, ChevronRight } from 'lucide-react'

interface SmartRecommendationsProps {
  currentCompany?: Company
  onCompanyClick?: (company: Company) => void
}

interface RecommendationGroup {
  title: string
  description: string
  companies: Company[]
  reason: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

export function SmartRecommendations({ currentCompany, onCompanyClick }: SmartRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      generateRecommendations()
    }
  }, [user, currentCompany])

  const generateRecommendations = async () => {
    setLoading(true)
    
    try {
      // Fetch all companies with ratings
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          company_ratings (
            rating,
            user_id,
            created_at
          )
        `)
        .order('relevance_score', { ascending: false })

      if (companiesError) throw companiesError

      // Fetch team ratings
      const { data: teamRatings, error: ratingsError } = await supabase
        .from('company_ratings')
        .select('*')
        .eq('rating', 1) // Only positive ratings

      if (ratingsError) throw ratingsError

      const recommendationGroups: RecommendationGroup[] = []

      // 1. Based on team positive ratings
      if (teamRatings && teamRatings.length > 0) {
        const highlyRatedCompanies = companies?.filter(company => {
          const positiveRatings = teamRatings.filter(r => r.company_id === company.id)
          return positiveRatings.length >= 2 // At least 2 team members liked it
        }) || []

        if (highlyRatedCompanies.length > 0) {
          recommendationGroups.push({
            title: 'Team Recommended',
            description: 'Companies that received positive ratings from multiple team members',
            companies: highlyRatedCompanies.slice(0, 5),
            reason: 'Team rated positively',
            icon: <Users className="w-5 h-5 text-green-600" />,
            priority: 'high'
          })
        }
      }

      // 2. Similar companies based on current company
      if (currentCompany) {
        const similarCompanies = companies?.filter(company => {
          if (company.id === currentCompany.id) return false
          
          // Check similarity by department or keywords
          const sameDepartment = company.department === currentCompany.department
          const similarLocation = company.location?.includes(currentCompany.location?.split(' ')[0] || '') || false
          
          return sameDepartment || similarLocation
        }) || []

        if (similarCompanies.length > 0) {
          recommendationGroups.push({
            title: 'Similar Companies',
            description: `Similar to ${currentCompany.company}`,
            companies: similarCompanies.slice(0, 4),
            reason: 'Similar characteristics',
            icon: <Target className="w-5 h-5 text-blue-600" />,
            priority: 'medium'
          })
        }
      }

      // 3. High relevance score companies not yet rated
      const unratedHighRelevance = companies?.filter(company => {
        const hasUserRating = company.company_ratings?.some((r: any) => r.user_id === user?.id)
        return !hasUserRating && (company.relevance_score || 0) >= 8
      }) || []

      if (unratedHighRelevance.length > 0) {
        recommendationGroups.push({
          title: 'High Relevance',
          description: 'Companies with high relevance scores not yet rated',
          companies: unratedHighRelevance.slice(0, 6),
          reason: 'High relevance score',
          icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
          priority: 'high'
        })
      }

      // 4. Must visit companies
      const mustVisitCompanies = companies?.filter(company => 
        company.visit_priority === 'MUST_VISIT'
      ) || []

      if (mustVisitCompanies.length > 0) {
        recommendationGroups.push({
          title: 'Must Visit',
          description: 'Companies marked as highest priority',
          companies: mustVisitCompanies.slice(0, 8),
          reason: 'Highest priority',
          icon: <Target className="w-5 h-5 text-red-600" />,
          priority: 'high'
        })
      }

      setRecommendations(recommendationGroups)
      
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
    
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-orange-200 bg-orange-50'
      case 'low': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Lightbulb className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
          </motion.div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            Smart Recommendations
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border rounded-lg p-4"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-4 bg-gray-200 rounded w-1/3 mb-2"
              ></motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="h-3 bg-gray-200 rounded w-2/3 mb-3"
              ></motion.div>
              <div className="flex gap-2">
                {[1, 2, 3].map(j => (
                  <motion.div
                    key={j}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: j * 0.1 }}
                    className="h-8 bg-gray-200 rounded w-20"
                  ></motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        </motion.div>
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-gray-600 mb-2"
        >
          No recommendations available
        </motion.h3>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500"
        >
          Start rating companies to receive personalized recommendations
        </motion.p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-4"
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Lightbulb className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
        </motion.div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
          Smart Recommendations
        </h2>
      </motion.div>

      <AnimatePresence>
        {recommendations.map((group, groupIndex) => (
          <motion.div
            key={groupIndex}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: groupIndex * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className={`border-2 rounded-xl p-4 ${getPriorityColor(group.priority)} shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {group.icon}
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: groupIndex * 0.1 + 0.2 }}
                    className="font-bold text-lg"
                  >
                    {group.title}
                  </motion.h3>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: groupIndex * 0.1 + 0.3 }}
                    className="text-sm text-gray-600"
                  >
                    {group.description}
                  </motion.p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: groupIndex * 0.1 + 0.4, type: "spring", bounce: 0.5 }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(group.priority)}`}
              >
                {group.priority === 'high' ? 'High Priority' :
                 group.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
              </motion.div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.companies.map((company, companyIndex) => (
                <motion.button
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 + companyIndex * 0.05 + 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    borderColor: "#3b82f6"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCompanyClick?.(company)}
                  className="text-left p-3 bg-white rounded-lg border hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm group-hover:text-blue-600" style={{ color: 'var(--balena-dark)' }}>
                      {company.company}
                    </h4>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="group-hover:text-blue-600"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </motion.div>
                  </div>
                <p className="text-xs mb-1" style={{ color: 'var(--balena-brown)' }}>
                  📍 {company.location}
                </p>
                {company.relevance_score && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      ⭐ {company.relevance_score}/10
                    </span>
                  </div>
                )}
                </motion.button>
              ))}
          </div>

          {group.companies.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No companies available in this category
            </p>
          )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
