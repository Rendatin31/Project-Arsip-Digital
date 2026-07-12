-- CREATE EMAIL NOTIFICATION TRIGGER
-- Trigger ini akan mengirim email setiap ada notifikasi baru
-- Jalankan SQL ini di Supabase SQL Editor

-- Drop existing function and trigger if exists
DROP TRIGGER IF EXISTS on_notification_created ON notifications;
DROP FUNCTION IF EXISTS send_email_notification();

-- Create function to send email notification
CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_name text;
  email_enabled boolean;
  edge_function_url text;
  payload json;
BEGIN
  -- Get Edge Function URL from environment
  -- Project reference: axpanhequppcviaimwte
  edge_function_url := 'https://axpanhequppcviaimwte.supabase.co/functions/v1/send-notification-email';
  
  -- Get user email and name
  SELECT 
    p.email, 
    p.full_name,
    COALESCE(np.email_notifications, true)
  INTO 
    user_email, 
    user_name,
    email_enabled
  FROM profiles p
  LEFT JOIN notification_preferences np ON np.user_id = p.id
  WHERE p.id = NEW.user_id;

  -- Only send email if user has email notifications enabled
  IF email_enabled = false THEN
    RAISE NOTICE 'Email notifications disabled for user: %', NEW.user_id;
    RETURN NEW;
  END IF;

  -- Build JSON payload
  payload := json_build_object(
    'user_id', NEW.user_id,
    'type', NEW.type,
    'title', NEW.title,
    'message', NEW.message,
    'notification_id', NEW.id
  );

  -- Call Edge Function asynchronously using pg_net (if available)
  -- If pg_net extension is not available, this will fail silently
  BEGIN
    PERFORM
      net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := payload::jsonb
      );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the trigger
      RAISE WARNING 'Failed to call email notification function: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Create trigger on notifications table
CREATE TRIGGER on_notification_created
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION send_email_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_email_notification() TO authenticated;

-- Verify trigger created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_notification_created';

-- IMPORTANT NOTES:
-- 1. Replace YOUR_PROJECT_REF with your actual Supabase project reference
-- 2. You need to enable pg_net extension for async HTTP calls:
--    Run: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 3. Set service role key as a database setting:
--    Run: ALTER DATABASE postgres SET app.settings.service_role_key = 'your_service_role_key_here';
