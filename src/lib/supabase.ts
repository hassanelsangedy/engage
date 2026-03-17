
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role for server-side operations if needed, or anon key for client-side
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// For client-side or restricted access
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
