# Update Edge Function: create-user

## Tujuan
Menambahkan `created_by` ke `user_metadata` sehingga trigger `handle_new_user()` dapat menyimpannya ke tabel `profiles`.

## Cara Update di Supabase Dashboard

### 1. Buka Supabase Dashboard
- Pergi ke: https://supabase.com/dashboard
- Login dan pilih project Anda
- Klik menu **Edge Functions** di sidebar kiri
- Pilih function **"create-user"**
- Klik tombol **Edit** atau **View Code**

### 2. Cari Baris Ini (sekitar baris 27-32):

```typescript
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  email_confirm: false,
  user_metadata: { full_name, role, status },
});
```

### 3. Ubah Menjadi (TAMBAHKAN created_by):

```typescript
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  email_confirm: false,
  user_metadata: { 
    full_name, 
    role, 
    status,
    created_by  // ← TAMBAHKAN BARIS INI
  },
});
```

### 4. Save & Deploy
- Klik tombol **"Deploy"** atau **"Save"**
- Tunggu beberapa detik sampai deployment selesai
- Function akan restart otomatis

## Penjelasan

Function ini menggunakan `auth.admin.createUser()` yang akan:
1. Membuat user baru di tabel `auth.users`
2. Menyimpan metadata (full_name, role, status, created_by) ke `raw_user_meta_data`
3. **Trigger `handle_new_user()`** akan otomatis jalan dan insert data ke tabel `profiles`
4. Trigger akan membaca `created_by` dari `raw_user_meta_data->>'created_by'`

## File Lengkap

Jika ingin copy seluruh kode, lihat file: **`edge-function-create-user-FIXED.js`**

Copy seluruh isi file tersebut dan paste ke editor Edge Function di Supabase Dashboard.

## Testing

Setelah deploy:
1. Login ke aplikasi sebagai admin
2. Tambah user baru
3. Cek di Supabase → Table Editor → profiles
4. Pastikan kolom `created_by` terisi dengan ID admin yang membuat user tersebut

## Troubleshooting

**Error: "Column 'created_by' does not exist"**
- Pastikan sudah menjalankan SQL: `supabase-add-created-by.sql`

**Error: "Function not found"**
- Pastikan sudah menjalankan SQL: `supabase-update-trigger-created-by.sql`

**created_by masih NULL**
- Check apakah trigger `handle_new_user()` sudah diupdate
- Check logs di Edge Function untuk melihat error

