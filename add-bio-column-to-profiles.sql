-- ADD BIO AND AVATAR COLUMNS TO PROFILES TABLE
-- Jalankan SQL ini di Supabase SQL Editor

-- Add bio column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio text;

-- Add avatar_url column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add updated_at column (with auto-update trigger)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-update
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON COLUMN profiles.bio IS 'Bio singkat user (opsional)';
COMMENT ON COLUMN profiles.avatar_url IS 'URL avatar/photo profil user dari Supabase Storage';
COMMENT ON COLUMN profiles.updated_at IS 'Timestamp terakhir kali profil diupdate (auto-update via trigger)';

-- Verify columns added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('bio', 'avatar_url', 'updated_at')
ORDER BY column_name;

-- Create storage bucket for avatars (if not exists)
-- Note: This should be run separately or manually in Supabase Dashboard
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Test update (optional - ganti USER_ID dengan id user Anda)
-- UPDATE profiles
-- SET 
--   bio = 'Administrator sistem pengarsipan digital',
--   avatar_url = 'avatars/user-id/avatar.jpg'
-- WHERE id = 'USER_ID_HERE';
