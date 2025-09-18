'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, Note } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { FileText, Camera, Image, Paperclip, Send, X, Edit, Trash2, Eye } from 'lucide-react'

interface NotesAndPhotosProps {
  companyId: number
  visitId?: number
}

interface NoteWithUser extends Note {
  user_email?: string
}

export function NotesAndPhotos({ companyId, visitId }: NotesAndPhotosProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<NoteWithUser[]>([])
  const [newNote, setNewNote] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImageViewer, setShowImageViewer] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
    setupRealtimeSubscription()
  }, [companyId])

  const fetchNotes = async () => {
    try {
      const { data: notesData, error } = await supabase
        .from('notes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(notesData || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`notes_${companyId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          fetchNotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `note-attachment-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      setSelectedImages(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error uploading images')
    }

    setUploading(false)
  }

  const handleSubmitNote = async () => {
    if (!user || (!newNote.trim() && selectedImages.length === 0)) return

    try {
      const noteData = {
        company_id: companyId,
        visit_id: visitId,
        user_id: user.id,
        content: newNote.trim(),
        attachments: selectedImages.length > 0 ? selectedImages : null,
        is_private: isPrivate,
        created_at: new Date().toISOString()
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            content: newNote.trim(),
            attachments: selectedImages.length > 0 ? selectedImages : null,
            is_private: isPrivate,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('notes')
          .insert(noteData)

        if (error) throw error

        // Add to activity feed
        await supabase
          .from('activity_feed')
          .insert({
            user_name: user.user_metadata?.full_name || user.email,
            action_type: 'note_added',
            company_id: companyId,
            description: `Added note${selectedImages.length > 0 ? ` with ${selectedImages.length} images` : ''}`,`
            metadata: {
              note_preview: newNote.slice(0, 50),
              attachments_count: selectedImages.length,
              is_private: isPrivate
            }
          })
      }

      // Reset form
      setNewNote('')
      setSelectedImages([])
      setIsPrivate(false)
      setEditingNote(null)
      fetchNotes()

    } catch (error) {
      console.error('Error saving note:', error)
      alert('Error saving note')
    }
  }

  const handleEditNote = (note: NoteWithUser) => {
    setNewNote(note.content)
    setSelectedImages(note.attachments || [])
    setIsPrivate(note.is_private)
    setEditingNote(note.id)
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Error deleting note')
    }
  }

  const removeImage = (imageUrl: string) => {
    setSelectedImages(prev => prev.filter(url => url !== imageUrl))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </h3>

        <div className="space-y-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write note, list or observations..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Image Attachments */}
          {selectedImages.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {selectedImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`attachment-${index}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => setShowImageViewer(imageUrl)}
                  />
                  <button
                    onClick={() => removeImage(imageUrl)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Add Images'}
              </button>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                Private Note
              </label>
            </div>

            <div className="flex gap-2">
              {editingNote && (
                <button
                  onClick={() => {
                    setEditingNote(null)
                    setNewNote('')
                    setSelectedImages([])
                    setIsPrivate(false)
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmitNote}
                disabled={!newNote.trim() && selectedImages.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {editingNote ? 'Update' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleImageUpload(e.target.files)
          }}
          className="hidden"
        />
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No notes yet</p>
            <p className="text-sm">Add the first note</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`border rounded-lg p-4 ${note.is_private ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        Team member
                      </span>
                      {note.is_private && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                          Private
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {note.user_id === user?.id && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="mt-3">
                    <div className="grid gap-2 sm:grid-cols-4">
                      {note.attachments.map((attachment, index) => (
                        <img
                          key={index}
                          src={attachment}
                          alt={`attachment-${index}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => setShowImageViewer(attachment)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageViewer(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={showImageViewer}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
