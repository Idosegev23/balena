'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Check, Loader2, CreditCard } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { supabase } from '@/lib/supabase'

export interface ScannedData {
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
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ScannedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)


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

  // Ensure business-cards bucket exists
  const ensureBucketExists = async () => {
    try {
      // Try to list files in the bucket to check if it exists
      const { error } = await supabase.storage
        .from('business-cards')
        .list('', { limit: 1 })
      
      if (error && error.message.includes('not found')) {
        console.log('Business cards bucket not found, creating it...')
        // Try to create the bucket (this might fail if we don't have admin permissions)
        const { error: createError } = await supabase.storage
          .createBucket('business-cards', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
          })
        
        if (createError) {
          console.error('Failed to create bucket:', createError)
          setError('Storage bucket not available. Please contact administrator.')
          return false
        }
        console.log('Business cards bucket created successfully')
      }
      return true
    } catch (error) {
      console.error('Error checking bucket:', error)
      return true // Continue anyway, might work
    }
  }

  // Upload business card image to Supabase Storage
  const uploadCardImage = async (imageDataUrl: string): Promise<string | null> => {
    try {
      console.log('Starting image upload to Supabase...')
      
      // Ensure bucket exists
      const bucketReady = await ensureBucketExists()
      if (!bucketReady) return null
      
      // Convert data URL to blob
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      console.log('Image converted to blob, size:', blob.size)
      
      // Generate unique filename
      const timestamp = new Date().getTime()
      const filename = `business-card-${companyId || 'unknown'}-${timestamp}.jpg`
      console.log('Generated filename:', filename)
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('business-cards')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        })
      
      if (error) {
        console.error('Error uploading business card image:', error)
        setError(`Failed to upload image: ${error.message}`)
        return null
      }
      
      console.log('Image uploaded successfully:', data)
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-cards')
        .getPublicUrl(data.path)
      
      console.log('Generated public URL:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Error uploading business card image:', error)
      setError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  // Save business card data to database
  const saveBusinessCardToDatabase = async (scannedData: ScannedData, imageUrl: string) => {
    try {
      console.log('Saving business card to database...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      const insertData = {
        company_id: companyId,
        user_id: user.id,
        contact_name: scannedData.name,
        contact_title: scannedData.title,
        contact_email: scannedData.email,
        contact_phone: scannedData.phone,
        company_name: scannedData.company || companyName,
        card_image_url: imageUrl,
        card_photo_url: imageUrl, // Also save to old column for compatibility
        extracted_text: scannedData.rawText,
        is_processed: true,
        collected_by: user.email || user.id,
        collected_at: new Date().toISOString()
      }

      console.log('Inserting business card data:', insertData)

      const { error } = await supabase
        .from('business_cards')
        .insert(insertData)
      
      if (error) {
        console.error('Database insert error:', error)
        setError(`Failed to save business card: ${error.message}`)
        throw error
      }
      console.log('Business card saved to database successfully')
    } catch (error) {
      console.error('Error saving business card to database:', error)
      setError(`Failed to save business card: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      console.log('Starting OCR processing...')
      const worker = await createWorker('eng')
      console.log('Tesseract worker created successfully')
      
      const { data: { text } } = await worker.recognize(scannedImage)
      console.log('OCR completed, extracted text:', text)
      await worker.terminate()

      const parsedData = parseBusinessCard(text)
      console.log('Parsed business card data:', parsedData)
      setExtractedData(parsedData)
    } catch (err) {
      console.error('OCR processing error:', err)
      setError(`Failed to process the image: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again or upload a clearer image.`)
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
  }, [extractedData, scannedImage, onScanComplete, onClose, companyId, companyName])

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
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!scannedImage && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
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
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        handleFileUpload({ target: { files: [file] } } as any)
                      }
                    }
                    input.click()
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Upload from Gallery</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
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

      </div>
    </div>
  )
}