'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Check, Loader2, CreditCard } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { supabase } from '@/lib/supabase'

interface ScannedData {
  name?: string
  title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  rawText?: string
  cardImageUrl?: string // Add image URL to the scanned data
}

interface BusinessCardScannerProps {
  onScanComplete: (data: ScannedData) => void
  onClose: () => void
  companyName?: string
  companyId?: number
}

export function BusinessCardScanner({ onScanComplete, onClose, companyName, companyId }: BusinessCardScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ScannedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please check permissions or try uploading an image.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setScannedImage(imageData)
        stopCamera()
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setScannedImage(result)
    }
    reader.readAsDataURL(file)
  }, [])

  // Upload business card image to Supabase Storage
  const uploadCardImage = async (imageDataUrl: string): Promise<string | null> => {
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      
      // Generate unique filename
      const timestamp = new Date().getTime()
      const filename = `business-card-${companyId || 'unknown'}-${timestamp}.jpg`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('business-cards')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        })
      
      if (error) {
        console.error('Error uploading business card image:', error)
        return null
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-cards')
        .getPublicUrl(data.path)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading business card image:', error)
      return null
    }
  }

  // Save business card data to database
  const saveBusinessCardToDatabase = async (scannedData: ScannedData, imageUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { error } = await supabase
        .from('business_cards')
        .insert({
          company_id: companyId,
          user_id: user.id,
          contact_name: scannedData.name,
          contact_title: scannedData.title,
          contact_email: scannedData.email,
          contact_phone: scannedData.phone,
          company_name: scannedData.company || companyName,
          card_image_url: imageUrl,
          extracted_text: scannedData.rawText,
          is_processed: true
        })
      
      if (error) {
        console.error('Error saving business card to database:', error)
      }
    } catch (error) {
      console.error('Error saving business card to database:', error)
    }
  }

  const parseBusinessCard = (text: string): ScannedData => {
    const lines = text.split('\n').filter(line => line.trim())
    const data: ScannedData = { rawText: text }

    // Email extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    if (emailMatch) {
      data.email = emailMatch[0]
    }

    // Phone extraction (various formats)
    const phoneMatch = text.match(/[\+]?[\d\s\-\(\)\.]{10,}/g)
    if (phoneMatch) {
      data.phone = phoneMatch[0].replace(/[^\d\+]/g, '').replace(/^(\d)/, '+$1')
    }

    // Website extraction
    const websiteMatch = text.match(/(www\.|https?:\/\/)[^\s]+/gi)
    if (websiteMatch) {
      data.website = websiteMatch[0].replace(/^www\./, 'https://www.')
    }

    // Company name - if we have the expected company name, try to find it
    if (companyName) {
      const companyWords = companyName.toLowerCase().split(/\s+/)
      const foundCompany = lines.find(line => 
        companyWords.some(word => line.toLowerCase().includes(word))
      )
      if (foundCompany) {
        data.company = foundCompany.trim()
      }
    }

    // Name extraction (usually first line or line before title)
    const titleKeywords = ['ceo', 'cto', 'manager', 'director', 'president', 'vice', 'head', 'chief', 'founder']
    const nameLines = lines.filter(line => {
      const lower = line.toLowerCase()
      return !lower.includes('@') && 
             !lower.match(/[\d\+\-\(\)]{5,}/) && 
             !titleKeywords.some(keyword => lower.includes(keyword)) &&
             line.length > 2 && line.length < 50
    })
    
    if (nameLines.length > 0) {
      data.name = nameLines[0].trim()
    }

    // Title extraction
    const titleLine = lines.find(line => {
      const lower = line.toLowerCase()
      return titleKeywords.some(keyword => lower.includes(keyword))
    })
    if (titleLine) {
      data.title = titleLine.trim()
    }

    return data
  }

  const processImage = useCallback(async () => {
    if (!scannedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const worker = await createWorker('eng')
      
      const { data: { text } } = await worker.recognize(scannedImage)
      await worker.terminate()

      const parsedData = parseBusinessCard(text)
      setExtractedData(parsedData)
    } catch (err) {
      console.error('OCR processing error:', err)
      setError('Failed to process the image. Please try again or upload a clearer image.')
    } finally {
      setIsProcessing(false)
    }
  }, [scannedImage, companyName, parseBusinessCard])

  const handleConfirm = useCallback(async () => {
    if (extractedData && scannedImage) {
      setIsProcessing(true)
      
      try {
        // Upload image to Supabase Storage
        const imageUrl = await uploadCardImage(scannedImage)
        
        if (imageUrl) {
          // Save to database
          await saveBusinessCardToDatabase(extractedData, imageUrl)
          
          // Add image URL to extracted data
          const dataWithImage = { ...extractedData, cardImageUrl: imageUrl }
          onScanComplete(dataWithImage)
        } else {
          // If image upload fails, still proceed with text data
          onScanComplete(extractedData)
        }
        
        onClose()
      } catch (error) {
        console.error('Error saving business card:', error)
        setError('Failed to save business card. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    }
  }, [extractedData, scannedImage, onScanComplete, onClose, uploadCardImage, saveBusinessCardToDatabase])

  const retakePhoto = useCallback(() => {
    setScannedImage(null)
    setExtractedData(null)
    setError(null)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Scan Business Card
              </h2>
          </div>
          <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
              <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!scannedImage && !isScanning && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                  <button
                    onClick={startCamera}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  Take Photo
                  </button>
                  
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Upload Image</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={captureImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {scannedImage && !extractedData && !isProcessing && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={scannedImage || ''}
                  alt="Scanned business card"
                  className="w-full h-64 object-contain bg-gray-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={processImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Process Card
                </button>
                <button
                  onClick={retakePhoto}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retake
                </button>
              </div>
                </div>
              )}

          {isProcessing && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Processing business card...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          )}

          {extractedData && (
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={scannedImage || ''}
                  alt="Scanned business card"
                  className="w-full h-32 object-contain bg-gray-100"
                      />
                    </div>
                    
                    <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Extracted Information
                </h3>
                
                <div className="space-y-3">
                  {extractedData.name && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-500">Name:</span>
                      <span className="text-gray-900">{extractedData.name}</span>
                    </div>
                  )}
                  
                  {extractedData.title && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-500">Title:</span>
                      <span className="text-gray-900">{extractedData.title}</span>
                    </div>
                  )}
                  
                  {extractedData.company && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-500">Company:</span>
                      <span className="text-gray-900">{extractedData.company}</span>
                    </div>
                  )}
                  
                  {extractedData.email && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-500">Email:</span>
                      <span className="text-gray-900">{extractedData.email}</span>
                    </div>
                  )}
                  
                  {extractedData.phone && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-500">Phone:</span>
                      <span className="text-gray-900">{extractedData.phone}</span>
                  </div>
                  )}
                  
                  {extractedData.website && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-500">Website:</span>
                      <span className="text-gray-900">{extractedData.website}</span>
                    </div>
                  )}
                </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                  <Check className="h-4 w-4" />
                  Save Contact
                    </button>
                    <button
                  onClick={retakePhoto}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                  Try Again
                    </button>
                  </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}