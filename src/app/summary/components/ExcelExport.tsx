'use client'

import React from 'react'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Company, Visit } from '../data/types'

interface ExcelExportProps {
  companies: Company[]
  visits: Visit[]
  className?: string
}

export function ExcelExport({ companies, visits, className = '' }: ExcelExportProps) {
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Prepare companies data
    const companiesForExport = companies.map(company => ({
      'Company Name': company.company,
      'Hall': company.hall,
      'Stand': company.stand,
      'Department': company.department,
      'Visit Priority': company.visit_priority,
      'Relevance Score': company.relevance_score,
      'Visited': company.visited ? 'Yes' : 'No',
      'Visit Date': company.visit_date ? new Date(company.visit_date).toLocaleDateString() : '',
      'Visited By': company.visited_by || '',
      'Tags': company.tags.join(', '),
      'Contact Person': company.contact_person || '',
      'Email': company.email || '',
      'Phone': company.phone || '',
      'Website': company.website || '',
      'Why Relevant': company.why_relevant || '',
      'Description': company.description || '',
      'Follow Up Status': company.follow_up_status,
      'Follow Up Priority': company.follow_up_priority,
      'Next Follow Up Date': company.next_follow_up_date || '',
      'Follow Up Notes': company.follow_up_notes || ''
    }))

    // Prepare visits data
    const visitsForExport = visits.map(visit => ({
      'Visit ID': visit.id,
      'Company': visit.company,
      'Hall': visit.hall,
      'Stand': visit.stand,
      'Department': visit.department,
      'Visit Date': new Date(visit.visit_date).toLocaleDateString(),
      'Visit Time': new Date(visit.visit_date).toLocaleTimeString(),
      'Duration (minutes)': visit.duration_minutes || '',
      'Notes': visit.notes || '',
      'Contacts Met': visit.contacts_met ? visit.contacts_met.join(', ') : '',
      'Next Steps': visit.next_steps || '',
      'Follow Up Required': visit.follow_up_required ? 'Yes' : 'No',
      'Follow Up Date': visit.follow_up_date || ''
    }))

    // Create summary statistics
    const summaryStats = [
      { 'Metric': 'Total Companies Visited', 'Value': companies.length },
      { 'Metric': 'Total Visits Recorded', 'Value': visits.length },
      { 'Metric': 'Average Relevance Score', 'Value': Math.round(companies.reduce((sum, c) => sum + c.relevance_score, 0) / companies.length) },
      { 'Metric': 'Must Visit Companies', 'Value': companies.filter(c => c.visit_priority === 'MUST_VISIT').length },
      { 'Metric': 'High Priority Companies', 'Value': companies.filter(c => c.visit_priority === 'HIGH').length },
      { 'Metric': 'Companies Requiring Follow-up', 'Value': companies.filter(c => c.follow_up_priority > 0).length }
    ]

    // Department breakdown
    const departmentStats = companies.reduce((acc, company) => {
      const dept = company.department || 'Unknown'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const departmentBreakdown = Object.entries(departmentStats).map(([dept, count]) => ({
      'Department': dept,
      'Company Count': count,
      'Percentage': `${Math.round((count / companies.length) * 100)}%`
    }))

    // Hall breakdown
    const hallStats = companies.reduce((acc, company) => {
      const hall = company.hall || 'Unknown'
      acc[hall] = (acc[hall] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const hallBreakdown = Object.entries(hallStats).map(([hall, count]) => ({
      'Hall': hall,
      'Company Count': count,
      'Percentage': `${Math.round((count / companies.length) * 100)}%`
    }))

    // Create worksheets
    const companiesWS = XLSX.utils.json_to_sheet(companiesForExport)
    const visitsWS = XLSX.utils.json_to_sheet(visitsForExport)
    const summaryWS = XLSX.utils.json_to_sheet(summaryStats)
    const departmentWS = XLSX.utils.json_to_sheet(departmentBreakdown)
    const hallWS = XLSX.utils.json_to_sheet(hallBreakdown)

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary Statistics')
    XLSX.utils.book_append_sheet(workbook, companiesWS, 'Companies')
    XLSX.utils.book_append_sheet(workbook, visitsWS, 'Visits')
    XLSX.utils.book_append_sheet(workbook, departmentWS, 'Department Breakdown')
    XLSX.utils.book_append_sheet(workbook, hallWS, 'Hall Breakdown')

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `K-Show-2025-Summary-${dateStr}.xlsx`

    // Save the file
    XLSX.writeFile(workbook, filename)
  }

  return (
    <button
      onClick={exportToExcel}
      className={`inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>Export to Excel</span>
    </button>
  )
}
