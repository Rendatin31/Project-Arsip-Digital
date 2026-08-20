-- PENTING: Remove Broken Trigger yang Menyebabkan Error
-- Error: function storage.delete_object(unknown, text) does not exist
-- 
-- Trigger ini dibuat dari create-auto-delete-storage-trigger.sql sebelumnya
-- dan harus dihapus karena function storage.delete_object() tidak tersedia

-- 1. Drop trigger yang error
DROP TRIGGER IF EXISTS trigger_auto_delete_document_file ON public.documents;

-- 2. Drop function yang tidak bisa digunakan
DROP FUNCTION IF EXISTS auto_delete_document_file();

-- 3. Verify trigger sudah dihapus
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'documents';

-- Output: Seharusnya tidak ada trigger 'trigger_auto_delete_document_file'
-- Jika masih ada trigger lain, itu OK

-- 4. Test delete dokumen dari aplikasi
-- Setelah run SQL ini, coba delete dokumen lagi dari aplikasi
-- Seharusnya tidak ada error lagi
