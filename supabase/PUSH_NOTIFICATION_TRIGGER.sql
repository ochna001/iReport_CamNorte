-- Enable pg_net extension (already enabled on most Supabase projects)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create push notification log table (for tracking failures and debugging)
CREATE TABLE IF NOT EXISTS public.push_notification_log (
  id BIGSERIAL PRIMARY KEY,
  notification_id BIGINT,
  recipient_id UUID,
  push_token TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying logs
CREATE INDEX IF NOT EXISTS idx_push_log_notification ON public.push_notification_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_push_log_created ON public.push_notification_log(created_at);

-- Function: send Expo push notifications whenever a notifications row is inserted
-- Includes rate limiting (max 1 push per token per 5 seconds) and failure logging
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS trigger AS $$
DECLARE
  push_token RECORD;
  request_body JSONB;
  recent_push_count INTEGER;
BEGIN
  -- Loop through all Expo push tokens registered for the recipient
  FOR push_token IN
    SELECT token
    FROM public.push_tokens
    WHERE user_id = NEW.recipient_id
      AND token IS NOT NULL
  LOOP
    -- Rate limiting: check if we sent a push to this token in the last 5 seconds
    SELECT COUNT(*) INTO recent_push_count
    FROM public.push_notification_log
    WHERE push_token = push_token.token
      AND created_at > NOW() - INTERVAL '5 seconds';
    
    -- Skip if rate limit exceeded (prevents spam and cost overruns)
    IF recent_push_count > 0 THEN
      INSERT INTO public.push_notification_log (
        notification_id, recipient_id, push_token, success, error_message
      ) VALUES (
        NEW.id, NEW.recipient_id, push_token.token, false, 'Rate limit: skipped (5s cooldown)'
      );
      CONTINUE;
    END IF;

    BEGIN
      request_body := jsonb_build_object(
        'to', push_token.token,
        'title', COALESCE(NEW.title, 'Notification'),
        'body', COALESCE(NEW.body, ''),
        'sound', 'default',
        'priority', 'high',
        'channelId', 'status-updates',
        'data', jsonb_build_object(
          'incident_id', NEW.incident_id,
          'notification_id', NEW.id
        )
      );

      -- Send the push payload via Expo's push API
      PERFORM extensions.net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := '{"Content-Type":"application/json"}',
        body := request_body::text
      );

      -- Log success
      INSERT INTO public.push_notification_log (
        notification_id, recipient_id, push_token, success
      ) VALUES (
        NEW.id, NEW.recipient_id, push_token.token, true
      );

    EXCEPTION WHEN OTHERS THEN
      -- Log failure with error message
      INSERT INTO public.push_notification_log (
        notification_id, recipient_id, push_token, success, error_message
      ) VALUES (
        NEW.id, NEW.recipient_id, push_token.token, false, SQLERRM
      );
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS notify_push_on_insert ON public.notifications;

CREATE TRIGGER notify_push_on_insert
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_notification();

-- Add comment for documentation
COMMENT ON FUNCTION public.send_push_notification() IS 'Sends Expo push notifications with rate limiting (5s cooldown) and failure logging to prevent cost overruns';
COMMENT ON TABLE public.push_notification_log IS 'Logs all push notification attempts for debugging and cost monitoring';
