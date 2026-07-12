-- CREATE DATABASE FUNCTION TO INSERT NOTIFICATIONS
-- Function ini akan bypass RLS karena dijalankan dengan SECURITY DEFINER
-- Jalankan SQL ini di Supabase SQL Editor

-- Drop function if exists
DROP FUNCTION IF EXISTS create_notification(uuid, text, text, text);

-- Create function to insert notifications (bypasses RLS)
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notif_type text,
  notif_title text,
  notif_message text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the function owner
SET search_path = public
AS $$
DECLARE
  new_notification json;
BEGIN
  -- Insert notification
  INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
  VALUES (target_user_id, notif_type, notif_title, notif_message, false, now())
  RETURNING json_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'title', title,
    'message', message,
    'is_read', is_read,
    'created_at', created_at
  ) INTO new_notification;
  
  RETURN new_notification;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_notification(uuid, text, text, text) TO authenticated;

-- Test the function (optional - replace with your user_id)
-- SELECT create_notification(
--   auth.uid(),
--   'system',
--   'Test Notification',
--   'This is a test notification from database function'
-- );
