'use server'

import { createClient } from '@/lib/supabaseServer'

export async function approveProvider(providerId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const adminId = session?.user?.id

  const { error } = await supabase
    .from('providers')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adminId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId)

  if (error) throw new Error(error.message)
}

export async function rejectProvider(providerId: string, reason?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('providers')
    .update({
      status: 'rejected',
      rejection_reason: reason ?? null,
      approved_at: null,
      approved_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId)

  if (error) throw new Error(error.message)
}
