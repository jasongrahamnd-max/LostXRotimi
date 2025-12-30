import { createClient } from '@supabase/supabase-js';

// Using the provided credentials.
// We check process.env.VITE_... first, then fall back to the provided strings.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yhtzhgnnccbzmgvmxxbt.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WuCvxVEyoBCTZ0Cbbxfmaw_WI3zwZDS';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key. Check your configuration.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);