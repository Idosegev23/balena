import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Company {
  id: number
  company: string
  location?: string
  hall?: string
  stand?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  
  // Relevance & Priority
  relevance_score?: number
  visit_priority?: 'MUST_VISIT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MONITOR_ONLY'
  department?: string
  goal_category?: string
  why_relevant?: string
  claude_analysis?: any // JSONB object with analysis
  tags?: string[] // Array of tags like 'supplier', 'competitor', etc.
  
  // Contact Information (Latest from scraping)
  main_email?: string
  main_phone?: string
  main_website?: string
  contact_person?: string
  contact_info?: string
  contact_persons?: any // JSONB array with contact details
  website_emails?: string
  website_phones?: string
  
  // Company Details
  about_us?: string
  company_description?: string
  products?: string
  products_services?: string
  sustainability_info?: string
  meta_description?: string
  website_title?: string
  
  // Business Information
  detailed_address?: string
  sales_volume?: string
  export_content?: string
  employees_count?: string
  foundation_year?: string
  target_groups?: string
  
  // Visual & Media
  logo?: string
  logo_url?: string
  logo_file?: string
  
  // Meeting & Visit Management
  must_visit?: boolean
  meeting_requested?: boolean
  meeting_scheduled?: boolean
  meeting_completed?: boolean
  brochures_collected?: boolean
  samples_requested?: boolean
  samples_received?: boolean
  quotes_requested?: boolean
  priority_score?: number
  relevance_status?: string
  
  // Scraping & Sources
  source_search_term?: string
  source_url?: string
  profile_url?: string
  data_source?: string
  last_detailed_scrape?: string
  scraping_status?: 'pending' | 'completed' | 'failed' | 'skipped'
  scraping_timestamp?: string
  success?: boolean
  
  // Timestamps
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
