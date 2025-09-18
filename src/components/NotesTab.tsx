'use client'

import { useState, useEffect } from 'react'
import { Company, supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { FileText, Plus, Trash2, Edit3, Save, X, Calendar } from 'lucide-react'
import { ShimmerButton } from './ui/shimmer-button'

interface Note {
  id: number
  company_id: number
  user_id: string
  content: string
  is_private: boolean
  created_at: string
  updated_at: string
  user_email?: string
  user_department?: string
}

interface NotesTabProps {
  company: Company
  onUpdate: () => void
}

export function NotesTab({ company, onUpdate }: NotesTabProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && company.id) {
      fetchNotes()
      setupRealtimeSubscription()
    }
  }, [user, company.id])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`notes_${company.id}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `company_id=eq.${company.id}`
        },
        () => {
          fetchNotes() // Refresh notes when any change happens
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      // First get the notes
      const { data: notesData, error } = await supabase
        .from('notes')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Add user info to notes
      const notesWithUserInfo = await Promise.all(
        (notesData || []).map(async (note) => {
          // Try to get user info from users table
          const { data: userData } = await supabase
            .from('users')
            .select('email, team_role')
            .eq('id', note.user_id)
            .single()
          
          return {
            ...note,
            user_email: userData?.email || 'Unknown User',
            user_department: userData?.team_role || 'Unknown Department'
          }
        })
      )
      setNotes(notesWithUserInfo)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
    setLoading(false)
  }

  const addNote = async () => {
    if (!newNote.trim() || !user) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          company_id: company.id,
          user_id: user.id,
          content: newNote.trim(),
          is_private: isPrivate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      setNewNote('')
      setIsPrivate(false)
      await fetchNotes()
      onUpdate()
    } catch (error) {
      console.error('Error adding note:', error)
    }
    setSaving(false)
  }

  const updateNote = async (noteId: number, content: string) => {
    if (!content.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .eq('user_id', user?.id) // Only allow users to edit their own notes

      if (error) throw error

      setEditingNoteId(null)
      setEditingContent('')
      await fetchNotes()
      onUpdate()
    } catch (error) {
      console.error('Error updating note:', error)
    }
    setSaving(false)
  }

  const deleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id) // Only allow users to delete their own notes

      if (error) throw error

      await fetchNotes()
      onUpdate()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
    setSaving(false)
  }

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingContent(note.content)
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    setEditingContent('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canEditNote = (note: Note) => {
    return user && note.user_id === user.id
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Company Notes</h2>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm">
          {notes.length}
        </span>
        {user?.user_metadata?.team_role && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            {user.user_metadata.team_role} Team
          </span>
        )}
      </div>
      

      {/* Add New Note */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300">
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a new note about this company..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
            rows={3}
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private-note"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="private-note" className="text-xs sm:text-sm text-gray-600">
                Private note (only I can see this)
              </label>
            </div>
            
            <ShimmerButton
              onClick={addNote}
              disabled={!newNote.trim() || saving}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              background="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              shimmerColor="#ffffff"
              shimmerDuration="1.5s"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Saving...' : 'Add Note'}
            </ShimmerButton>
          </div>
        </div>
      </div>

            {/* Notes List */}
            <div className="space-y-3 sm:space-y-4">
              {notes.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No notes yet</p>
                  <p className="text-xs sm:text-sm">Add the first note about this company</p>
                </div>
              ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white p-3 sm:p-4 rounded-lg border-2 ${
                note.is_private ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                  {note.user_department && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {note.user_department}
                    </span>
                  )}
                  {note.is_private && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Private
                    </span>
                  )}
                </div>
                
                {canEditNote(note) && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editingNoteId === note.id ? (
                      <>
                        <button
                          onClick={() => updateNote(note.id, editingContent)}
                          disabled={saving}
                          className="p-1.5 sm:p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          disabled={saving}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingNoteId === note.id ? (
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              ) : (
                <div className="text-gray-800 whitespace-pre-wrap">
                  {note.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
