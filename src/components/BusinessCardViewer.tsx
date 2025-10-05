'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, User, Mail, Phone, Building, Calendar, Eye, X } from 'lucide-react'
import { supabase, BusinessCard } from '@/lib/supabase'

interface BusinessCardViewerProps {
  companyId: number
}

export function BusinessCardViewer({ companyId }: BusinessCardViewerProps) {
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    fetchBusinessCards()
  }, [companyId])

  const fetchBusinessCards = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBusinessCards(data || [])
    } catch (error) {
      console.error('Error fetching business cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (businessCards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No business cards scanned yet</p>
        <p className="text-sm">Use the scanner to add business cards</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Business Cards ({businessCards.length})</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {businessCards.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {card.contact_name || 'Unknown Contact'}
                </span>
              </div>
              {card.card_image_url && (
                <button
                  onClick={() => {
                    setSelectedCard(card)
                    setShowImageModal(true)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="View business card image"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {card.contact_title && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-3 h-3" />
                  <span>{card.contact_title}</span>
                </div>
              )}
              
              {card.contact_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3 h-3" />
                  <a 
                    href={`mailto:${card.contact_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {card.contact_email}
                  </a>
                </div>
              )}
              
              {card.contact_phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  <a 
                    href={`tel:${card.contact_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {card.contact_phone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Scanned {formatDate(card.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Business Card Image Modal */}
      {showImageModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCard.contact_name || 'Business Card'}
                </h3>
                <p className="text-sm text-gray-500">
                  Scanned {formatDate(selectedCard.created_at)}
                </p>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              {selectedCard.card_image_url ? (
                <img
                  src={selectedCard.card_image_url}
                  alt="Business card"
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No image available</p>
                </div>
              )}
              
              {selectedCard.extracted_text && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Text:</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                    {selectedCard.extracted_text}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
