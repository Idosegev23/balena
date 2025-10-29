export interface Company {
  id: number
  company: string
  hall: string
  stand: string
  department: string
  visit_priority: string
  relevance_score: number
  visited: boolean
  tags: string[]
  description: string | null
  website: string | null
  contact_info: string | null
  relevance_rating: number
  must_visit_priority: number
  visit_status: string
  visited_by: string | null
  visit_date: string | null
  follow_up_status: string
  team_notes: any[]
  contact_person: string | null
  email: string | null
  phone: string | null
  products: string | null
  why_relevant: string | null
  business_category: string | null
  visit_day: string | null
  estimated_visit_duration: number | null
  actual_visit_duration: number | null
  follow_up_priority: number
  next_follow_up_date: string | null
  follow_up_notes: string | null
  notes_summary?: string | null // Combined notes from notes table
}

export interface Visit {
  id: number
  company_id: number
  visit_date: string
  notes: string
  duration_minutes: number | null
  contacts_met: string[] | null
  next_steps: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  company: string
  hall: string
  stand: string
  department: string
}

export interface FilterState {
  search: string
  department: string
  hall: string
  visitPriority: string
  visitStatus: string
  tags: string[]
  relevanceScore: [number, number]
}

export interface SummaryStats {
  totalCompanies: number
  totalVisits: number
  departments: string[]
  halls: string[]
  visitPriorities: string[]
  averageRelevanceScore: number
  topTags: { tag: string; count: number }[]
}
