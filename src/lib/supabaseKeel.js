import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_KEEL_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_KEEL_SUPABASE_ANON_KEY;

const hasConfig = supabaseUrl && supabaseAnonKey;

export const supabaseKeel = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  : null;
