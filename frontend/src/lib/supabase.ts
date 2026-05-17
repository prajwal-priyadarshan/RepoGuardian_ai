import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are missing from Frontend .env!");
}

// 🛡️ Safe fallback initialization to prevent import-time blank-screen crashes
export const supabase = createClient(
  supabaseUrl || 'https://eygrcrhnryegwngfvvpx.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
