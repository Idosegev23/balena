'use client'

import { useState, useEffect } from 'react'
import { supabase, FollowUp, Company } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { CheckCircle, Clock, AlertCircle, Users, Calendar, Plus, Edit, Trash2, Flag } from 'lucide-react'

interface FollowUpInterfaceProps {
  companyId?: number
  showAllCompanies?: boolean
}

interface FollowUpWithCompany extends FollowUp {
  company?: Company
  assigned_user?: {
    full_name?: string
    email: string
  }
  created_by_user?: {
    full_name?: string
    email: string
  }
}

export function FollowUpInterface({ companyId, showAllCompanies = false }: FollowUpInterfaceProps) {
  const { user } = useAuth()
  const [followUps, setFollowUps] = useState<FollowUpWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
    assigned_user_id: ''
  })

  useEffect(() => {
    fetchFollowUps()
    setupRealtimeSubscription()
  }, [companyId, showAllCompanies])

  const fetchFollowUps = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('follow_ups')
        .select(`
          *,
          company:companies(id, company, hall, stand),
          assigned_user:users!follow_ups_assigned_user_id_fkey(full_name, email),
          created_by_user:users!follow_ups_created_by_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (!showAllCompanies && companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) throw error
      setFollowUps(data || [])
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
    }
    
    setLoading(false)
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('follow_ups_realtime')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'follow_ups'
        },
        () => {
          fetchFollowUps()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSubmit = async () => {
    if (!user || !formData.title.trim()) return

    try {
      const followUpData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_user_id: formData.assigned_user_id || user.id,
        created_by_user_id: user.id,
        company_id: companyId || null,
        status: 'pending' as const
      }

      if (editingFollowUp) {
        const { error } = await supabase
          .from('follow_ups')
          .update({
            ...followUpData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFollowUp.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('follow_ups')
          .insert(followUpData)

        if (error) throw error

        // Add to activity feed
        await supabase
          .from('activity_feed')
          .insert({
            user_name: user.user_metadata?.full_name || user.email,
            action_type: 'followup_created',
            company_id: companyId,
            description: `יצר משימת פולואפ: ${formData.title}`,
            metadata: {
              title: formData.title,
              priority: formData.priority,
              due_date: formData.due_date
            }
          })
      }

      resetForm()
      fetchFollowUps()
    } catch (error) {
      console.error('Error saving follow-up:', error)
      alert('שגיאה בשמירת המשימה')
    }
  }

  const updateStatus = async (followUpId: number, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('follow_ups')
        .update(updateData)
        .eq('id', followUpId)

      if (error) throw error

      fetchFollowUps()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('שגיאה בעדכון הסטטוס')
    }
  }

  const deleteFollowUp = async (followUpId: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) return

    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', followUpId)

      if (error) throw error
      fetchFollowUps()
    } catch (error) {
      console.error('Error deleting follow-up:', error)
      alert('שגיאה במחיקת המשימה')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      assigned_user_id: ''
    })
    setShowForm(false)
    setEditingFollowUp(null)
  }

  const startEdit = (followUp: FollowUp) => {
    setFormData({
      title: followUp.title,
      description: followUp.description || '',
      priority: followUp.priority,
      due_date: followUp.due_date ? followUp.due_date.split('T')[0] : '',
      assigned_user_id: followUp.assigned_user_id
    })
    setEditingFollowUp(followUp)
    setShowForm(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL')
  }

  const isOverdue = (dueDateString: string) => {
    if (!dueDateString) return false
    const dueDate = new Date(dueDateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  const filteredFollowUps = followUps.filter(followUp => {
    if (filterStatus !== 'all' && followUp.status !== filterStatus) return false
    if (filterPriority !== 'all' && followUp.priority !== filterPriority) return false
    return true
  })

  const pendingCount = followUps.filter(f => f.status === 'pending').length
  const overdueCount = followUps.filter(f => f.due_date && isOverdue(f.due_date) && f.status !== 'completed').length

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p>טוען משימות פולואפ...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            משימות פולואפ
          </h3>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {pendingCount} ממתינות
              </span>
            )}
            {overdueCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {overdueCount} באיחור
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          משימה חדשה
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="pending">ממתין</option>
          <option value="in_progress">בתהליך</option>
          <option value="completed">הושלם</option>
          <option value="cancelled">בוטל</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">כל העדיפויות</option>
          <option value="urgent">דחוף</option>
          <option value="high">גבוה</option>
          <option value="medium">בינוני</option>
          <option value="low">נמוך</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">
            {editingFollowUp ? 'ערוך משימה' : 'משימה חדשה'}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">כותרת המשימה *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="לדוגמה: שלח דוגמאות חומרים"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">תיאור</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="פרטים נוספים על המשימה..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">עדיפות</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                  <option value="urgent">דחופה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">תאריך יעד</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingFollowUp ? 'עדכן' : 'הוסף'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filteredFollowUps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>אין משימות פולואפ</p>
            <p className="text-sm">הוסף את המשימה הראשונה</p>
          </div>
        ) : (
          filteredFollowUps.map((followUp) => (
            <div 
              key={followUp.id} 
              className={`border rounded-lg p-4 ${followUp.status === 'completed' ? 'bg-green-50' : 'bg-white'} ${
                followUp.due_date && isOverdue(followUp.due_date) && followUp.status !== 'completed' ? 'border-red-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(followUp.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(followUp.status)}
                        {followUp.status === 'pending' ? 'ממתין' :
                         followUp.status === 'in_progress' ? 'בתהליך' :
                         followUp.status === 'completed' ? 'הושלם' : 'בוטל'}
                      </div>
                    </div>

                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(followUp.priority)}`}>
                      <Flag className="w-3 h-3 inline mr-1" />
                      {followUp.priority === 'urgent' ? 'דחוף' :
                       followUp.priority === 'high' ? 'גבוה' :
                       followUp.priority === 'medium' ? 'בינוני' : 'נמוך'}
                    </div>

                    {followUp.due_date && isOverdue(followUp.due_date) && followUp.status !== 'completed' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        באיחור
                      </span>
                    )}
                  </div>

                  <h4 className="font-medium mb-1">{followUp.title}</h4>
                  
                  {followUp.description && (
                    <p className="text-sm text-gray-600 mb-2">{followUp.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {showAllCompanies && followUp.company && (
                      <span>🏢 {followUp.company.company}</span>
                    )}
                    <span>👤 {followUp.assigned_user?.full_name || followUp.assigned_user?.email}</span>
                    {followUp.due_date && (
                      <span>📅 {formatDate(followUp.due_date)}</span>
                    )}
                    <span>נוצר {formatDate(followUp.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {followUp.status !== 'completed' && (
                    <>
                      <select
                        value={followUp.status}
                        onChange={(e) => updateStatus(followUp.id, e.target.value)}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        <option value="pending">ממתין</option>
                        <option value="in_progress">בתהליך</option>
                        <option value="completed">הושלם</option>
                        <option value="cancelled">בוטל</option>
                      </select>
                    </>
                  )}

                  {(followUp.created_by_user_id === user?.id || followUp.assigned_user_id === user?.id) && (
                    <>
                      <button
                        onClick={() => startEdit(followUp)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteFollowUp(followUp.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
