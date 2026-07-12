-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('upload', 'security', 'share', 'system', 'approval', 'delete', 'edit', 'access')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy 1: Users can SELECT (view) their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Any authenticated user can INSERT notifications for anyone
-- This is the KEY policy that allows the notification system to work
CREATE POLICY "notifications_insert_authenticated"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Users can UPDATE (mark as read) their own notifications
CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own notifications
CREATE POLICY "notifications_delete_own"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Auto-delete old notifications (older than 30 days)
-- You can run this as a cron job or scheduled function
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- Sample notifications for testing (optional)
-- LANGKAH 1: Dapatkan user_id Anda dengan query ini:
-- SELECT id, email FROM auth.users LIMIT 5;

-- LANGKAH 2: Copy user_id dari hasil query di atas, kemudian ganti 'PASTE-USER-ID-HERE' dengan ID tersebut
-- Contoh: '550e8400-e29b-41d4-a716-446655440000'
-- 
-- INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
-- ('PASTE-USER-ID-HERE', 'upload', 'Dokumen Baru Diunggah', 'Ahmad Rizki mengunggah "Laporan Keuangan Q4.pdf"', false, NOW() - INTERVAL '5 minutes'),
-- ('PASTE-USER-ID-HERE', 'security', 'Peringatan Keamanan', 'Terdeteksi percobaan login dari IP tidak dikenal', false, NOW() - INTERVAL '15 minutes'),
-- ('PASTE-USER-ID-HERE', 'share', 'Dokumen Dibagikan', 'Siti Nurhaliza membagikan folder "Proyek 2024" dengan Anda', true, NOW() - INTERVAL '1 hour'),
-- ('PASTE-USER-ID-HERE', 'system', 'Update Sistem', 'Versi baru aplikasi (v2.1.0) telah tersedia', true, NOW() - INTERVAL '2 hours'),
-- ('PASTE-USER-ID-HERE', 'approval', 'Dokumen Disetujui', 'Permohonan akses untuk "Budget 2024.xlsx" telah disetujui', true, NOW() - INTERVAL '3 hours');
