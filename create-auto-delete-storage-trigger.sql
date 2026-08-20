-- SOLUSI TERBAIK: Database Trigger untuk Auto-Delete File dari Storage
-- Trigger ini akan otomatis menghapus file dari storage ketika record dokumen dihapus
-- Tidak peduli siapa yang menghapus (bypass RLS policy)

-- 1. Create function untuk auto-delete file dari storage
CREATE OR REPLACE FUNCTION auto_delete_document_file()
RETURNS TRIGGER AS $$
DECLARE
  file_path_to_delete text;
BEGIN
  -- Get file_path dari record yang akan dihapus
  file_path_to_delete := OLD.file_path;
  
  -- Log untuk debugging
  RAISE NOTICE 'Auto-deleting file from storage: %', file_path_to_delete;
  
  -- Delete file dari storage jika file_path ada
  IF file_path_to_delete IS NOT NULL AND file_path_to_delete != '' THEN
    -- Gunakan storage extension untuk delete file
    -- Note: Ini membutuhkan storage extension dan elevated privileges
    PERFORM storage.delete_object('documents', file_path_to_delete);
    
    RAISE NOTICE 'File deleted successfully: %', file_path_to_delete;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger yang akan dipanggil BEFORE DELETE
DROP TRIGGER IF EXISTS trigger_auto_delete_document_file ON public.documents;

CREATE TRIGGER trigger_auto_delete_document_file
BEFORE DELETE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION auto_delete_document_file();

-- 3. Test trigger (uncomment untuk test)
-- INSERT INTO public.documents (user_id, file_name, file_path, subject) 
-- VALUES (auth.uid(), 'test.pdf', 'test-folder/test.pdf', 'Test Document');
-- DELETE FROM public.documents WHERE file_name = 'test.pdf';

-- 4. Verify trigger sudah dibuat
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_delete_document_file';

-- Note: Jika menggunakan trigger ini, Anda TIDAK perlu mengubah RLS policy
-- Trigger akan berjalan dengan SECURITY DEFINER (elevated privileges)
-- Sehingga file akan otomatis terhapus dari storage tanpa mempedulikan RLS policy
