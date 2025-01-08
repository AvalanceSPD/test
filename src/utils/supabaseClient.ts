import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('กรุณากำหนดค่า SUPABASE_URL และ SUPABASE_ANON_KEY ใน .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

