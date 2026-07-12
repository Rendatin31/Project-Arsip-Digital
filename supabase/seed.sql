-- ============================================
-- SEED DATA DUMMY - ARSIP DIGITAL
-- ============================================

-- 1. Kategori / Struktur Direktori
insert into public.categories (id, name, parent_id, user_id, description, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'KEUANGAN', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kategori dokumen keuangan', now())
on conflict (id) do nothing;

insert into public.categories (id, name, parent_id, user_id, description, created_at) values
  ('22222222-2222-2222-2222-222222222222', 'TAGIHAN', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kategori dokumen tagihan', now())
on conflict (id) do nothing;

insert into public.categories (id, name, parent_id, user_id, description, created_at) values
  ('33333333-3333-3333-3333-333333333333', 'RAHASIA', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kategori dokumen rahasia', now())
on conflict (id) do nothing;

insert into public.categories (id, name, parent_id, user_id, description, created_at) values
  ('44444444-4444-4444-4444-444444444444', 'DITINJAU', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kategori dokumen dalam peninjauan', now())
on conflict (id) do nothing;

-- 2. Direktori / Struktur Folder
insert into public.directories (id, name, parent_id, user_id, created_at) values
  ('77777777-7777-7777-7777-777777777777', 'Arsip Keuangan', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now())
on conflict (id) do nothing;

insert into public.directories (id, name, parent_id, user_id, created_at) values
  ('88888888-8888-8888-8888-888888888888', 'Arsip Kepegawaian', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now())
on conflict (id) do nothing;

insert into public.directories (id, name, parent_id, user_id, created_at) values
  ('99999999-9999-9999-9999-999999999999', 'Surat Keputusan', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now())
on conflict (id) do nothing;

insert into public.directories (id, name, parent_id, user_id, created_at) values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dokumen Proyek', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now())
on conflict (id) do nothing;

insert into public.directories (id, name, parent_id, user_id, created_at) values
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Laporan Bulanan', '77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now())
on conflict (id) do nothing;

insert into public.directories (id, name, parent_id, user_id, created_at) values
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Invoice Vendor', '77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now())
on conflict (id) do nothing;

-- 2. Dummy user profile
-- Ganti UUID di bawah dengan UUID user asli dari auth.users
insert into public.profiles (id, email, full_name, role, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@arsip.go.id', 'Admin Utama', 'admin', now())
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name;

-- 3. Dummy documents
insert into public.documents (
  id, user_id, directory_id, category_id, letter_number, subject, file_name, file_size, mime_type, status, uploaded_at
) values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'SR-001/KEU/VIII/2023',
    'Laporan Realisasi Anggaran Divisi IT Agustus',
    'laporan_keuangan_agustus.pdf',
    2500000,
    'application/pdf',
    'PUBLISHED',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

insert into public.documents (
  id, user_id, directory_id, category_id, letter_number, subject, file_name, file_size, mime_type, status, uploaded_at
) values
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'INV-2309-992',
    'Invoice Pengadaan Cloud Server Amazon AWS',
    'invoice_aws.pdf',
    850000,
    'application/pdf',
    'PUBLISHED',
    now() - interval '2 days'
  )
on conflict (id) do nothing;

insert into public.documents (
  id, user_id, directory_id, category_id, letter_number, subject, file_name, file_size, mime_type, status, uploaded_at
) values
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'SK-DIR-2023-012',
    'Salinan SK Direksi Penetapan Target Q4',
    'sk_direksi_q4.pdf',
    1200000,
    'application/pdf',
    'CONFIDENTIAL',
    now() - interval '3 days'
  )
on conflict (id) do nothing;

insert into public.documents (
  id, user_id, directory_id, category_id, letter_number, subject, file_name, file_size, mime_type, status, uploaded_at
) values
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'MOU-OPS-44',
    'Draft MoU Kerjasama Operasional PT Maju Jaya',
    'mou_maju_jaya.docx',
    3500000,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'DRAFT',
    now() - interval '5 days'
  )
on conflict (id) do nothing;

-- 4. Dummy audit logs
insert into public.audit_logs (user_id, action, document_id, metadata, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LOGIN', null, '{"ip":"192.168.1.10","user_agent":"Mozilla/5.0"}', now() - interval '1 hour')
on conflict do nothing;

insert into public.audit_logs (user_id, action, document_id, metadata, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UPLOAD', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"file_name":"laporan_keuangan_agustus.pdf"}', now() - interval '1 day')
on conflict do nothing;

insert into public.audit_logs (user_id, action, document_id, metadata, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VIEW', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"file_name":"invoice_aws.pdf"}', now() - interval '2 days')
on conflict do nothing;

insert into public.audit_logs (user_id, action, document_id, metadata, created_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DOWNLOAD', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '{"file_name":"sk_direksi_q4.pdf"}', now() - interval '3 days')
on conflict do nothing;
