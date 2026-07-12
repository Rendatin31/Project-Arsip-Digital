-- Cek data dokumen yang sudah ada
select id, file_name, file_size, file_path, mime_type, uploaded_at
from public.documents
order by uploaded_at desc;
