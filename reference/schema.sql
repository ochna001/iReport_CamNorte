-- iReport Database Schema Reference (READ-ONLY)
-- WARNING: This schema is for context only and reflects the current Supabase database.
-- Last updated: Nov 30, 2025

-- Table for emergency response agencies (PNP, BFP, PDRRMO)
CREATE TABLE public.agencies (
    id INTEGER PRIMARY KEY DEFAULT nextval('agencies_id_seq'),
    name VARCHAR NOT NULL UNIQUE,
    short_name VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the default agencies
INSERT INTO public.agencies (name, short_name)
VALUES
    ('Philippine National Police', 'PNP'),
    ('Bureau of Fire Protection', 'BFP'),
    ('Provincial Disaster Risk Reduction and Management Office', 'PDRRMO')
ON CONFLICT (short_name) DO NOTHING;

-- Table for individual agency stations/offices with their locations
CREATE TABLE public.agency_stations (
    id INTEGER PRIMARY KEY DEFAULT nextval('agency_stations_id_seq'),
    agency_id INTEGER NOT NULL REFERENCES public.agencies(id),
    name TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    contact_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for agency resources (vehicles, equipment, personnel)
CREATE TABLE public.agency_resources (
    id INTEGER PRIMARY KEY DEFAULT nextval('agency_resources_id_seq'),
    station_id INTEGER REFERENCES public.agency_stations(id),
    name TEXT NOT NULL,
    type VARCHAR CHECK (type IN ('vehicle', 'equipment', 'personnel')),
    status VARCHAR DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'maintenance')),
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Table for public user profiles (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name TEXT,
    email TEXT UNIQUE,
    role VARCHAR NOT NULL CHECK (role IN ('Resident', 'Desk Officer', 'Field Officer', 'Chief')),
    agency_id INTEGER REFERENCES public.agencies(id),
    phone_number VARCHAR,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    date_of_birth DATE CHECK (date_of_birth <= CURRENT_DATE AND date_of_birth >= (CURRENT_DATE - '120 years'::interval)),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for all incident reports
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_type TEXT NOT NULL CHECK (agency_type IN ('pnp', 'bfp', 'pdrrmo')),
    reporter_id UUID REFERENCES auth.users(id),
    reporter_name TEXT NOT NULL,
    reporter_age INTEGER NOT NULL,
    reporter_phone TEXT, -- Required for guest reporters, optional for registered users
    description TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    location_address TEXT,
    media_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed')),
    assigned_officer_id UUID REFERENCES auth.users(id),
    assigned_officer_ids UUID[] DEFAULT '{}', -- Multiple officers can be assigned
    assigned_station_id INTEGER REFERENCES public.agency_stations(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    updated_by TEXT, -- Stores name directly
    first_response_at TIMESTAMPTZ
);

-- Table for media files (photos, videos) associated with an incident
CREATE TABLE public.media (
    id BIGINT PRIMARY KEY DEFAULT nextval('media_id_seq'),
    incident_id BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    media_type VARCHAR NOT NULL CHECK (media_type IN ('photo', 'video')),
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Table for logging updates and notes on an incident
CREATE TABLE public.incident_updates (
    id BIGINT PRIMARY KEY DEFAULT nextval('incident_updates_id_seq'),
    incident_id UUID NOT NULL REFERENCES public.incidents(id),
    author_id UUID REFERENCES public.profiles(id),
    update_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for tracking status changes history
CREATE TABLE public.incident_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id),
    status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT NOT NULL, -- Stores officer name directly
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for detailed final reports upon case closure
CREATE TABLE public.final_reports (
    id BIGINT PRIMARY KEY DEFAULT nextval('final_reports_id_seq'),
    incident_id UUID NOT NULL UNIQUE REFERENCES public.incidents(id),
    report_details JSONB NOT NULL,
    completed_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- Table for user notifications
CREATE TABLE public.notifications (
    id BIGINT PRIMARY KEY DEFAULT nextval('notifications_id_seq'),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id),
    incident_id UUID REFERENCES public.incidents(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for push notification tokens
CREATE TABLE public.push_tokens (
    id BIGINT PRIMARY KEY DEFAULT nextval('push_tokens_id_seq'),
    token TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    device_id TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for security/audit logs
CREATE TABLE public.security_logs (
    id BIGINT PRIMARY KEY DEFAULT nextval('security_logs_id_seq'),
    user_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
