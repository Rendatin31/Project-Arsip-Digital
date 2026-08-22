-- Add FCM token column to profiles table
-- This stores Firebase Cloud Messaging tokens for push notifications

-- Add fcm_token column (nullable, will be populated when user logs in)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add timestamp for when token was last updated
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMPTZ;

-- Create index for faster lookups by FCM token
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token 
ON profiles(fcm_token) 
WHERE fcm_token IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN profiles.fcm_token_updated_at IS 'Timestamp when FCM token was last updated';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('fcm_token', 'fcm_token_updated_at');
