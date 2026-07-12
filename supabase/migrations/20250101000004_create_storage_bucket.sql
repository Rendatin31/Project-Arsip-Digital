-- Storage bucket untuk dokumen arsip
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Hapus policy lama jika ada (nama bisa berbeda)
drop policy if exists "Documents storage readable by owner" on storage.objects;
drop policy if exists "Documents storage insertable by owner" on storage.objects;
drop policy if exists "Documents storage updateable by owner" on storage.objects;
drop policy if exists "Documents storage deletable by owner" on storage.objects;
drop policy if exists "Allow authenticated read documents" on storage.objects;

-- SELECT: pemilik bisa baca file di folder userId-nya
create policy "Documents storage readable by owner"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- INSERT: pemilik bisa upload ke folder userId-nya
create policy "Documents storage insertable by owner"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- UPDATE
create policy "Documents storage updateable by owner"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- DELETE
create policy "Documents storage deletable by owner"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
