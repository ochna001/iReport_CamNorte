-- ============================================================
-- iReport Supabase Migrations
-- Run these in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- MIGRATION 0: Fix notify_status_change trigger for guest users
-- ============================================================
-- The trigger was failing because guest users exist in auth.users but not in profiles
-- This fix checks if the reporter exists in profiles before inserting notification

CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_body TEXT;
    reporter_exists BOOLEAN;
BEGIN
    -- Only notify on status changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Check if reporter exists in profiles table (skip notification for guests)
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.reporter_id) INTO reporter_exists;
    
    IF NOT reporter_exists THEN
        -- Guest user - skip notification but don't fail
        RETURN NEW;
    END IF;

    -- Build notification based on new status
    CASE NEW.status
        WHEN 'assigned' THEN
            notification_title := 'Report Assigned';
            notification_body := 'Your report has been assigned to a station and is being reviewed.';
        WHEN 'in_progress' THEN
            notification_title := 'Responders En Route';
            notification_body := 'Responders are now on their way to the incident location.';
        WHEN 'resolved' THEN
            notification_title := 'Incident Resolved';
            notification_body := 'Your reported incident has been resolved. Thank you for your report.';
        WHEN 'closed' THEN
            notification_title := 'Report Closed';
            notification_body := 'Your report has been closed.';
        ELSE
            RETURN NEW;
    END CASE;

    -- Insert notification only if reporter_id is not null and exists in profiles
    IF NEW.reporter_id IS NOT NULL THEN
        INSERT INTO public.notifications (recipient_id, incident_id, title, body, is_read)
        VALUES (NEW.reporter_id, NEW.id, notification_title, notification_body, false);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger should already exist, this just updates the function


-- ============================================================
-- MIGRATION 1: Add reporter location columns
-- ============================================================
-- These columns store the reporter's location at the time of report
-- (separate from incident location which can be edited)

ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS reporter_latitude NUMERIC,
ADD COLUMN IF NOT EXISTS reporter_longitude NUMERIC;

-- Add comment for documentation
COMMENT ON COLUMN public.incidents.reporter_latitude IS 'Reporter''s GPS latitude at time of report (for audit/verification)';
COMMENT ON COLUMN public.incidents.reporter_longitude IS 'Reporter''s GPS longitude at time of report (for audit/verification)';


-- ============================================================
-- MIGRATION 2: Auto-assign old reports to nearest stations
-- ============================================================
-- This script assigns all unassigned incidents to their nearest station
-- based on the incident location and agency type

-- First, let's see how many unassigned incidents we have
SELECT 
    agency_type,
    COUNT(*) as unassigned_count
FROM public.incidents 
WHERE assigned_station_id IS NULL
GROUP BY agency_type;

-- Now run the auto-assignment
-- This version calculates distance directly instead of using the function
-- Note: Run MIGRATION 0 first to fix the trigger, then this will work without disabling triggers

DO $$
DECLARE
    incident_record RECORD;
    station_record RECORD;
    agency_id_val INTEGER;
    assigned_count INTEGER := 0;
BEGIN
    -- Loop through all unassigned incidents
    FOR incident_record IN 
        SELECT id, agency_type, latitude, longitude 
        FROM public.incidents 
        WHERE assigned_station_id IS NULL
          AND latitude IS NOT NULL 
          AND longitude IS NOT NULL
    LOOP
        -- Get agency_id based on agency_type
        CASE incident_record.agency_type
            WHEN 'pnp' THEN agency_id_val := 1;
            WHEN 'bfp' THEN agency_id_val := 2;
            WHEN 'pdrrmo' THEN agency_id_val := 3;
            ELSE agency_id_val := NULL;
        END CASE;
        
        IF agency_id_val IS NOT NULL THEN
            -- Find nearest station by calculating distance directly
            SELECT 
                s.id,
                s.name,
                public.calculate_distance(
                    incident_record.latitude::FLOAT, 
                    incident_record.longitude::FLOAT, 
                    s.latitude::FLOAT, 
                    s.longitude::FLOAT
                ) as distance
            INTO station_record
            FROM public.agency_stations s
            WHERE s.agency_id = agency_id_val
            ORDER BY distance
            LIMIT 1;
            
            IF station_record.id IS NOT NULL THEN
                -- Update the incident with assigned station
                UPDATE public.incidents 
                SET 
                    assigned_station_id = station_record.id,
                    status = CASE WHEN status = 'pending' THEN 'assigned' ELSE status END,
                    updated_at = NOW()
                WHERE id = incident_record.id;
                
                -- Add status history entry
                INSERT INTO public.incident_status_history (
                    incident_id, 
                    status, 
                    notes, 
                    changed_by
                ) VALUES (
                    incident_record.id,
                    'assigned',
                    'Auto-assigned to ' || station_record.name || ' (' || ROUND(station_record.distance::NUMERIC, 2) || ' km away) - Migration Script',
                    'System'
                );
                
                assigned_count := assigned_count + 1;
                RAISE NOTICE 'Assigned incident % to station % (% km)', 
                    incident_record.id, station_record.name, ROUND(station_record.distance::NUMERIC, 2);
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration complete. Assigned % incidents to stations.', assigned_count;
END $$;

-- Verify the results
SELECT 
    i.id,
    i.agency_type,
    i.status,
    s.name as assigned_station,
    i.created_at
FROM public.incidents i
LEFT JOIN public.agency_stations s ON i.assigned_station_id = s.id
ORDER BY i.created_at DESC
LIMIT 20;
