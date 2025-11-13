import { createClient } from '@supabase/supabase-js'

// Server-side Supabase Admin client. Do NOT import this in client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  if (!url || !serviceKey) {
    throw new Error('Supabase admin client missing configuration')
    }
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}
