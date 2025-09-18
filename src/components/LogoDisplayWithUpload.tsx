'use client'

import React, { useState } from 'react'
import { Upload, Image as ImageIcon, Building2 } from 'lucide-react'
import { Company, supabase } from '@/lib/supabase'

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

    setIsUploading(true)
    
    try {
      // Upload to Supabase Storage
      const fileName = `${company.id}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName)

      const logoUrl = urlData.publicUrl

      // Update company in database
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', company.id)

      if (updateError) throw updateError

      onLogoUpdate?.(logoUrl)
      setShowUploadOverlay(false)
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const fetchWebsiteLogo = async () => {
    if (!company.website && !company.main_website) return

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
              .update({ logo_url: logoUrl })
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

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setShowUploadOverlay(true)}
      onMouseLeave={() => setShowUploadOverlay(false)}
    >
      {hasLogo ? (
        <img 
          src={company.logo_url || company.logo} 
          alt={`${company.company} logo`}
          className={`${sizeClasses[size]} object-contain bg-white rounded-lg border shadow-sm`}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            // Show fallback
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
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
                    onClick={() => document.getElementById(`file-input-${company.id}`)?.click()}
                    className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
                    title="Upload logo"
                  >
                    <Upload className="w-4 h-4 text-white" />
                  </button>
                  
                  {(company.website || company.main_website) && (
                    <button
                      onClick={fetchWebsiteLogo}
                      className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
                      title="Get logo from website"
                    >
                      <ImageIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                
                <span className="text-xs text-white text-center">
                  {hasLogo ? 'Change' : 'Add Logo'}
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
