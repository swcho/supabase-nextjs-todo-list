import { createClient } from '@supabase/supabase-js'
import { Database } from './schema'
import { useSupabaseClient as _useSupabaseClient } from '@supabase/auth-helpers-react'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export function useSupabaseClient() {
  return _useSupabaseClient<Database>()
}
