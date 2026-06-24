import { createClient } from '@supabase/supabase-js'

// These two values are safe to expose in the browser — the anon key can only
// do what your RLS policies allow, which is: users can only touch their own data.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
