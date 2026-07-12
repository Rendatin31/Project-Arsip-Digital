-- CREATE NOTIFICATION PREFERENCES TABLE
-- Tabel ini untuk menyimpan preferensi notifikasi setiap user
-- Jalankan SQL ini di Supabase SQL Editor

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email notification settings
  email_notifications boolean DEFAULT true,
  
  -- Activity notification settings
  document_upload boolean DEFAULT true,
  document_update boolean DEFAULT true,
  security_alert boolean DEFAULT true,
  system_update boolean DEFAULT false,
  
  -- Report notification settings
  weekly_report boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one preference per user
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy 1: Users can SELECT (view) their own preferences
CREATE POLICY "notification_preferences_select_own"
  ON notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can INSERT their own preferences
CREATE POLICY "notification_preferences_insert_own"
  ON notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own preferences
CREATE POLICY "notification_preferences_update_own"
  ON notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own preferences
CREATE POLICY "notification_preferences_delete_own"
  ON notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify table and policies created
SELECT 
  schemaname, 
  tablename, 
  tableowner
FROM pg_tables
WHERE tablename = 'notification_preferences';

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'notification_preferences'
ORDER BY policyname;

-- Optional: Insert default preferences for existing users
-- INSERT INTO notification_preferences (user_id, email_notifications, document_upload, document_update, security_alert, system_update, weekly_report)
-- SELECT 
--   id,
--   true,
--   true,
--   true,
--   true,
--   false,
--   true
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM notification_preferences)
-- ON CONFLICT (user_id) DO NOTHING;
