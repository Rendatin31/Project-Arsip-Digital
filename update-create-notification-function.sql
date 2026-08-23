-- Update create_notification function to accept creator info
-- This allows storing who created the notification (for avatar display)

CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notif_type text,
  notif_title text,
  notif_message text,
  creator_id uuid DEFAULT NULL,
  creator_avatar text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, creator_user_id, creator_avatar_url, is_read)
  VALUES (target_user_id, notif_type, notif_title, notif_message, creator_id, creator_avatar, false)
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$;
