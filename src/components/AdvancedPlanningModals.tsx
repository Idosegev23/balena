'use client'

import { useState } from 'react'
import { X, Clock, MapPin, Users, CheckSquare, Calendar, Navigation, Share2 } from 'lucide-react'
import { Company } from '@/lib/supabase'

interface AdvancedPlanningModalsProps {
  company: Company
  activeModal: 'timing' | 'route' | 'team' | 'questions' | null
  onClose: () => void
}

export function AdvancedPlanningModals({ company, activeModal, onClose }: AdvancedPlanningModalsProps) {
  const [selectedTime, setSelectedTime] = useState('')
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [checkedQuestions, setCheckedQuestions] = useState<number[]>([])

  if (!activeModal) return null

  const getOptimalTimes = () => {
    const hall = company.hall || 'Hall 1'
    return [
      { time: '9:00-10:00 AM', crowd: 'Low', recommended: true, reason: 'Exhibition opening - less crowded' },
      { time: '10:00-11:00 AM', crowd: 'Medium', recommended: true, reason: 'Good networking time' },
      { time: '11:00-12:00 PM', crowd: 'High', recommended: false, reason: 'Peak visitor hours' },
      { time: '2:00-3:00 PM', crowd: 'Medium', recommended: true, reason: 'Post-lunch quiet period' },
      { time: '4:00-5:00 PM', crowd: 'Low', recommended: true, reason: 'End of day - more focused conversations' }
    ]
  }

  const getNearbyCompanies = () => {
    const hall = company.hall || 'Hall 1'
    return [
      { name: 'TechCorp Solutions', stand: 'A02', distance: '50m', department: 'Commercial' },
      { name: 'Innovation Labs', stand: 'A04', distance: '80m', department: 'R&D' },
      { name: 'Global Materials', stand: 'B01', distance: '120m', department: 'Operations' }
    ]
  }

  const getQuestionsByDepartment = () => {
    const dept = company.department || 'General'
    const questions = {
      Commercial: [
        'What are your current pricing models?',
        'Do you offer volume discounts?',
        'What is your typical lead time?',
        'Can you provide references from similar companies?',
        'What support do you offer post-purchase?'
      ],
      Operations: [
        'What are your production capabilities?',
        'How do you ensure quality control?',
        'What certifications do you hold?',
        'Can you handle our volume requirements?',
        'What is your supply chain resilience?'
      ],
      'R&D': [
        'What innovations are you working on?',
        'Do you collaborate on R&D projects?',
        'What is your IP protection approach?',
        'Can you customize solutions for our needs?',
        'What is your technology roadmap?'
      ],
      Marketing: [
        'What marketing support do you provide?',
        'Do you have co-marketing opportunities?',
        'What is your brand positioning?',
        'Can you provide marketing materials?',
        'What events do you participate in?'
      ],
      General: [
        'Tell us about your company background',
        'What makes you different from competitors?',
        'What are your main products/services?',
        'Who are your typical customers?',
        'What are your future plans?'
      ]
    }
    return questions[dept as keyof typeof questions] || questions.General
  }

  const renderTimingModal = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-bold">Optimal Visit Timing</h3>
          <p className="text-sm text-gray-600">Choose the best time to visit {company.company}</p>
        </div>
      </div>

      <div className="space-y-3">
        {getOptimalTimes().map((slot, index) => (
          <button
            key={index}
            onClick={() => setSelectedTime(slot.time)}
            className={`w-full p-4 border rounded-lg text-left transition-all ${
              selectedTime === slot.time
                ? 'border-blue-500 bg-blue-50'
                : slot.recommended
                ? 'border-green-200 bg-green-50 hover:bg-green-100'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{slot.time}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  slot.crowd === 'Low' ? 'bg-green-100 text-green-700' :
                  slot.crowd === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {slot.crowd} crowd
                </span>
                {slot.recommended && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Recommended
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">{slot.reason}</p>
          </button>
        ))}
      </div>

      {selectedTime && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Selected Time: {selectedTime}</span>
          </div>
          <p className="text-sm text-blue-700">
            This time slot has been added to your visit plan. You&apos;ll receive a reminder 30 minutes before.
          </p>
        </div>
      )}
    </div>
  )

  const renderRouteModal = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Navigation className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="text-lg font-bold">Smart Route Planning</h3>
          <p className="text-sm text-gray-600">Optimize your path through {company.hall || 'the exhibition'}</p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-800">Current Location: {company.location}</span>
        </div>
        <p className="text-sm text-green-700">
          We found {getNearbyCompanies().length} companies within 200m of this booth
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Nearby Companies to Visit:</h4>
        {getNearbyCompanies().map((nearby, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div>
              <div className="font-medium">{nearby.name}</div>
              <div className="text-sm text-gray-600">Stand {nearby.stand} • {nearby.distance} away</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {nearby.department}
              </span>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                Add to Route
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="font-medium">Estimated Route Time: 45 minutes</span>
        </div>
        <p className="text-sm text-gray-600">
          Including 10 minutes per company + walking time
        </p>
      </div>
    </div>
  )

  const renderTeamModal = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-bold">Team Coordination</h3>
          <p className="text-sm text-gray-600">Coordinate this visit with your team members</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Invite Team Members:</label>
          <div className="space-y-2">
            {['Commercial Team', 'R&D Team', 'Operations Team'].map((team, index) => (
              <label key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={teamMembers.includes(team)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTeamMembers([...teamMembers, team])
                    } else {
                      setTeamMembers(teamMembers.filter(t => t !== team))
                    }
                  }}
                  className="rounded"
                />
                <Users className="w-4 h-4 text-gray-400" />
                <span>{team}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">Share Visit Plan</span>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Selected team members will receive visit details and can coordinate timing
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
              Send Invitation
            </button>
            <button className="px-3 py-1 border border-purple-600 text-purple-600 rounded text-sm hover:bg-purple-50">
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderQuestionsModal = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <CheckSquare className="w-6 h-6 text-orange-600" />
        <div>
          <h3 className="text-lg font-bold">Prepared Questions</h3>
          <p className="text-sm text-gray-600">
            {company.department} focused questions for {company.company}
          </p>
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckSquare className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-orange-800">
            {company.department || 'General'} Department Questions
          </span>
        </div>
        <p className="text-sm text-orange-700">
          These questions are tailored for {company.department || 'general'} discussions
        </p>
      </div>

      <div className="space-y-2">
        {getQuestionsByDepartment().map((question, index) => (
          <label key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={checkedQuestions.includes(index)}
              onChange={(e) => {
                if (e.target.checked) {
                  setCheckedQuestions([...checkedQuestions, index])
                } else {
                  setCheckedQuestions(checkedQuestions.filter(q => q !== index))
                }
              }}
              className="rounded mt-1"
            />
            <span className="text-sm">{question}</span>
          </label>
        ))}
      </div>

      {checkedQuestions.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">
              {checkedQuestions.length} questions selected
            </span>
          </div>
          <p className="text-sm text-green-700">
            Your personalized question list is ready for the visit
          </p>
        </div>
      )}
    </div>
  )

  const getModalContent = () => {
    switch (activeModal) {
      case 'timing': return renderTimingModal()
      case 'route': return renderRouteModal()
      case 'team': return renderTeamModal()
      case 'questions': return renderQuestionsModal()
      default: return null
    }
  }

  const getModalTitle = () => {
    switch (activeModal) {
      case 'timing': return 'Optimal Timing'
      case 'route': return 'Smart Route'
      case 'team': return 'Team Coordination'
      case 'questions': return 'Prepared Questions'
      default: return ''
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold" style={{ color: 'var(--balena-dark)' }}>
            {getModalTitle()} - {company.company}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {getModalContent()}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  )
}
