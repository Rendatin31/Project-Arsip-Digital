import { createClient } from '@supabase/supabase-js';

// Fallback untuk production build (Capacitor/APK)
// Jika environment variables tidak tersedia, gunakan values ini
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axpanhequppcviaimwte.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cGFuaGVxdXBwY3ZpYWltd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMjU4OTIsImV4cCI6MjA5ODgwMTg5Mn0.w6F7VV9by_ZeTGbxgt7vDQRMx_pgIdm2_95gQ8IZ_XE';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
