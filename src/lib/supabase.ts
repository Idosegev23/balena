import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Company {
  id: number
  company: string
  location: string
  hall?: string
  stand?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  relevance_score?: number
  visit_priority?: 'MUST_VISIT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MONITOR_ONLY'
  department?: string
  balena_value?: string
  connection_type?: 'SUPPLIER' | 'PARTNER' | 'COMPETITOR' | 'CUSTOMER' | 'SERVICE' | 'STRATEGIC'
  where_they_present?: string
  logo?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    team_role?: string
  }
}

export interface CompanyRating {
  id: number
  company_id: number
  user_id: string
  rating: -1 | 0 | 1 // -1 = thumbs down, 0 = neutral, 1 = thumbs up
  notes?: string
  created_at: string
  updated_at: string
}

export interface Visit {
  id: number
  company_id: number
  user_id: string
  visit_status: 'planned' | 'in_progress' | 'completed' | 'skipped'
  visit_date: string
  duration_minutes?: number
  notes?: string
  photos?: string[]
  contacts_met?: string[]
  next_steps?: string
  follow_up_required: boolean
  follow_up_date?: string
  created_at: string
  updated_at: string
}

export interface BusinessCard {
  id: number
  company_id?: number
  visit_id?: number
  user_id: string
  contact_name?: string
  contact_title?: string
  contact_email?: string
  contact_phone?: string
  company_name?: string
  card_image_url?: string
  extracted_text?: string
  is_processed: boolean
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  company_id: number
  visit_id?: number
  user_id: string
  content: string
  attachments?: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface FollowUp {
  id: number
  company_id: number
  visit_id?: number
  assigned_user_id: string
  created_by_user_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ActivityFeedItem {
  id: number
  user_id: string
  company_id: number
  action_type: string
  action_data?: any
  is_public: boolean
  created_at: string
}
