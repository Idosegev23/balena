-- Enhanced database schema for K-Show 2025 management system

-- Users table (extended from auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    team_role VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company relevance ratings by users
CREATE TABLE IF NOT EXISTS public.company_ratings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= -1 AND rating <= 1), -- -1 = thumbs down, 0 = neutral, 1 = thumbs up
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- Visit tracking
CREATE TABLE IF NOT EXISTS public.visits (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    visit_status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed, skipped
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    photos TEXT[], -- Array of photo URLs
    contacts_met TEXT[], -- Names of people met
    next_steps TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business cards collected
CREATE TABLE IF NOT EXISTS public.business_cards (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(255),
    company_name VARCHAR(255),
    card_image_url TEXT,
    extracted_text TEXT, -- OCR extracted text
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes and attachments
CREATE TABLE IF NOT EXISTS public.notes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[], -- Array of file URLs (images, docs, etc.)
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-up tasks
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, urgent
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'rated', 'visited', 'noted', 'followed_up', etc.
    action_data JSONB, -- Flexible data for different action types
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users from balena.science and triroars@gmail.com)
CREATE POLICY "Users can view all team members" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Team can view all ratings" ON public.company_ratings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own ratings" ON public.company_ratings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team can view all visits" ON public.visits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own visits" ON public.visits FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team can view all business cards" ON public.business_cards FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own business cards" ON public.business_cards FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team can view all notes" ON public.notes FOR SELECT USING (auth.role() = 'authenticated' AND (is_private = false OR user_id = auth.uid()));
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team can view all follow-ups" ON public.follow_ups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage assigned follow-ups" ON public.follow_ups FOR ALL USING (auth.uid() = assigned_user_id OR auth.uid() = created_by_user_id);

CREATE POLICY "Team can view activity feed" ON public.activity_feed FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create activity" ON public.activity_feed FOR INSERT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_ratings_company_id ON public.company_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_user_id ON public.company_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_company_id ON public.visits(company_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_business_cards_company_id ON public.business_cards(company_id);
CREATE INDEX IF NOT EXISTS idx_notes_company_id ON public.notes(company_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_company_id ON public.follow_ups(company_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_user ON public.follow_ups(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);

-- Real-time subscriptions for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
