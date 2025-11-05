-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can view own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Officers can view all incidents" ON public.incidents;
DROP POLICY IF EXISTS "Officers can update incidents" ON public.incidents;
DROP POLICY IF EXISTS "Anyone can upload incident media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view incident media" ON storage.objects;
DROP POLICY IF EXISTS "Officers can delete incident media" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view incident updates" ON public.incident_updates;
DROP POLICY IF EXISTS "Officers can create incident updates" ON public.incident_updates;
DROP POLICY IF EXISTS "Anyone can view final reports" ON public.final_reports;
DROP POLICY IF EXISTS "Officers can create final reports" ON public.final_reports;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view agency stations" ON public.agency_stations;

-- Drop triggers before functions
DROP TRIGGER IF EXISTS update_incidents_updated_at ON public.incidents;

-- Drop functions with CASCADE
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance(float, float, float, float) CASCADE;
DROP FUNCTION IF EXISTS public.find_nearest_station(float, float, int) CASCADE;

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.incident_updates CASCADE;
DROP TABLE IF EXISTS public.final_reports CASCADE;
DROP TABLE IF EXISTS public.incidents CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.agency_stations CASCADE;
DROP TABLE IF EXISTS public.agencies CASCADE;

-- ============================================
-- STEP 1: Create base tables (no dependencies)
-- ============================================

-- Agencies table (PNP, BFP, PDRRMO)
CREATE TABLE public.agencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    short_name VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default agencies
INSERT INTO public.agencies (name, short_name) VALUES
    ('Philippine National Police', 'PNP'),
    ('Bureau of Fire Protection', 'BFP'),
    ('Provincial Disaster Risk Reduction and Management Office', 'PDRRMO');

-- Agency stations (police stations, fire stations, PDRRMO offices)
CREATE TABLE public.agency_stations (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    contact_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users with role and agency)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT UNIQUE,
    role VARCHAR NOT NULL CHECK (role IN ('Resident', 'Field Officer', 'Chief')),
    agency_id INTEGER REFERENCES public.agencies(id) ON DELETE SET NULL,
    phone_number VARCHAR,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    date_of_birth DATE CHECK (date_of_birth <= CURRENT_DATE AND date_of_birth >= (CURRENT_DATE - INTERVAL '120 years')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create incidents table
-- ============================================

-- Create incidents table
CREATE TABLE public.incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Agency and Reporter Info
    agency_type TEXT NOT NULL CHECK (agency_type IN ('pnp', 'bfp', 'pdrrmo')),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_age INTEGER NOT NULL,
    
    -- Incident Details
    description TEXT NOT NULL,
    
    -- Location
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_address TEXT,
    
    -- Media
    media_urls TEXT[] DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed')),
    
    -- Assignment (for LGU app)
    assigned_officer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_station_id INTEGER REFERENCES public.agency_stations(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX idx_incidents_agency ON public.incidents(agency_type);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_reporter ON public.incidents(reporter_id);
CREATE INDEX idx_incidents_created ON public.incidents(created_at DESC);

-- Create Storage Bucket for incident media (before policies)
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-media', 'incident-media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on incidents table
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Anyone can insert incidents (for guest reporting)
CREATE POLICY "Anyone can create incidents"
    ON public.incidents
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 2. Users can view their own incidents
CREATE POLICY "Users can view own incidents"
    ON public.incidents
    FOR SELECT
    TO authenticated
    USING (reporter_id = auth.uid());

-- 3. Officers can view incidents for their agency (to be refined later)
CREATE POLICY "Officers can view all incidents"
    ON public.incidents
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. Officers can update incident status (to be refined later)
CREATE POLICY "Officers can update incidents"
    ON public.incidents
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage RLS Policies (bucket already created above)

-- 1. Anyone can upload to incident-media (for guest reporting)
CREATE POLICY "Anyone can upload incident media"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'incident-media');

-- 2. Anyone can view incident media (public bucket)
CREATE POLICY "Anyone can view incident media"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'incident-media');

-- 3. Officers can delete incident media
CREATE POLICY "Officers can delete incident media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'incident-media');

-- ============================================
-- STEP 3: Create dependent tables
-- ============================================

-- Incident updates (status changes, officer notes)
CREATE TABLE public.incident_updates (
    id BIGSERIAL PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    update_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Final reports (completed incident reports)
CREATE TABLE public.final_reports (
    id BIGSERIAL PRIMARY KEY,
    incident_id UUID NOT NULL UNIQUE REFERENCES public.incidents(id) ON DELETE CASCADE,
    report_details JSONB NOT NULL,
    completed_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (for residents and officers)
CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for dependent tables
CREATE INDEX idx_incident_updates_incident ON public.incident_updates(incident_id);
CREATE INDEX idx_incident_updates_author ON public.incident_updates(author_id);
CREATE INDEX idx_final_reports_incident ON public.final_reports(incident_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- STEP 4: Enable RLS on all tables
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS policies for new tables
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Agency stations policies (public read)
CREATE POLICY "Anyone can view agency stations"
    ON public.agency_stations FOR SELECT
    TO public
    USING (true);

-- Incident updates policies
CREATE POLICY "Anyone can view incident updates"
    ON public.incident_updates FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Officers can create incident updates"
    ON public.incident_updates FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Field Officer', 'Chief')
        )
    );

-- Final reports policies
CREATE POLICY "Anyone can view final reports"
    ON public.final_reports FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Officers can create final reports"
    ON public.final_reports FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Field Officer', 'Chief')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid());

-- ============================================
-- STEP 6: Create utility functions
-- ============================================

-- Haversine distance function (calculates distance between two points in km)
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 FLOAT, lon1 FLOAT, 
    lat2 FLOAT, lon2 FLOAT
) 
RETURNS FLOAT AS $$
DECLARE
    R INTEGER := 6371; -- Earth's radius in kilometers
    dLat FLOAT;
    dLon FLOAT;
    a FLOAT;
    c FLOAT;
    distance FLOAT;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    a := sin(dLat / 2) * sin(dLat / 2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    c := 2 * asin(sqrt(a));
    distance := R * c;
    RETURN distance;
END;
$$ LANGUAGE plpgsql;

-- Function to find the nearest station for an incident
CREATE OR REPLACE FUNCTION public.find_nearest_station(
    incident_lat FLOAT, 
    incident_lon FLOAT,
    target_agency_id INTEGER
) 
RETURNS TABLE (station_id INTEGER, station_name TEXT, distance_km FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        name,
        public.calculate_distance(incident_lat, incident_lon, latitude::FLOAT, longitude::FLOAT) as distance
    FROM
        public.agency_stations
    WHERE
        agency_id = target_agency_id
    ORDER BY
        distance
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETE! Database is ready.
-- ============================================
