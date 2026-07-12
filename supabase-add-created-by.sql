-- Add created_by column to profiles table
-- This will track which admin created each user

-- Add created_by column (nullable for existing users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON profiles(created_by);

-- Add comment to document the column purpose
COMMENT ON COLUMN profiles.created_by IS 'ID of the admin user who created this profile';
