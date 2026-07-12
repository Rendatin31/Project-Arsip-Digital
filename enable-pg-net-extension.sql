-- ENABLE PG_NET EXTENSION
-- Extension ini diperlukan untuk mengirim HTTP request dari database
-- Jalankan SQL ini di Supabase SQL Editor

-- Enable pg_net extension (untuk async HTTP calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Check pg_net version
SELECT * FROM pg_available_extensions WHERE name = 'pg_net';

-- CATATAN:
-- pg_net extension memungkinkan database untuk melakukan HTTP POST request
-- secara asynchronous tanpa blocking transaction
-- 
-- Alternatif jika pg_net tidak tersedia:
-- 1. Gunakan supabase-js di aplikasi untuk call edge function
-- 2. Gunakan Supabase Webhooks (Database Webhooks)
-- 3. Polling dari aplikasi untuk notifikasi baru
