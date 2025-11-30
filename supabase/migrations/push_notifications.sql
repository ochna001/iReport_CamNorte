-- =====================================================
-- Push Notifications with pg_net (Option B - Simpler)
-- =====================================================
-- This uses pg_net to directly call Expo Push API
-- Includes In-App Notification backup
-- =====================================================

-- 1. Enable pg_net extension (Required for HTTP calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Push Tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_device_id ON public.push_tokens(device_id);

-- 3. Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Policies for push_tokens
CREATE POLICY "Users can manage their own push tokens"
    ON public.push_tokens FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Function to send push notification directly via Expo API
CREATE OR REPLACE FUNCTION send_expo_push_notification(
    push_token TEXT,
    title TEXT,
    body TEXT,
    data JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
    PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
            'to', push_token,
            'title', title,
            'body', body,
            'sound', 'default',
            'data', data
        )::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger function for status changes
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
    push_token_record RECORD;
    notification_title TEXT;
    notification_body TEXT;
BEGIN
    -- Only proceed if status actually changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Set notification message based on new status (concise but detailed)
    -- Status values: pending, assigned, in_progress, resolved, closed
    CASE NEW.status
        WHEN 'assigned' THEN
            notification_title := '🚔 Responders Assigned';
            notification_body := COALESCE(UPPER(NEW.agency_type), 'Agency') || ' team assigned to your ' || 
                LOWER(COALESCE(NEW.agency_type, 'incident')) || ' report at ' || 
                COALESCE(SUBSTRING(NEW.location_address FROM 1 FOR 50), 'your location') || '.';
        WHEN 'in_progress' THEN
            notification_title := '🚨 Responders On Scene';
            notification_body := COALESCE(UPPER(NEW.agency_type), 'Agency') || ' responders have arrived at ' || 
                COALESCE(SUBSTRING(NEW.location_address FROM 1 FOR 50), 'the location') || '.';
        WHEN 'resolved' THEN
            notification_title := '✅ Incident Resolved';
            notification_body := 'Your ' || LOWER(COALESCE(NEW.agency_type, 'incident')) || 
                ' report has been resolved. Thank you for helping keep our community safe!';
        WHEN 'closed' THEN
            notification_title := '📋 Case Closed';
            notification_body := 'Your ' || LOWER(COALESCE(NEW.agency_type, 'incident')) || 
                ' report (#' || NEW.id || ') has been officially closed.';
        ELSE
            notification_title := '📢 Status Update';
            notification_body := 'Your ' || LOWER(COALESCE(NEW.agency_type, 'incident')) || 
                ' report status changed to: ' || NEW.status;
    END CASE;

    -- A. BACKUP: Insert into in-app notifications table (always reliable)
    -- This ensures user sees it in their notification history even if push fails
    INSERT INTO public.notifications (
        recipient_id,
        incident_id,
        title,
        body,
        is_read
    )
    SELECT 
        NEW.reporter_id,
        NEW.id,
        notification_title,
        notification_body,
        false
    WHERE NEW.reporter_id IS NOT NULL;

    -- B. PRIMARY: Send Push Notification
    -- Find push token by user_id
    FOR push_token_record IN
        SELECT token FROM public.push_tokens
        WHERE user_id = NEW.reporter_id
    LOOP
        -- Send push notification directly via Expo
        PERFORM send_expo_push_notification(
            push_token_record.token,
            notification_title,
            notification_body,
            jsonb_build_object(
                'incident_id', NEW.id,
                'status', NEW.status,
                'type', 'status_change'
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add first_response_at column if not exists
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ;

-- 8. Function to set first_response_at (BEFORE trigger)
-- Tracks when responders actually arrive on scene (in_progress status)
CREATE OR REPLACE FUNCTION set_first_response_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Set first_response_at when status changes to in_progress (responders arrived)
    IF NEW.status = 'in_progress' AND NEW.first_response_at IS NULL THEN
        NEW.first_response_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create BEFORE trigger for first_response_at
DROP TRIGGER IF EXISTS set_first_response ON public.incidents;
CREATE TRIGGER set_first_response
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION set_first_response_time();

-- 10. Create AFTER trigger for notifications
DROP TRIGGER IF EXISTS on_incident_status_change ON public.incidents;
CREATE TRIGGER on_incident_status_change
    AFTER UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION notify_status_change();
