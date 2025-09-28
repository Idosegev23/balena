'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { Upload, Image as ImageIcon, X, Check, Download, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface LogoUploaderProps {
  company: Company
  onLogoUpdated?: (logoUrl: string | null) => void
  className?: string
}

export function LogoUploader({ company, onLogoUpdated, className = '' }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use proper auth
  const { user } = useAuth()

  const showMessage = (msg: string, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('❌ Please select an image file', true)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('❌ File size too large. Please select an image under 5MB', true)
      return
    }

    setUploading(true)

    try {
      // Create optimized filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
      const companySlug = company.company.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50)
      const fileName = `logo_${companySlug}_${Date.now()}.${fileExt}`

      // Process image if needed
      const processedFile = await processImage(file)

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, processedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName)

      // Update company record
      const { data: updateData, error: updateError } = await supabase
        .from('companies')
        .update({
          logo: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)
        .select()

      if (updateError) throw updateError

      showMessage('✅ Logo uploaded successfully!')
      onLogoUpdated?.(publicUrl)

    } catch (error: any) {
      console.error('Error uploading logo:', error)
      showMessage(`❌ Upload failed: ${error.message}`, true)
    } finally {
      setUploading(false)
    }
  }

  const processImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate optimal dimensions (max 400x200, maintain aspect ratio)
        const maxWidth = 400
        const maxHeight = 200
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now()
            })
            resolve(processedFile)
          } else {
            resolve(file) // Fallback to original
          }
        }, 'image/png', 0.9)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleRemoveLogo = async () => {
    if (!user || !company.logo) return

    setUploading(true)

    try {
      // Extract filename from URL
      const url = new URL(company.logo)
      const fileName = url.pathname.split('/').pop()

      // Remove from storage
      if (fileName) {
        await supabase.storage
          .from('company-logos')
          .remove([fileName])
      }

      // Update company record  
      const { data: updateData, error: updateError } = await supabase
        .from('companies')
        .update({
          logo: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)
        .select()

      if (updateError) throw updateError

      showMessage('✅ Logo removed successfully!')
      onLogoUpdated?.(null)

    } catch (error: any) {
      console.error('Error removing logo:', error)
      showMessage(`❌ Remove failed: ${error.message}`, true)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <div className={`logo-uploader ${className}`}>
      {/* Current Logo Display */}
      {company.logo && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Logo</span>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(company.logo!, '_blank')}
                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                title="View full size"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleRemoveLogo}
                disabled={uploading}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Remove logo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="relative w-full max-w-xs mx-auto">
            <img
              src={company.logo}
              alt={`${company.company} logo`}
              className="w-full h-auto max-h-24 object-contain bg-gray-50 rounded-lg border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading logo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">
                {company.logo ? 'Upload new logo' : 'Upload company logo'}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Drag and drop or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload size={16} className="mr-2" />
                Choose File
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              PNG, JPG, SVG up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-3 p-2 rounded text-sm text-center ${
          message.includes('❌') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Use high-quality images for best results</li>
          <li>Transparent PNG files work best for logos</li>
          <li>Images will be automatically optimized</li>
        </ul>
      </div>
    </div>
  )
}

// Helper component for logo display in lists
export function LogoDisplay({ 
  company, 
  size = 'sm',
  className = '' 
}: { 
  company: Company
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8', 
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const logoSrc = company.logo_url || company.logo
  
  if (!logoSrc) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded flex items-center justify-center`}>
        <ImageIcon size={size === 'xs' ? 12 : size === 'sm' ? 16 : 20} className="text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={logoSrc}
      alt={`${company.company} logo`}
      className={`${sizeClasses[size]} ${className} object-contain bg-gray-50 rounded`}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        const parent = target.parentElement!
        if (!parent.querySelector('.logo-fallback')) {
          const fallback = document.createElement('div')
          fallback.className = `logo-fallback ${sizeClasses[size]} bg-gray-100 rounded flex items-center justify-center`
          fallback.innerHTML = `
            <svg width="${size === 'xs' ? '12' : size === 'sm' ? '16' : '20'}" height="${size === 'xs' ? '12' : size === 'sm' ? '16' : '20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          `
          parent.appendChild(fallback)
        }
      }}
    />
  )
}
