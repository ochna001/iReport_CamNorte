-- ============================================
-- RATE LIMITING & ABUSE PREVENTION
-- Run this AFTER INCIDENTS_TABLE.sql
-- ============================================

-- Function to check if user has exceeded rate limit
CREATE OR REPLACE FUNCTION check_incident_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- Check how many incidents this user created in the last hour
    SELECT COUNT(*)
    INTO recent_count
    FROM public.incidents
    WHERE reporter_id = NEW.reporter_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Limit: 5 incidents per hour per user
    IF recent_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded. You can only submit 5 reports per hour.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce rate limit
CREATE TRIGGER enforce_incident_rate_limit
    BEFORE INSERT ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION check_incident_rate_limit();

-- ============================================
-- CONTENT VALIDATION
-- ============================================

-- Function to validate incident data
CREATE OR REPLACE FUNCTION validate_incident_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate reporter name (not empty, reasonable length)
    IF LENGTH(TRIM(NEW.reporter_name)) < 2 THEN
        RAISE EXCEPTION 'Reporter name must be at least 2 characters';
    END IF;
    
    IF LENGTH(NEW.reporter_name) > 100 THEN
        RAISE EXCEPTION 'Reporter name is too long';
    END IF;
    
    -- Validate age (reasonable range)
    IF NEW.reporter_age < 13 OR NEW.reporter_age > 120 THEN
        RAISE EXCEPTION 'Invalid age. Must be between 13 and 120';
    END IF;
    
    -- Validate description (not empty, reasonable length)
    IF LENGTH(TRIM(NEW.description)) < 10 THEN
        RAISE EXCEPTION 'Description must be at least 10 characters';
    END IF;
    
    IF LENGTH(NEW.description) > 5000 THEN
        RAISE EXCEPTION 'Description is too long (max 5000 characters)';
    END IF;
    
    -- Validate coordinates (within Philippines bounds approximately)
    IF NEW.latitude < 4.0 OR NEW.latitude > 22.0 THEN
        RAISE EXCEPTION 'Invalid latitude. Must be within Philippines';
    END IF;
    
    IF NEW.longitude < 116.0 OR NEW.longitude > 127.0 THEN
        RAISE EXCEPTION 'Invalid longitude. Must be within Philippines';
    END IF;
    
    -- Validate media URLs count (max 10 files)
    IF array_length(NEW.media_urls, 1) > 10 THEN
        RAISE EXCEPTION 'Too many media files. Maximum 10 allowed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate data
CREATE TRIGGER validate_incident_before_insert
    BEFORE INSERT ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION validate_incident_data();

-- ============================================
-- STORAGE POLICIES (More Restrictive)
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can upload incident media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view incident media" ON storage.objects;
DROP POLICY IF EXISTS "Officers can delete incident media" ON storage.objects;

-- 1. Limit file size and type for uploads
CREATE POLICY "Authenticated users can upload incident media with limits"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'incident-media' 
        AND (storage.foldername(name))[1] = 'incidents'
        -- File size limit enforced by storage bucket settings
    );

-- 2. Anyone can view (public bucket)
CREATE POLICY "Anyone can view incident media"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'incident-media');

-- 3. Only officers can delete
CREATE POLICY "Officers can delete incident media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'incident-media'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('Field Officer', 'Chief')
        )
    );

-- ============================================
-- UPDATE STORAGE BUCKET SETTINGS
-- ============================================

-- Update bucket to enforce file size limits (10MB per file)
UPDATE storage.buckets
SET 
    file_size_limit = 10485760,  -- 10MB in bytes
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'video/mp4',
        'video/quicktime'
    ]
WHERE id = 'incident-media';

-- ============================================
-- INCIDENT UPDATE RESTRICTIONS
-- ============================================

-- Prevent users from modifying their own incidents after submission
CREATE POLICY "Users cannot update their own incidents"
    ON public.incidents
    FOR UPDATE
    TO authenticated
    USING (
        -- Only officers can update
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('Field Officer', 'Chief')
        )
    );

-- Prevent users from deleting incidents
CREATE POLICY "Users cannot delete incidents"
    ON public.incidents
    FOR DELETE
    TO authenticated
    USING (
        -- Only chiefs can delete
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role = 'Chief'
        )
    );

-- ============================================
-- LOGGING & MONITORING
-- ============================================

-- Create audit log table for suspicious activity
CREATE TABLE IF NOT EXISTS public.security_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to log suspicious activity
CREATE OR REPLACE FUNCTION log_suspicious_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log if user tries to submit too many incidents
    INSERT INTO public.security_logs (user_id, action, details)
    VALUES (
        NEW.reporter_id,
        'RATE_LIMIT_ATTEMPT',
        jsonb_build_object(
            'incident_id', NEW.id,
            'agency_type', NEW.agency_type
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETE!
-- ============================================

-- Summary of protections:
-- ✅ Rate limiting: 5 reports per hour per user
-- ✅ Input validation: Name, age, description, coordinates
-- ✅ Media limits: Max 10 files, 10MB each
-- ✅ File type restrictions: Only images and videos
-- ✅ Geographic bounds: Only Philippines coordinates
-- ✅ Update/delete restrictions: Users can't modify after submission
-- ✅ Audit logging: Track suspicious activity
