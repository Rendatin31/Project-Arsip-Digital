-- Add creator_user_id and creator_avatar_url columns to notifications table
-- This allows us to display the actual user avatar in notification modals

-- Add creator_user_id column
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS creator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add creator_avatar_url column (denormalized for performance)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS creator_avatar_url text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_creator_user_id ON notifications(creator_user_id);

-- Add comment for documentation
COMMENT ON COLUMN notifications.creator_user_id IS 'User who triggered this notification (uploader, editor, etc.)';
COMMENT ON COLUMN notifications.creator_avatar_url IS 'Avatar URL of creator user (denormalized for performance)';
