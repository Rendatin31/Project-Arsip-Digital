-- INSERT SAMPLE NOTIFICATIONS
-- File ini untuk menambahkan notifikasi contoh ke akun Anda yang sedang login

-- CARA PENGGUNAAN:
-- 1. Pastikan Anda sudah login di aplikasi
-- 2. Jalankan query ini di Supabase SQL Editor
-- 3. Query akan otomatis menggunakan user_id dari akun yang sedang login

-- Insert sample notifications untuk user yang sedang login (menggunakan auth.uid())
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) 
SELECT 
  auth.uid(),
  type,
  title,
  message,
  is_read,
  created_at
FROM (
  VALUES
    ('upload', 'Dokumen Baru Diunggah', 'Ahmad Rizki mengunggah "Laporan Keuangan Q4.pdf"', false, NOW() - INTERVAL '5 minutes'),
    ('security', 'Peringatan Keamanan', 'Terdeteksi percobaan login dari IP tidak dikenal', false, NOW() - INTERVAL '15 minutes'),
    ('share', 'Dokumen Dibagikan', 'Siti Nurhaliza membagikan folder "Proyek 2024" dengan Anda', true, NOW() - INTERVAL '1 hour'),
    ('system', 'Update Sistem', 'Versi baru aplikasi (v2.1.0) telah tersedia', true, NOW() - INTERVAL '2 hours'),
    ('approval', 'Dokumen Disetujui', 'Permohonan akses untuk "Budget 2024.xlsx" telah disetujui', true, NOW() - INTERVAL '3 hours'),
    ('delete', 'Dokumen Dihapus', 'Admin menghapus dokumen "Draft Proposal.docx"', true, NOW() - INTERVAL '5 hours'),
    ('edit', 'Dokumen Diperbarui', 'Budi Santoso memperbarui dokumen "Budget 2024.xlsx"', false, NOW() - INTERVAL '30 minutes'),
    ('access', 'Perubahan Hak Akses', 'Hak akses Anda untuk folder "Confidential" telah diubah', false, NOW() - INTERVAL '1 hour')
) AS sample(type, title, message, is_read, created_at)
WHERE auth.uid() IS NOT NULL;

-- Tampilkan notifikasi yang baru saja dibuat
SELECT * FROM notifications 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 10;
