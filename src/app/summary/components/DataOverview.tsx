'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Users, Star, Calendar, TrendingUp } from 'lucide-react'
import { Company, Visit } from '../data/types'

interface DataOverviewProps {
  companies: Company[]
  visits: Visit[]
}

export function DataOverview({ companies, visits }: DataOverviewProps) {
  const stats = {
    totalCompanies: companies.length,
    totalVisits: visits.length,
    averageRelevanceScore: Math.round(companies.reduce((sum, c) => sum + c.relevance_score, 0) / companies.length),
    mustVisitCompanies: companies.filter(c => c.visit_priority === 'MUST_VISIT').length,
    highPriorityCompanies: companies.filter(c => c.visit_priority === 'HIGH').length,
    followUpRequired: companies.filter(c => c.follow_up_priority > 0).length
  }

  const departmentStats = companies.reduce((acc, company) => {
    const dept = company.department || 'Unknown'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const hallStats = companies.reduce((acc, company) => {
    const hall = company.hall || 'Unknown'
    acc[hall] = (acc[hall] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDepartments = Object.entries(departmentStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const topHalls = Object.entries(hallStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.totalCompanies}</div>
              <div className="text-sm text-slate-500">Companies Visited</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Total companies that were visited during K-Show 2025
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.totalVisits}</div>
              <div className="text-sm text-slate-500">Total Visits</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Number of recorded visits with notes and details
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.averageRelevanceScore}</div>
              <div className="text-sm text-slate-500">Avg. Relevance</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Average relevance score across all visited companies
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.mustVisitCompanies}</div>
              <div className="text-sm text-slate-500">Must Visit</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Companies marked as "Must Visit" priority
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.highPriorityCompanies}</div>
              <div className="text-sm text-slate-500">High Priority</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Companies marked as "High" priority for visits
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats.followUpRequired}</div>
              <div className="text-sm text-slate-500">Follow-up Required</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Companies requiring follow-up actions
          </div>
        </motion.div>
      </div>

      {/* Department and Hall Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Departments */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-slate-600" />
            Top Departments
          </h3>
          <div className="space-y-3">
            {topDepartments.map(([dept, count], index) => (
              <div key={dept} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-700">{dept}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{count}</div>
                  <div className="text-xs text-slate-500">
                    {Math.round((count / stats.totalCompanies) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Halls */}
        <motion.div variants={fadeInUp} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-slate-600" />
            Top Exhibition Halls
          </h3>
          <div className="space-y-3">
            {topHalls.map(([hall, count], index) => (
              <div key={hall} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-700">Hall {hall}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{count}</div>
                  <div className="text-xs text-slate-500">
                    {Math.round((count / stats.totalCompanies) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
