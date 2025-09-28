'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Download, FileText, Image, Mail, Package, CheckCircle, AlertCircle, Building2 } from 'lucide-react'

interface ExportOptions {
  includeCompanies: boolean
  includeNotes: boolean
  includeBusinessCards: boolean
  includeVisits: boolean
  includeImages: boolean
  includeFollowUps: boolean
  format: 'excel' | 'pdf' | 'json'
  dateRange: 'all' | 'week' | 'month'
  departments: string[]
  priorities: string[]
}

export function DataExport() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>('')
  const [options, setOptions] = useState<ExportOptions>({
    includeCompanies: true,
    includeNotes: true,
    includeBusinessCards: true,
    includeVisits: true,
    includeImages: false, // Heavy download
    includeFollowUps: true,
    format: 'excel',
    dateRange: 'all',
    departments: [],
    priorities: ['MUST_VISIT', 'HIGH']
  })

  const exportData = async () => {
    if (!user) return
    
    setExporting(true)
    setExportStatus('Preparing data for export...')
    
    try {
      const exportData: any = {
        metadata: {
          exportedBy: user?.user_metadata?.full_name || user?.email || 'Unknown',
          exportedAt: new Date().toISOString(),
          exportOptions: options
        }
      }

      // Export companies with ratings, notes and tags
      if (options.includeCompanies) {
        setExportStatus('Exporting company data...')
        
        let companiesQuery = supabase
          .from('companies')
          .select(`
            *,
            company_ratings(rating, notes, user_id, created_at),
            notes(content, note_type, created_at, user_id, is_private)
          `)
          .order('company')

        if (options.priorities.length > 0) {
          companiesQuery = companiesQuery.in('visit_priority', options.priorities)
        }

        const { data: companies, error: companiesError } = await companiesQuery
        if (companiesError) throw companiesError
        
        exportData.companies = companies
      }

      // Export visits
      if (options.includeVisits) {
        setExportStatus('Exporting visits data...')
        
        const { data: visits, error: visitsError } = await supabase
          .from('visits')
          .select(`
            *,
            company:companies(company, hall, stand),
            user:users(full_name, email)
          `)
          .order('visit_date', { ascending: false })

        if (visitsError) throw visitsError
        exportData.visits = visits
      }

      // Export business cards
      if (options.includeBusinessCards) {
        setExportStatus('Exporting business cards...')
        
        const { data: businessCards, error: cardsError } = await supabase
          .from('business_cards')
          .select(`
            *,
            company:companies(company)
          `)
          .order('collected_at', { ascending: false })

        if (cardsError) throw cardsError
        exportData.businessCards = businessCards
      }

      // Export notes
      if (options.includeNotes) {
        setExportStatus('Exporting notes...')
        
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select(`
            *,
            company:companies(company),
            user:users(full_name, email)
          `)
          .eq('is_private', false) // Only export public notes
          .order('created_at', { ascending: false })

        if (notesError) throw notesError
        exportData.notes = notes
      }

      // Export follow-ups
      if (options.includeFollowUps) {
        setExportStatus('Exporting follow-up tasks...')
        
        const { data: followUps, error: followUpsError } = await supabase
          .from('follow_ups')
          .select(`
            *,
            company:companies(company),
            assigned_user:users!follow_ups_assigned_user_id_fkey(full_name, email),
            created_by_user:users!follow_ups_created_by_user_id_fkey(full_name, email)
          `)
          .order('created_at', { ascending: false })

        if (followUpsError) throw followUpsError
        exportData.followUps = followUps
      }

      // Generate file based on format
      setExportStatus('Creating file...')
      
      if (options.format === 'json') {
        downloadJSON(exportData)
      } else if (options.format === 'excel') {
        await generateExcel(exportData)
      } else if (options.format === 'pdf') {
        await generatePDF(exportData)
      }

      // Log export activity
      await supabase
        .from('activity_feed')
        .insert({
          user_name: user?.user_metadata?.full_name || user?.email || 'Unknown',
          action_type: 'data_exported',
          description: `Exported data in ${options.format} format`,
          metadata: {
            format: options.format,
            options: options,
            recordCounts: {
              companies: exportData.companies?.length || 0,
              visits: exportData.visits?.length || 0,
              businessCards: exportData.businessCards?.length || 0,
              notes: exportData.notes?.length || 0,
              followUps: exportData.followUps?.length || 0
            }
          }
        })

      setExportStatus('Export completed successfully!')
      
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus('Error exporting data')
    }
    
    setExporting(false)
    setTimeout(() => setExportStatus(''), 3000)
  }

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `balena-kshow-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateExcel = async (data: any) => {
    // In a real implementation, would use libraries like SheetJS (xlsx) or ExcelJS
    // For now, we'll create a CSV-like format
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" // BOM for Hebrew support
    
    // Companies sheet
    if (data.companies) {
      csvContent += "=== Companies ===\n"
      csvContent += "Company Name,Location,Hall,Stand,Email,Phone,Website,Description,Visit Priority,Relevance Score,Tags,Likes,Dislikes,Rating Notes,General Notes,Private Notes,Last Updated\n"
      
      data.companies.forEach((company: any) => {
        // Process ratings to get like/dislike info
        const ratings = company.company_ratings || []
        const likes = ratings.filter((r: any) => r.rating === 1).length
        const dislikes = ratings.filter((r: any) => r.rating === -1).length
        const ratingNotes = ratings.map((r: any) => r.notes).filter(Boolean).join('; ')
        
        // Process notes by type
        const notes = company.notes || []
        const generalNotes = notes.filter((n: any) => !n.is_private).map((n: any) => `${n.note_type || 'Note'}: ${n.content}`).join('; ')
        const privateNotes = notes.filter((n: any) => n.is_private).map((n: any) => `${n.note_type || 'Private'}: ${n.content}`).join('; ')
        
        // Process tags
        const tags = Array.isArray(company.tags) ? company.tags.join(', ') : (company.tags || '')
        
        // Get last updated date
        const lastUpdated = company.updated_at ? new Date(company.updated_at).toLocaleDateString('he-IL') : ''
        
        csvContent += [
          company.company || '',
          company.location || '',
          company.hall || '',
          company.stand || '',
          company.email || '',
          company.phone || '',
          company.website || '',
          (company.description || '').replace(/,/g, ';'),
          company.visit_priority || '',
          company.relevance_score || '',
          tags,
          likes.toString(),
          dislikes.toString(),
          ratingNotes.replace(/,/g, ';'),
          generalNotes.replace(/,/g, ';'),
          privateNotes.replace(/,/g, ';'),
          lastUpdated
        ].map(field => `"${field}"`).join(',') + '\n'
      })
      csvContent += '\n'
    }

    // Visits sheet
    if (data.visits) {
      csvContent += "=== Visits ===\n"
      csvContent += "Company,Visitor,Status,Visit Date,Duration,Notes\n"
      
      data.visits.forEach((visit: any) => {
        csvContent += [
          visit.company?.company || '',
          visit.user?.full_name || visit.user?.email || '',
          visit.visit_status || '',
          new Date(visit.visit_date).toLocaleDateString('en-US'),
          visit.duration_minutes || '',
          (visit.notes || '').replace(/,/g, ';')
        ].map(field => `"${field}"`).join(',') + '\n'
      })
      csvContent += '\n'
    }

    // Download CSV
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `balena-kshow-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDF = async (data: any) => {
    // In a real implementation, would use libraries like jsPDF or Puppeteer
    // For now, we'll create an HTML page that can be printed as PDF
    
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Data Export - Balena K-Show 2025</title>
        <style>
          body { font-family: Arial, sans-serif; direction: ltr; }
          h1, h2 { color: #0E2226; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <h1>Data Export - Balena K-Show 2025</h1>
        <p>Export Date: ${new Date().toLocaleDateString('en-US')}</p>
        <p>Exported by: ${user?.user_metadata?.full_name || user?.email || 'Unknown'}</p>
        
        ${data.companies ? `
          <h2>Companies (${data.companies.length})</h2>
          <table>
            <tr>
              <th>Company Name</th>
              <th>Location</th>
              <th>Hall/Stand</th>
              <th>Priority</th>
              <th>Relevance Score</th>
              <th>Tags</th>
              <th>Like/Dislike</th>
              <th>Notes</th>
            </tr>
            ${data.companies.map((company: any) => {
              const ratings = company.company_ratings || []
              const likes = ratings.filter((r: any) => r.rating === 1).length
              const dislikes = ratings.filter((r: any) => r.rating === -1).length
              const likeDislikeInfo = `👍${likes} 👎${dislikes}`
              
              const notes = company.notes || []
              const allNotes = notes.map((n: any) => n.content).join('; ')
              const tags = Array.isArray(company.tags) ? company.tags.join(', ') : (company.tags || '')
              
              return `
              <tr>
                <td>${company.company || ''}</td>
                <td>${company.location || ''}</td>
                <td>${company.hall || ''}/${company.stand || ''}</td>
                <td>${company.visit_priority || ''}</td>
                <td>${company.relevance_score || ''}</td>
                <td>${tags}</td>
                <td>${likeDislikeInfo}</td>
                <td>${allNotes}</td>
              </tr>`
            }).join('')}
          </table>
        ` : ''}
        
        ${data.visits ? `
          <div class="page-break"></div>
          <h2>Visits (${data.visits.length})</h2>
          <table>
            <tr>
              <th>Company</th>
              <th>Visitor</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
            ${data.visits.map((visit: any) => `
              <tr>
                <td>${visit.company?.company || ''}</td>
                <td>${visit.user?.full_name || visit.user?.email || ''}</td>
                <td>${new Date(visit.visit_date).toLocaleDateString('en-US')}</td>
                <td>${visit.duration_minutes || ''} minutes</td>
                <td>${visit.visit_status || ''}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `balena-kshow-export-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('HTML file created. You can open it in browser and print as PDF')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Download className="w-6 h-6" style={{ color: 'var(--balena-dark)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
          Data Export
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="font-bold">Export Options</h3>
          
          {/* Data Types */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Data Types</h4>
            <div className="space-y-2">
              {[
                { key: 'includeCompanies', label: 'Companies and contact details', icon: <Building2 className="w-4 h-4" /> },
                { key: 'includeVisits', label: 'Visits and tracking', icon: <CheckCircle className="w-4 h-4" /> },
                { key: 'includeNotes', label: 'Notes (public)', icon: <FileText className="w-4 h-4" /> },
                { key: 'includeBusinessCards', label: 'Business cards', icon: <Mail className="w-4 h-4" /> },
                { key: 'includeFollowUps', label: 'Follow-up tasks', icon: <AlertCircle className="w-4 h-4" /> },
                { key: 'includeImages', label: 'Images (will increase file size)', icon: <Image className="w-4 h-4" /> }
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options[key as keyof ExportOptions] as boolean}
                    onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded"
                  />
                  {icon}
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">File Format</h4>
            <div className="space-y-2">
              {[
                { value: 'excel', label: 'Excel/CSV (recommended for analysis)', icon: '📊' },
                { value: 'pdf', label: 'PDF/HTML (recommended for reports)', icon: '📄' },
                { value: 'json', label: 'JSON (advanced)', icon: '💻' }
              ].map(({ value, label, icon }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value={value}
                    checked={options.format === value}
                    onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="rounded"
                  />
                  <span>{icon}</span>
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Data Filtering</h4>
            
            <div>
              <label className="block text-sm mb-2">Visit Priorities</label>
              <div className="space-y-1">
                {[
                  { value: 'MUST_VISIT', label: 'Must Visit' },
                  { value: 'HIGH', label: 'High Priority' },
                  { value: 'MEDIUM', label: 'Medium Priority' },
                  { value: 'LOW', label: 'Low Priority' }
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.priorities.includes(value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions(prev => ({ ...prev, priorities: [...prev.priorities, value] }))
                        } else {
                          setOptions(prev => ({ ...prev, priorities: prev.priorities.filter(p => p !== value) }))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Status & Action */}
        <div className="space-y-4">
          <h3 className="font-bold">Export Status</h3>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            {!exporting && !exportStatus && (
              <div className="text-center py-6">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-4">Ready to export data</p>
                <p className="text-sm text-gray-500">
                  Select the appropriate options and click Export
                </p>
              </div>
            )}

            {exporting && (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="font-medium">{exportStatus}</p>
                <p className="text-sm text-gray-500 mt-2">Please wait...</p>
              </div>
            )}

            {!exporting && exportStatus && (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p className="font-medium text-green-600">{exportStatus}</p>
              </div>
            )}
          </div>

          <button
            onClick={exportData}
            disabled={exporting || (!options.includeCompanies && !options.includeVisits && !options.includeNotes && !options.includeBusinessCards && !options.includeFollowUps)}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? '⏳ Exporting...' : '📥 Export Data'}
          </button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Export includes only data you have permission to view</p>
            <p>• Private notes will not be included in export</p>
            <p>• Image files may create a large file</p>
          </div>
        </div>
      </div>
    </div>
  )
}
