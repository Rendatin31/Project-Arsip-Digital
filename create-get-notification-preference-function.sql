-- CREATE FUNCTION TO GET NOTIFICATION PREFERENCES
-- Function ini akan bypass RLS karena dijalankan dengan SECURITY DEFINER
-- Jalankan SQL ini di Supabase SQL Editor

-- Drop function if exists
DROP FUNCTION IF EXISTS get_notification_preference(uuid, text);

-- Create function to get notification preference (bypasses RLS)
CREATE OR REPLACE FUNCTION get_notification_preference(
  target_user_id uuid,
  preference_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the function owner
SET search_path = public
AS $$
DECLARE
  pref_value boolean;
  pref_field text;
BEGIN
  -- Map notification types to preference fields
  CASE preference_type
    WHEN 'upload' THEN pref_field := 'document_upload';
    WHEN 'edit' THEN pref_field := 'document_update';
    WHEN 'delete' THEN pref_field := 'document_update';
    WHEN 'security' THEN pref_field := 'security_alert';
    WHEN 'system' THEN pref_field := 'system_update';
    WHEN 'approval' THEN pref_field := 'document_upload';
    WHEN 'access' THEN pref_field := 'security_alert';
    WHEN 'share' THEN pref_field := 'document_upload';
    ELSE pref_field := NULL;
  END CASE;

  -- If unknown type, default to enabled
  IF pref_field IS NULL THEN
    RETURN true;
  END IF;

  -- Get preference value
  EXECUTE format('SELECT %I FROM notification_preferences WHERE user_id = $1', pref_field)
  INTO pref_value
  USING target_user_id;

  -- If no preference found, default to enabled
  IF pref_value IS NULL THEN
    RETURN true;
  END IF;

  -- Return the preference value
  RETURN pref_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_notification_preference(uuid, text) TO authenticated;

-- Test the function (optional - replace with your user_id)
-- SELECT get_notification_preference(
--   'e6151fe4-6b2d-48a1-adba-f46fb3f33863',
--   'upload'
-- );
