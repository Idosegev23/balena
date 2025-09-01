'use client'

import { useState, useRef } from 'react'
import { supabase, BusinessCard } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Camera, Upload, FileText, User, Mail, Phone, Building2, X, Check } from 'lucide-react'

interface BusinessCardScannerProps {
  companyId?: number
  onCardAdded?: (card: BusinessCard) => void
}

export function BusinessCardScanner({ companyId, onCardAdded }: BusinessCardScannerProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<Partial<BusinessCard>>({})
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!user) return
    
    setUploading(true)
    
    try {
      // Upload image to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `business-card-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-cards')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-cards')
        .getPublicUrl(fileName)

      setImageUrl(publicUrl)
      
      // Extract text using OCR (mock implementation - in real app would use Tesseract.js or cloud OCR)
      await extractTextFromImage(file, publicUrl)
      
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('שגיאה בהעלאת התמונה')
    }
    
    setUploading(false)
  }

  const extractTextFromImage = async (file: File, imageUrl: string) => {
    setProcessing(true)
    
    try {
      // Mock OCR extraction - in real implementation would use:
      // - Tesseract.js for client-side OCR
      // - Google Vision API, Azure Computer Vision, or AWS Textract
      // - Custom AI model for business card parsing
      
      // For now, we'll simulate extraction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock extracted data
      const mockData: Partial<BusinessCard> = {
        contact_name: 'John Smith',
        contact_title: 'Sales Manager',
        contact_email: 'john.smith@company.com',
        contact_phone: '+49 211 123 4567',
        company_name: 'Advanced Materials GmbH',
        card_image_url: imageUrl,
        extracted_text: `John Smith
Sales Manager
Advanced Materials GmbH
Phone: +49 211 123 4567
Email: john.smith@company.com
Website: www.advancedmaterials.de`,
        user_id: user?.id || '',
        company_id: companyId
      }
      
      setExtractedData(mockData)
      setIsEditing(true)
      
    } catch (error) {
      console.error('Error extracting text:', error)
      alert('שגיאה בחילוץ הטקסט')
    }
    
    setProcessing(false)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('לא ניתן לגשת למצלמה')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'business-card-photo.jpg', { type: 'image/jpeg' })
        await handleFileUpload(file)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setShowCamera(false)
  }

  const saveBusinessCard = async () => {
    if (!user) return
    
    setUploading(true)
    
    try {
      const { data, error } = await supabase
        .from('business_cards')
        .insert({
          ...extractedData,
          user_id: user?.id || '',
          is_processed: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Add to activity feed
      await supabase
        .from('activity_feed')
        .insert({
          user_name: user.user_metadata?.full_name || user.email,
          action_type: 'business_card_scanned',
          company_id: companyId,
          description: `סרק כרטיס ביקור של ${extractedData.contact_name}`,
          metadata: {
            contact_name: extractedData.contact_name,
            company_name: extractedData.company_name
          }
        })

      onCardAdded?.(data)
      setIsOpen(false)
      resetState()
      
    } catch (error) {
      console.error('Error saving business card:', error)
      alert('שגיאה בשמירת כרטיס הביקור')
    }
    
    setUploading(false)
  }

  const resetState = () => {
    setImageUrl(null)
    setExtractedData({})
    setIsEditing(false)
    setShowCamera(false)
    stopCamera()
  }

  const handleClose = () => {
    setIsOpen(false)
    resetState()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        style={{ borderColor: 'var(--balena-brown)', color: 'var(--balena-brown)' }}
      >
        <Camera className="w-5 h-5" />
        סרוק כרטיס ביקור
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ background: `linear-gradient(135deg, var(--balena-dark) 0%, var(--balena-brown) 100%)` }}>
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">סריקת כרטיס ביקור</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!imageUrl && !showCamera && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6">בחר דרך לצלם או להעלות כרטיס ביקור</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Camera className="w-12 h-12 text-blue-600" />
                    <div>
                      <div className="font-medium">צלם עכשיו</div>
                      <div className="text-sm text-gray-500">השתמש במצלמה</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl hover:bg-green-50 hover:border-green-300"
                  >
                    <Upload className="w-12 h-12 text-green-600" />
                    <div>
                      <div className="font-medium">העלה תמונה</div>
                      <div className="text-sm text-gray-500">מהגלריה</div>
                    </div>
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 border-4 border-white/50 rounded-lg pointer-events-none">
                  <div className="absolute inset-4 border-2 border-yellow-400 rounded-lg"></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📸 צלם
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {imageUrl && (
            <div className="space-y-6">
              <div className="text-center">
                <img src={imageUrl} alt="Business Card" className="max-w-full h-64 object-contain mx-auto rounded-lg border" />
              </div>

              {processing && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p>מחלץ טקסט מהתמונה...</p>
                </div>
              )}

              {isEditing && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">פרטים מחולצים - אמת וערוך:</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">שם איש קשר</label>
                      <input
                        type="text"
                        value={extractedData.contact_name || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, contact_name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">תפקיד</label>
                      <input
                        type="text"
                        value={extractedData.contact_title || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, contact_title: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">אימייל</label>
                      <input
                        type="email"
                        value={extractedData.contact_email || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, contact_email: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">טלפון</label>
                      <input
                        type="tel"
                        value={extractedData.contact_phone || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, contact_phone: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">שם החברה</label>
                      <input
                        type="text"
                        value={extractedData.company_name || ''}
                        onChange={(e) => setExtractedData(prev => ({ ...prev, company_name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">טקסט מחולץ (גולמי)</label>
                    <textarea
                      value={extractedData.extracted_text || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...prev, extracted_text: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveBusinessCard}
                      disabled={uploading}
                      className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {uploading ? '⏳ שומר...' : '💾 שמור כרטיס ביקור'}
                    </button>
                    <button
                      onClick={resetState}
                      className="px-4 py-3 border rounded-lg hover:bg-gray-50"
                    >
                      צלם שוב
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
