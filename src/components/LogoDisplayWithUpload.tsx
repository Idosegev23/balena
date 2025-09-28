'use client'

import React, { useState } from 'react'
import { Upload, Image as ImageIcon, Building2 } from 'lucide-react'
import { Company, supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface LogoDisplayWithUploadProps {
  company: Company
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showUploadButton?: boolean
  onLogoUpdate?: (logoUrl: string) => void
}

export function LogoDisplayWithUpload({ 
  company, 
  size = 'md', 
  className = '',
  showUploadButton = true,
  onLogoUpdate 
}: LogoDisplayWithUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadOverlay, setShowUploadOverlay] = useState(false)
  const { user } = useAuth()

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check authentication
    if (!user) {
      alert('❌ You must be logged in to upload logos')
      return
    }

    console.log('🖼️ Starting logo upload for company:', company.id, company.company)
    console.log('👤 User authenticated:', user.email)
    setIsUploading(true)
    
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Create clean filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
      const companySlug = company.company.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50)
      const fileName = `logo_${companySlug}_${Date.now()}.${fileExt}`

      console.log('📤 Uploading via API route')

      // Create form data for API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('companyId', company.id.toString())
      formData.append('companyName', company.company)

      // Upload via API route (bypasses RLS issues)
      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error:', result)
        throw new Error(result.error || 'Upload failed')
      }

      console.log('✅ Upload successful:', result)
      const logoUrl = result.logoUrl

      onLogoUpdate?.(logoUrl)
      setShowUploadOverlay(false)
      
      // Show success message
      alert('✅ Logo uploaded successfully!')
      
    } catch (error: any) {
      console.error('❌ Logo upload error:', error)
      alert(`❌ Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const fetchWebsiteLogo = async () => {
    if (!company.website && !company.main_website) return
    
    // Check authentication
    if (!user) {
      alert('❌ You must be logged in to fetch logos')
      return
    }

    console.log('🌐 Fetching logo from website for company:', company.company)
    setIsUploading(true)
    
    try {
      const website = company.main_website || company.website || ''
      let url = website
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      const domain = new URL(url).hostname
      
      const logoSources = [
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
        `https://${domain}/apple-touch-icon.png`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://logo.clearbit.com/${domain}`
      ]
      
      for (const logoUrl of logoSources) {
        try {
          const response = await fetch(logoUrl, { method: 'HEAD' })
          if (response.ok) {
            // Update company in database
            const { error } = await supabase
              .from('companies')
              .update({ 
                logo_url: logoUrl,
                logo: logoUrl,
                updated_at: new Date().toISOString()
              })
              .eq('id', company.id)

            if (!error) {
              onLogoUpdate?.(logoUrl)
              setShowUploadOverlay(false)
              break
            }
          }
        } catch (e) {
          continue
        }
      }
    } catch (error) {
      console.error('Error fetching website logo:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const hasLogo = company.logo_url || company.logo
  const logoSrc = company.logo_url || company.logo

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setShowUploadOverlay(true)}
      onMouseLeave={() => setShowUploadOverlay(false)}
    >
      {hasLogo ? (
        <img 
          src={logoSrc} 
          alt={`${company.company} logo`}
          className={`${sizeClasses[size]} object-contain bg-white rounded-lg border shadow-sm`}
          onError={(e) => {
            console.log('❌ Logo failed to load:', logoSrc)
            const target = e.currentTarget;
            target.style.display = 'none';
            // Show fallback
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
          onLoad={() => {
            console.log('✅ Logo loaded successfully:', logoSrc)
          }}
        />
      ) : null}
      
      {/* Fallback when no logo or logo fails to load */}
      <div 
        className={`${sizeClasses[size]} bg-gray-100 rounded-lg border flex items-center justify-center ${hasLogo ? 'hidden' : ''}`}
        style={{ display: hasLogo ? 'none' : 'flex' }}
      >
        <Building2 className={`${iconSizes[size]} text-gray-400`} />
      </div>

      {/* Upload Overlay */}
      {showUploadButton && (showUploadOverlay || !hasLogo) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('❌ You must be logged in to upload logos')
                        return
                      }
                      document.getElementById(`file-input-${company.id}`)?.click()
                    }}
                    className={`p-2 rounded-full transition-all ${
                      user 
                        ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                        : 'bg-red-500 bg-opacity-30 cursor-not-allowed'
                    }`}
                    title={user ? "Upload logo" : "Login required to upload"}
                  >
                    <Upload className="w-4 h-4 text-white" />
                  </button>
                  
                  {(company.website || company.main_website) && (
                    <button
                      onClick={() => {
                        if (!user) {
                          alert('❌ You must be logged in to fetch logos')
                          return
                        }
                        fetchWebsiteLogo()
                      }}
                      className={`p-2 rounded-full transition-all ${
                        user 
                          ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                          : 'bg-red-500 bg-opacity-30 cursor-not-allowed'
                      }`}
                      title={user ? "Get logo from website" : "Login required to fetch logo"}
                    >
                      <ImageIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                
                <span className="text-xs text-white text-center">
                  {!user ? '⚠️ Login required' : hasLogo ? 'Change' : 'Add Logo'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        id={`file-input-${company.id}`}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
